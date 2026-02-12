"""
阿里云函数计算 FC 3.0 客户端封装
公共API模块，保留docstrings供外部调用者理解接口
"""

import json
import os
import base64
import zipfile
import io
import tempfile
import shutil
from typing import Optional, List, Dict, Any

import requests
from alibabacloud_fc20230330.client import Client as FCClient
from alibabacloud_fc20230330 import models as fc_models
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models


class AliyunFCManager:
    """阿里云函数计算管理器，支持多账号"""

    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        self.accounts = {acc["name"]: acc for acc in self.config.get("accounts", [])}
        self.default_account = self.config.get("default_account")
        self.user_prefix = self.config.get("user_prefix", "")
        self._clients: Dict[str, FCClient] = {}

    def _load_config(self, config_path: str = None) -> Dict[str, Any]:
        """
        加载配置，优先级：
        1. 显式传入的 config_path
        2. 同目录下的 config.json (便于独立使用)
        3. ~/.config/opencode/credentials.json -> deploy.aliyun_fc (config-app 规范)
        """
        config_files = [
            config_path,
            os.path.join(os.path.dirname(__file__), "config.json"),
        ]

        # 尝试从配置文件加载
        for path in config_files:
            if path and os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)

        # 从 credentials.json 加载 (config-app 规范)
        credentials_path = os.path.expanduser("~/.config/opencode/credentials.json")
        if os.path.exists(credentials_path):
            with open(credentials_path, "r", encoding="utf-8") as f:
                cred = json.load(f)
            fc_config = cred.get("deploy", {}).get("aliyun_fc", {})
            if fc_config.get("accounts"):
                return fc_config

        raise FileNotFoundError(
            "未找到 FC 配置。请在以下位置之一配置：\n"
            "1. ~/.config/opencode/credentials.json (deploy.aliyun_fc)\n"
            "2. 同目录下的 config.json"
        )

    def _get_client(self, account_name: str = None) -> FCClient:
        if account_name is None:
            account_name = self.default_account

        if account_name not in self._clients:
            account = self.accounts[account_name]
            config = open_api_models.Config(
                access_key_id=account["access_key_id"],
                access_key_secret=account["access_key_secret"],
            )
            config.endpoint = (
                f"{account['account_id']}.{account['region']}.fc.aliyuncs.com"
            )
            self._clients[account_name] = FCClient(config)

        return self._clients[account_name]

    def list_accounts(self) -> List[str]:
        """列出所有配置的账号"""
        return list(self.accounts.keys())

    def list_functions(
        self, account_name: str = None, prefix: str = None, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        列出函数

        Args:
            account_name: 账号名称，默认使用默认账号
            prefix: 函数名前缀过滤
            limit: 返回数量限制
        """
        client = self._get_client(account_name)

        request = fc_models.ListFunctionsRequest(limit=limit)
        if prefix:
            request.prefix = prefix

        runtime_options = util_models.RuntimeOptions()
        response = client.list_functions_with_options(request, {}, runtime_options)

        functions = []
        if response.body and response.body.functions:
            for func in response.body.functions:
                functions.append(
                    {
                        "function_name": func.function_name,
                        "runtime": func.runtime,
                        "handler": func.handler,
                        "memory_size": func.memory_size,
                        "timeout": func.timeout,
                        "description": func.description,
                        "created_time": func.created_time,
                        "last_modified_time": func.last_modified_time,
                    }
                )

        return functions

    def get_function(
        self, function_name: str, account_name: str = None
    ) -> Dict[str, Any]:
        """获取函数详情"""
        client = self._get_client(account_name)

        request = fc_models.GetFunctionRequest()
        runtime_options = util_models.RuntimeOptions()
        response = client.get_function_with_options(
            function_name, request, {}, runtime_options
        )

        func = response.body
        return {
            "function_name": func.function_name,
            "function_id": func.function_id,
            "runtime": func.runtime,
            "handler": func.handler,
            "memory_size": func.memory_size,
            "timeout": func.timeout,
            "description": func.description,
            "environment_variables": func.environment_variables,
            "created_time": func.created_time,
            "last_modified_time": func.last_modified_time,
            "code_size": func.code_size,
            "code_checksum": func.code_checksum,
        }

    def get_function_code(
        self, function_name: str, account_name: str = None
    ) -> Dict[str, Any]:
        """获取函数代码下载链接"""
        client = self._get_client(account_name)

        request = fc_models.GetFunctionCodeRequest()
        runtime_options = util_models.RuntimeOptions()
        response = client.get_function_code_with_options(
            function_name, request, {}, runtime_options
        )

        return {"url": response.body.url, "checksum": response.body.checksum}

    def download_function_code(
        self, function_name: str, dest_dir: str, account_name: str = None
    ) -> Dict[str, Any]:
        """下载函数代码到本地目录"""
        code_info = self.get_function_code(function_name, account_name)

        response = requests.get(code_info["url"])
        response.raise_for_status()

        os.makedirs(dest_dir, exist_ok=True)

        with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
            zf.extractall(dest_dir)

        return {
            "function_name": function_name,
            "dest_dir": dest_dir,
            "files": os.listdir(dest_dir),
            "checksum": code_info["checksum"],
        }

    def upload_function_code(
        self, function_name: str, source_dir: str, account_name: str = None
    ) -> Dict[str, Any]:
        """从本地目录打包并上传函数代码"""
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            with zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for root, dirs, files in os.walk(source_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, source_dir)
                        zf.write(file_path, arcname)

            result = self.update_function_code(
                function_name, tmp_path, account_name=account_name
            )
            return result
        finally:
            os.unlink(tmp_path)

    def update_function_code(
        self,
        function_name: str,
        zip_file_path: str = None,
        oss_bucket: str = None,
        oss_key: str = None,
        account_name: str = None,
    ) -> Dict[str, Any]:
        """更新函数代码（zip文件或OSS）"""
        client = self._get_client(account_name)

        code = fc_models.InputCodeLocation()

        if zip_file_path:
            with open(zip_file_path, "rb") as f:
                code.zip_file = base64.b64encode(f.read()).decode("utf-8")
        elif oss_bucket and oss_key:
            code.oss_bucket_name = oss_bucket
            code.oss_object_name = oss_key
        else:
            raise ValueError("必须提供 zip_file_path 或 oss_bucket+oss_key")

        body = fc_models.UpdateFunctionInput(code=code)
        request = fc_models.UpdateFunctionRequest(body=body)

        runtime_options = util_models.RuntimeOptions()
        response = client.update_function_with_options(
            function_name, request, {}, runtime_options
        )

        func = response.body
        return {
            "function_name": func.function_name,
            "last_modified_time": func.last_modified_time,
            "code_checksum": func.code_checksum,
        }

    def update_function_config(
        self,
        function_name: str,
        memory_size: int = None,
        timeout: int = None,
        environment_variables: Dict[str, str] = None,
        description: str = None,
        account_name: str = None,
    ) -> Dict[str, Any]:
        """更新函数配置"""
        client = self._get_client(account_name)

        body = fc_models.UpdateFunctionInput()
        if memory_size is not None:
            body.memory_size = memory_size
        if timeout is not None:
            body.timeout = timeout
        if environment_variables is not None:
            body.environment_variables = environment_variables
        if description is not None:
            body.description = description

        request = fc_models.UpdateFunctionRequest(body=body)
        runtime_options = util_models.RuntimeOptions()
        response = client.update_function_with_options(
            function_name, request, {}, runtime_options
        )

        func = response.body
        return {
            "function_name": func.function_name,
            "last_modified_time": func.last_modified_time,
        }

    def create_function(
        self,
        function_name: str,
        source_dir: str,
        description: str = "",
        start_command: List[str] = None,
        port: int = 9000,
        runtime: str = "custom.debian10",
        memory_size: int = 512,
        timeout: int = 60,
        cpu: float = 0.35,
        disk_size: int = 512,
        internet_access: bool = False,
        vpc_id: str = "vpc-uf6y912n32c0pb5mqn68n",
        vswitch_ids: List[str] = None,
        security_group_id: str = "sg-uf63l2tka3mbr8cygd0s",
        environment_variables: Dict[str, str] = None,
        account_name: str = None,
    ) -> Dict[str, Any]:
        """创建新函数（默认低规格配置，含VPC网络）"""
        client = self._get_client(account_name)

        if start_command is None:
            start_command = ["python3", "app.py"]
        if vswitch_ids is None:
            vswitch_ids = ["vsw-uf6itgmi6bjjghgp0sax3"]

        full_name = (
            f"{self.user_prefix}_{function_name}" if self.user_prefix else function_name
        )
        full_desc = (
            f"[{self.user_prefix}] {description}" if self.user_prefix else description
        )
        tags = {"owner": self.user_prefix} if self.user_prefix else {}

        default_env = {
            "LD_LIBRARY_PATH": "/code:/code/lib:/usr/local/lib:/opt/lib:/opt/php8.1/lib:/opt/php8.0/lib:/opt/php7.2/lib",
            "PATH": "/var/fc/lang/python3.10/bin:/usr/local/bin/apache-maven/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/ruby/bin:/opt/bin:/code:/code/bin",
            "PYTHONPATH": "/opt/python:/code",
        }
        if environment_variables:
            default_env.update(environment_variables)

        custom_runtime_config = fc_models.CustomRuntimeConfig(
            command=start_command,
            port=port,
        )

        vpc_config = fc_models.VPCConfig(
            vpc_id=vpc_id,
            v_switch_ids=vswitch_ids,
            security_group_id=security_group_id,
        )

        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            with zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for root, dirs, files in os.walk(source_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, source_dir)
                        zf.write(file_path, arcname)

            with open(tmp_path, "rb") as f:
                code_base64 = base64.b64encode(f.read()).decode("utf-8")

            code = fc_models.InputCodeLocation(zip_file=code_base64)

            func_input = fc_models.CreateFunctionInput(
                function_name=full_name,
                description=full_desc,
                runtime=runtime,
                handler="index.handler",
                memory_size=memory_size,
                timeout=timeout,
                cpu=cpu,
                disk_size=disk_size,
                instance_concurrency=20,
                internet_access=internet_access,
                custom_runtime_config=custom_runtime_config,
                vpc_config=vpc_config,
                environment_variables=default_env,
                code=code,
                tags=tags,
            )

            request = fc_models.CreateFunctionRequest(body=func_input)
            runtime_options = util_models.RuntimeOptions()
            response = client.create_function_with_options(request, {}, runtime_options)

            func = response.body
            return {
                "function_name": func.function_name,
                "function_id": func.function_id,
                "runtime": func.runtime,
                "created_time": func.created_time,
            }
        finally:
            os.unlink(tmp_path)

    def create_http_trigger(
        self,
        function_name: str,
        trigger_name: str = "defaultTrigger",
        auth_type: str = "anonymous",
        account_name: str = None,
    ) -> Dict[str, Any]:
        """为函数创建HTTP触发器"""
        client = self._get_client(account_name)

        trigger_config_str = json.dumps(
            {
                "authType": auth_type,
                "disableURLInternet": False,
            }
        )

        trigger_input = fc_models.CreateTriggerInput(
            trigger_name=trigger_name,
            trigger_type="http",
            trigger_config=trigger_config_str,
        )

        request = fc_models.CreateTriggerRequest(body=trigger_input)
        runtime_options = util_models.RuntimeOptions()
        response = client.create_trigger_with_options(
            function_name, request, {}, runtime_options
        )

        trigger = response.body
        url_internet = None
        if hasattr(trigger, "http_trigger") and trigger.http_trigger:
            url_internet = trigger.http_trigger.url_internet

        return {
            "trigger_name": trigger.trigger_name,
            "trigger_type": trigger.trigger_type,
            "url_internet": url_internet,
        }

    def list_triggers(
        self, function_name: str, account_name: str = None
    ) -> List[Dict[str, Any]]:
        """获取函数的所有触发器"""
        client = self._get_client(account_name)

        request = fc_models.ListTriggersRequest()
        runtime_options = util_models.RuntimeOptions()
        response = client.list_triggers_with_options(
            function_name, request, {}, runtime_options
        )

        triggers = []
        if response.body.triggers:
            for t in response.body.triggers:
                trigger_info = {
                    "trigger_name": t.trigger_name,
                    "trigger_type": t.trigger_type,
                }
                if hasattr(t, "http_trigger") and t.http_trigger:
                    trigger_info["url_internet"] = t.http_trigger.url_internet
                    trigger_info["url_intranet"] = t.http_trigger.url_intranet
                triggers.append(trigger_info)

        return triggers

    def list_custom_domains(self, account_name: str = None) -> List[Dict[str, Any]]:
        """获取所有自定义域名及路由配置"""
        client = self._get_client(account_name)

        request = fc_models.ListCustomDomainsRequest()
        runtime_options = util_models.RuntimeOptions()
        response = client.list_custom_domains_with_options(request, {}, runtime_options)

        domains = []
        if response.body.custom_domains:
            for domain in response.body.custom_domains:
                domain_info = {
                    "domain_name": domain.domain_name,
                    "protocol": domain.protocol,
                    "routes": [],
                }
                if domain.route_config and domain.route_config.routes:
                    for route in domain.route_config.routes:
                        domain_info["routes"].append(
                            {
                                "path": route.path,
                                "function_name": route.function_name,
                            }
                        )
                domains.append(domain_info)

        return domains

    def add_domain_route(
        self,
        domain_name: str,
        path: str,
        function_name: str,
        account_name: str = None,
    ) -> Dict[str, Any]:
        """为自定义域名添加路由规则"""
        client = self._get_client(account_name)
        runtime_options = util_models.RuntimeOptions()

        response = client.get_custom_domain_with_options(
            domain_name, {}, runtime_options
        )
        domain = response.body

        current_routes = []
        if domain.route_config and domain.route_config.routes:
            for route in domain.route_config.routes:
                if route.path == path:
                    return {"status": "exists", "message": f"路由 {path} 已存在"}
                current_routes.append(route)

        full_path = f"/ai/{self.user_prefix}{path}" if self.user_prefix else path

        new_route = fc_models.PathConfig(
            path=full_path,
            function_name=function_name,
        )
        current_routes.append(new_route)

        route_config = fc_models.RouteConfig(routes=current_routes)
        update_input = fc_models.UpdateCustomDomainInput(route_config=route_config)
        update_request = fc_models.UpdateCustomDomainRequest(body=update_input)

        client.update_custom_domain_with_options(
            domain_name, update_request, {}, runtime_options
        )

        return {
            "status": "created",
            "domain_name": domain_name,
            "path": full_path,
            "function_name": function_name,
            "user_prefix": self.user_prefix,
        }


if __name__ == "__main__":
    manager = AliyunFCManager()
    print("账号列表:", manager.list_accounts())
    print("\n函数列表:")
    functions = manager.list_functions()
    for f in functions:
        print(f"  - {f['function_name']} ({f['runtime']})")
