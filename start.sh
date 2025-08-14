#!/bin/bash

echo "🚀 启动Claude Code提问艺术指南网页版..."
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 检查必要文件是否存在
required_files=("index.html" "CC提问艺术教程_v2.0.md" "styles/main.css" "scripts/main.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ 缺少必要文件:"
    printf '   - %s\n' "${missing_files[@]}"
    echo ""
    echo "💡 请确保所有文件都已正确创建"
    exit 1
fi

echo "✅ 所有必要文件检查完成"
echo "🌐 启动本地服务器..."
echo ""

# 启动Python服务器
python3 serve.py