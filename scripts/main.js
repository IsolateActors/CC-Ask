// ==== 主应用模块 ====

class ClaudeGuideApp {
    constructor() {
        this.markdownContent = null;
        this.navigationManager = null;
        this.clipboardManager = null;
        this.floatingToolbar = null;
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 初始化Claude Code提问艺术指南...');
        
        try {
            // 等待DOM完全加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 加载Markdown内容
            await this.loadMarkdownContent();
            
            // 初始化管理器
            this.initializeManagers();
            
            // 设置浮动工具栏
            this.setupFloatingToolbar();
            
            // 设置全局事件监听
            this.setupGlobalEventListeners();
            
            console.log('✅ 应用初始化完成');
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }
    
    async loadMarkdownContent() {
        console.log('📄 开始加载Markdown内容...');
        
        const contentContainer = document.getElementById('markdownContent');
        if (!contentContainer) {
            throw new Error('找不到内容容器');
        }
        
        try {
            this.isLoading = true;
            
            // 读取Markdown文件
            const response = await fetch('./CC提问艺术教程_v2.0.md');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const markdownText = await response.text();
            
            // 预处理Markdown内容
            const processedMarkdown = this.preprocessMarkdown(markdownText);
            
            // 转换为HTML
            const htmlContent = marked.parse(processedMarkdown);
            
            // 后处理HTML
            const finalHtml = this.postprocessHTML(htmlContent);
            
            // 插入到页面
            contentContainer.innerHTML = finalHtml;
            
            // 添加ID到标题元素
            this.addIdsToHeadings();
            
            console.log('✅ Markdown内容加载完成');
            
        } catch (error) {
            console.error('❌ 加载Markdown失败:', error);
            contentContainer.innerHTML = this.getErrorHTML(error.message);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
    
    preprocessMarkdown(markdown) {
        // 预处理Markdown内容，修复格式问题
        return markdown
            // 确保代码块正确格式化
            .replace(/```([^\n]*?)\n([\s\S]*?)```/g, '```$1\n$2\n```')
            // 修复表格格式
            .replace(/\\\|/g, '|')
            // 确保标题前有空行
            .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
            // 清理多余的空行
            .replace(/\n{3,}/g, '\n\n');
    }
    
    postprocessHTML(html) {
        // 后处理HTML，添加自定义样式和功能
        return html
            // 为表格添加包装器
            .replace(/<table>/g, '<div class="table-wrapper"><table>')
            .replace(/<\/table>/g, '</table></div>')
            // 为图片添加懒加载
            .replace(/<img([^>]*?)src="([^"]*?)"([^>]*?)>/g, '<img$1data-src="$2" src="data:image/svg+xml,%3Csvg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"1\\" height=\\"1\\"%3E%3C/svg%3E"$3 loading="lazy">')
            // 为外部链接添加target="_blank"
            .replace(/<a href="(https?:\/\/[^"]*?)"([^>]*?)>/g, '<a href="$1" target="_blank" rel="noopener noreferrer"$2>');
    }
    
    addIdsToHeadings() {
        const headings = document.querySelectorAll('#markdownContent h1, #markdownContent h2, #markdownContent h3, #markdownContent h4, #markdownContent h5, #markdownContent h6');
        
        headings.forEach(heading => {
            if (!heading.id) {
                const text = heading.textContent.trim();
                const id = this.generateIdFromText(text);
                heading.id = id;
            }
        });
    }
    
    generateIdFromText(text) {
        // 预定义的ID映射，确保与导航链接匹配
        const idMap = {
            // 学习导航
            '🎯 完整学习路径': 'learning-paths',
            '📚 章节概览': 'chapter-overview',
            // 第1章
            '💡 核心理念：让AI做你的专业顾问': 'core-concept',
            '🎯 三种基本提问方式': 'three-methods',
            '🎪 万能启动模板': 'universal-template',
            '📊 决策树：我该怎么问？': 'decision-tree',
            '🎁 立即实践：3个练习': 'practice-exercises',
            // 第2章
            '🌟 完整协作流程概览': 'complete-flow',
            '阶段1：项目启动与创意验证 💡': 'stage-1',
            '阶段2：需求分析与文档化 🔍': 'stage-2',
            '阶段3：技术方案制定 📋': 'stage-3',
            '阶段4：开发执行协作 ⚙️': 'stage-4',
            '阶段5：问题解决技巧 🔧': 'stage-5',
            '阶段6：项目总结与优化 🚀': 'stage-6',
            '💡 完整流程的关键成功因素': 'success-factors',
            // 第3章
            '💡 为什么需要上下文管理？': 'why-context',
            '📝 CLAUDE.md文档体系 - 项目的大脑': 'claude-md',
            '🔄 会话恢复策略': 'session-recovery',
            '📊 实战演示：完整的上下文管理流程': 'context-demo',
            '🎯 上下文管理的成功标准': 'context-success',
            // 第4章
            '💡 核心理念：从"会问"到"巧问"': 'smart-questioning',
            '⚡ 斜杠命令 - 让提问更简洁': 'slash-commands',
            '🧠 Memory管理 - AI永远记住你的项目': 'memory-management',
            '💻 IDE集成 - 编程环境的自然延伸': 'ide-integration',
            '🤖 Agent深度分析 - 专业问题的一站式解决': 'agent-analysis',
            '🔄 自动化工作流 - GitHub Actions增强': 'automation-workflow',
            '💡 2025新功能学习路线图': 'learning-roadmap',
            '⚡ 效率提升对比': 'efficiency-comparison',
            // 第5章
            '🚀 项目启动模板 ⭐': 'project-templates',
            '⚡ 快速启动模板': 'quick-templates',
            '🐛 问题解决模板': 'problem-solving',
            '🎯 高级协作模板': 'advanced-collaboration',
            '🔥 2025新功能专用模板': 'new-features-templates',
            '📋 快速参考速查表': 'quick-reference',
            '💡 模板使用最佳实践': 'best-practices',
            // 第6章
            '🎯 4级进阶练习体系': 'four-levels',
            '🏆 实际项目案例分享': 'success-cases',
            '📊 成长路径评估': 'skill-assessment',
            '🚀 专家认证标准': 'expert-certification',
            '💡 持续成长建议': 'continuous-growth',
            // 结语
            '🏆 恭喜！你已经掌握了Claude Code提问艺术的精髓': 'congratulations',
            '🚀 立即开始你的AI协作之旅': 'start-journey',
            '📈 持续成长路径': 'continuous-path',
            '📊 v2.0版本更新说明': 'version-update'
        };
        
        // 检查是否有预定义的映射
        if (idMap[text]) {
            return idMap[text];
        }
        
        // 从文本生成URL友好的ID
        return text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // 保留中文、英文、数字、连字符
            .replace(/\s+/g, '-') // 空格替换为连字符
            .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
            .substring(0, 50); // 限制长度
    }
    
    initializeManagers() {
        console.log('🔧 初始化功能模块...');
        
        // 初始化导航管理器
        if (window.NavigationManager) {
            this.navigationManager = new window.NavigationManager();
            console.log('✅ 导航管理器初始化完成');
        }
        
        // 初始化剪贴板管理器
        if (window.ClipboardManager) {
            this.clipboardManager = new window.ClipboardManager();
            console.log('✅ 剪贴板管理器初始化完成');
        }
        
        // 初始化其他管理器
        this.initializeOtherManagers();
    }
    
    initializeOtherManagers() {
        // 模板管理器
        if (window.TemplateManager) {
            this.templateManager = new window.TemplateManager();
        }
        
        // 搜索管理器
        if (window.SearchManager) {
            this.searchManager = new window.SearchManager();
        }
        
    }
    
    setupFloatingToolbar() {
        const mainFab = document.getElementById('mainFab');
        const fabMenu = document.getElementById('fabMenu');
        const quickTemplateBtn = document.getElementById('quickTemplateBtn');
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        const searchBtn = document.getElementById('searchBtn');
        const topBtn = document.getElementById('topBtn');
        
        if (!mainFab || !fabMenu) return;
        
        // 主FAB点击切换菜单
        mainFab.addEventListener('click', () => {
            const isActive = fabMenu.classList.contains('active');
            
            if (isActive) {
                fabMenu.classList.remove('active');
                mainFab.classList.remove('active');
            } else {
                fabMenu.classList.add('active');
                mainFab.classList.add('active');
            }
        });
        
        // 快速模板按钮
        quickTemplateBtn?.addEventListener('click', () => {
            this.toggleTemplatePanel();
            this.closeFabMenu();
        });
        
        // 书签按钮
        bookmarkBtn?.addEventListener('click', () => {
            this.toggleBookmark();
            this.closeFabMenu();
        });
        
        // 搜索按钮
        searchBtn?.addEventListener('click', () => {
            this.toggleSearchPanel();
            this.closeFabMenu();
        });
        
        // 回到顶部按钮
        topBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.closeFabMenu();
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-toolbar')) {
                this.closeFabMenu();
            }
        });
    }
    
    closeFabMenu() {
        const mainFab = document.getElementById('mainFab');
        const fabMenu = document.getElementById('fabMenu');
        
        fabMenu?.classList.remove('active');
        mainFab?.classList.remove('active');
    }
    
    toggleTemplatePanel() {
        const panel = document.getElementById('templatePanel');
        const overlay = document.getElementById('overlay');
        
        if (panel && overlay) {
            const isActive = panel.classList.contains('active');
            
            if (isActive) {
                panel.classList.remove('active');
                overlay.classList.remove('active');
            } else {
                // 关闭其他面板
                this.closeAllPanels();
                panel.classList.add('active');
                overlay.classList.add('active');
            }
        }
    }
    
    toggleSearchPanel() {
        const panel = document.getElementById('searchPanel');
        const overlay = document.getElementById('overlay');
        
        if (panel && overlay) {
            const isActive = panel.classList.contains('active');
            
            if (isActive) {
                panel.classList.remove('active');
                overlay.classList.remove('active');
            } else {
                // 关闭其他面板
                this.closeAllPanels();
                panel.classList.add('active');
                overlay.classList.add('active');
                
                // 聚焦到搜索框
                setTimeout(() => {
                    const searchInput = document.getElementById('searchInput');
                    searchInput?.focus();
                }, 300);
            }
        }
    }
    
    toggleBookmark() {
        const currentSection = this.navigationManager?.getCurrentSection();
        if (!currentSection) {
            this.showToast('请先选择一个章节', 'warning');
            return;
        }
        
        const bookmarks = this.getBookmarks();
        const isBookmarked = bookmarks.includes(currentSection);
        
        if (isBookmarked) {
            this.removeBookmark(currentSection);
            this.showToast('已移除书签', 'info');
        } else {
            this.addBookmark(currentSection);
            this.showToast('已添加书签', 'success');
        }
    }
    
    addBookmark(sectionId) {
        try {
            const bookmarks = this.getBookmarks();
            if (!bookmarks.includes(sectionId)) {
                bookmarks.push(sectionId);
                localStorage.setItem('cc-guide-bookmarks', JSON.stringify(bookmarks));
            }
        } catch (e) {
            console.warn('无法保存书签:', e);
        }
    }
    
    removeBookmark(sectionId) {
        try {
            const bookmarks = this.getBookmarks();
            const index = bookmarks.indexOf(sectionId);
            if (index > -1) {
                bookmarks.splice(index, 1);
                localStorage.setItem('cc-guide-bookmarks', JSON.stringify(bookmarks));
            }
        } catch (e) {
            console.warn('无法移除书签:', e);
        }
    }
    
    getBookmarks() {
        try {
            return JSON.parse(localStorage.getItem('cc-guide-bookmarks') || '[]');
        } catch (e) {
            return [];
        }
    }
    
    closeAllPanels() {
        const panels = document.querySelectorAll('.template-panel, .search-panel');
        const overlay = document.getElementById('overlay');
        
        panels.forEach(panel => panel.classList.remove('active'));
        overlay?.classList.remove('active');
    }
    
    setupGlobalEventListeners() {
        // ESC键关闭所有面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
                this.closeFabMenu();
            }
        });
        
        // 点击遮罩层关闭面板
        const overlay = document.getElementById('overlay');
        overlay?.addEventListener('click', () => {
            this.closeAllPanels();
        });
        
        
        // 监听模板按钮
        const templatesBtn = document.getElementById('templatesBtn');
        templatesBtn?.addEventListener('click', () => {
            this.toggleTemplatePanel();
        });
        
        // 监听面板关闭按钮
        document.querySelectorAll('.panel-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllPanels();
            });
        });
    }
    
    
    getErrorHTML(message) {
        return `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h2>内容加载失败</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">重新加载</button>
            </div>
        `;
    }
    
    showError(message) {
        console.error('应用错误:', message);
        
        // 可以在这里添加用户友好的错误提示
        if (this.clipboardManager) {
            this.clipboardManager.showToast(message, 'error');
        }
    }
    
    showToast(message, type = 'info') {
        if (this.clipboardManager) {
            this.clipboardManager.showToast(message, type);
        }
    }
    
    // 公共方法：获取应用状态
    getAppState() {
        return {
            isLoading: this.isLoading,
            currentSection: this.navigationManager?.getCurrentSection(),
            bookmarks: this.getBookmarks(),
            copyStats: this.clipboardManager?.getCopyStatistics()
        };
    }
}

// 添加错误页面样式
const addErrorStyles = () => {
    if (document.getElementById('error-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'error-styles';
    style.textContent = `
        .error-container {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-primary);
        }
        
        .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .error-container h2 {
            color: var(--error-color);
            margin-bottom: 1rem;
        }
        
        .error-container p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .retry-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s ease;
        }
        
        .retry-btn:hover {
            background: var(--primary-hover);
        }
    `;
    
    document.head.appendChild(style);
};

// 初始化样式
addErrorStyles();

// 创建全局应用实例
window.addEventListener('load', () => {
    window.claudeGuideApp = new ClaudeGuideApp();
});

// 导出应用类
window.ClaudeGuideApp = ClaudeGuideApp;