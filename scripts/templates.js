// ==== 模板管理模块 ====

class TemplateManager {
    constructor() {
        this.templates = [];
        this.currentCategory = 'startup';
        this.init();
    }
    
    init() {
        this.loadTemplateData();
        this.setupTemplatePanel();
        this.loadTemplateUsageStats();
    }
    
    loadTemplateData() {
        // 核心模板数据
        this.templates = [
            // 项目启动模板
            {
                id: 'universal-startup',
                category: 'startup',
                title: '万能启动模板',
                description: '适合复杂项目的完整启动模板',
                priority: 'high',
                usage: 0,
                content: `我想开发一个[项目类型]，用来[解决的核心问题]。

基本情况：
- 目标用户：[用户群体和使用场景]
- 问题痛点：[当前的问题和困扰]
- 期望效果：[理想的解决方案效果]

初步想法：
- [想法1]
- [想法2] 
- [想法3]

限制条件：
- 时间：[开发周期要求]
- 技术：[技术栈偏好或限制]
- 资源：[人力和资金情况]

请担任产品经理，通过专业提问帮我：
1. 完善和优化需求
2. 分析技术可行性
3. 制定开发方案
4. 规划实施步骤`
            },
            {
                id: 'web-app-quick',
                category: 'startup',
                title: 'Web应用快速版',
                description: '快速启动Web项目',
                priority: 'medium',
                usage: 0,
                content: `Web项目：[功能描述]
用户：[用户类型]  
技术：[前端]+[后端]+[数据库]
请问需要了解什么细节？`
            },
            {
                id: 'mobile-app-quick',
                category: 'startup',
                title: '移动应用快速版',
                description: '快速启动移动App项目',
                priority: 'medium',
                usage: 0,
                content: `移动App：[解决什么问题]
平台：[iOS/Android/跨平台]
核心功能：[3个以内主要功能]
请帮我分析技术方案`
            },
            {
                id: 'tool-dev-quick',
                category: 'startup',
                title: '工具开发快速版',
                description: '开发实用工具的快速模板',
                priority: 'medium',
                usage: 0,
                content: `开发工具：[工具用途]
输入：[处理什么数据]
输出：[期望结果]
语言：[编程语言偏好]
请制定开发计划`
            },
            
            // 问题解决模板
            {
                id: 'bug-report',
                category: 'problem',
                title: '完整Bug报告模板',
                description: '标准化的问题报告格式',
                priority: 'high',
                usage: 0,
                content: `我遇到了一个bug，详情如下：

**问题描述：**
[简要描述问题现象]

**错误信息：**
\`\`\`
[粘贴完整的错误日志]
\`\`\`

**复现步骤：**
1. [第一步操作]
2. [第二步操作] 
3. [触发问题的操作]

**期望行为：**
[描述应该发生什么]

**环境信息：**
- 操作系统：[版本]
- 浏览器/运行环境：[版本]
- 项目版本：[版本号]

请帮我分析问题原因并提供解决方案。`
            },
            {
                id: 'performance-optimization',
                category: 'problem',
                title: '性能优化速查',
                description: '性能问题诊断模板',
                priority: 'medium',
                usage: 0,
                content: `性能问题：[具体表现]
技术栈：[当前技术]
瓶颈点：[怀疑的问题]
目标：[优化期望]
请提供诊断和优化方案`
            },
            {
                id: 'code-review',
                category: 'problem',
                title: '代码审查速查',
                description: '代码质量审查模板',
                priority: 'medium',
                usage: 0,
                content: `审查代码：[代码功能]
关注点：[重点方面]
标准：[项目规范]
请提供改进建议和重构方案`
            },
            
            // 高级协作模板
            {
                id: 'tech-comparison',
                category: 'advanced',
                title: '技术选型对比模板',
                description: '系统化的技术方案对比',
                priority: 'high',
                usage: 0,
                content: `请帮我对比技术方案：

**项目背景：**[项目类型和规模]
**团队情况：**[技术水平和人员规模]

**候选方案：**
- 方案A：[技术栈1]
- 方案B：[技术栈2]
- 方案C：[技术栈3]

**对比维度：**
1. 学习成本和开发效率
2. 性能表现和扩展能力
3. 生态系统和社区支持
4. 长期维护和技术债务

**输出要求：**
- 详细对比表格
- 推荐方案及理由
- 风险评估和应对策略`
            },
            {
                id: 'architecture-design',
                category: 'advanced',
                title: '架构设计引导模板',
                description: '系统架构设计指导',
                priority: 'high',
                usage: 0,
                content: `请引导我设计系统架构：

**系统要求：**
- 功能模块：[核心功能列表]
- 性能指标：[并发、响应时间等]
- 扩展需求：[未来扩展计划]

**约束条件：**
- 技术限制：[必须或不能使用的技术]
- 资源限制：[人力、时间、预算]
- 业务限制：[合规、安全等要求]

**设计产出：**
1. 系统架构图
2. 技术栈选择
3. 数据库设计
4. API接口规划
5. 部署架构方案`
            },
            {
                id: 'team-collaboration',
                category: 'advanced',
                title: '团队协作沟通模板',
                description: '团队合作项目的协作规范',
                priority: 'medium',
                usage: 0,
                content: `团队协作场景：[协作类型]
参与成员：[团队角色]
协作目标：[期望达成的结果]

请帮我：
1. 设计协作流程和分工方案
2. 建立统一的代码规范和文档标准
3. 制定进度跟踪和质量控制机制
4. 提供团队AI协作的最佳实践`
            },
            
            // 2025新功能模板
            {
                id: 'memory-enhanced',
                category: 'new-features',
                title: '2025增强版启动模板',
                description: '结合Memory和斜杠命令的新模板',
                priority: 'high',
                usage: 0,
                content: `/memory set project="[项目名称]"
/memory set goal="[核心目标]"
/memory set users="[目标用户]"

我想开发[项目描述]，请：
1. 担任产品经理角色，深度分析需求
2. 使用Agent搜索类似产品最佳实践
3. 制定包含2025新功能的开发方案
4. 建立完整的CLAUDE.md项目记忆体系`
            },
            {
                id: 'ide-integration',
                category: 'new-features',
                title: 'IDE集成协作模板',
                description: 'IDE环境下的实时协作',
                priority: 'medium',
                usage: 0,
                content: `请在IDE中协助我：

**当前任务：**[正在开发的功能]
**选中代码：**[已选中的代码段]

**协作需求：**
1. 分析代码质量和最佳实践
2. 提供性能优化建议
3. 实现自动重构和改进
4. 生成对应的测试用例
5. 更新相关文档和注释

请直接在IDE中实施改进方案。`
            },
            {
                id: 'agent-analysis',
                category: 'new-features',
                title: 'Agent深度分析模板',
                description: '使用Agent进行专业分析',
                priority: 'medium',
                usage: 0,
                content: `请通过Agent进行综合分析：

**分析目标：**[具体问题或需求]

**分析要求：**
1. 搜索相关的最新最佳实践
2. 分析我的项目特定情况
3. 提供具体可执行的方案
4. 给出优先级排序的建议

**输出要求：**
- 详细分析报告
- 可执行的行动计划
- 预期效果和风险评估`
            }
        ];
        
        console.log(`✅ 加载了 ${this.templates.length} 个模板`);
    }
    
    setupTemplatePanel() {
        this.setupCategoryButtons();
        this.setupPanelEvents();
        this.renderTemplateList();
    }
    
    setupCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.template-category');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 移除其他按钮的active状态
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                
                // 激活当前按钮
                e.target.classList.add('active');
                
                // 更新当前分类
                this.currentCategory = e.target.dataset.category;
                
                // 重新渲染模板列表
                this.renderTemplateList();
            });
        });
    }
    
    setupPanelEvents() {
        // 搜索功能
        const searchInput = document.getElementById('templateSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTemplates(e.target.value);
            });
        }
    }
    
    renderTemplateList() {
        const templateList = document.getElementById('templateList');
        if (!templateList) return;
        
        const filteredTemplates = this.templates.filter(template => 
            template.category === this.currentCategory
        );
        
        // 按优先级和使用次数排序
        filteredTemplates.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            return b.usage - a.usage;
        });
        
        templateList.innerHTML = filteredTemplates.map(template => 
            this.createTemplateCard(template)
        ).join('');
        
        // 设置事件监听
        this.setupTemplateCardEvents();
    }
    
    createTemplateCard(template) {
        const priorityIcon = {
            high: '⭐',
            medium: '🔥',
            low: '💡'
        };
        
        const categoryLabel = {
            startup: '项目启动',
            problem: '问题解决',
            advanced: '高级协作',
            'new-features': '2025新功能'
        };
        
        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <h4 class="template-title">
                        ${priorityIcon[template.priority]} ${template.title}
                    </h4>
                    <div class="template-meta">
                        <span class="template-category">${categoryLabel[template.category]}</span>
                        <span class="template-usage">${template.usage} 次使用</span>
                    </div>
                </div>
                <p class="template-description">${template.description}</p>
                <div class="template-actions">
                    <button class="template-preview-btn" data-action="preview">
                        👀 预览
                    </button>
                    <button class="template-copy-btn" data-action="copy">
                        📋 复制模板
                    </button>
                    <button class="template-use-btn" data-action="use">
                        🚀 立即使用
                    </button>
                </div>
                <div class="template-preview" style="display: none;">
                    <pre><code>${template.content}</code></pre>
                </div>
            </div>
        `;
    }
    
    setupTemplateCardEvents() {
        document.querySelectorAll('.template-card').forEach(card => {
            const templateId = card.dataset.templateId;
            const template = this.templates.find(t => t.id === templateId);
            
            if (!template) return;
            
            // 预览按钮
            const previewBtn = card.querySelector('[data-action="preview"]');
            previewBtn?.addEventListener('click', () => {
                this.togglePreview(card);
            });
            
            // 复制按钮
            const copyBtn = card.querySelector('[data-action="copy"]');
            copyBtn?.addEventListener('click', () => {
                this.copyTemplate(template, copyBtn);
            });
            
            // 立即使用按钮
            const useBtn = card.querySelector('[data-action="use"]');
            useBtn?.addEventListener('click', () => {
                this.useTemplate(template);
            });
        });
    }
    
    togglePreview(card) {
        const preview = card.querySelector('.template-preview');
        const previewBtn = card.querySelector('[data-action="preview"]');
        
        if (preview.style.display === 'none') {
            preview.style.display = 'block';
            previewBtn.textContent = '🔼 收起';
        } else {
            preview.style.display = 'none';
            previewBtn.textContent = '👀 预览';
        }
    }
    
    async copyTemplate(template, button) {
        try {
            if (window.claudeGuideApp?.clipboardManager) {
                const success = await window.claudeGuideApp.clipboardManager.copyText(template.content, false);
                
                if (success) {
                    this.incrementTemplateUsage(template.id);
                    this.showTemplateCopySuccess(button, template.title);
                    window.claudeGuideApp.showToast(`模板"${template.title}"已复制`, 'success');
                } else {
                    throw new Error('复制失败');
                }
            } else {
                throw new Error('剪贴板管理器未初始化');
            }
        } catch (error) {
            console.error('复制模板失败:', error);
            window.claudeGuideApp?.showToast('复制失败，请手动选择', 'error');
        }
    }
    
    useTemplate(template) {
        // 复制模板并关闭面板
        this.copyTemplate(template, null);
        
        // 关闭模板面板
        window.claudeGuideApp?.closeAllPanels();
        
        // 显示使用提示
        setTimeout(() => {
            window.claudeGuideApp?.showToast(`模板"${template.title}"已准备就绪，可以粘贴使用`, 'info');
        }, 500);
        
        this.incrementTemplateUsage(template.id);
    }
    
    showTemplateCopySuccess(button, templateTitle) {
        if (!button) return;
        
        const originalText = button.textContent;
        button.textContent = '✅ 已复制';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }
    
    incrementTemplateUsage(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            template.usage++;
            this.saveTemplateUsageStats();
            
            // 重新渲染以更新使用次数显示
            this.renderTemplateList();
        }
    }
    
    filterTemplates(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderTemplateList();
            return;
        }
        
        const templateList = document.getElementById('templateList');
        if (!templateList) return;
        
        const filteredTemplates = this.templates.filter(template => {
            if (template.category !== this.currentCategory) return false;
            
            const searchText = searchTerm.toLowerCase();
            return template.title.toLowerCase().includes(searchText) ||
                   template.description.toLowerCase().includes(searchText) ||
                   template.content.toLowerCase().includes(searchText);
        });
        
        templateList.innerHTML = filteredTemplates.map(template => 
            this.createTemplateCard(template)
        ).join('');
        
        this.setupTemplateCardEvents();
    }
    
    saveTemplateUsageStats() {
        try {
            const usageStats = {};
            this.templates.forEach(template => {
                usageStats[template.id] = template.usage;
            });
            localStorage.setItem('cc-guide-template-usage', JSON.stringify(usageStats));
        } catch (e) {
            console.warn('无法保存模板使用统计:', e);
        }
    }
    
    loadTemplateUsageStats() {
        try {
            const usageStats = JSON.parse(localStorage.getItem('cc-guide-template-usage') || '{}');
            this.templates.forEach(template => {
                template.usage = usageStats[template.id] || 0;
            });
        } catch (e) {
            console.warn('无法加载模板使用统计:', e);
        }
    }
    
    // 公共方法：获取模板统计
    getTemplateStats() {
        const stats = {
            total: this.templates.length,
            byCategory: {},
            mostUsed: null,
            totalUsage: 0
        };
        
        this.templates.forEach(template => {
            if (!stats.byCategory[template.category]) {
                stats.byCategory[template.category] = 0;
            }
            stats.byCategory[template.category]++;
            stats.totalUsage += template.usage;
            
            if (!stats.mostUsed || template.usage > stats.mostUsed.usage) {
                stats.mostUsed = template;
            }
        });
        
        return stats;
    }
    
    // 公共方法：获取推荐模板
    getRecommendedTemplates(limit = 3) {
        return this.templates
            .filter(t => t.priority === 'high')
            .sort((a, b) => b.usage - a.usage)
            .slice(0, limit);
    }
}

// 添加模板面板样式
const addTemplateStyles = () => {
    if (document.getElementById('template-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'template-styles';
    style.textContent = `
        .template-categories {
            display: flex;
            gap: 0.5rem;
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
            overflow-x: auto;
        }
        
        .template-category {
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: var(--transition-fast);
            white-space: nowrap;
        }
        
        .template-category.active {
            background: var(--primary-color);
            color: var(--text-inverse);
        }
        
        .template-category:hover:not(.active) {
            background: var(--border-medium);
        }
        
        .template-list {
            padding: 1rem;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
        }
        
        .template-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-light);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
            transition: var(--transition-fast);
        }
        
        .template-card:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--primary-color);
        }
        
        .template-header {
            margin-bottom: 0.5rem;
        }
        
        .template-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 0.25rem 0;
        }
        
        .template-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .template-category {
            background: var(--bg-tertiary);
            padding: 0.125rem 0.5rem;
            border-radius: 0.75rem;
        }
        
        .template-description {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 1rem;
            line-height: 1.4;
        }
        
        .template-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .template-preview-btn,
        .template-copy-btn,
        .template-use-btn {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-light);
            padding: 0.375rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: var(--transition-fast);
        }
        
        .template-copy-btn {
            background: var(--primary-color);
            color: var(--text-inverse);
            border-color: var(--primary-color);
        }
        
        .template-use-btn {
            background: var(--success-color);
            color: var(--text-inverse);
            border-color: var(--success-color);
        }
        
        .template-preview-btn:hover,
        .template-copy-btn:hover,
        .template-use-btn:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
        }
        
        .template-preview {
            margin-top: 1rem;
            border-top: 1px solid var(--border-light);
            padding-top: 1rem;
        }
        
        .template-preview pre {
            background: var(--bg-code);
            padding: 1rem;
            border-radius: 0.25rem;
            overflow-x: auto;
            font-size: 0.8rem;
            line-height: 1.4;
            margin: 0;
        }
        
        .template-preview code {
            background: transparent;
            padding: 0;
        }
    `;
    
    document.head.appendChild(style);
};

// 初始化样式
addTemplateStyles();

// 导出给其他模块使用
window.TemplateManager = TemplateManager;