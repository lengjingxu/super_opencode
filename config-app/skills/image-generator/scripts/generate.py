#!/usr/bin/env python3

import argparse
import json
import os
import sys
import urllib.request
import urllib.error

DEFAULT_API_URL = "https://sd.exacg.cc/api/v1/generate_image"
DEFAULT_API_KEY = ""
UPLOAD_URL = "https://img.exacg.cc/upload.php"


def load_config():
    config_path = os.path.expanduser("~/.config/opencode/credentials.json")

    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
                if "image_generator" in config:
                    return config["image_generator"]
        except (json.JSONDecodeError, IOError):
            pass

    return {}


def get_api_config():
    config = load_config()
    api_url = config.get("base_url") or DEFAULT_API_URL
    api_key = config.get("api_key") or DEFAULT_API_KEY
    return api_url, api_key


def generate_image(
    prompt: str,
    output: str,
    negative_prompt: str = "",
    width: int = 512,
    height: int = 512,
    cfg: int = 7,
    seed: int = -1,
    model_index: int = 5,
) -> dict:
    api_url, api_key = get_api_config()

    payload = {"prompt": prompt, "model_index": model_index}

    if width != 512:
        payload["width"] = min(width, 1024)
    if height != 512:
        payload["height"] = min(height, 1024)
    if negative_prompt:
        payload["negative_prompt"] = negative_prompt
    if seed != -1:
        payload["seed"] = seed

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "curl/8.7.1",
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(api_url, data=data, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=120) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        return {"success": False, "error": f"API request failed: {e}"}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Invalid JSON response: {e}"}

    if not response_data.get("success"):
        return {
            "success": False,
            "error": response_data.get("message", "Generation failed"),
        }

    try:
        image_url = response_data["data"]["image_url"]
        remaining_points = response_data["data"].get("remaining_points", "unknown")
    except KeyError as e:
        return {"success": False, "error": f"Failed to parse response: {e}"}

    output_dir = os.path.dirname(output)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    try:
        urllib.request.urlretrieve(image_url, output)
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to download image: {e}",
            "image_url": image_url,
        }

    return {
        "success": True,
        "image_url": image_url,
        "local_path": os.path.abspath(output),
        "remaining_points": remaining_points,
    }


def upload_image(image_path: str) -> str:
    import mimetypes
    import uuid

    boundary = uuid.uuid4().hex
    filename = os.path.basename(image_path)
    content_type = mimetypes.guess_type(image_path)[0] or "application/octet-stream"

    with open(image_path, "rb") as f:
        file_data = f.read()

    body = (
        (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
            f"Content-Type: {content_type}\r\n\r\n"
        ).encode("utf-8")
        + file_data
        + f"\r\n--{boundary}--\r\n".encode("utf-8")
    )

    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "User-Agent": "curl/8.7.1",
    }

    req = urllib.request.Request(UPLOAD_URL, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as response:
        result = json.loads(response.read().decode("utf-8"))

    if result.get("success"):
        return result["data"]["url"]
    raise Exception(result.get("message", "Upload failed"))


def modify_image(
    source_image: str,
    prompt: str,
    output: str,
    width: int = 1200,
    height: int = 800,
    model_index: int = 9,
) -> dict:
    api_url, api_key = get_api_config()

    if source_image.startswith(("http://", "https://")):
        image_url = source_image
    else:
        image_url = upload_image(source_image)

    payload = {
        "prompt": prompt,
        "model_index": model_index,
        "image_source": image_url,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "curl/8.7.1",
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(api_url, data=data, headers=headers, method="POST")

        with urllib.request.urlopen(req, timeout=120) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        return {"success": False, "error": f"API request failed: {e}"}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Invalid JSON response: {e}"}

    if not response_data.get("success"):
        return {
            "success": False,
            "error": response_data.get("message", "Modification failed"),
        }

    try:
        result_url = response_data["data"]["image_url"]
        remaining_points = response_data["data"].get("remaining_points", "unknown")
    except KeyError as e:
        return {"success": False, "error": f"Failed to parse response: {e}"}

    output_dir = os.path.dirname(output)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    try:
        urllib.request.urlretrieve(result_url, output)
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to download image: {e}",
            "image_url": result_url,
        }

    return {
        "success": True,
        "image_url": result_url,
        "local_path": os.path.abspath(output),
        "remaining_points": remaining_points,
    }


def main():
    parser = argparse.ArgumentParser(description="SD Image Generator")
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument(
        "--output", required=True, help="Output file path (.webp recommended)"
    )
    parser.add_argument("--negative", default="", help="Negative prompt")
    parser.add_argument("--width", type=int, default=512, help="Image width (max 1024)")
    parser.add_argument(
        "--height", type=int, default=512, help="Image height (max 1024)"
    )
    parser.add_argument("--cfg", type=int, default=7, help="CFG scale")
    parser.add_argument(
        "--seed", type=int, default=-1, help="Random seed (-1 for random)"
    )
    parser.add_argument(
        "--model", type=int, default=5, help="Model index for text2img (default: 5)"
    )
    parser.add_argument(
        "--source", default=None, help="Source image path or URL (enables img2img mode)"
    )
    parser.add_argument(
        "--edit-model",
        type=int,
        choices=[9, 19],
        default=9,
        help="Image edit model: 9=MiaoMiao RealSkin (default), 19=Qwen Image Edit",
    )

    args = parser.parse_args()

    if args.source:
        model_index = args.edit_model if args.edit_model is not None else 9
        result = modify_image(
            source_image=args.source,
            prompt=args.prompt,
            output=args.output,
            width=args.width,
            height=args.height,
            model_index=model_index,
        )
    else:
        result = generate_image(
            prompt=args.prompt,
            output=args.output,
            negative_prompt=args.negative,
            width=args.width,
            height=args.height,
            cfg=args.cfg,
            seed=args.seed,
            model_index=args.model,
        )

    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
