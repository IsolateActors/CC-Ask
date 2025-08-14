// ==== 搜索功能模块 ====

class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.searchResults = [];
        this.currentQuery = '';
        this.init();
    }
    
    init() {
        this.setupSearchPanel();
        this.buildSearchIndex();
        this.setupKeyboardShortcuts();
    }
    
    setupSearchPanel() {
        const searchInput = document.getElementById('searchInput');
        const searchExecute = document.getElementById('searchExecute');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput || !searchExecute || !searchResults) {
            console.warn('搜索面板元素未找到');
            return;
        }
        
        // 搜索输入事件
        searchInput.addEventListener('input', (e) => {
            this.currentQuery = e.target.value.trim();
            if (this.currentQuery.length >= 2) {
                this.performSearch(this.currentQuery);
            } else {
                this.clearSearchResults();
            }
        });
        
        // 搜索按钮点击
        searchExecute.addEventListener('click', () => {
            if (this.currentQuery) {
                this.performSearch(this.currentQuery);
            }
        });
        
        // 回车键搜索
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.currentQuery) {
                    this.performSearch(this.currentQuery);
                }
            }
        });
        
        // 清空按钮
        this.addClearButton(searchInput);
    }
    
    addClearButton(searchInput) {
        const container = searchInput.parentElement;
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '✕';
        clearBtn.title = '清空搜索';
        clearBtn.style.display = 'none';
        
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.currentQuery = '';
            this.clearSearchResults();
            clearBtn.style.display = 'none';
            searchInput.focus();
        });
        
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
        });
        
        container.appendChild(clearBtn);
    }
    
    buildSearchIndex() {
        // 等待内容加载完成后构建索引
        const checkContent = () => {
            const content = document.getElementById('markdownContent');
            if (content && content.innerHTML && !content.innerHTML.includes('loading')) {
                this.indexContent();
            } else {
                setTimeout(checkContent, 500);
            }
        };
        
        checkContent();
    }
    
    indexContent() {
        console.log('🔍 构建搜索索引...');
        
        this.searchIndex = [];
        
        // 索引导航项
        this.indexNavigationItems();
        
        // 索引页面内容
        this.indexPageContent();
        
        // 索引模板
        this.indexTemplates();
        
        console.log(`✅ 搜索索引构建完成，共 ${this.searchIndex.length} 个条目`);
    }
    
    indexNavigationItems() {
        const tocLinks = document.querySelectorAll('.toc-link');
        
        tocLinks.forEach(link => {
            const title = link.textContent.trim();
            const href = link.getAttribute('href');
            
            if (title && href) {
                this.searchIndex.push({
                    type: 'navigation',
                    title: title,
                    content: title,
                    url: href,
                    element: link,
                    score: 0
                });
            }
        });
    }
    
    indexPageContent() {
        const content = document.getElementById('markdownContent');
        if (!content) return;
        
        // 索引标题
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            const text = heading.textContent.trim();
            const id = heading.id;
            
            if (text && id) {
                this.searchIndex.push({
                    type: 'heading',
                    title: text,
                    content: text,
                    url: `#${id}`,
                    element: heading,
                    level: parseInt(heading.tagName.charAt(1)),
                    score: 0
                });
            }
        });
        
        // 索引段落内容
        const paragraphs = content.querySelectorAll('p, li');
        paragraphs.forEach(para => {
            const text = para.textContent.trim();
            if (text.length > 20) {
                const nearestHeading = this.findNearestHeading(para);
                
                this.searchIndex.push({
                    type: 'content',
                    title: nearestHeading ? nearestHeading.textContent.trim() : '内容片段',
                    content: text,
                    url: nearestHeading && nearestHeading.id ? `#${nearestHeading.id}` : '#',
                    element: para,
                    context: nearestHeading ? nearestHeading.textContent.trim() : '',
                    score: 0
                });
            }
        });
        
        // 索引代码块
        const codeBlocks = content.querySelectorAll('pre code');
        codeBlocks.forEach(code => {
            const text = code.textContent.trim();
            if (text) {
                const nearestHeading = this.findNearestHeading(code);
                
                this.searchIndex.push({
                    type: 'code',
                    title: nearestHeading ? `${nearestHeading.textContent.trim()} - 代码` : '代码块',
                    content: text,
                    url: nearestHeading && nearestHeading.id ? `#${nearestHeading.id}` : '#',
                    element: code,
                    context: nearestHeading ? nearestHeading.textContent.trim() : '',
                    score: 0
                });
            }
        });
    }
    
    indexTemplates() {
        if (window.claudeGuideApp?.templateManager) {
            const templates = window.claudeGuideApp.templateManager.templates;
            
            templates.forEach(template => {
                this.searchIndex.push({
                    type: 'template',
                    title: template.title,
                    content: `${template.title} ${template.description} ${template.content}`,
                    url: '#templates',
                    template: template,
                    score: 0
                });
            });
        }
    }
    
    findNearestHeading(element) {
        let current = element.previousElementSibling;
        
        while (current) {
            if (current.tagName && /^H[1-6]$/.test(current.tagName)) {
                return current;
            }
            current = current.previousElementSibling;
        }
        
        // 如果没找到，向上查找父级
        let parent = element.parentElement;
        while (parent && parent.id !== 'markdownContent') {
            const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) return heading;
            parent = parent.parentElement;
        }
        
        return null;
    }
    
    performSearch(query) {
        if (!query || query.length < 2) {
            this.clearSearchResults();
            return;
        }
        
        console.log(`🔍 搜索: "${query}"`);
        
        // 计算相关性分数
        this.calculateRelevanceScores(query);
        
        // 排序并过滤结果
        this.searchResults = this.searchIndex
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20); // 限制结果数量
        
        // 显示结果
        this.displaySearchResults();
        
        // 记录搜索历史
        this.recordSearchQuery(query);
    }
    
    calculateRelevanceScores(query) {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\\s+/).filter(word => word.length > 0);
        
        this.searchIndex.forEach(item => {
            let score = 0;
            const titleLower = item.title.toLowerCase();
            const contentLower = item.content.toLowerCase();
            
            // 标题完全匹配
            if (titleLower === queryLower) {
                score += 100;
            }
            // 标题包含查询
            else if (titleLower.includes(queryLower)) {
                score += 50;
            }
            // 标题包含查询词
            else {
                queryWords.forEach(word => {
                    if (titleLower.includes(word)) {
                        score += 20;
                    }
                });
            }
            
            // 内容完全匹配
            if (contentLower.includes(queryLower)) {
                score += 30;
            }
            // 内容包含查询词
            else {
                queryWords.forEach(word => {
                    const wordCount = (contentLower.match(new RegExp(word, 'g')) || []).length;
                    score += wordCount * 5;
                });
            }
            
            // 类型权重
            const typeWeights = {
                navigation: 1.5,
                heading: 1.3,
                template: 1.2,
                code: 1.0,
                content: 0.8
            };
            
            score *= (typeWeights[item.type] || 1);
            
            // 模板使用频率权重
            if (item.template && item.template.usage > 0) {
                score += item.template.usage * 2;
            }
            
            item.score = score;
        });
    }
    
    displaySearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>没有找到相关内容</p>
                    <p class="no-results-suggestion">尝试使用不同的关键词或检查拼写</p>
                </div>
            `;
            return;
        }
        
        const resultsHTML = `
            <div class="search-results-header">
                <span class="search-results-count">找到 ${this.searchResults.length} 个结果</span>
            </div>
            <div class="search-results-list">
                ${this.searchResults.map(result => this.createResultItem(result)).join('')}
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHTML;
        
        // 设置结果项点击事件
        this.setupResultClickEvents();
    }
    
    createResultItem(result) {
        const typeIcons = {
            navigation: '🧭',
            heading: '📌',
            template: '🚀',
            code: '💻',
            content: '📄'
        };
        
        const typeLabels = {
            navigation: '导航',
            heading: '标题',
            template: '模板',
            code: '代码',
            content: '内容'
        };
        
        // 生成内容预览
        const preview = this.generateContentPreview(result);
        
        return `
            <div class="search-result-item" data-url="${result.url}" data-type="${result.type}">
                <div class="result-header">
                    <span class="result-icon">${typeIcons[result.type] || '📄'}</span>
                    <h4 class="result-title">${this.highlightQuery(result.title)}</h4>
                    <span class="result-type">${typeLabels[result.type]}</span>
                </div>
                ${preview ? `<p class="result-preview">${preview}</p>` : ''}
                ${result.context ? `<p class="result-context">在: ${result.context}</p>` : ''}
                <div class="result-meta">
                    <span class="result-score">相关度: ${Math.round(result.score)}</span>
                </div>
            </div>
        `;
    }
    
    generateContentPreview(result) {
        if (result.type === 'template') {
            return this.highlightQuery(result.template.description);
        }
        
        const content = result.content;
        const query = this.currentQuery.toLowerCase();
        
        // 找到第一个匹配位置
        const index = content.toLowerCase().indexOf(query);
        if (index === -1) return '';
        
        // 生成预览片段
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        let preview = content.substring(start, end);
        
        if (start > 0) preview = '...' + preview;
        if (end < content.length) preview = preview + '...';
        
        return this.highlightQuery(preview);
    }
    
    highlightQuery(text) {
        if (!this.currentQuery) return text;
        
        const queryWords = this.currentQuery.split(/\\s+/).filter(word => word.length > 0);
        let highlightedText = text;
        
        queryWords.forEach(word => {
            const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    }
    
    setupResultClickEvents() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                const type = item.dataset.type;
                
                if (type === 'template') {
                    this.handleTemplateResult(item);
                } else {
                    this.handleNavigationResult(url);
                }
            });
        });
    }
    
    handleTemplateResult(item) {
        // 显示模板面板
        window.claudeGuideApp?.toggleTemplatePanel();
        
        // 关闭搜索面板
        window.claudeGuideApp?.closeAllPanels();
        setTimeout(() => {
            window.claudeGuideApp?.toggleTemplatePanel();
        }, 100);
    }
    
    handleNavigationResult(url) {
        if (url && url !== '#') {
            // 导航到目标位置
            if (window.claudeGuideApp?.navigationManager) {
                const sectionId = url.substring(1);
                window.claudeGuideApp.navigationManager.navigateToSection(sectionId);
            }
            
            // 关闭搜索面板
            window.claudeGuideApp?.closeAllPanels();
        }
    }
    
    clearSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchPanel();
            }
            
            // Ctrl/Cmd + F 也打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.openSearchPanel();
            }
        });
    }
    
    openSearchPanel() {
        window.claudeGuideApp?.toggleSearchPanel();
        
        // 聚焦搜索框
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            searchInput?.focus();
            searchInput?.select();
        }, 300);
    }
    
    recordSearchQuery(query) {
        try {
            const searches = JSON.parse(localStorage.getItem('cc-guide-searches') || '[]');
            
            // 移除重复项
            const filteredSearches = searches.filter(s => s !== query);
            
            // 添加到开头
            filteredSearches.unshift(query);
            
            // 限制历史记录数量
            const limitedSearches = filteredSearches.slice(0, 10);
            
            localStorage.setItem('cc-guide-searches', JSON.stringify(limitedSearches));
        } catch (e) {
            console.warn('无法保存搜索历史:', e);
        }
    }
    
    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('cc-guide-searches') || '[]');
        } catch (e) {
            return [];
        }
    }
    
    // 公共方法：执行搜索
    search(query) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = query;
            this.currentQuery = query;
            this.performSearch(query);
        }
    }
    
    // 公共方法：获取搜索统计
    getSearchStats() {
        return {
            indexSize: this.searchIndex.length,
            lastQuery: this.currentQuery,
            resultCount: this.searchResults.length,
            history: this.getSearchHistory()
        };
    }
}

// 添加搜索面板样式
const addSearchStyles = () => {
    if (document.getElementById('search-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-styles';
    style.textContent = `
        .search-container {
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
            position: relative;
        }
        
        .search-container input {
            width: 100%;
            padding: 0.75rem 3rem 0.75rem 1rem;
            border: 1px solid var(--border-medium);
            border-radius: 0.5rem;
            font-size: 1rem;
            background: var(--bg-primary);
            color: var(--text-primary);
        }
        
        .search-container input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-container button {
            position: absolute;
            right: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.875rem;
        }
        
        .search-clear-btn {
            position: absolute !important;
            right: 5rem !important;
            background: transparent !important;
            color: var(--text-muted) !important;
            padding: 0.25rem !important;
            font-size: 1rem !important;
            border-radius: 50% !important;
            width: 24px !important;
            height: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        .search-clear-btn:hover {
            background: var(--bg-tertiary) !important;
            color: var(--text-primary) !important;
        }
        
        .search-results {
            max-height: calc(100vh - 200px);
            overflow-y: auto;
        }
        
        .search-results-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
            background: var(--bg-secondary);
        }
        
        .search-results-count {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .search-results-list {
            padding: 0.5rem;
        }
        
        .search-result-item {
            padding: 1rem;
            border: 1px solid var(--border-light);
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: var(--transition-fast);
            background: var(--bg-primary);
        }
        
        .search-result-item:hover {
            background: var(--bg-secondary);
            border-color: var(--primary-color);
            box-shadow: var(--shadow-sm);
        }
        
        .result-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .result-icon {
            font-size: 1rem;
        }
        
        .result-title {
            flex: 1;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
        }
        
        .result-type {
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            font-size: 0.75rem;
            padding: 0.125rem 0.5rem;
            border-radius: 0.75rem;
        }
        
        .result-preview {
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.4;
            margin: 0.5rem 0;
        }
        
        .result-context {
            font-size: 0.8rem;
            color: var(--text-muted);
            font-style: italic;
            margin: 0.25rem 0;
        }
        
        .result-meta {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }
        
        .search-no-results {
            text-align: center;
            padding: 3rem 2rem;
            color: var(--text-secondary);
        }
        
        .no-results-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .no-results-suggestion {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }
        
        mark {
            background: yellow;
            color: black;
            padding: 0.125rem 0.25rem;
            border-radius: 0.125rem;
        }
    `;
    
    document.head.appendChild(style);
};

// 初始化样式
addSearchStyles();

// 导出给其他模块使用
window.SearchManager = SearchManager;