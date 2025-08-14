// ==== 导航功能模块 ====

class NavigationManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.navToggle = document.getElementById('navToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.overlay = document.getElementById('overlay');
        this.tocLinks = document.querySelectorAll('.toc-link');
        this.expandableTitles = document.querySelectorAll('.toc-title.expandable');
        
        this.currentActiveLink = null;
        this.isSmallScreen = window.innerWidth <= 768;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.restoreNavigationState();
        this.handleResponsiveChanges();
    }
    
    setupEventListeners() {
        // 移动端导航切换
        this.navToggle?.addEventListener('click', () => this.toggleSidebar());
        this.sidebarClose?.addEventListener('click', () => this.closeSidebar());
        this.overlay?.addEventListener('click', () => this.closeSidebar());
        
        // 目录链接点击
        this.tocLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleTocLinkClick(e));
        });
        
        // 可展开标题点击
        this.expandableTitles.forEach(title => {
            title.addEventListener('click', (e) => this.toggleSection(e));
        });
        
        // ESC键关闭侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('active')) {
                this.closeSidebar();
            }
        });
        
        // 窗口大小变化处理
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupIntersectionObserver() {
        // 创建交叉观察器来自动更新导航高亮
        const options = {
            root: null,
            rootMargin: '-80px 0px -80px 0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNavigation(entry.target.id);
                }
            });
        }, options);
        
        // 观察所有具有ID的标题元素
        this.observeHeadings();
    }
    
    observeHeadings() {
        // 等待内容加载后观察标题
        const observer = new MutationObserver(() => {
            const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]');
            headings.forEach(heading => {
                this.observer.observe(heading);
            });
        });
        
        observer.observe(document.getElementById('markdownContent'), {
            childList: true,
            subtree: true
        });
    }
    
    toggleSidebar() {
        if (this.isSmallScreen) {
            this.sidebar?.classList.toggle('active');
            this.overlay?.classList.toggle('active');
            document.body.style.overflow = this.sidebar?.classList.contains('active') ? 'hidden' : '';
        }
    }
    
    closeSidebar() {
        if (this.isSmallScreen) {
            this.sidebar?.classList.remove('active');
            this.overlay?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    openSidebar() {
        if (this.isSmallScreen) {
            this.sidebar?.classList.add('active');
            this.overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    handleTocLinkClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href')?.substring(1);
        
        if (targetId) {
            this.scrollToSection(targetId);
            this.updateActiveNavigation(targetId);
            
            // 移动端点击后关闭侧边栏
            if (this.isSmallScreen) {
                setTimeout(() => this.closeSidebar(), 300);
            }
            
            // 保存当前位置
            this.saveNavigationState(targetId);
        }
    }
    
    scrollToSection(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const navHeight = document.querySelector('.main-nav')?.offsetHeight || 60;
            const targetPosition = targetElement.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    updateActiveNavigation(targetId) {
        // 移除之前的活动状态
        if (this.currentActiveLink) {
            this.currentActiveLink.classList.remove('active');
        }
        
        // 设置新的活动链接
        const newActiveLink = document.querySelector(`a[href="#${targetId}"]`);
        if (newActiveLink && newActiveLink.classList.contains('toc-link')) {
            newActiveLink.classList.add('active');
            this.currentActiveLink = newActiveLink;
            
            // 确保父级章节展开
            this.ensureParentExpanded(newActiveLink);
            
            // 滚动到可见区域
            this.scrollLinkIntoView(newActiveLink);
        }
    }
    
    ensureParentExpanded(link) {
        const parentSection = link.closest('.toc-section');
        const parentTitle = parentSection?.querySelector('.toc-title.expandable');
        
        if (parentTitle && parentTitle.classList.contains('collapsed')) {
            parentTitle.classList.remove('collapsed');
            const list = parentTitle.nextElementSibling;
            if (list) {
                list.style.maxHeight = list.scrollHeight + 'px';
            }
        }
    }
    
    scrollLinkIntoView(link) {
        if (this.sidebar && !this.isSmallScreen) {
            const sidebarRect = this.sidebar.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            
            if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
                link.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }
    
    toggleSection(e) {
        e.stopPropagation();
        const title = e.currentTarget;
        const list = title.nextElementSibling;
        
        if (!list || !list.classList.contains('toc-list')) return;
        
        const isCollapsed = title.classList.contains('collapsed');
        
        if (isCollapsed) {
            // 展开
            title.classList.remove('collapsed');
            list.style.maxHeight = list.scrollHeight + 'px';
            list.style.opacity = '1';
        } else {
            // 折叠
            title.classList.add('collapsed');
            list.style.maxHeight = '0';
            list.style.opacity = '0';
        }
        
        // 保存折叠状态
        this.saveSectionState(title.dataset.target, isCollapsed);
    }
    
    handleResize() {
        const wasSmallScreen = this.isSmallScreen;
        this.isSmallScreen = window.innerWidth <= 768;
        
        if (wasSmallScreen !== this.isSmallScreen) {
            this.handleResponsiveChanges();
        }
    }
    
    handleResponsiveChanges() {
        if (!this.isSmallScreen) {
            // 大屏幕：关闭移动端状态
            this.sidebar?.classList.remove('active');
            this.overlay?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // 保存和恢复导航状态
    saveNavigationState(activeSection) {
        try {
            localStorage.setItem('cc-guide-active-section', activeSection);
        } catch (e) {
            console.warn('无法保存导航状态:', e);
        }
    }
    
    restoreNavigationState() {
        try {
            const activeSection = localStorage.getItem('cc-guide-active-section');
            if (activeSection) {
                // 延迟恢复，等待内容加载
                setTimeout(() => {
                    this.updateActiveNavigation(activeSection);
                }, 500);
            }
        } catch (e) {
            console.warn('无法恢复导航状态:', e);
        }
    }
    
    saveSectionState(sectionId, isExpanded) {
        try {
            const sectionStates = JSON.parse(localStorage.getItem('cc-guide-section-states') || '{}');
            sectionStates[sectionId] = isExpanded;
            localStorage.setItem('cc-guide-section-states', JSON.stringify(sectionStates));
        } catch (e) {
            console.warn('无法保存章节状态:', e);
        }
    }
    
    restoreSectionStates() {
        try {
            const sectionStates = JSON.parse(localStorage.getItem('cc-guide-section-states') || '{}');
            
            Object.entries(sectionStates).forEach(([sectionId, isExpanded]) => {
                const title = document.querySelector(`[data-target="${sectionId}"]`);
                if (title && title.classList.contains('expandable')) {
                    const list = title.nextElementSibling;
                    if (list && !isExpanded) {
                        title.classList.add('collapsed');
                        list.style.maxHeight = '0';
                        list.style.opacity = '0';
                    }
                }
            });
        } catch (e) {
            console.warn('无法恢复章节状态:', e);
        }
    }
    
    // 公共方法：滚动到指定章节
    navigateToSection(sectionId) {
        this.scrollToSection(sectionId);
        this.updateActiveNavigation(sectionId);
        this.saveNavigationState(sectionId);
    }
    
    // 公共方法：获取当前章节
    getCurrentSection() {
        return this.currentActiveLink?.getAttribute('href')?.substring(1) || null;
    }
    
    // 公共方法：获取所有章节
    getAllSections() {
        return Array.from(this.tocLinks).map(link => ({
            id: link.getAttribute('href')?.substring(1),
            title: link.textContent.trim(),
            element: link
        }));
    }
}

// 导出给其他模块使用
window.NavigationManager = NavigationManager;