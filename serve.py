#!/usr/bin/env python3
"""
简单的HTTP服务器，用于本地开发和测试Claude Code提问艺术指南网页版
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头，允许本地文件访问
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # 设置正确的MIME类型
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def guess_type(self, path):
        mimetype = super().guess_type(path)
        # 确保JavaScript文件有正确的MIME类型
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.md'):
            return 'text/markdown'
        return mimetype

def main():
    PORT = 8000
    
    # 确保在项目根目录启动
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    print(f"🚀 Claude Code提问艺术指南 - 本地服务器")
    print(f"📁 服务目录: {project_root}")
    print(f"🌐 访问地址: http://localhost:{PORT}")
    print(f"📱 移动端测试: http://[本机IP]:{PORT}")
    print(f"⚡ 按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 服务器已停止")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ 端口 {PORT} 已被占用")
            print(f"💡 请尝试其他端口或停止占用该端口的程序")
            print(f"🔍 查看占用进程: lsof -i :{PORT}")
        else:
            print(f"\n❌ 启动服务器失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()