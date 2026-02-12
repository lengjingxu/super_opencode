---
name: deploy-fc
description: 阿里云函数计算部署 - 支持多账号管理、函数CRUD、代码部署、自定义域名路由配置
triggers:
  - 部署到阿里云
  - 函数计算
  - FC部署
  - serverless
  - 发布上线
  - 阿里云函数
  - FC函数
  - 云函数
  - 创建函数
---

# 阿里云函数计算 FC 3.0 Skill

管理阿里云函数计算服务，支持多账号、函数创建/更新/部署、代码管理、自定义域名路由配置。

## 配置文件

在 `~/.config/opencode/credentials.json` 中配置：

```json
{
  "deploy": {
    "aliyun_fc": {
      "enabled": true,
      "accounts": [
        {
          "name": "default",
          "account_id": "阿里云主账号ID",
          "access_key_id": "AccessKey ID",
          "access_key_secret": "AccessKey Secret",
          "region": "cn-shanghai"
        }
      ],
      "default_account": "default"
    }
  }
}
```

## 核心能力

### 1. 列出函数
```python
from aliyun_fc_client import AliyunFCManager
manager = AliyunFCManager()
functions = manager.list_functions(prefix="web")  # 可选前缀过滤
```

### 2. 获取函数详情
```python
func = manager.get_function("function_name")
# 返回: function_name, runtime, memory_size, timeout, environment_variables 等
```

### 3. 下载函数代码
```python
result = manager.download_function_code("function_name", "/local/path")
# 代码会解压到指定目录
```

### 4. 上传/更新函数代码
```python
# 从本地目录打包上传（依赖需打包在目录中）
result = manager.upload_function_code("function_name", "/local/project/path")
```

### 5. 创建新函数
```python
result = manager.create_function(
    function_name="my_func",
    source_dir="/local/project/path",  # 代码目录（含依赖）
    description="函数描述（支持中文）",
    start_command=["python3", "app.py"],
    port=9000,
)
# 默认配置: custom.debian10, 512MB内存, 60秒超时, VPC网络
```

### 6. 创建HTTP触发器
```python
result = manager.create_http_trigger("function_name")
# 返回: trigger_name, url_internet
```

### 7. 获取触发器列表
```python
triggers = manager.list_triggers("function_name")
# 返回: trigger_name, url_internet, url_intranet
```

### 8. 获取自定义域名列表
```python
domains = manager.list_custom_domains()
# 返回: domain_name, protocol, routes[]
```

### 9. 添加自定义域名路由
```python
result = manager.add_domain_route(
    domain_name="bitools.retailaim.cn",
    path="/ai/my_func/*",
    function_name="my_func"
)
```

### 10. 更新函数配置
```python
result = manager.update_function_config(
    function_name="my_func",
    memory_size=1024,
    timeout=120,
    description="新描述",
    environment_variables={"KEY": "value"}
)
```

## 完整部署流程示例

```python
from aliyun_fc_client import AliyunFCManager
manager = AliyunFCManager()

# 1. 创建函数（含代码）
manager.create_function(
    function_name="my_new_api",
    source_dir="./my_project",  # 需包含 app.py 和依赖
    description="我的新API服务",
    start_command=["python3", "app.py"],
    port=9000,
)

# 2. 创建HTTP触发器
trigger = manager.create_http_trigger("my_new_api")
print(f"默认URL: {trigger['url_internet']}")

# 3. 添加自定义域名路由
manager.add_domain_route(
    domain_name="bitools.retailaim.cn",
    path="/ai/my_new_api/*",
    function_name="my_new_api"
)

# 访问地址: https://bitools.retailaim.cn/ai/my_new_api/
```

## 代码打包注意事项

1. **依赖打包**: Python依赖需安装到项目目录
   ```bash
   pip install flask requests -t ./my_project/
   ```

2. **入口文件**: 默认启动命令为 `python3 app.py`，确保项目根目录有 `app.py`

3. **端口**: 默认监听 9000 端口，Flask 示例:
   ```python
   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=9000)
   ```

4. **路由兼容**: 自定义域名路由如 `/ai/func/*`，代码中路由会收到完整路径

## 默认函数配置

| 配置项 | 默认值 |
|--------|--------|
| runtime | custom.debian10 |
| memory_size | 512 MB |
| timeout | 60 秒 |
| cpu | 0.35 核 |
| disk_size | 512 MB |
| port | 9000 |
| internet_access | False (通过VPC) |
| vpc_id | vpc-uf6y912n32c0pb5mqn68n |
| vswitch_ids | vsw-uf6itgmi6bjjghgp0sax3 |
| security_group_id | sg-uf63l2tka3mbr8cygd0s |

## 已配置的自定义域名

| 域名 | 用途 |
|------|------|
| bitools.retailaim.com | 主要业务域名 |
| bitools.retailaim.cn | 备用域名 |
| tools.leng.ishanggang.com | 工具类服务 |

## 错误处理

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| FunctionAlreadyExists | 函数已存在 | 使用 upload_function_code 更新 |
| TriggerAlreadyExists | 触发器已存在 | 使用 list_triggers 获取URL |
| FunctionNotFound | 函数不存在 | 先创建函数 |
| ModuleNotFoundError | 缺少依赖 | pip install -t 打包依赖 |

## 文件结构

```
deploy-fc/
├── aliyun_fc_client.py   # FC客户端封装
└── SKILL.md              # 本文件
```

## 依赖安装

```bash
pip install alibabacloud_fc20230330 alibabacloud_tea_openapi alibabacloud_tea_util requests
```
