---
name: image-generator
description: Generate images via SD API for frontend development. Use when needing visual assets like banners, hero images, logos, illustrations, posters, avatars, card backgrounds, or any placeholder images for web/mobile projects. Triggers on "generate image", "create banner", "need a logo", "placeholder image", "hero background".
---

## Configuration

Config is read from `~/.config/opencode/credentials.json`:

```json
{
  "image_generator": {
    "enabled": true,
    "base_url": "https://sd.exacg.cc/api/v1/generate_image",
    "api_key": "your-api-key"
  }
}
```

Use Oh-My-OpenCode Config App to manage this configuration.

## Usage

```bash
python ~/.config/opencode/skills/image-generator/scripts/generate.py \
  --prompt "description" \
  --output "./path/to/image.webp"
```

## Parameters

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `--prompt` | Yes | - | Image description |
| `--output` | Yes | - | Output path (.webp) |
| `--width` | No | 512 | Width (max 1024) |
| `--height` | No | 512 | Height (max 1024) |
| `--negative` | No | "blurry, low quality, distorted" | What to avoid |
| `--cfg` | No | 7 | CFG scale |
| `--seed` | No | -1 | Seed (-1 = random) |

## Common Sizes

| Asset Type | Dimensions |
|------------|------------|
| Logo/Icon | 512x512 |
| Avatar | 256x256 |
| Hero Banner | 1024x512 |
| Card Image | 512x512 |
| Poster | 768x1024 |

## Examples

```bash
# Logo
python ~/.config/opencode/skills/image-generator/scripts/generate.py \
  --prompt "minimalist tech logo, flat design" \
  --output "./assets/logo.webp"

# Hero banner
python ~/.config/opencode/skills/image-generator/scripts/generate.py \
  --prompt "abstract gradient, tech, blue purple" \
  --width 1024 --height 512 \
  --output "./public/hero.webp"

# Avatar placeholder
python ~/.config/opencode/skills/image-generator/scripts/generate.py \
  --prompt "geometric avatar, neutral colors" \
  --width 256 --height 256 \
  --output "./public/avatar.webp"
```

## Output

Returns JSON: `{"success": true, "local_path": "/abs/path", "remaining_points": N}`

Creates parent directories automatically. 1 point per image.
