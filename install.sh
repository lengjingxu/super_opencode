#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.config/opencode"
SKILLS_DIR="$CONFIG_DIR/skills"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           Oh-My-OpenCode 最佳实践配置包                       ║"
    echo "║           让 AI 开发团队开箱即用                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        return 1
    fi
    return 0
}

install_opencode() {
    print_info "检查 OpenCode 安装状态..."
    
    if check_command opencode; then
        print_step "OpenCode 已安装"
        return 0
    fi
    
    print_info "安装 OpenCode..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if check_command brew; then
            brew install opencode
        else
            curl -fsSL https://opencode.ai/install.sh | bash
        fi
    else
        curl -fsSL https://opencode.ai/install.sh | bash
    fi
    
    if check_command opencode; then
        print_step "OpenCode 安装成功"
    else
        print_error "OpenCode 安装失败，请手动安装: https://opencode.ai"
        exit 1
    fi
}

install_oh_my_opencode() {
    print_info "检查 Oh-My-OpenCode 安装状态..."
    
    if opencode plugin list 2>/dev/null | grep -q "oh-my-opencode"; then
        print_step "Oh-My-OpenCode 已安装"
        return 0
    fi
    
    print_info "安装 Oh-My-OpenCode..."
    opencode plugin add oh-my-opencode
    
    print_step "Oh-My-OpenCode 安装成功"
}

install_plugins() {
    print_info "安装推荐插件..."
    
    local plugins=("opencode-notificator" "opencode-supermemory" "opencode-dynamic-context-pruning")
    
    for plugin in "${plugins[@]}"; do
        if ! opencode plugin list 2>/dev/null | grep -q "$plugin"; then
            print_info "安装 $plugin..."
            opencode plugin add "$plugin" 2>/dev/null || print_warn "$plugin 安装失败，跳过"
        fi
    done
    
    print_step "插件安装完成"
}

select_frontend() {
    echo ""
    echo -e "${BLUE}[1/4] 选择前端技术栈：${NC}"
    echo "  1) Vue 3 + Tailwind + DaisyUI (推荐)"
    echo "  2) React + Next.js + shadcn/ui"
    echo "  3) Angular"
    echo "  4) 纯 HTML/CSS/JS"
    echo "  5) 跳过"
    echo ""
    read -p "请选择 [1-5]: " frontend_choice
    
    case $frontend_choice in
        1) FRONTEND="vue3-tailwind" ;;
        2) FRONTEND="react-nextjs" ;;
        3) FRONTEND="angular" ;;
        4) FRONTEND="vanilla" ;;
        *) FRONTEND="" ;;
    esac
}

select_backend() {
    echo ""
    echo -e "${BLUE}[2/4] 选择后端技术栈：${NC}"
    echo "  1) Python + FastAPI (推荐)"
    echo "  2) Java + Spring Boot"
    echo "  3) Node.js + Express"
    echo "  4) Go + Gin"
    echo "  5) 跳过"
    echo ""
    read -p "请选择 [1-5]: " backend_choice
    
    case $backend_choice in
        1) BACKEND="python-fastapi" ;;
        2) BACKEND="java-springboot" ;;
        3) BACKEND="node-express" ;;
        4) BACKEND="go-gin" ;;
        *) BACKEND="" ;;
    esac
}

input_api_key() {
    echo ""
    echo -e "${BLUE}[3/4] 配置模型服务：${NC}"
    echo "  我们提供统一的模型服务，包含 Claude、GPT、Gemini 等"
    echo "  一个 API Key 即可使用所有模型"
    echo ""
    read -p "请输入 API Key (留空跳过): " API_KEY
}

input_nickname() {
    echo ""
    echo -e "${BLUE}[4/4] 个性化设置：${NC}"
    read -p "AI 称呼你为 (默认: 主人): " NICKNAME
    NICKNAME=${NICKNAME:-"主人"}
}

create_config_dir() {
    print_info "创建配置目录..."
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$SKILLS_DIR"
    mkdir -p "$CONFIG_DIR/hooks"
    print_step "配置目录创建完成"
}

copy_templates() {
    print_info "复制配置模板..."
    
    cp "$SCRIPT_DIR/templates/oh-my-opencode.json" "$CONFIG_DIR/"
    cp "$SCRIPT_DIR/templates/opencode.json" "$CONFIG_DIR/"
    
    if [ ! -f "$CONFIG_DIR/credentials.json" ]; then
        cp "$SCRIPT_DIR/templates/credentials.json.template" "$CONFIG_DIR/credentials.json"
    fi
    
    print_step "配置模板复制完成"
}

copy_skills() {
    print_info "复制 Skills..."
    
    cp -r "$SCRIPT_DIR/skills/"* "$SKILLS_DIR/"
    
    print_step "Skills 复制完成"
}

copy_hooks() {
    print_info "复制 Hook 脚本..."
    
    cp "$SCRIPT_DIR/hooks/notify.sh" "$CONFIG_DIR/hooks/"
    chmod +x "$CONFIG_DIR/hooks/notify.sh"
    
    print_step "Hook 脚本复制完成"
}

apply_tech_stack() {
    print_info "应用技术栈配置..."
    
    local prompt_append=""
    
    if [ -n "$FRONTEND" ] && [ -f "$SCRIPT_DIR/tech-stacks/frontend/$FRONTEND.json" ]; then
        local frontend_prompt=$(jq -r '.prompt_append' "$SCRIPT_DIR/tech-stacks/frontend/$FRONTEND.json")
        prompt_append="$frontend_prompt"
        print_step "前端技术栈: $FRONTEND"
    fi
    
    if [ -n "$BACKEND" ] && [ -f "$SCRIPT_DIR/tech-stacks/backend/$BACKEND.json" ]; then
        local backend_prompt=$(jq -r '.prompt_append' "$SCRIPT_DIR/tech-stacks/backend/$BACKEND.json")
        if [ -n "$prompt_append" ]; then
            prompt_append="$prompt_append\n\n$backend_prompt"
        else
            prompt_append="$backend_prompt"
        fi
        print_step "后端技术栈: $BACKEND"
    fi
    
    if [ -n "$prompt_append" ]; then
        local escaped_prompt=$(echo "$prompt_append" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
        local tmp_file=$(mktemp)
        jq --arg prompt "$escaped_prompt" '.categories["visual-engineering"].prompt_append = $prompt' "$CONFIG_DIR/oh-my-opencode.json" > "$tmp_file"
        mv "$tmp_file" "$CONFIG_DIR/oh-my-opencode.json"
    fi
}

apply_api_key() {
    if [ -n "$API_KEY" ]; then
        print_info "配置 API Key..."
        local tmp_file=$(mktemp)
        jq --arg key "$API_KEY" '.model_service.api_key = $key' "$CONFIG_DIR/credentials.json" > "$tmp_file"
        mv "$tmp_file" "$CONFIG_DIR/credentials.json"
        print_step "API Key 配置完成"
    fi
}

apply_nickname() {
    print_info "生成 AGENTS.md..."
    
    sed "s/主人/$NICKNAME/g" "$SCRIPT_DIR/templates/AGENTS.md.template" > "$CONFIG_DIR/AGENTS.md"
    
    print_step "AGENTS.md 生成完成"
}

print_summary() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    安装完成！                                   ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "配置文件位置："
    echo "  - $CONFIG_DIR/opencode.json"
    echo "  - $CONFIG_DIR/oh-my-opencode.json"
    echo "  - $CONFIG_DIR/credentials.json"
    echo "  - $CONFIG_DIR/AGENTS.md"
    echo ""
    echo "下一步："
    if [ -z "$API_KEY" ]; then
        echo "  1. 编辑 $CONFIG_DIR/credentials.json 填入 API Key"
    fi
    echo "  2. 运行 opencode 开始使用"
    echo ""
    echo -e "${BLUE}文档: https://github.com/xxx/oh-my-opencode-starter${NC}"
    echo ""
}

main() {
    print_banner
    
    if ! check_command jq; then
        print_error "请先安装 jq: brew install jq (macOS) 或 apt install jq (Linux)"
        exit 1
    fi
    
    install_opencode
    install_oh_my_opencode
    install_plugins
    
    select_frontend
    select_backend
    input_api_key
    input_nickname
    
    create_config_dir
    copy_templates
    copy_skills
    copy_hooks
    apply_tech_stack
    apply_api_key
    apply_nickname
    
    print_summary
}

main "$@"
