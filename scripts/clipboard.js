// ==== 剪贴板复制功能模块 ====

class ClipboardManager {
    constructor() {
        this.copiedCount = 0;
        this.init();
    }
    
    init() {
        this.setupCodeBlockObserver();
        this.loadCopyStatistics();
    }
    
    setupCodeBlockObserver() {
        // 观察DOM变化，为新的代码块添加复制按钮
        const observer = new MutationObserver(() => {
            this.processCodeBlocks();
        });
        
        observer.observe(document.getElementById('markdownContent'), {
            childList: true,
            subtree: true
        });
        
        // 初始处理已有的代码块
        this.processCodeBlocks();
    }
    
    processCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code:not([data-copy-processed])');
        
        codeBlocks.forEach(codeElement => {
            this.addCopyButton(codeElement);
            codeElement.setAttribute('data-copy-processed', 'true');
        });
    }
    
    addCopyButton(codeElement) {
        const preElement = codeElement.parentElement;
        if (!preElement || preElement.tagName !== 'PRE') return;
        
        // 检查是否已经有复制按钮
        if (preElement.parentElement.querySelector('.copy-btn')) return;
        
        // 创建代码容器
        const codeContainer = document.createElement('div');
        codeContainer.className = 'code-container';
        
        // 创建代码头部
        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';
        
        // 获取语言信息
        const language = this.getLanguageFromClass(codeElement.className) || '代码';
        const languageSpan = document.createElement('span');
        languageSpan.className = 'code-language';
        languageSpan.textContent = language;
        
        // 创建复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<span class="copy-icon">📋</span> 复制';
        copyBtn.setAttribute('title', '点击复制代码');
        
        // 获取代码内容
        const codeText = this.getCleanCodeText(codeElement);
        
        // 设置点击事件
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyToClipboard(codeText, copyBtn, language);
        });
        
        // 组装元素
        codeHeader.appendChild(languageSpan);
        codeHeader.appendChild(copyBtn);
        
        // 替换原有结构
        preElement.parentNode.insertBefore(codeContainer, preElement);
        codeContainer.appendChild(codeHeader);
        codeContainer.appendChild(preElement);
        
        // 添加模板标识
        if (this.isTemplate(codeText)) {
            this.markAsTemplate(codeContainer, codeText);
        }
    }
    
    getLanguageFromClass(className) {
        const langMap = {
            'language-javascript': 'JavaScript',
            'language-js': 'JavaScript', 
            'language-typescript': 'TypeScript',
            'language-ts': 'TypeScript',
            'language-html': 'HTML',
            'language-css': 'CSS',
            'language-json': 'JSON',
            'language-markdown': 'Markdown',
            'language-md': 'Markdown',
            'language-bash': 'Bash',
            'language-shell': 'Shell',
            'language-yaml': 'YAML',
            'language-yml': 'YAML',
            'language-xml': 'XML',
            'language-python': 'Python',
            'language-py': 'Python'
        };
        
        const classes = className.split(' ');
        for (const cls of classes) {
            if (langMap[cls]) {
                return langMap[cls];
            }
        }
        
        return null;
    }
    
    getCleanCodeText(codeElement) {
        // 获取纯文本内容，去除HTML标签
        let text = codeElement.textContent || codeElement.innerText || '';
        
        // 清理常见的格式问题
        text = text
            .replace(/^\n+/, '') // 移除开头的换行
            .replace(/\n+$/, '') // 移除结尾的换行
            .replace(/\t/g, '    '); // 将tab转换为4个空格
        
        return text;
    }
    
    isTemplate(codeText) {
        // 检查是否是模板代码
        const templateKeywords = [
            '[项目类型]', '[解决的核心问题]', '[用户群体]',
            '[功能描述]', '[技术栈]', '[需求描述]',
            '我想开发', '请担任', '请帮我分析',
            '项目背景：', '基本情况：', '限制条件：'
        ];
        
        return templateKeywords.some(keyword => codeText.includes(keyword));
    }
    
    markAsTemplate(container, codeText) {
        container.classList.add('template-container');
        
        const header = container.querySelector('.code-header');
        const languageSpan = header.querySelector('.code-language');
        languageSpan.textContent = '🎪 模板';
        languageSpan.classList.add('template-language');
        
        const copyBtn = header.querySelector('.copy-btn');
        copyBtn.innerHTML = '<span class="copy-icon">🚀</span> 使用模板';
        copyBtn.classList.add('template-copy-btn');
        
        // 添加模板类型标识
        const templateType = this.getTemplateType(codeText);
        if (templateType) {
            const typeTag = document.createElement('span');
            typeTag.className = 'template-type-tag';
            typeTag.textContent = templateType;
            header.insertBefore(typeTag, copyBtn);
        }
    }
    
    getTemplateType(codeText) {
        if (codeText.includes('我想开发') && codeText.includes('请担任产品经理')) {
            return '启动模板';
        }
        if (codeText.includes('问题描述：') || codeText.includes('错误信息：')) {
            return '问题解决';
        }
        if (codeText.includes('技术选型') || codeText.includes('架构设计')) {
            return '高级协作';
        }
        if (codeText.includes('Agent') || codeText.includes('IDE') || codeText.includes('Memory')) {
            return '2025新功能';
        }
        return '通用模板';
    }
    
    async copyToClipboard(text, button, language) {
        try {
            // 使用现代 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                this.showCopySuccess(button, language);
            } else {
                // 回退方案
                this.fallbackCopyToClipboard(text, button, language);
            }
            
            this.incrementCopyCount();
            this.trackCopyUsage(language);
            
        } catch (err) {
            console.error('复制失败:', err);
            this.showCopyError(button);
        }
    }
    
    fallbackCopyToClipboard(text, button, language) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopySuccess(button, language);
            } else {
                throw new Error('execCommand failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.showCopyError(button);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    showCopySuccess(button, language) {
        const originalContent = button.innerHTML;
        const isTemplate = button.classList.contains('template-copy-btn');
        
        button.innerHTML = isTemplate ? 
            '<span class="copy-icon">✅</span> 已复制模板' : 
            '<span class="copy-icon">✅</span> 已复制';
        
        button.classList.add('copied');
        button.disabled = true;
        
        // 显示提示消息
        this.showToast(`${isTemplate ? '模板' : language}已复制到剪贴板`, 'success');
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
            button.disabled = false;
        }, 2000);
    }
    
    showCopyError(button) {
        const originalContent = button.innerHTML;
        
        button.innerHTML = '<span class="copy-icon">❌</span> 复制失败';
        button.classList.add('error');
        
        this.showToast('复制失败，请手动选择代码', 'error');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('error');
        }, 2000);
    }
    
    showToast(message, type = 'info') {
        // 创建或获取toast容器
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // 触发显示动画
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 3秒后自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    incrementCopyCount() {
        this.copiedCount++;
        this.saveCopyStatistics();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('copyCountChanged', {
            detail: { count: this.copiedCount }
        }));
    }
    
    trackCopyUsage(language) {
        try {
            const usage = JSON.parse(localStorage.getItem('cc-guide-copy-usage') || '{}');
            usage[language] = (usage[language] || 0) + 1;
            localStorage.setItem('cc-guide-copy-usage', JSON.stringify(usage));
        } catch (e) {
            console.warn('无法保存使用统计:', e);
        }
    }
    
    saveCopyStatistics() {
        try {
            localStorage.setItem('cc-guide-copy-count', this.copiedCount.toString());
        } catch (e) {
            console.warn('无法保存复制统计:', e);
        }
    }
    
    loadCopyStatistics() {
        try {
            this.copiedCount = parseInt(localStorage.getItem('cc-guide-copy-count') || '0');
        } catch (e) {
            console.warn('无法加载复制统计:', e);
            this.copiedCount = 0;
        }
    }
    
    // 公共方法：获取复制统计
    getCopyStatistics() {
        try {
            const usage = JSON.parse(localStorage.getItem('cc-guide-copy-usage') || '{}');
            return {
                totalCopies: this.copiedCount,
                byLanguage: usage
            };
        } catch (e) {
            return {
                totalCopies: this.copiedCount,
                byLanguage: {}
            };
        }
    }
    
    // 公共方法：重置统计
    resetStatistics() {
        this.copiedCount = 0;
        try {
            localStorage.removeItem('cc-guide-copy-count');
            localStorage.removeItem('cc-guide-copy-usage');
        } catch (e) {
            console.warn('无法重置统计:', e);
        }
    }
    
    // 公共方法：手动复制文本
    async copyText(text, showToast = true) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                this.fallbackCopyText(text);
            }
            
            if (showToast) {
                this.showToast('内容已复制到剪贴板', 'success');
            }
            
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            if (showToast) {
                this.showToast('复制失败', 'error');
            }
            return false;
        }
    }
    
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
            throw new Error('Fallback copy failed');
        }
    }
}

// 添加toast样式到页面
const addToastStyles = () => {
    if (document.getElementById('toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        }
        
        .toast {
            background: #333;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: all;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
        }
        
        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .toast-success {
            background: #10b981;
        }
        
        .toast-error {
            background: #ef4444;
        }
        
        .toast-info {
            background: #3b82f6;
        }
        
        .template-container {
            border-left: 4px solid #f59e0b;
        }
        
        .template-language {
            color: #f59e0b !important;
            font-weight: 600;
        }
        
        .template-copy-btn {
            background: #f59e0b !important;
        }
        
        .template-copy-btn:hover {
            background: #d97706 !important;
        }
        
        .template-type-tag {
            background: #fef3c7;
            color: #92400e;
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
            border-radius: 0.3rem;
            font-weight: 500;
        }
    `;
    
    document.head.appendChild(style);
};

// 初始化时添加样式
addToastStyles();

// 导出给其他模块使用
window.ClipboardManager = ClipboardManager;