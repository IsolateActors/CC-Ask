// ==== 学习进度管理模块 ====

class ProgressManager {
    constructor() {
        this.checkpoints = new Map();
        this.chapterProgress = new Map();
        this.templateUsage = new Map();
        this.startTime = Date.now();
        this.sessionTime = 0;
        
        this.init();
    }
    
    init() {
        this.loadProgressData();
        this.setupProgressTracking();
        this.setupProgressPanel();
        this.startSessionTracking();
    }
    
    loadProgressData() {
        try {
            // 加载检查点进度
            const checkpointData = localStorage.getItem('cc-guide-checkpoints');
            if (checkpointData) {
                const parsed = JSON.parse(checkpointData);
                this.checkpoints = new Map(Object.entries(parsed));
            }
            
            // 加载章节进度
            const chapterData = localStorage.getItem('cc-guide-chapters');
            if (chapterData) {
                const parsed = JSON.parse(chapterData);
                this.chapterProgress = new Map(Object.entries(parsed));
            }
            
            // 加载会话时间
            this.sessionTime = parseInt(localStorage.getItem('cc-guide-session-time') || '0');
            
            console.log('✅ 进度数据加载完成');
        } catch (e) {
            console.warn('无法加载进度数据:', e);
        }
    }
    
    saveProgressData() {
        try {
            // 保存检查点进度
            const checkpointObj = Object.fromEntries(this.checkpoints);
            localStorage.setItem('cc-guide-checkpoints', JSON.stringify(checkpointObj));
            
            // 保存章节进度
            const chapterObj = Object.fromEntries(this.chapterProgress);
            localStorage.setItem('cc-guide-chapters', JSON.stringify(chapterObj));
            
            // 保存会话时间
            localStorage.setItem('cc-guide-session-time', this.sessionTime.toString());
        } catch (e) {
            console.warn('无法保存进度数据:', e);
        }
    }
    
    setupProgressTracking() {
        // 监听滚动事件，自动标记章节访问
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackCurrentSection();
            }, 500);
        });
        
        // 监听复制事件
        window.addEventListener('copyCountChanged', (e) => {
            this.updateCopyProgress(e.detail.count);
        });
        
        // 设置检查点观察器
        this.setupCheckpointObserver();
    }
    
    setupCheckpointObserver() {
        // 观察检查点元素
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const checkpointId = entry.target.id || entry.target.closest('[id]')?.id;
                    if (checkpointId && checkpointId.includes('checkpoint')) {
                        this.markCheckpointVisited(checkpointId);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        });
        
        // 等待内容加载后开始观察
        const waitForContent = () => {
            const checkpoints = document.querySelectorAll('[id*="checkpoint"], .checkpoint');
            if (checkpoints.length > 0) {
                checkpoints.forEach(checkpoint => observer.observe(checkpoint));
            } else {
                setTimeout(waitForContent, 1000);
            }
        };
        
        waitForContent();
    }
    
    trackCurrentSection() {
        const currentSection = window.claudeGuideApp?.navigationManager?.getCurrentSection();
        if (currentSection) {
            this.markSectionVisited(currentSection);
        }
    }
    
    markSectionVisited(sectionId) {
        if (!this.chapterProgress.has(sectionId)) {
            this.chapterProgress.set(sectionId, {
                visited: true,
                visitedAt: Date.now(),
                timeSpent: 0,
                completed: false
            });
            
            this.saveProgressData();
            this.updateProgressDisplay();
            
            console.log(`📊 标记章节已访问: ${sectionId}`);
        }
    }
    
    markCheckpointVisited(checkpointId) {
        if (!this.checkpoints.has(checkpointId)) {
            this.checkpoints.set(checkpointId, {
                visited: true,
                visitedAt: Date.now(),
                completed: false
            });
            
            this.saveProgressData();
            this.updateProgressDisplay();
            
            console.log(`✅ 检查点已访问: ${checkpointId}`);
        }
    }
    
    markCheckpointCompleted(checkpointId) {
        const checkpoint = this.checkpoints.get(checkpointId) || {};
        checkpoint.completed = true;
        checkpoint.completedAt = Date.now();
        
        this.checkpoints.set(checkpointId, checkpoint);
        this.saveProgressData();
        this.updateProgressDisplay();
        
        console.log(`🎉 检查点已完成: ${checkpointId}`);
        
        // 显示成就提示
        this.showAchievement(`检查点完成！`, '恭喜完成一个学习检查点');
    }
    
    updateCopyProgress(totalCopies) {
        // 更新复制统计
        const milestones = [1, 5, 10, 20, 50];
        milestones.forEach(milestone => {
            if (totalCopies >= milestone && !this.checkpoints.has(`copy-${milestone}`)) {
                this.checkpoints.set(`copy-${milestone}`, {
                    type: 'milestone',
                    completed: true,
                    completedAt: Date.now(),
                    description: `已复制 ${milestone} 个模板`
                });
                
                this.showAchievement(`复制里程碑！`, `已复制 ${milestone} 个模板`);
            }
        });
        
        this.saveProgressData();
        this.updateProgressDisplay();
    }
    
    setupProgressPanel() {
        // 设置学习进度的交互式检查点
        this.setupInteractiveCheckpoints();
    }
    
    setupInteractiveCheckpoints() {
        // 等待内容加载
        const observer = new MutationObserver(() => {
            const checklistItems = document.querySelectorAll('.checklist input[type="checkbox"]');
            
            checklistItems.forEach((checkbox, index) => {
                const checkpointId = `manual-checkpoint-${index}`;
                
                // 恢复保存的状态
                const saved = this.checkpoints.get(checkpointId);
                if (saved?.completed) {
                    checkbox.checked = true;
                }
                
                // 监听变化
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        this.markCheckpointCompleted(checkpointId);
                    } else {
                        // 移除完成状态
                        const checkpoint = this.checkpoints.get(checkpointId) || {};
                        checkpoint.completed = false;
                        this.checkpoints.set(checkpointId, checkpoint);
                        this.saveProgressData();
                        this.updateProgressDisplay();
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    updateProgressDisplay() {
        // 更新进度面板中的统计数据
        this.updateProgressStats();
        this.updateChapterProgressList();
    }
    
    updateProgressStats() {
        const completedChapters = Array.from(this.chapterProgress.values())
            .filter(progress => progress.completed).length;
        
        const completedCheckpoints = Array.from(this.checkpoints.values())
            .filter(checkpoint => checkpoint.completed).length;
        
        const copyStats = window.claudeGuideApp?.clipboardManager?.getCopyStatistics();
        const usedTemplates = copyStats?.totalCopies || 0;
        
        // 更新显示
        const completedChaptersEl = document.getElementById('completedChapters');
        const completedCheckpointsEl = document.getElementById('completedCheckpoints');
        const usedTemplatesEl = document.getElementById('usedTemplates');
        
        if (completedChaptersEl) completedChaptersEl.textContent = completedChapters;
        if (completedCheckpointsEl) completedCheckpointsEl.textContent = completedCheckpoints;
        if (usedTemplatesEl) usedTemplatesEl.textContent = usedTemplates;
    }
    
    updateChapterProgressList() {
        const progressList = document.getElementById('chapterProgressList');
        if (!progressList) return;
        
        const chapters = [
            { id: 'chapter-1', title: '第1章：5分钟快速入门' },
            { id: 'chapter-2', title: '第2章：完整提问流程' },
            { id: 'chapter-3', title: '第3章：上下文管理专精' },
            { id: 'chapter-4', title: '第4章：2025新功能应用' },
            { id: 'chapter-5', title: '第5章：实用工具箱' },
            { id: 'chapter-6', title: '第6章：进阶实战练习' }
        ];
        
        const progressHTML = chapters.map(chapter => {
            const progress = this.chapterProgress.get(chapter.id);
            const isVisited = progress?.visited || false;
            const isCompleted = progress?.completed || false;
            
            const statusIcon = isCompleted ? '✅' : (isVisited ? '👀' : '⚪');
            const statusText = isCompleted ? '已完成' : (isVisited ? '已访问' : '未开始');
            
            return `
                <div class="chapter-progress-item ${isCompleted ? 'completed' : ''} ${isVisited ? 'visited' : ''}">
                    <span class="chapter-status">${statusIcon}</span>
                    <span class="chapter-title">${chapter.title}</span>
                    <span class="chapter-status-text">${statusText}</span>
                    ${!isCompleted && isVisited ? `
                        <button class="mark-completed-btn" data-chapter="${chapter.id}">
                            标记完成
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        progressList.innerHTML = progressHTML;
        
        // 设置标记完成按钮事件
        progressList.querySelectorAll('.mark-completed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chapterId = btn.dataset.chapter;
                this.markChapterCompleted(chapterId);
            });
        });
    }
    
    markChapterCompleted(chapterId) {
        const progress = this.chapterProgress.get(chapterId) || {};
        progress.completed = true;
        progress.completedAt = Date.now();
        
        this.chapterProgress.set(chapterId, progress);
        this.saveProgressData();
        this.updateProgressDisplay();
        
        // 显示成就
        const chapterNames = {
            'chapter-1': '快速入门',
            'chapter-2': '完整流程',
            'chapter-3': '上下文管理',
            'chapter-4': '2025新功能',
            'chapter-5': '实用工具箱',
            'chapter-6': '进阶实战'
        };
        
        const chapterName = chapterNames[chapterId] || chapterId;
        this.showAchievement(`章节完成！`, `恭喜完成"${chapterName}"章节`);
        
        // 检查是否完成所有章节
        this.checkOverallCompletion();
    }
    
    checkOverallCompletion() {
        const totalChapters = 6;
        const completedChapters = Array.from(this.chapterProgress.values())
            .filter(progress => progress.completed).length;
        
        if (completedChapters === totalChapters) {
            this.showAchievement(`🎉 恭喜完成学习！`, `你已经掌握了Claude Code提问艺术的精髓！`);
        }
    }
    
    startSessionTracking() {
        // 记录会话开始时间
        this.sessionStartTime = Date.now();
        
        // 每分钟更新一次会话时间
        this.sessionInterval = setInterval(() => {
            this.sessionTime += 60000; // 1分钟
            this.saveProgressData();
        }, 60000);
        
        // 页面离开时保存
        window.addEventListener('beforeunload', () => {
            const currentSessionTime = Date.now() - this.sessionStartTime;
            this.sessionTime += currentSessionTime;
            this.saveProgressData();
        });
    }
    
    showAchievement(title, description) {
        // 创建成就提示
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <h4 class="achievement-title">${title}</h4>
                <p class="achievement-description">${description}</p>
            </div>
            <button class="achievement-close">×</button>
        `;
        
        document.body.appendChild(achievement);
        
        // 显示动画
        setTimeout(() => achievement.classList.add('show'), 100);
        
        // 自动关闭
        setTimeout(() => {
            achievement.classList.remove('show');
            setTimeout(() => achievement.remove(), 300);
        }, 5000);
        
        // 手动关闭
        achievement.querySelector('.achievement-close').addEventListener('click', () => {
            achievement.classList.remove('show');
            setTimeout(() => achievement.remove(), 300);
        });
    }
    
    // 公共方法：获取学习统计
    getLearningStats() {
        const totalChapters = 6;
        const visitedChapters = Array.from(this.chapterProgress.values())
            .filter(progress => progress.visited).length;
        const completedChapters = Array.from(this.chapterProgress.values())
            .filter(progress => progress.completed).length;
        
        const totalCheckpoints = this.checkpoints.size;
        const completedCheckpoints = Array.from(this.checkpoints.values())
            .filter(checkpoint => checkpoint.completed).length;
        
        const copyStats = window.claudeGuideApp?.clipboardManager?.getCopyStatistics();
        
        return {
            chapters: {
                total: totalChapters,
                visited: visitedChapters,
                completed: completedChapters,
                progress: Math.round((completedChapters / totalChapters) * 100)
            },
            checkpoints: {
                total: totalCheckpoints,
                completed: completedCheckpoints,
                progress: totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0
            },
            templates: {
                used: copyStats?.totalCopies || 0,
                byType: copyStats?.byLanguage || {}
            },
            time: {
                session: this.sessionTime,
                current: Date.now() - this.sessionStartTime
            }
        };
    }
    
    // 公共方法：重置进度
    resetProgress() {
        if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
            this.checkpoints.clear();
            this.chapterProgress.clear();
            this.sessionTime = 0;
            
            try {
                localStorage.removeItem('cc-guide-checkpoints');
                localStorage.removeItem('cc-guide-chapters');
                localStorage.removeItem('cc-guide-session-time');
            } catch (e) {
                console.warn('无法清除进度数据:', e);
            }
            
            this.updateProgressDisplay();
            window.claudeGuideApp?.showToast('学习进度已重置', 'info');
        }
    }
    
    // 公共方法：导出进度数据
    exportProgress() {
        const data = {
            checkpoints: Object.fromEntries(this.checkpoints),
            chapters: Object.fromEntries(this.chapterProgress),
            sessionTime: this.sessionTime,
            exportedAt: Date.now(),
            stats: this.getLearningStats()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cc-guide-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        window.claudeGuideApp?.showToast('进度数据已导出', 'success');
    }
}

// 添加进度管理样式
const addProgressStyles = () => {
    if (document.getElementById('progress-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'progress-styles';
    style.textContent = `
        .progress-content {
            padding: 1rem;
        }
        
        .progress-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-item {
            text-align: center;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 0.5rem;
            border: 1px solid var(--border-light);
        }
        
        .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.25rem;
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .chapter-progress h4 {
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .chapter-progress-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border: 1px solid var(--border-light);
            border-radius: 0.375rem;
            margin-bottom: 0.5rem;
            transition: var(--transition-fast);
        }
        
        .chapter-progress-item:hover {
            background: var(--bg-secondary);
        }
        
        .chapter-progress-item.completed {
            background: var(--bg-secondary);
            border-color: var(--success-color);
        }
        
        .chapter-progress-item.visited {
            background: var(--bg-tertiary);
        }
        
        .chapter-status {
            font-size: 1.2rem;
        }
        
        .chapter-title {
            flex: 1;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .chapter-status-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .mark-completed-btn {
            background: var(--success-color);
            color: white;
            border: none;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: var(--transition-fast);
        }
        
        .mark-completed-btn:hover {
            background: #059669;
        }
        
        .achievement-notification {
            position: fixed;
            top: 100px;
            right: -400px;
            width: 350px;
            background: var(--bg-primary);
            border: 1px solid var(--success-color);
            border-radius: 0.5rem;
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            transition: right 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .achievement-notification.show {
            right: 20px;
        }
        
        .achievement-icon {
            font-size: 2rem;
        }
        
        .achievement-content {
            flex: 1;
        }
        
        .achievement-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--success-color);
            margin: 0 0 0.25rem 0;
        }
        
        .achievement-description {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
        }
        
        .achievement-close {
            background: transparent;
            border: none;
            font-size: 1.25rem;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: var(--transition-fast);
        }
        
        .achievement-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
            .progress-stats {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
            
            .achievement-notification {
                width: calc(100vw - 40px);
                right: -100vw;
            }
            
            .achievement-notification.show {
                right: 20px;
            }
        }
    `;
    
    document.head.appendChild(style);
};

// 初始化样式
addProgressStyles();

// 导出给其他模块使用
window.ProgressManager = ProgressManager;