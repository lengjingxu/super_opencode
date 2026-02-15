        // Data Definitions
        const frontendStacks = [
            { id: 'react', name: 'React', icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>' },
            { id: 'vue', name: 'Vue', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 2L12 22 2 2h20z"/></svg>' },
            { id: 'nextjs', name: 'Next.js', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>' },
            { id: 'none', name: '无前端', icon: '<svg class="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>' }
        ];
        
        const backendStacks = [
            { id: 'python', name: 'Python', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
            { id: 'java', name: 'Java', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>' },
            { id: 'nodejs', name: 'Node.js', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
            { id: 'none', name: '无后端', icon: '<svg class="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>' }
        ];

        const styles = [
            { id: 'glassmorphism', name: '玻璃拟态', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
            { id: 'neumorphism', name: '新拟态', icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>' },
            { id: 'minimalist', name: '极简主义', icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>' },
            { id: 'brutalist', name: '粗野主义', icon: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18"/></svg>' },
            { id: 'flat-design', name: '扁平设计', icon: '<svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 2 22 22 22 12 2"/></svg>' },
            { id: 'material-design', name: 'Material', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>' },
            { id: 'dark-mode', name: '深色模式', icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' },
            { id: 'swiss-style', name: '瑞士风格', icon: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' }
        ];

        const categoryDefinitions = [
            { 
                id: 'visual-engineering', 
                name: '前端/UI', 
                icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.55 0 1-.45 1-1 0-1.25.8-2 2-2 1.35 0 2.45-.9 2.75-2.1.35-1.4.35-2.85-.75-3.65-.25-.2-.4-.45-.4-.75 0-1.1 1.25-1.75 2.5-1.1.55.3 1.25-.1 1.25-.7 0-4.95-4.5-9-10-9z"/></svg>',
                description: 'Frontend, UI/UX, design, styling, animation',
                recommendedType: 'creative',
                defaultModel: 'google/gemini-3-pro'
            },
            { 
                id: 'ultrabrain', 
                name: '复杂逻辑', 
                icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>',
                description: '复杂架构、深度逻辑推理',
                recommendedType: 'reasoning',
                defaultModel: 'openai/gpt-5.2-codex'
            },
            { 
                id: 'deep', 
                name: '深度研究', 
                icon: '<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
                description: '目标导向的自主问题解决',
                recommendedType: 'reasoning',
                defaultModel: 'openai/gpt-5.2-codex'
            },
            { 
                id: 'artistry', 
                name: '创意任务', 
                icon: '<svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
                description: '高度创意/艺术性任务',
                recommendedType: 'creative',
                defaultModel: 'google/gemini-3-pro'
            },
            { 
                id: 'quick', 
                name: '快速任务', 
                icon: '<svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
                description: '简单任务 - 单文件修改、typo修复',
                recommendedType: 'fast',
                defaultModel: 'anthropic/claude-haiku-4-5'
            },
            { 
                id: 'writing', 
                name: '文档写作', 
                icon: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
                description: '文档、散文、技术写作',
                recommendedType: 'writing',
                defaultModel: 'google/gemini-3-flash'
            }
        ];

        const modelTypeKeywords = {
            reasoning: ['codex', 'o1', 'o3', 'opus', 'thinking', 'pro'],
            creative: ['gemini', 'pro', 'opus', 'sonnet'],
            fast: ['haiku', 'flash', 'mini', 'fast'],
            writing: ['flash', 'sonnet', 'gemini']
        };

        // State
        let state = {
            view: 'wizard',
            step: 1,
            activeTab: 13,
            deployTab: 'fc',
            config: {
                frontend: '',
                backend: '',
                style: '',
                webhookType: 'feishu',
                webhookUrl: '',
                webhookSecret: '',
                notifyDeploy: false,
                notifyError: false,
                dbType: 'mysql',
                dbHost: 'localhost',
                dbPort: '5432',
                dbUsername: '',
                dbPassword: '',
                dbName: '',
                deployPlatform: 'aliyun-fc',
                accessKeyId: '',
                accessKeySecret: '',
                region: 'cn-hangzhou',
                serviceName: '',
                functionName: ''
            },
            credentials: {
                proxyName: '',
                apiFormat: 'openai',
                apiKey: '',
                baseUrl: ''
            },
            providers: [],
            imageService: {
                url: '',
                apiKey: '',
                skillInstalled: false
            },
            fcAccounts: [],
            dockerRegistries: [],
            ecsServers: [],
            dbConnections: {},
            promptAppends: {},
            agentPromptAppends: {},
            categoryModels: {}
        };

        // DOM Elements
        const el = (id) => document.getElementById(id);

        // Theme Management
        function setTheme(themeName) {
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem('omo-theme', themeName);
            updateThemeButtons(themeName);
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem('omo-theme') || 'minimalist';
            setTheme(savedTheme);
        }

        function updateThemeButtons(activeTheme) {
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const themeMap = {
                'minimalist': '.theme-btn-minimalist',
                'glassmorphism': '.theme-btn-glass',
                'swiss': '.theme-btn-swiss'
            };
            const activeBtn = document.querySelector(themeMap[activeTheme]);
            if (activeBtn) activeBtn.classList.add('active');
        }

        // Initialization
        async function init() {
            loadTheme();
            try {
                // Load saved app config
                const savedConfig = await window.api.loadConfig();
                if (savedConfig && savedConfig.success && savedConfig.data) {
                    state.config = { ...state.config, ...savedConfig.data };
                    if (savedConfig.data.imageService) {
                        state.imageService.url = savedConfig.data.imageService.url || '';
                        state.imageService.apiKey = savedConfig.data.imageService.apiKey || '';
                    }
                }
                
                const savedCreds = await window.api.loadCredentials();
                if (savedCreds && savedCreds.success && savedCreds.data) {
                    state.credentials = { ...state.credentials, ...savedCreds.data };
                }

                // Load real OpenCode/Oh-My-OpenCode configs
                const realConfigs = await window.api.loadAllConfigs();
                if (realConfigs.success && realConfigs.configs) {
                    const { opencode, ohMyOpencode, auth } = realConfigs.configs;
                    
                    // Merge opencode.json settings
                    if (opencode) {
                        if (opencode.provider) {
                            // Populate providers list
                            state.providers = Object.entries(opencode.provider).map(([key, config]) => {
                                // Infer apiFormat from npm package
                                let apiFormat = 'openai';
                                if (config.npm) {
                                    if (config.npm.includes('anthropic')) apiFormat = 'anthropic';
                                    else if (config.npm.includes('google')) apiFormat = 'gemini';
                                }
                                return {
                                    name: key,  // provider key (用于引用)
                                    displayName: config.name || '',  // 显示名称
                                    apiFormat,
                                    baseUrl: config.options?.baseURL || '',
                                    apiKey: config.options?.apiKey || '', // 从 options 读取 apiKey
                                    npm: config.npm || '',
                                    models: config.models || {}
                                };
                            });

                            const providerKeys = Object.keys(opencode.provider);
                            if (providerKeys.length > 0) {
                                const firstProvider = opencode.provider[providerKeys[0]];
                                state.credentials.proxyName = providerKeys[0];
                                if (firstProvider.options && firstProvider.options.baseURL) {
                                    state.credentials.baseUrl = firstProvider.options.baseURL;
                                }
                            }
                        }
                    }
                    
                    // Merge oh-my-opencode.json settings
                    if (ohMyOpencode) {
                        if (ohMyOpencode.frontend) state.config.frontend = ohMyOpencode.frontend;
                        if (ohMyOpencode.backend) state.config.backend = ohMyOpencode.backend;
                        if (ohMyOpencode.designStyle) state.config.style = ohMyOpencode.designStyle;
                        
                        // Load prompt appends
                        if (ohMyOpencode.categories) {
                            state.promptAppends = {};
                            for (const [key, value] of Object.entries(ohMyOpencode.categories)) {
                                if (value.prompt_append) {
                                    state.promptAppends[key] = value.prompt_append;
                                }
                            }
                        }
                    }
                    
                    // Merge auth.json settings
                    if (auth) {
                        // Fill keys for providers - match by provider NAME, not apiFormat
                        state.providers.forEach(p => {
                            // Try exact name match first
                            if (auth[p.name] && auth[p.name].key) {
                                p.apiKey = auth[p.name].key;
                            }
                            // Also try apiFormat match as fallback
                            else if (auth[p.apiFormat] && auth[p.apiFormat].key) {
                                p.apiKey = auth[p.apiFormat].key;
                            }
                        });

                        const authKeys = Object.keys(auth);
                        if (authKeys.length > 0) {
                            const firstAuth = auth[authKeys[0]];
                            if (firstAuth && firstAuth.key) {
                                state.credentials.apiKey = firstAuth.key;
                            }
                            // Detect API format from auth key name
                            if (authKeys[0].includes('openai')) state.credentials.apiFormat = 'openai';
                            else if (authKeys[0].includes('anthropic')) state.credentials.apiFormat = 'anthropic';
                            else if (authKeys[0].includes('gemini')) state.credentials.apiFormat = 'gemini';
                        }
                    }
                }

                // Check status
                const status = await window.api.checkInitStatus();
                const isInit = status && !status.needsSetup;
                
                if (isInit) {
                    state.view = 'dashboard';
                    showDashboard();
                } else {
                    state.view = 'wizard';
                    showWizard();
                }
                
                renderOptions();
                bindInputs();
                
                // Load additional data for dashboard
                if (state.view === 'dashboard') {
                    loadAgentsMd();
                    loadPromptAppends();
                }
            } catch (e) {
                console.error('Init failed', e);
                // Fallback to wizard if error
                state.view = 'wizard';
                showWizard();
                renderOptions();
            }
        }

        // --- Render Functions ---

        function renderOptions() {
            // Render Tech Stacks (Wizard & Dashboard)
            const renderCards = (items, containerId, category, isDashboard) => {
                const container = el(containerId);
                if (!container) return;
                container.innerHTML = items.map(item => `
                    <div class="card ${state.config[category] === item.id ? 'selected' : ''}" 
                         onclick="${isDashboard ? 'selectDashStack' : 'selectWizStack'}('${category}', '${item.id}')">
                        <div class="card-icon">${item.icon}</div>
                        <div class="card-title">${item.name}</div>
                    </div>
                `).join('');
            };

            renderCards(frontendStacks, 'wizard-frontend-options', 'frontend', false);
            renderCards(backendStacks, 'wizard-backend-options', 'backend', false);
            renderCards(frontendStacks, 'dash-frontend-options', 'frontend', true);
            renderCards(backendStacks, 'dash-backend-options', 'backend', true);

            // Render Styles
            const renderStyles = (containerId, isDashboard) => {
                const container = el(containerId);
                if (!container) return;
                container.innerHTML = styles.map(item => `
                    <div class="card ${state.config.style === item.id ? 'selected' : ''}" 
                         onclick="${isDashboard ? 'selectDashStyle' : 'selectWizStyle'}('${item.id}')">
                        <div class="card-icon">${item.icon}</div>
                        <div class="card-title">${item.name}</div>
                    </div>
                `).join('');
            };

            renderStyles('wizard-style-options', false);
            renderStyles('dash-style-options', true);
        }

        function bindInputs() {
            // Bind Dashboard Inputs to State
            const bind = (id, obj, key, type = 'value') => {
                const element = el(id);
                if (!element) return;
                if (type === 'checkbox') {
                    element.checked = state[obj][key];
                    element.onchange = (e) => state[obj][key] = e.target.checked;
                } else {
                    element.value = state[obj][key] || '';
                    element.oninput = (e) => state[obj][key] = e.target.value;
                }
            };

            // Webhook
            bind('webhook-type', 'config', 'webhookType');
            bind('webhook-url', 'config', 'webhookUrl');
            bind('webhook-secret', 'config', 'webhookSecret');
            bind('notify-deploy', 'config', 'notifyDeploy', 'checkbox');
            bind('notify-error', 'config', 'notifyError', 'checkbox');

            // Database
            bind('db-type', 'config', 'dbType');
            bind('db-host', 'config', 'dbHost');
            bind('db-port', 'config', 'dbPort');
            bind('db-username', 'config', 'dbUsername');
            bind('db-password', 'config', 'dbPassword');
            bind('db-name', 'config', 'dbName');

            // Deploy
            bind('deploy-platform', 'config', 'deployPlatform');
            bind('deploy-ak-id', 'config', 'accessKeyId');
            bind('deploy-ak-secret', 'config', 'accessKeySecret');
            bind('deploy-region', 'config', 'region');
            bind('deploy-service', 'config', 'serviceName');
            bind('deploy-function', 'config', 'functionName');

            // Model (Dashboard)
            bind('dash-proxy-name', 'credentials', 'proxyName');
            bind('dash-api-format', 'credentials', 'apiFormat');
            bind('dash-base-url', 'credentials', 'baseUrl');
            bind('dash-api-key', 'credentials', 'apiKey');
            
            // Model (Wizard)
            bind('wiz-proxy-name', 'credentials', 'proxyName');
            bind('wiz-api-format', 'credentials', 'apiFormat');
            bind('wiz-base-url', 'credentials', 'baseUrl');
            bind('wiz-api-key', 'credentials', 'apiKey');
        }

        // --- Wizard Logic ---

        function resetToWizard() {
            if (confirm('确定要重新进入安装引导吗？当前配置不会被删除。')) {
                state.step = 1;
                state.view = 'wizard';
                window.api.installSkills();
                showWizard();
            }
        }

        function showWizard() {
            el('wizard-view').classList.remove('hidden');
            el('dashboard-view').classList.add('hidden');
            updateWizardStep();
        }

        function updateWizardStep() {
            // Hide all steps
            for (let i = 1; i <= 5; i++) el(`step-${i}`).classList.add('hidden');
            // Show current
            el(`step-${state.step}`).classList.remove('hidden');
            
            // Update dots
            const dotsContainer = el('wizard-dots');
            dotsContainer.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const dot = document.createElement('div');
                dot.className = `progress-dot ${i === state.step ? 'active' : ''}`;
                dotsContainer.appendChild(dot);
            }

            // Update buttons
            const prevBtn = el('btn-prev');
            const nextBtn = el('btn-next');
            
            prevBtn.style.visibility = state.step === 1 ? 'hidden' : 'visible';
            nextBtn.textContent = state.step === 5 ? '完成配置' : '下一步';
            
            // Validation for Next button
            validateStep();
        }

        function validateStep() {
            const nextBtn = el('btn-next');
            let isValid = true;
            
            if (state.step === 1) {
                isValid = el('check-opencode').checked;
            } else if (state.step === 2) {
                isValid = el('check-omo').checked;
            } else if (state.step === 3) {
                isValid = state.config.frontend && state.config.backend;
            } else if (state.step === 4) {
                isValid = !!state.config.style;
            } else if (state.step === 5) {
                isValid = true;
            }
            
            nextBtn.disabled = !isValid;
            nextBtn.style.opacity = isValid ? '1' : '0.5';
        }

        window.toggleNextBtn = (checked) => {
            validateStep();
        };

        window.prevStep = () => {
            if (state.step > 1) {
                state.step--;
                updateWizardStep();
            }
        };

        window.nextStep = async () => {
            if (state.step < 5) {
                state.step++;
                updateWizardStep();
            } else {
                // Finish
                await window.api.installSkills();
                await saveAll();
                state.view = 'dashboard';
                showDashboard();
                showToast('配置已完成！');
            }
        };

        window.selectWizStack = (category, id) => {
            state.config[category] = id;
            renderOptions();
            validateStep();
        };

        window.selectWizStyle = (id) => {
            state.config.style = id;
            renderOptions();
            validateStep();
        };

        window.copyCommand = () => {
            const cmd = el('install-cmd').innerText;
            if (navigator.clipboard) navigator.clipboard.writeText(cmd);
            showToast('命令已复制');
        };

        // --- Dashboard Logic ---

        function showDashboard() {
            el('wizard-view').classList.add('hidden');
            el('dashboard-view').classList.remove('hidden');
            switchTab(state.activeTab);
        }

        window.switchTab = (index) => {
            state.activeTab = index;
            for (let i = 0; i <= 13; i++) {
                const nav = el(`nav-${i}`);
                const tab = el(`tab-${i}`);
                if (nav) nav.classList.toggle('active', i === index);
                if (tab) tab.classList.toggle('hidden', i !== index);
            }
            
            if (index === 0) {
                // Tab 0: Appearance - no image service loading here
            }

            if (index === 2) {
                if (typeof backToProviderList === 'function') {
                    backToProviderList();
                } else {
                    renderProviderList();
                }
            }
            if (index === 3) loadWebhookConfig();
            if (index === 4) loadSqlConfig();
            if (index === 5) {
                if (!state.deployTab) state.deployTab = 'fc';
                switchDeployTab(state.deployTab);
            }
            if (index === 6) loadAgentsMd();
            if (index === 7) loadPromptAppends();
            if (index === 8) {
                const urlInput = document.getElementById('image-service-url');
                const keyInput = document.getElementById('image-service-key');
                if (urlInput) urlInput.value = state.imageService.url || '';
                if (keyInput) keyInput.value = state.imageService.apiKey || '';
                checkImageSkillStatus();
            }
            if (index === 9) loadAgentModels();
            if (index === 10) loadBackupList();
            if (index === 11) loadUserCenter();
            if (index === 12) loadFeishuConfig();
            if (index === 13) loadLauncherSessions();
        };

        window.toggleNavGroup = (header) => {
            const group = header.parentElement;
            group.classList.toggle('collapsed');
        };

        window.selectDashStack = (category, id) => {
            state.config[category] = id;
            renderOptions();
        };

        // Launcher
        let launcherSessions = [];

        async function loadLauncherSessions() {
            try {
                const result = await window.api.loadSessions();
                if (result && result.success && result.data && result.data.sessions) {
                    launcherSessions = result.data.sessions;
                } else {
                    launcherSessions = [];
                }
            } catch (e) {
                launcherSessions = [];
            }
            renderLauncherSessions();
            updateLauncherServerStatus();
        }

        function renderLauncherSessions() {
            const container = el('launcher-sessions-list');
            const clearBtn = el('launcher-clear-btn');
            if (!container) return;

            if (launcherSessions.length === 0) {
                clearBtn.style.display = 'none';
                container.innerHTML = `
                    <div class="launcher-empty">
                        <svg class="icon icon-lg" viewBox="0 0 24 24" style="color: var(--text-muted); margin-bottom: 8px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <p>暂无历史会话</p>
                        <p class="text-sm">点击上方按钮选择目录开始</p>
                    </div>`;
                return;
            }

            clearBtn.style.display = '';
            container.innerHTML = launcherSessions
                .sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
                .map((s, i) => `
                    <div class="launcher-session-item" onclick="launcherOpenSession(${i})">
                        <div class="launcher-session-icon">
                            <svg class="icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div class="launcher-session-info">
                            <div class="launcher-session-name">${escapeHtml(s.name)}</div>
                            <div class="launcher-session-path">${escapeHtml(s.dir)}</div>
                        </div>
                        <div class="launcher-session-time">${formatRelativeTime(s.lastOpened)}</div>
                        <button class="launcher-session-remove" onclick="event.stopPropagation(); launcherRemoveSession(${i})" title="移除">
                            <svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>`).join('');
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str || '';
            return div.innerHTML;
        }

        function formatRelativeTime(isoStr) {
            if (!isoStr) return '';
            const diff = Date.now() - new Date(isoStr).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return '刚刚';
            if (mins < 60) return mins + ' 分钟前';
            const hours = Math.floor(mins / 60);
            if (hours < 24) return hours + ' 小时前';
            const days = Math.floor(hours / 24);
            if (days < 30) return days + ' 天前';
            return new Date(isoStr).toLocaleDateString();
        }

        async function saveLauncherSessions() {
            try {
                await window.api.saveSessions({ sessions: launcherSessions.slice(0, 20) });
            } catch (e) {
                console.error('Failed to save sessions:', e);
            }
        }

        function addSessionToHistory(dir) {
            const name = dir.split('/').pop() || dir;
            const existing = launcherSessions.findIndex(s => s.dir === dir);
            if (existing >= 0) {
                launcherSessions[existing].lastOpened = new Date().toISOString();
            } else {
                launcherSessions.unshift({ dir, name, lastOpened: new Date().toISOString() });
            }
            saveLauncherSessions();
        }

        window.launcherNewSession = async () => {
            const result = await window.api.openClientWindow();
            if (result && result.success) {
                if (result.dir) {
                    addSessionToHistory(result.dir);
                    renderLauncherSessions();
                }
                showToast('会话已启动');
                updateLauncherServerStatus();
            } else if (result && result.error) {
                showToast('启动失败: ' + result.error);
            }
        };

        window.launcherOpenSession = async (index) => {
            const session = launcherSessions[index];
            if (!session) return;
            addSessionToHistory(session.dir);
            renderLauncherSessions();
            const result = await window.api.openClientWindowWithDir(session.dir);
            if (result && result.success) {
                showToast('会话已启动');
                updateLauncherServerStatus();
            } else if (result && result.error) {
                showToast('启动失败: ' + result.error);
            }
        };

        window.launcherRemoveSession = async (index) => {
            launcherSessions.splice(index, 1);
            await saveLauncherSessions();
            renderLauncherSessions();
        };

        window.launcherClearSessions = async () => {
            if (!confirm('确定清空所有历史会话记录？')) return;
            launcherSessions = [];
            await saveLauncherSessions();
            renderLauncherSessions();
        };

        window.launcherReconnect = async () => {
            const result = await window.api.openClientWindow();
            if (result && result.success) {
                updateLauncherServerStatus();
            }
        };

        async function updateLauncherServerStatus() {
            const statusEl = el('launcher-server-status');
            if (!statusEl) return;
            try {
                const status = await window.api.checkInitStatus();
                if (status && status.opencode) {
                    statusEl.classList.remove('hidden');
                    statusEl.querySelector('.launcher-status-text').textContent = 'OpenCode 已安装';
                } else {
                    statusEl.classList.add('hidden');
                }
            } catch (e) {
                statusEl.classList.add('hidden');
            }
        }

        // --- Provider Management ---

        function renderProviderList() {
            const tbody = document.getElementById('provider-table-body');
            if (!tbody) return;
            
            tbody.innerHTML = state.providers.map((p, i) => {
                const modelCount = Object.keys(p.models || {}).length;
                const formatLabel = p.apiFormat === 'anthropic' ? 'Anthropic' : 
                                    p.apiFormat === 'gemini' ? 'Gemini' : 'OpenAI';
                return `
                    <tr>
                        <td style="font-weight: var(--font-medium);">${p.displayName || p.name || '未命名'}<br><small style="color: var(--text-muted); font-weight: normal;">${p.name || ''}</small></td>
                        <td><span class="badge">${formatLabel}</span></td>
                        <td>${modelCount} 个模型</td>
                        <td class="table-actions">
                            <button class="btn btn-ghost btn-sm" onclick="editProvider(${i})">编辑</button>
                            <button class="btn btn-ghost btn-sm" onclick="editModels(${i})">模型</button>
                            <button class="btn btn-ghost btn-sm" onclick="removeProvider(${i})" style="color: var(--danger);">删除</button>
                        </td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="4" class="empty-state" style="padding: var(--space-8);">暂无服务商配置，点击下方按钮添加</td></tr>';
        }

        window.addProvider = () => {
            state.providers.push({ 
                name: '', 
                displayName: '',
                apiFormat: 'openai', 
                baseUrl: '', 
                apiKey: '',
                npm: '',
                models: {}
            });
            editProvider(state.providers.length - 1);
        };

        window.removeProvider = (index) => {
            if (confirm('确定要删除这个服务商吗？')) {
                state.providers.splice(index, 1);
                renderProviderList();
            }
        };

        window.editProvider = (index) => {
            state.editingProviderIndex = index;
            const p = state.providers[index];
            
            document.getElementById('provider-list-view').classList.add('hidden');
            document.getElementById('provider-edit-view').classList.remove('hidden');
            document.getElementById('model-list-view').classList.add('hidden');
            
            document.getElementById('provider-edit-view').innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                    <button class="btn" onclick="backToProviderList()" style="margin-right: 16px;">← 返回</button>
                    <h3 style="margin: 0;">编辑服务商: ${p.displayName || p.name || '新服务商'}</h3>
                </div>
                
                <div class="form-group">
                    <label class="form-label">服务商 ID（唯一标识，用于配置引用）</label>
                    <input type="text" class="input" id="edit-provider-name" value="${p.name || ''}" placeholder="如: my-proxy">
                    <p class="form-hint">用于 model 配置中引用，如 my-proxy/gpt-4</p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">显示名称</label>
                    <input type="text" class="input" id="edit-provider-display-name" value="${p.displayName || ''}" placeholder="如: 我的代理服务">
                </div>
                
                <div class="form-group">
                    <label class="form-label">接口格式</label>
                    <select class="select" id="edit-provider-format" onchange="updateNpmHint()">
                        <option value="openai" ${p.apiFormat === 'openai' ? 'selected' : ''}>OpenAI 格式</option>
                        <option value="anthropic" ${p.apiFormat === 'anthropic' ? 'selected' : ''}>Anthropic 格式</option>
                        <option value="gemini" ${p.apiFormat === 'gemini' ? 'selected' : ''}>Gemini 格式</option>
                    </select>
                    <p class="form-hint">NPM 包将自动关联：<span id="edit-provider-npm-hint">${getNpmPackageForFormat(p.apiFormat)}</span></p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">API 地址</label>
                    <input type="text" class="input" id="edit-provider-url" value="${p.baseUrl || ''}" placeholder="https://api.example.com/v1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">API Key</label>
                    <input type="password" class="input" id="edit-provider-key" value="${p.apiKey || ''}">
                </div>
                
                <button class="btn btn-primary" onclick="saveProviderEdit()">保存</button>
            `;
        };

        window.saveProviderEdit = () => {
            const i = state.editingProviderIndex;
            state.providers[i].name = document.getElementById('edit-provider-name').value;
            state.providers[i].displayName = document.getElementById('edit-provider-display-name').value;
            state.providers[i].apiFormat = document.getElementById('edit-provider-format').value;
            state.providers[i].baseUrl = document.getElementById('edit-provider-url').value;
            state.providers[i].apiKey = document.getElementById('edit-provider-key').value;
            state.providers[i].npm = getNpmPackageForFormat(state.providers[i].apiFormat);
            
            backToProviderList();
            showToast('服务商配置已更新', 'success');
        };

        function getNpmPackageForFormat(format) {
            const npmMap = {
                'openai': '@ai-sdk/openai',
                'anthropic': '@ai-sdk/anthropic',
                'gemini': '@ai-sdk/google'
            };
            return npmMap[format] || '@ai-sdk/openai';
        }

        function updateNpmHint() {
            const format = document.getElementById('edit-provider-format').value;
            const hint = document.getElementById('edit-provider-npm-hint');
            if (hint) {
                hint.textContent = getNpmPackageForFormat(format);
            }
        }

        window.backToProviderList = () => {
            document.getElementById('provider-list-view').classList.remove('hidden');
            document.getElementById('provider-edit-view').classList.add('hidden');
            document.getElementById('model-list-view').classList.add('hidden');
            renderProviderList();
        };

        // --- Model Management ---

        window.editModels = (providerIndex) => {
            state.editingProviderIndex = providerIndex;
            
            document.getElementById('provider-list-view').classList.add('hidden');
            document.getElementById('provider-edit-view').classList.add('hidden');
            document.getElementById('model-list-view').classList.remove('hidden');
            
            renderModelList(providerIndex);
        };

        function renderModelList(providerIndex) {
            const p = state.providers[providerIndex];
            const models = Object.entries(p.models || {});
            
            document.getElementById('model-list-view').innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                    <button class="btn" onclick="backToProviderList()" style="margin-right: 16px;">← 返回</button>
                    <h3 style="margin: 0;">${p.name} - 模型配置</h3>
                </div>
                
                <div id="model-cards">
                    ${models.map(([modelId, model]) => `
                        <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <strong>${model.name || modelId}</strong>
                                <button class="btn" onclick="removeModel(${providerIndex}, '${modelId}')" style="color: #e74c3c; padding: 4px 8px;">删除</button>
                            </div>
                            
                            <div class="grid-2" style="gap: 12px;">
                                <div class="form-group" style="margin-bottom: 8px;">
                                    <label class="form-label" style="font-size: 12px;">模型 ID</label>
                                    <input type="text" class="input" value="${modelId}" onchange="renameModel(${providerIndex}, '${modelId}', this.value)">
                                </div>
                                <div class="form-group" style="margin-bottom: 8px;">
                                    <label class="form-label" style="font-size: 12px;">显示名称</label>
                                    <input type="text" class="input" value="${model.name || ''}" onchange="updateModel(${providerIndex}, '${modelId}', 'name', this.value)">
                                </div>
                            </div>
                            
                            <div class="grid-2" style="gap: 12px;">
                                <div class="form-group" style="margin-bottom: 8px;">
                                    <label class="form-label" style="font-size: 12px;">上下文限制</label>
                                    <input type="number" class="input" value="${model.limit?.context || 200000}" onchange="updateModelLimit(${providerIndex}, '${modelId}', 'context', parseInt(this.value))">
                                </div>
                                <div class="form-group" style="margin-bottom: 8px;">
                                    <label class="form-label" style="font-size: 12px;">输出限制</label>
                                    <input type="number" class="input" value="${model.limit?.output || 64000}" onchange="updateModelLimit(${providerIndex}, '${modelId}', 'output', parseInt(this.value))">
                                </div>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 8px;">
                                <label class="form-label" style="font-size: 12px;">输入模态 (逗号分隔)</label>
                                <input type="text" class="input" value="${(model.modalities?.input || ['text']).join(', ')}" onchange="updateModelModalities(${providerIndex}, '${modelId}', 'input', this.value)">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 12px;">Variants (JSON)</label>
                                <textarea class="input" style="font-family: monospace; font-size: 12px; min-height: 80px;" onchange="updateModelVariants(${providerIndex}, '${modelId}', this.value)">${JSON.stringify(model.variants || {}, null, 2)}</textarea>
                            </div>
                        </div>
                    `).join('') || '<p class="text-muted">暂无模型配置</p>'}
                </div>
                
                <button class="btn" onclick="addModel(${providerIndex})" style="margin-top: 16px;">+ 添加模型</button>
                <button class="btn btn-primary" onclick="saveAllAndBack()" style="margin-top: 16px; margin-left: 8px;">保存并返回</button>
            `;
        }

        window.saveAllAndBack = async () => {
            await saveAll();
            backToProviderList();
        };

        window.addModel = (providerIndex) => {
            if (!state.providers[providerIndex].models) {
                state.providers[providerIndex].models = {};
            }
            const modelId = 'new-model-' + Date.now();
            state.providers[providerIndex].models[modelId] = {
                name: '',
                limit: { context: 200000, output: 64000 },
                modalities: { input: ['text'], output: ['text'] },
                variants: {}
            };
            renderModelList(providerIndex);
        };

        window.removeModel = (providerIndex, modelId) => {
            delete state.providers[providerIndex].models[modelId];
            renderModelList(providerIndex);
        };

        window.renameModel = (providerIndex, oldId, newId) => {
            if (oldId !== newId && newId) {
                const provider = state.providers[providerIndex];
                provider.models[newId] = provider.models[oldId];
                delete provider.models[oldId];
                renderModelList(providerIndex);
            }
        };

        window.updateModel = (providerIndex, modelId, field, value) => {
            state.providers[providerIndex].models[modelId][field] = value;
        };

        window.updateModelLimit = (providerIndex, modelId, field, value) => {
            if (!state.providers[providerIndex].models[modelId].limit) {
                state.providers[providerIndex].models[modelId].limit = {};
            }
            state.providers[providerIndex].models[modelId].limit[field] = value;
        };

        window.updateModelModalities = (providerIndex, modelId, type, value) => {
            if (!state.providers[providerIndex].models[modelId].modalities) {
                state.providers[providerIndex].models[modelId].modalities = { input: [], output: [] };
            }
            state.providers[providerIndex].models[modelId].modalities[type] = value.split(',').map(s => s.trim()).filter(Boolean);
        };

        window.updateModelVariants = (providerIndex, modelId, value) => {
            try {
                state.providers[providerIndex].models[modelId].variants = JSON.parse(value);
            } catch (e) {
                // Invalid JSON, ignore
            }
        };

        // --- Image Service Management ---

        async function checkImageSkillStatus() {
            const statusEl = document.getElementById('image-skill-status');
            if (!statusEl) return;
            
            statusEl.innerHTML = '<span style="color: var(--text-muted);">正在检测 Skill 状态...</span>';
            
            try {
                const result = await window.api.checkSkillInstalled('image-generator');
                
                if (result && result.installed) {
                    state.imageService.skillInstalled = true;
                    statusEl.innerHTML = '<span style="color: #27ae60;">✓ image-generator Skill 已安装</span>';
                } else {
                    state.imageService.skillInstalled = false;
                    statusEl.innerHTML = '<span style="color: #e67e22;">⚠ image-generator Skill 未安装</span><br><small class="text-muted">保存配置后将自动安装</small>';
                }
            } catch (e) {
                statusEl.innerHTML = '<span style="color: #666;">无法检测 Skill 状态</span>';
            }
        }

        window.saveImageService = async () => {
            state.imageService.url = document.getElementById('image-service-url').value;
            state.imageService.apiKey = document.getElementById('image-service-key').value;
            
            try {
                // Save config
                await window.api.saveConfig({
                    ...state.config,
                    imageService: {
                        url: state.imageService.url,
                        apiKey: state.imageService.apiKey
                    }
                });
                
                // If URL is provided, we should try to install/configure the skill
                if (state.imageService.url) {
                    showToast('正在配置 image-generator Skill...', 'info');
                    // We assume window.api.installImageGeneratorSkill exists or we implement it via generic command
                    // Since we don't have that specific API exposed in the mock, we'll simulate it or use generic
                    // For now, just save the config is enough as the "Skill" is likely just using this config
                }
                
                showToast('生图服务配置已保存', 'success');
                checkImageSkillStatus();
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        window.selectDashStyle = (id) => {
            state.config.style = id;
            renderOptions();
        };

        // --- FC Config Functions ---
        async function loadFcConfig() {
            try {
                const result = await window.api.getFcConfig();
                if (result.success && result.data) {
                    state.fcAccounts = result.data.accounts || [];
                    renderFcAccounts();
                }
            } catch (e) {
                console.error('Failed to load FC config:', e);
            }
            checkFcSkillStatus();
        }

        async function checkFcSkillStatus() {
            const statusEl = document.getElementById('fc-skill-status');
            if (!statusEl) return;
            try {
                const result = await window.api.checkSkillInstalled('deploy-fc');
                if (result && result.installed) {
                    statusEl.innerHTML = '<span style="color: #27ae60;">✓ deploy-fc Skill 已安装</span>';
                } else {
                    statusEl.innerHTML = '<span style="color: #e67e22;">⚠ deploy-fc Skill 未安装</span><br><small>保存配置后将自动安装</small>';
                }
            } catch (e) {
                statusEl.innerHTML = '<span style="color: #666;">无法检测 Skill 状态</span>';
            }
        }

        function renderFcAccounts() {
            const container = document.getElementById('fc-accounts-list');
            if (!container) return;
            if (state.fcAccounts.length === 0) {
                container.innerHTML = '<p class="text-muted">暂无配置的账号，点击下方按钮添加</p>';
                return;
            }
            container.innerHTML = state.fcAccounts.map((acc, i) => `
                <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong>${acc.name || '未命名账号'}</strong>
                        <button class="btn" onclick="removeFcAccount(${i})" style="color: #e74c3c; padding: 4px 8px;">删除</button>
                    </div>
                    <div class="form-group"><label class="form-label">账号名称</label>
                        <input type="text" class="input" value="${acc.name || ''}" onchange="updateFcAccount(${i}, 'name', this.value)"></div>
                    <div class="form-group"><label class="form-label">Account ID</label>
                        <input type="text" class="input" value="${acc.account_id || ''}" onchange="updateFcAccount(${i}, 'account_id', this.value)"></div>
                    <div class="form-group"><label class="form-label">AccessKey ID</label>
                        <input type="text" class="input" value="${acc.access_key_id || ''}" onchange="updateFcAccount(${i}, 'access_key_id', this.value)"></div>
                    <div class="form-group"><label class="form-label">AccessKey Secret</label>
                        <input type="password" class="input" value="${acc.access_key_secret || ''}" onchange="updateFcAccount(${i}, 'access_key_secret', this.value)"></div>
                    <div class="form-group"><label class="form-label">地域</label>
                        <select class="select" onchange="updateFcAccount(${i}, 'region', this.value)">
                            <option value="cn-hangzhou" ${acc.region === 'cn-hangzhou' ? 'selected' : ''}>cn-hangzhou</option>
                            <option value="cn-shanghai" ${acc.region === 'cn-shanghai' ? 'selected' : ''}>cn-shanghai</option>
                            <option value="cn-beijing" ${acc.region === 'cn-beijing' ? 'selected' : ''}>cn-beijing</option>
                            <option value="cn-shenzhen" ${acc.region === 'cn-shenzhen' ? 'selected' : ''}>cn-shenzhen</option>
                        </select></div>
                </div>
            `).join('');
        }

        window.addFcAccount = () => {
            state.fcAccounts.push({ name: '', account_id: '', access_key_id: '', access_key_secret: '', region: 'cn-hangzhou' });
            renderFcAccounts();
        };

        window.removeFcAccount = (index) => {
            state.fcAccounts.splice(index, 1);
            renderFcAccounts();
        };

        window.updateFcAccount = (index, field, value) => {
            state.fcAccounts[index][field] = value;
        };

        window.saveFcConfig = async () => {
            try {
                const validAccounts = state.fcAccounts.filter(acc => acc.name || acc.access_key_id);
                await window.api.saveFcConfig({
                    accounts: validAccounts,
                    default_account: validAccounts.length > 0 ? validAccounts[0].name : ''
                });
                showToast('部署配置已保存', 'success');
                checkFcSkillStatus();
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        // --- Deploy Tab Management ---
        window.switchDeployTab = (tab) => {
            state.deployTab = tab;
            
            // Update buttons
            document.querySelectorAll('[id^="deploy-tab-"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`deploy-tab-${tab}`).classList.add('active');
            
            // Update views
            document.querySelectorAll('[id^="deploy-view-"]').forEach(view => view.classList.add('hidden'));
            document.getElementById(`deploy-view-${tab}`).classList.remove('hidden');
            
            // Load data if needed
            if (tab === 'fc') loadFcConfig();
            if (tab === 'docker') loadDockerConfig();
            if (tab === 'ecs') loadEcsConfig();
        };

        // --- Docker Config Functions ---
        async function loadDockerConfig() {
            try {
                // Try to read from skill config
                const result = await window.api.readSkillConfig('deploy-docker');
                if (result.success && result.data) {
                    state.dockerRegistries = result.data.registries || [];
                    renderDockerRegistries();
                }
            } catch (e) {
                console.error('Failed to load Docker config:', e);
            }
            checkDockerSkillStatus();
        }

        async function checkDockerSkillStatus() {
            const statusEl = document.getElementById('docker-skill-status');
            if (!statusEl) return;
            try {
                const result = await window.api.checkSkillInstalled('deploy-docker');
                if (result && result.installed) {
                    statusEl.innerHTML = '<span style="color: #27ae60;">✓ deploy-docker Skill 已安装</span>';
                } else {
                    statusEl.innerHTML = '<span style="color: #e67e22;">⚠ deploy-docker Skill 未安装</span><br><small>保存配置后将自动安装</small>';
                }
            } catch (e) {
                statusEl.innerHTML = '<span style="color: #666;">无法检测 Skill 状态</span>';
            }
        }

        function renderDockerRegistries() {
            const container = document.getElementById('docker-registries-list');
            if (!container) return;
            if (state.dockerRegistries.length === 0) {
                container.innerHTML = '<p class="text-muted">暂无配置的仓库，点击下方按钮添加</p>';
                return;
            }
            container.innerHTML = state.dockerRegistries.map((reg, i) => `
                <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong>${reg.name || '未命名仓库'}</strong>
                        <button class="btn" onclick="removeDockerRegistry(${i})" style="color: #e74c3c; padding: 4px 8px;">删除</button>
                    </div>
                    <div class="form-group"><label class="form-label">仓库名称 (别名)</label>
                        <input type="text" class="input" value="${reg.name || ''}" onchange="updateDockerRegistry(${i}, 'name', this.value)" placeholder="例如: my-dockerhub"></div>
                    <div class="form-group"><label class="form-label">Registry URL</label>
                        <input type="text" class="input" value="${reg.registry_url || ''}" onchange="updateDockerRegistry(${i}, 'registry_url', this.value)" placeholder="https://index.docker.io/v1/ 或 registry.cn-hangzhou.aliyuncs.com"></div>
                    <div class="form-group"><label class="form-label">命名空间 (Namespace)</label>
                        <input type="text" class="input" value="${reg.namespace || ''}" onchange="updateDockerRegistry(${i}, 'namespace', this.value)"></div>
                    <div class="form-group"><label class="form-label">用户名</label>
                        <input type="text" class="input" value="${reg.username || ''}" onchange="updateDockerRegistry(${i}, 'username', this.value)"></div>
                    <div class="form-group"><label class="form-label">密码 / Token</label>
                        <input type="password" class="input" value="${reg.password || ''}" onchange="updateDockerRegistry(${i}, 'password', this.value)"></div>
                </div>
            `).join('');
        }

        window.addDockerRegistry = () => {
            state.dockerRegistries.push({ name: '', registry_url: '', namespace: '', username: '', password: '' });
            renderDockerRegistries();
        };

        window.removeDockerRegistry = (index) => {
            state.dockerRegistries.splice(index, 1);
            renderDockerRegistries();
        };

        window.updateDockerRegistry = (index, field, value) => {
            state.dockerRegistries[index][field] = value;
        };

        window.saveDockerConfig = async () => {
            try {
                const validRegistries = state.dockerRegistries.filter(r => r.name || r.registry_url);
                await window.api.writeSkillConfig('deploy-docker', {
                    registries: validRegistries,
                    default_registry: validRegistries.length > 0 ? validRegistries[0].name : ''
                });
                showToast('Docker 配置已保存', 'success');
                checkDockerSkillStatus();
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        // --- ECS Config Functions ---
        async function loadEcsConfig() {
            try {
                const result = await window.api.readSkillConfig('deploy-ecs');
                if (result.success && result.data) {
                    state.ecsServers = result.data.servers || [];
                    renderEcsServers();
                }
            } catch (e) {
                console.error('Failed to load ECS config:', e);
            }
            checkEcsSkillStatus();
        }

        async function checkEcsSkillStatus() {
            const statusEl = document.getElementById('ecs-skill-status');
            if (!statusEl) return;
            try {
                const result = await window.api.checkSkillInstalled('deploy-ecs');
                if (result && result.installed) {
                    statusEl.innerHTML = '<span style="color: #27ae60;">✓ deploy-ecs Skill 已安装</span>';
                } else {
                    statusEl.innerHTML = '<span style="color: #e67e22;">⚠ deploy-ecs Skill 未安装</span><br><small>保存配置后将自动安装</small>';
                }
            } catch (e) {
                statusEl.innerHTML = '<span style="color: #666;">无法检测 Skill 状态</span>';
            }
        }

        function renderEcsServers() {
            const container = document.getElementById('ecs-servers-list');
            if (!container) return;
            if (state.ecsServers.length === 0) {
                container.innerHTML = '<p class="text-muted">暂无配置的服务器，点击下方按钮添加</p>';
                return;
            }
            container.innerHTML = state.ecsServers.map((srv, i) => `
                <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong>${srv.name || '未命名服务器'}</strong>
                        <button class="btn" onclick="removeEcsServer(${i})" style="color: #e74c3c; padding: 4px 8px;">删除</button>
                    </div>
                    <div class="form-group"><label class="form-label">服务器名称</label>
                        <input type="text" class="input" value="${srv.name || ''}" onchange="updateEcsServer(${i}, 'name', this.value)" placeholder="例如: prod-server"></div>
                    <div class="form-group"><label class="form-label">主机地址 (IP/Host)</label>
                        <input type="text" class="input" value="${srv.host || ''}" onchange="updateEcsServer(${i}, 'host', this.value)"></div>
                    <div class="form-group"><label class="form-label">端口</label>
                        <input type="number" class="input" value="${srv.port || 22}" onchange="updateEcsServer(${i}, 'port', parseInt(this.value))"></div>
                    <div class="form-group"><label class="form-label">用户名</label>
                        <input type="text" class="input" value="${srv.username || 'root'}" onchange="updateEcsServer(${i}, 'username', this.value)"></div>
                    <div class="form-group"><label class="form-label">认证方式</label>
                        <select class="select" onchange="updateEcsServer(${i}, 'auth_type', this.value)">
                            <option value="password" ${srv.auth_type === 'password' ? 'selected' : ''}>密码</option>
                            <option value="key" ${srv.auth_type === 'key' ? 'selected' : ''}>私钥文件</option>
                        </select></div>
                    <div class="form-group"><label class="form-label">密码 / 私钥路径</label>
                        <input type="password" class="input" value="${srv.password || ''}" onchange="updateEcsServer(${i}, 'password', this.value)" placeholder="${srv.auth_type === 'key' ? '~/.ssh/id_rsa' : '服务器密码'}"></div>
                </div>
            `).join('');
        }

        window.addEcsServer = () => {
            state.ecsServers.push({ name: '', host: '', port: 22, username: 'root', auth_type: 'password', password: '' });
            renderEcsServers();
        };

        window.removeEcsServer = (index) => {
            state.ecsServers.splice(index, 1);
            renderEcsServers();
        };

        window.updateEcsServer = (index, field, value) => {
            state.ecsServers[index][field] = value;
        };

        window.saveEcsConfig = async () => {
            try {
                const validServers = state.ecsServers.filter(s => s.name || s.host);
                await window.api.writeSkillConfig('deploy-ecs', {
                    servers: validServers,
                    default_server: validServers.length > 0 ? validServers[0].name : ''
                });
                showToast('ECS 配置已保存', 'success');
                checkEcsSkillStatus();
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        // --- SQL Config Functions ---
        async function loadSqlConfig() {
            try {
                const result = await window.api.getSqlConfig();
                if (result.success && result.data) {
                    state.dbConnections = result.data.connections || {};
                    renderDbConnections();
                }
            } catch (e) {
                console.error('Failed to load SQL config:', e);
            }
            checkSqlSkillStatus();
        }

        async function checkSqlSkillStatus() {
            const statusEl = document.getElementById('sql-skill-status');
            if (!statusEl) return;
            try {
                const result = await window.api.checkSkillInstalled('sql-query');
                if (result && result.installed) {
                    statusEl.innerHTML = '<span style="color: #27ae60;">✓ sql-query Skill 已安装</span>';
                } else {
                    statusEl.innerHTML = '<span style="color: #e67e22;">⚠ sql-query Skill 未安装</span><br><small>保存配置后将自动安装</small>';
                }
            } catch (e) {
                statusEl.innerHTML = '<span style="color: #666;">无法检测 Skill 状态</span>';
            }
        }

        function renderDbConnections() {
            const container = document.getElementById('db-connections-list');
            if (!container) return;
            const connections = Object.entries(state.dbConnections);
            if (connections.length === 0) {
                container.innerHTML = '<p class="text-muted">暂无配置的数据库连接，点击下方按钮添加</p>';
                return;
            }
            container.innerHTML = connections.map(([name, conn]) => `
                <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong>${name || '未命名'}</strong>
                        <button class="btn" onclick="removeDbConnection('${name}')" style="color: #e74c3c; padding: 4px 8px;">删除</button>
                    </div>
                    <div class="form-group"><label class="form-label">连接名称</label>
                        <input type="text" class="input" value="${name}" onchange="renameDbConnection('${name}', this.value)"></div>
                    <div class="form-group"><label class="form-label">主机地址</label>
                        <input type="text" class="input" value="${conn.host || ''}" onchange="updateDbConnection('${name}', 'host', this.value)"></div>
                    <div class="form-group"><label class="form-label">端口</label>
                        <input type="number" class="input" value="${conn.port || 3306}" onchange="updateDbConnection('${name}', 'port', parseInt(this.value))"></div>
                    <div class="form-group"><label class="form-label">用户名</label>
                        <input type="text" class="input" value="${conn.user || ''}" onchange="updateDbConnection('${name}', 'user', this.value)"></div>
                    <div class="form-group"><label class="form-label">密码</label>
                        <input type="password" class="input" value="${conn.password || ''}" onchange="updateDbConnection('${name}', 'password', this.value)"></div>
                    <div class="form-group"><label class="form-label">数据库名</label>
                        <input type="text" class="input" value="${conn.database || ''}" onchange="updateDbConnection('${name}', 'database', this.value)"></div>
                </div>
            `).join('');
        }

        window.addDbConnection = () => {
            const name = 'connection_' + Date.now();
            state.dbConnections[name] = { host: '', port: 3306, user: '', password: '', database: '' };
            renderDbConnections();
        };

        window.removeDbConnection = (name) => {
            delete state.dbConnections[name];
            renderDbConnections();
        };

        window.renameDbConnection = (oldName, newName) => {
            if (oldName !== newName && newName) {
                state.dbConnections[newName] = state.dbConnections[oldName];
                delete state.dbConnections[oldName];
                renderDbConnections();
            }
        };

        window.updateDbConnection = (name, field, value) => {
            if (state.dbConnections[name]) {
                state.dbConnections[name][field] = value;
            }
        };

        window.saveSqlConfig = async () => {
            try {
                const validConnections = {};
                for (const [name, conn] of Object.entries(state.dbConnections)) {
                    if (conn.host || conn.user) {
                        validConnections[name] = conn;
                    }
                }
                await window.api.saveSqlConfig({ connections: validConnections });
                showToast('数据库配置已保存', 'success');
                checkSqlSkillStatus();
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        window.saveTab = async (type) => {
            if (type === 'all-appearance') {
                await saveTab('stack');
                await saveTab('style');
                await saveImageService();
                return;
            }
            await saveAll();
            showToast('配置已保存');
        };

        window.saveWebhookConfig = async () => {
            const webhookType = document.getElementById('webhook-type').value;
            const webhookUrl = document.getElementById('webhook-url').value;
            const notifyPermission = document.getElementById('notify-permission').checked;
            const notifyIdle = document.getElementById('notify-idle').checked;
            const notifyError = document.getElementById('notify-error').checked;

            if (!webhookUrl) {
                showToast('请输入 Webhook URL');
                return;
            }

            try {
                const result = await window.api.saveWebhookPlugin({
                    type: webhookType,
                    url: webhookUrl,
                    notify_permission: notifyPermission,
                    notify_idle: notifyIdle,
                    notify_error: notifyError
                });

                if (result.success) {
                    showToast('Webhook 配置已保存');
                    const statusEl = document.getElementById('webhook-status');
                    statusEl.style.display = 'block';
                    statusEl.innerHTML = '<span style="color: var(--success);">✓ 插件已配置到 OpenCode</span>';
                } else {
                    showToast('保存失败: ' + result.error);
                }
            } catch (e) {
                showToast('保存失败: ' + e.message);
            }
        };

        window.testWebhook = async () => {
            const webhookUrl = document.getElementById('webhook-url').value;
            const webhookType = document.getElementById('webhook-type').value;

            if (!webhookUrl) {
                showToast('请先输入 Webhook URL');
                return;
            }

            try {
                const result = await window.api.testWebhook({
                    type: webhookType,
                    url: webhookUrl
                });

                if (result.success) {
                    showToast('测试通知已发送');
                } else {
                    showToast('发送失败: ' + result.error);
                }
            } catch (e) {
                showToast('发送失败: ' + e.message);
            }
        };

        window.loadWebhookConfig = async () => {
            try {
                const result = await window.api.getWebhookConfig();
                if (result.success && result.data) {
                    const config = result.data;
                    document.getElementById('webhook-type').value = config.type || 'feishu';
                    document.getElementById('webhook-url').value = config.url || '';
                    document.getElementById('notify-permission').checked = config.notify_permission === true;
                    document.getElementById('notify-idle').checked = config.notify_idle === true;
                    document.getElementById('notify-error').checked = config.notify_error === true;
                    
                    if (config.url) {
                        const statusEl = document.getElementById('webhook-status');
                        statusEl.style.display = 'block';
                        statusEl.innerHTML = '<span style="color: var(--success);">✓ 插件已配置</span>';
                    }
                }
            } catch (e) {
                console.error('Failed to load webhook config:', e);
            }
        };

        async function saveAll() {
            // Save app config (local)
            await window.api.saveConfig(state.config);
            await window.api.saveCredentials(state.credentials);
            
            // Generate and merge prompt_append based on tech stack and design style
            const visualPrompt = generateTechStackPrompt(state.config.frontend, state.config.backend, state.config.style);
            if (visualPrompt) {
                // Write to visual-engineering
                state.promptAppends['visual-engineering'] = mergePromptAppend(
                    state.promptAppends['visual-engineering'] || '', 
                    visualPrompt
                );
                
                // Also write to artistry with image-generator skill
                const artistryPrompt = visualPrompt + `\n\n## 可用技能\n- 使用 /ui-ux-pro-max skill 获取详细设计指南\n- 使用 /image-generator skill 生成创意图片素材（banner、logo、插图等）`;
                state.promptAppends['artistry'] = mergePromptAppend(
                    state.promptAppends['artistry'] || '',
                    artistryPrompt
                );
            }
            
            // Generate and merge prompts for other categories based on backend
            const categoryPrompts = generateCategoryPrompts(state.config.backend);
            for (const [cat, prompt] of Object.entries(categoryPrompts)) {
                if (prompt) {
                    state.promptAppends[cat] = mergePromptAppend(
                        state.promptAppends[cat] || '', 
                        prompt
                    );
                }
            }
            
            // Load existing oh-my-opencode.json and merge updates
            const existingOhMyResult = await window.api.getOhMyOpencodeConfig();
            const ohMyConfig = (existingOhMyResult.success && existingOhMyResult.data) 
                ? existingOhMyResult.data 
                : { "$schema": "https://oh-my-opencode.dev/schema.json", "version": "1.0.0" };
            
            // Remove config-app specific fields if they exist (cleanup)
            delete ohMyConfig.frontend;
            delete ohMyConfig.backend;
            delete ohMyConfig.designStyle;
            
            // Merge categories - preserve existing, update prompt_append
            if (!ohMyConfig.categories) ohMyConfig.categories = {};
            const allCategories = ['visual-engineering', 'ultrabrain', 'quick', 'deep', 'writing', 'artistry', 'unspecified-low', 'unspecified-high'];
            allCategories.forEach(cat => {
                if (!ohMyConfig.categories[cat]) {
                    ohMyConfig.categories[cat] = {};
                }
                // Update prompt_append: use new value if exists, otherwise keep existing
                if (state.promptAppends[cat] !== undefined && state.promptAppends[cat] !== '') {
                    ohMyConfig.categories[cat].prompt_append = state.promptAppends[cat];
                }
            });
            
            await window.api.saveConfigWithBackup('oh-my-opencode', ohMyConfig);
            
            // Build and save real opencode.json with backup (provider config)
            try {
                const existingResult = await window.api.loadAllConfigs();
                const opencodeConfig = (existingResult.success && existingResult.configs && existingResult.configs.opencode) 
                    ? existingResult.configs.opencode 
                    : {};
                
                if (!opencodeConfig.provider) opencodeConfig.provider = {};
                
                // Merge providers - preserve existing fields, only update what we manage
                state.providers.forEach(p => {
                    if (p.name) {
                        const existing = opencodeConfig.provider[p.name] || {};
                        opencodeConfig.provider[p.name] = {
                            ...existing,  // Preserve all existing fields
                            name: p.displayName || existing.name || p.name,
                            npm: p.npm || existing.npm || '@ai-sdk/openai-compatible',
                            options: {
                                ...(existing.options || {}),
                                ...(p.baseUrl ? { baseURL: p.baseUrl } : {}),
                                ...(p.apiKey ? { apiKey: p.apiKey } : {})
                            },
                            models: p.models || existing.models || {}
                        };
                    }
                });
                
                // Add from wizard credentials if set and not empty
                if (state.credentials.proxyName && state.credentials.baseUrl) {
                    const existing = opencodeConfig.provider[state.credentials.proxyName] || {};
                    opencodeConfig.provider[state.credentials.proxyName] = {
                        ...existing,
                        name: state.credentials.displayName || existing.name || state.credentials.proxyName,
                        npm: state.credentials.npm || existing.npm || '@ai-sdk/openai-compatible',
                        options: {
                            ...(existing.options || {}),
                            baseURL: state.credentials.baseUrl,
                            ...(state.credentials.apiKey ? { apiKey: state.credentials.apiKey } : {})
                        },
                        models: existing.models || {}
                    };
                }
                
                await window.api.saveConfigWithBackup('opencode', opencodeConfig);
                
                // Save auth.json - use provider NAME as key, not apiFormat
                const authConfig = (existingResult.success && existingResult.configs && existingResult.configs.auth)
                    ? existingResult.configs.auth
                    : {};
                
                // Add keys from providers - only if apiKey is not empty
                state.providers.forEach(p => {
                    if (p.name && p.apiKey) {
                        authConfig[p.name] = { type: 'api', key: p.apiKey };
                    }
                });
                
                // Add from wizard credentials - only if apiKey is not empty
                if (state.credentials.proxyName && state.credentials.apiKey) {
                    authConfig[state.credentials.proxyName] = { type: 'api', key: state.credentials.apiKey };
                }
                
                await window.api.saveConfigWithBackup('auth', authConfig);
                
            } catch (e) {
                console.error('Error saving provider configs:', e);
                showToast('保存服务商配置失败', 'error');
            }
        }

        // --- New Features ---

        window.installOpencode = async () => {
            const btn = document.getElementById('btn-install-opencode');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '安装中...';
            btn.style.opacity = '0.7';
            
            try {
                await window.api.installOpencode();
                document.getElementById('check-opencode').checked = true;
                btn.textContent = '✓ 安装成功';
                btn.style.background = 'var(--success)';
                btn.style.opacity = '1';
                showToast('OpenCode 安装成功！', 'success');
                validateStep();
            } catch (e) {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.opacity = '1';
                showToast('安装失败: ' + e.message, 'error');
            }
        };

        window.installOhMyOpencode = async () => {
            const btn = document.getElementById('btn-install-omo');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '安装中...';
            btn.style.opacity = '0.7';
            
            try {
                await window.api.installOhMyOpencode();
                btn.textContent = '安装插件中...';
                // Also install plugins and uiux skill by default
                await window.api.installPlugins();
                btn.textContent = '安装 UI/UX Skill...';
                await window.api.installUiuxSkill();
                document.getElementById('check-omo').checked = true;
                btn.textContent = '✓ 安装成功';
                btn.style.background = 'var(--success)';
                btn.style.opacity = '1';
                showToast('Oh-My-OpenCode 安装成功！', 'success');
                validateStep();
            } catch (e) {
                btn.disabled = false;
                btn.textContent = originalText;
                btn.style.opacity = '1';
                showToast('安装失败: ' + e.message, 'error');
            }
        };

        window.launchOpencode = async (mode) => {
            try {
                await window.api.launchOpencode(mode);
                showToast('OpenCode 已启动', 'success');
            } catch (e) {
                showToast('启动失败: ' + e.message, 'error');
            }
        };

        window.openWebUI = async () => {
            try {
                await window.api.openWebUI();
            } catch (e) {
                showToast('打开失败: ' + e.message, 'error');
            }
        };

        window.openConfigDir = async () => {
            try {
                await window.api.openConfigDir();
            } catch (e) {
                showToast('打开失败: ' + e.message, 'error');
            }
        };

        window.loadAgentsMd = async () => {
            try {
                const result = await window.api.readAgentsMd();
                if (result.success) {
                    document.getElementById('agents-md-editor').value = result.data || '';
                } else {
                    // If file doesn't exist, it might be fine, just empty
                    console.log('AGENTS.md not found or empty');
                }
            } catch (e) {
                showToast('加载失败: ' + e.message, 'error');
            }
        };

        window.saveAgentsMd = async () => {
            try {
                const content = document.getElementById('agents-md-editor').value;
                await window.api.writeAgentsMd(content);
                showToast('AGENTS.md 已保存', 'success');
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        function getAvailableModels() {
            const models = [];
            state.providers.forEach(p => {
                if (p.name && p.models) {
                    Object.keys(p.models).forEach(modelId => {
                        models.push({
                            id: `${p.name}/${modelId}`,
                            name: p.models[modelId].name || modelId,
                            provider: p.name,
                            modelId: modelId
                        });
                    });
                }
            });
            return models;
        }

        function getRecommendedModel(categoryType) {
            const models = getAvailableModels();
            if (models.length === 0) return null;
            
            const keywords = modelTypeKeywords[categoryType] || [];
            for (const model of models) {
                const idLower = model.id.toLowerCase();
                if (keywords.some(kw => idLower.includes(kw))) {
                    return model.id;
                }
            }
            return models[0].id;
        }

        function renderCategoryConfig() {
            const container = document.getElementById('category-config-container');
            if (!container) return;
            
            const models = getAvailableModels();
            
            if (models.length === 0) {
                container.innerHTML = `
                    <div style="padding: 20px; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
                        <p style="color: var(--text-muted);"><svg class="icon" style="color: var(--danger); vertical-align: text-bottom;" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 请先在"模型服务"页面配置服务商和模型</p>
                    </div>`;
                return;
            }
            
            container.innerHTML = categoryDefinitions.map(cat => {
                const currentModel = state.categoryModels[cat.id] || '';
                const recommended = getRecommendedModel(cat.recommendedType);
                const promptValue = state.promptAppends[cat.id] || '';
                
                return `
                <div style="border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <span style="font-size: 20px;">${cat.icon}</span>
                        <strong>${cat.id}</strong>
                        <span style="color: var(--text-muted); font-size: 13px;">(${cat.name})</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 12px;">${cat.description}</p>
                    
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label class="form-label">模型选择</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <select class="select" id="cat-model-${cat.id}" style="flex: 1;" onchange="updateCategoryModel('${cat.id}', this.value)">
                                <option value="">使用默认 (${cat.defaultModel})</option>
                                ${models.map(m => `<option value="${m.id}" ${currentModel === m.id ? 'selected' : ''}>${m.id}</option>`).join('')}
                            </select>
                            ${recommended ? `<button class="btn btn-secondary" onclick="setCategoryModel('${cat.id}', '${recommended}')" style="white-space: nowrap;">推荐</button>` : ''}
                        </div>
                        ${recommended ? `<div class="form-hint">推荐: ${recommended}</div>` : ''}
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">追加提示词 (可选)</label>
                        <p class="form-hint" style="margin-top: 0; margin-bottom: 8px;">会基于技术栈和设计风格选择自动补充要求</p>
                        <textarea id="cat-prompt-${cat.id}" rows="2" class="input" style="height: auto;" 
                            onchange="updateCategoryPrompt('${cat.id}', this.value)">${promptValue}</textarea>
                    </div>
                </div>`;
            }).join('');
        }

        window.updateCategoryModel = (catId, value) => {
            state.categoryModels[catId] = value;
        };

        window.setCategoryModel = (catId, value) => {
            state.categoryModels[catId] = value;
            const el = document.getElementById('cat-model-' + catId);
            if (el) el.value = value;
        };

        window.updateCategoryPrompt = (catId, value) => {
            state.promptAppends[catId] = value;
        };

        window.loadCategoryConfig = async () => {
            try {
                const result = await window.api.getOhMyOpencodeConfig();
                if (result.success && result.data && result.data.categories) {
                    for (const [key, value] of Object.entries(result.data.categories)) {
                        if (value.model) state.categoryModels[key] = value.model;
                        if (value.prompt_append) state.promptAppends[key] = value.prompt_append;
                    }
                }
                renderCategoryConfig();
            } catch (e) {
                console.error('Failed to load category config:', e);
                renderCategoryConfig();
            }
        };

        window.saveCategoryConfig = async () => {
            try {
                const result = await window.api.getOhMyOpencodeConfig();
                const config = (result.success && result.data) ? result.data : {};
                
                if (!config.categories) config.categories = {};
                
                categoryDefinitions.forEach(cat => {
                    if (!config.categories[cat.id]) config.categories[cat.id] = {};
                    
                    const model = state.categoryModels[cat.id];
                    if (model) {
                        config.categories[cat.id].model = model;
                    } else {
                        delete config.categories[cat.id].model;
                    }
                    
                    // Only update prompt_append if we have a non-empty value
                    if (state.promptAppends[cat.id]) {
                        config.categories[cat.id].prompt_append = state.promptAppends[cat.id];
                    }
                });
                
                await window.api.saveConfigWithBackup('oh-my-opencode', config);
                showToast('Category 配置已保存', 'success');
            } catch (e) {
                showToast('保存失败: ' + e.message, 'error');
            }
        };

        window.loadPromptAppends = window.loadCategoryConfig;
        window.savePromptAppends = window.saveCategoryConfig;

        // --- Utilities ---

        function generateTechStackPrompt(frontend, backend, style) {
            const frontendMap = {
                'react': 'React 18+ (函数组件 + Hooks)',
                'vue': 'Vue.js 3 (Composition API)',
                'nextjs': 'Next.js 14+ (App Router)',
                'none': ''
            };
            
            const backendMap = {
                'python': 'Python 3.11+ (FastAPI/Flask)',
                'java': 'Java 17+ (Spring Boot)',
                'node': 'Node.js 20+ (Express/Fastify)',
                'none': ''
            };
            
            const styleMap = {
                'glassmorphism': '玻璃拟态风格 - 毛玻璃效果(backdrop-blur)、透明度渐变、柔和阴影',
                'neumorphism': '新拟态风格 - 柔和凸起/凹陷效果、同色系阴影、极简图标',
                'minimalist': '极简主义 - 大量留白、简洁线条、克制用色、清晰层次',
                'brutalist': '粗野主义 - 大胆排版、高对比度、原始感、打破常规',
                'flat-design': '扁平设计 - 纯色块、无阴影、简洁图标、清晰边界',
                'material-design': 'Material Design - 卡片布局、微妙阴影、涟漪动效',
                'dark-mode': '深色模式 - 深色背景、柔和对比、护眼配色',
                'gradient-heavy': '渐变风格 - 丰富渐变、流动感、现代活力',
                'cyberpunk': '赛博朋克 - 霓虹色彩、科技感、暗色调、发光效果',
                'retro-futurism': '复古未来 - 复古元素与未来感结合、怀旧配色',
                'organic-shapes': '有机形态 - 自然曲线、流动形状、柔和过渡',
                'swiss-style': '瑞士风格 - 网格系统、无衬线字体、几何图形、高可读性'
            };
            
            let prompt = '## 技术栈要求\n';
            
            if (frontend && frontend !== 'none' && frontendMap[frontend]) {
                prompt += `- 前端框架：${frontendMap[frontend]}\n`;
            }
            
            if (backend && backend !== 'none' && backendMap[backend]) {
                prompt += `- 后端框架：${backendMap[backend]}\n`;
            }
            
            if (style && styleMap[style]) {
                prompt += `\n## 设计风格要求\n`;
                prompt += `- 风格：${styleMap[style]}\n`;
                prompt += `- 使用 /frontend-ui-ux skill 获取详细设计指南\n`;
            }
            
            prompt += `\n## 语言要求\n`;
            prompt += `- 所有注释和文档必须使用中文\n`;
            
            return prompt;
        }

        function generateCategoryPrompts(backend) {
            const backendInfo = {
                'python': {
                    name: 'Python 3.11+',
                    framework: 'FastAPI/Flask',
                    testFramework: 'pytest',
                    typeHint: '类型注解 (typing)',
                    patterns: 'Pydantic 数据验证、async/await 异步'
                },
                'java': {
                    name: 'Java 17+',
                    framework: 'Spring Boot',
                    testFramework: 'JUnit 5 + Mockito',
                    typeHint: '强类型',
                    patterns: '依赖注入、AOP、JPA'
                },
                'node': {
                    name: 'Node.js 20+',
                    framework: 'Express/Fastify',
                    testFramework: 'Jest/Vitest',
                    typeHint: 'TypeScript 类型',
                    patterns: 'async/await、中间件模式'
                },
                'none': null
            };
            
            const info = backendInfo[backend];
            if (!info) return {};
            
            return {
                'ultrabrain': `## 后端技术栈
- 框架：${info.name} (${info.framework})
- 模式：${info.patterns}

## 架构要求
- 遵循 SOLID 原则
- 使用依赖注入解耦
- 分层架构（Controller/Service/Repository）
- 错误处理统一封装

## 测试要求
- 核心业务逻辑必须有单元测试
- 复杂流程需要集成测试
- 使用 ${info.testFramework} 测试框架
- 测试覆盖率目标 80%+

## 语言要求
- 所有注释和文档必须使用中文`,

                'quick': `## 后端技术栈
- 框架：${info.name} (${info.framework})

## 代码规范
- 遵循项目现有代码风格
- 添加必要的${info.typeHint}
- 函数/方法添加文档注释

## 测试要求
- 修改的函数需补充单元测试
- 使用 ${info.testFramework} 测试框架
- 确保现有测试通过

## 语言要求
- 所有注释和文档必须使用中文`,

                'deep': `## 后端技术栈
- 框架：${info.name} (${info.framework})
- 模式：${info.patterns}

## 研究方法
- 先分析现有代码结构和依赖
- 评估多种技术方案的优劣
- 考虑性能、可维护性、扩展性
- 参考业界最佳实践

## 测试要求
- 提供完整的测试方案
- 包含单元测试、集成测试、边界条件测试
- 使用 ${info.testFramework} 测试框架
- 考虑 Mock 和测试数据管理

## 语言要求
- 所有注释和文档必须使用中文`
            };
        }

        function mergePromptAppend(existing, generated) {
            if (!existing || existing.trim() === '') {
                return generated;
            }
            
            // 定义需要替换的章节标题
            const sectionsToReplace = [
                '## 技术栈要求',
                '## 技术栈推荐',
                '## 后端技术栈', 
                '## 设计风格要求',
                '## 架构要求',
                '## 测试要求',
                '## 代码规范',
                '## 研究方法',
                '## 语言要求',
                '## 可用技能'
            ];
            
            let result = existing;
            
            // 解析生成的内容为章节
            const generatedSections = {};
            let currentSection = null;
            let currentContent = [];
            
            generated.split('\n').forEach(line => {
                const isHeader = sectionsToReplace.some(h => line.startsWith(h));
                if (isHeader) {
                    if (currentSection) {
                        generatedSections[currentSection] = currentContent.join('\n');
                    }
                    currentSection = line;
                    currentContent = [line];
                } else if (currentSection) {
                    currentContent.push(line);
                }
            });
            if (currentSection) {
                generatedSections[currentSection] = currentContent.join('\n');
            }
            
            // 替换或追加每个章节
            for (const [header, content] of Object.entries(generatedSections)) {
                // 查找现有内容中是否有这个章节
                const headerRegex = new RegExp(
                    header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?(?=\\n## |$)', 
                    'g'
                );
                
                if (result.includes(header)) {
                    // 替换现有章节
                    result = result.replace(headerRegex, content);
                } else {
                    // 追加新章节
                    result = result.trim() + '\n\n' + content;
                }
            }
            
            return result.trim();
        }

        function showToast(msg) {
            const toast = el('toast');
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        let agentModelsData = { agents: {}, categories: {} };
        let availableModels = [];
        let currentAgentModels = {};
        let currentCategoryModels = {};

        async function loadAgentModels() {
            const loading = el('agent-models-loading');
            const content = el('agent-models-content');
            const error = el('agent-models-error');
            
            loading.style.display = 'block';
            content.style.display = 'none';
            error.style.display = 'none';
            
            try {
                const [recsResult, modelsResult, ohMyConfig, compactionResult] = await Promise.all([
                    api.getAgentRecommendations(),
                    api.getAvailableModels(),
                    api.getOhMyOpencodeConfig(),
                    api.getCompactionModel()
                ]);
                
                if (!modelsResult.success || modelsResult.models.length === 0) {
                    loading.style.display = 'none';
                    error.style.display = 'block';
                    return;
                }
                
                agentModelsData = recsResult;
                availableModels = modelsResult.models;
                
                // Reset current models
                currentAgentModels = {};
                currentCategoryModels = {};
                
                // Load existing values from config
                if (ohMyConfig.success && ohMyConfig.data) {
                    const agents = ohMyConfig.data.agents || {};
                    const categories = ohMyConfig.data.categories || {};
                    
                    // Load agent models
                    for (const [k, v] of Object.entries(agents)) {
                        if (v.model) currentAgentModels[k] = v.model;
                        if (v.prompt_append) state.agentPromptAppends[k] = v.prompt_append;
                    }
                    
                    // Load category models and prompt_appends
                    for (const [k, v] of Object.entries(categories)) {
                        if (v.model) currentCategoryModels[k] = v.model;
                        if (v.prompt_append) state.promptAppends[k] = v.prompt_append;
                    }
                }
                
                // Load compaction model from opencode.json (separate config target)
                if (compactionResult && compactionResult.success && compactionResult.model) {
                    currentAgentModels['compaction'] = compactionResult.model;
                }
                
                // Auto-match models for any missing entries
                autoMatchModels();
                
                renderAgentModels();
                loading.style.display = 'none';
                content.style.display = 'block';
            } catch (e) {
                loading.style.display = 'none';
                error.style.display = 'block';
                error.innerHTML = '<p><svg class="icon" style="color: var(--danger); vertical-align: text-bottom;" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 加载失败: ' + e.message + '</p>';
            }
        }

        function renderAgentModels() {
            const agentList = el('agent-models-list');
            const categoryList = el('category-models-list');
            
            agentList.innerHTML = '';
            categoryList.innerHTML = '';
            
            for (const [id, info] of Object.entries(agentModelsData.agents)) {
                agentList.appendChild(createModelSelector('agent', id, info, currentAgentModels[id]));
            }
            
            for (const [id, info] of Object.entries(agentModelsData.categories)) {
                categoryList.appendChild(createModelSelector('category', id, info, currentCategoryModels[id]));
            }
        }

        function createModelSelector(type, id, info, currentModel) {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 12px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border); margin-bottom: 8px;';
            
            const topRow = document.createElement('div');
            topRow.style.cssText = 'display: flex; align-items: center; gap: 12px;';
            
            const labelDiv = document.createElement('div');
            labelDiv.style.cssText = 'flex: 1; min-width: 200px;';
            const targetHint = info.target ? ' <span style="font-size: 11px; padding: 1px 6px; background: var(--warning); color: #fff; border-radius: 4px; font-weight: 400;">→ ' + info.target + '</span>' : '';
            labelDiv.innerHTML = '<div style="font-weight: 500; color: var(--text-primary);">' + info.name + targetHint + '</div>' +
                '<div style="font-size: 12px; color: var(--text-muted);">' + info.role + '</div>';
            
            const select = document.createElement('select');
            select.className = 'input';
            select.style.cssText = 'flex: 2; max-width: 400px;';
            select.id = type + '-model-' + id;
            
            // Add placeholder option
            const placeholderOpt = document.createElement('option');
            placeholderOpt.value = '';
            placeholderOpt.textContent = '-- 请选择模型 --';
            if (!currentModel) placeholderOpt.selected = true;
            select.appendChild(placeholderOpt);
            
            availableModels.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name + ' (' + m.provider + ')';
                if (m.id === currentModel) opt.selected = true;
                select.appendChild(opt);
            });
            
            select.onchange = () => {
                if (type === 'agent') {
                    currentAgentModels[id] = select.value;
                } else {
                    currentCategoryModels[id] = select.value;
                }
            };
            
            topRow.appendChild(labelDiv);
            topRow.appendChild(select);
            div.appendChild(topRow);
            
            if (type === 'category' || type === 'agent') {
                const stateObj = type === 'category' ? state.promptAppends : state.agentPromptAppends;
                const promptRow = document.createElement('div');
                promptRow.style.cssText = 'margin-top: 8px;';
                
                const promptLabel = document.createElement('label');
                promptLabel.style.cssText = 'display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;';
                promptLabel.textContent = '追加提示词 (可选)';
                
                const textarea = document.createElement('textarea');
                textarea.className = 'input';
                textarea.style.cssText = 'width: 100%; height: 60px; resize: vertical;';
                textarea.id = type + '-prompt-' + id;
                textarea.value = stateObj[id] || '';
                textarea.onchange = () => { stateObj[id] = textarea.value; };
                
                promptRow.appendChild(promptLabel);
                promptRow.appendChild(textarea);
                div.appendChild(promptRow);
            }
            
            return div;
        }

        function autoMatchModels() {
            // Provider priority: hosted first, then others
            const providerPriority = ['hosted'];
            availableModels.forEach(m => {
                if (m.provider && !providerPriority.includes(m.provider)) {
                    providerPriority.push(m.provider);
                }
            });
            
            // Check if a model exists in availableModels
            function modelExists(modelId) {
                return availableModels.some(m => m.id === modelId);
            }
            
            // Pattern mapping for model keywords
            const patterns = {
                opus: /opus|claude.*4.*5.*20251101/i,
                sonnet: /sonnet|claude.*4.*5(?!.*20251101)|claude-sonnet-4/i,
                haiku: /haiku/i,
                gemini_pro: /gemini.*pro|gemini-2.*pro|gemini-3.*pro/i,
                gemini_flash: /gemini.*flash|gemini-2.*flash|gemini-3.*flash/i,
                gpt4: /gpt-4\.1(?!.*mini)|gpt-4o(?!.*mini)|gpt-5/i,
                gpt4_mini: /gpt-4\.1-mini|gpt-4o-mini/i,
                codex: /codex|o3|o1-pro/i,
                o1: /o1(?!.*mini)/i,
                o3: /o3/i,
                deepseek: /deepseek-chat|deepseek-v3/i,
                deepseek_reasoner: /deepseek-reasoner|deepseek-r1/i
            };
            
            // Build matched models map with provider priority
            const matched = {};
            for (const [cat, pattern] of Object.entries(patterns)) {
                // Find best match respecting provider priority
                for (const provider of providerPriority) {
                    const found = availableModels.find(m => 
                        m.provider === provider && (pattern.test(m.id) || pattern.test(m.name))
                    );
                    if (found) {
                        matched[cat] = found.id;
                        break;
                    }
                }
                // If not found in priority providers, try any
                if (!matched[cat]) {
                    const found = availableModels.find(m => pattern.test(m.id) || pattern.test(m.name));
                    if (found) matched[cat] = found.id;
                }
            }
            
            // Helper: find best model based on prefer array
            function findBestModel(preferList) {
                if (!preferList || preferList.length === 0) return null;
                for (const pref of preferList) {
                    if (matched[pref]) return matched[pref];
                }
                return null;
            }
            
            // Fallback tier mapping (if prefer doesn't match)
            const tierToModel = {
                primary: matched.opus || matched.sonnet || matched.gpt4 || matched.deepseek || (availableModels[0] && availableModels[0].id),
                reasoning: matched.codex || matched.o3 || matched.o1 || matched.deepseek_reasoner || matched.opus || matched.gpt4 || matched.sonnet,
                fast: matched.haiku || matched.gemini_flash || matched.gpt4_mini || matched.sonnet,
                multimodal: matched.gemini_pro || matched.gemini_flash || matched.sonnet || matched.opus,
                secondary: matched.sonnet || matched.gpt4_mini || matched.gemini_pro || matched.deepseek
            };
            
            // Match agents - check if current model exists, if not re-match
            for (const [id, info] of Object.entries(agentModelsData.agents)) {
                if (!currentAgentModels[id] || !modelExists(currentAgentModels[id])) {
                    const preferMatch = findBestModel(info.prefer);
                    currentAgentModels[id] = preferMatch || tierToModel[info.tier] || tierToModel.primary || '';
                }
            }
            
            // Match categories - check if current model exists, if not re-match
            for (const [id, info] of Object.entries(agentModelsData.categories)) {
                if (!currentCategoryModels[id] || !modelExists(currentCategoryModels[id])) {
                    const preferMatch = findBestModel(info.prefer);
                    currentCategoryModels[id] = preferMatch || tierToModel[info.tier] || tierToModel.primary || '';
                }
            }
        }

        async function saveAgentModels() {
            try {
                // Build complete config structure
                const omoResult = await window.api.getOhMyOpencodeConfig();
                const config = (omoResult.success && omoResult.data) ? { ...omoResult.data } : {};
                
                // Ensure schema
                if (!config.$schema) {
                    config.$schema = "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json";
                }
                
                // Build agents section (skip compaction — it goes to opencode.json)
                if (!config.agents) config.agents = {};
                for (const [id, model] of Object.entries(currentAgentModels)) {
                    if (id === 'compaction') continue;
                    if (model) {
                        if (!config.agents[id]) config.agents[id] = {};
                        config.agents[id].model = model;
                    }
                    if (state.agentPromptAppends[id]) {
                        if (!config.agents[id]) config.agents[id] = {};
                        config.agents[id].prompt_append = state.agentPromptAppends[id];
                    }
                }
                
                // Build categories section
                if (!config.categories) config.categories = {};
                for (const [id, model] of Object.entries(currentCategoryModels)) {
                    if (model) {  // Only save if model is selected
                        if (!config.categories[id]) config.categories[id] = {};
                        config.categories[id].model = model;
                    }
                    // Update prompt_append if we have a value
                    if (state.promptAppends[id]) {
                        if (!config.categories[id]) config.categories[id] = {};
                        config.categories[id].prompt_append = state.promptAppends[id];
                    }
                }
                
                await window.api.saveConfigWithBackup('oh-my-opencode', config);
                
                // Save compaction model to opencode.json (separate config target)
                const compactionModel = currentAgentModels['compaction'] || '';
                await window.api.saveCompactionModel(compactionModel || null);
                
                showToast('模型配置已保存');
            } catch (e) {
                showToast('保存失败: ' + e.message);
            }
        }

        async function resetToRecommendedModels() {
            // Clear current selections
            currentAgentModels = {};
            currentCategoryModels = {};
            
            // Load prompt_append defaults from template
            try {
                const tpl = await window.api.getOhMyOpencodeTemplate();
                if (tpl.success && tpl.data) {
                    // Reset category prompt_appends
                    state.promptAppends = {};
                    const cats = tpl.data.categories || {};
                    for (const [k, v] of Object.entries(cats)) {
                        if (v.prompt_append) state.promptAppends[k] = v.prompt_append;
                    }
                    // Reset agent prompt_appends
                    state.agentPromptAppends = {};
                    const agents = tpl.data.agents || {};
                    for (const [k, v] of Object.entries(agents)) {
                        if (v.prompt_append) state.agentPromptAppends[k] = v.prompt_append;
                    }
                }
            } catch (e) {
                console.error('Failed to load template defaults:', e);
            }
            
            // Re-run auto-match to get recommended models
            autoMatchModels();
            
            // Re-render the UI
            renderAgentModels();
            
            showToast('已重置为推荐配置（含模型和提示词）');
        }

        function switchModelTab(tab) {
            // Update tab buttons
            document.getElementById('model-tab-agents').style.borderBottomColor = tab === 'agents' ? 'var(--accent)' : 'transparent';
            document.getElementById('model-tab-agents').style.color = tab === 'agents' ? 'var(--text-primary)' : 'var(--text-muted)';
            document.getElementById('model-tab-categories').style.borderBottomColor = tab === 'categories' ? 'var(--accent)' : 'transparent';
            document.getElementById('model-tab-categories').style.color = tab === 'categories' ? 'var(--text-primary)' : 'var(--text-muted)';
            
            // Update tab content
            document.getElementById('model-tab-content-agents').style.display = tab === 'agents' ? 'block' : 'none';
            document.getElementById('model-tab-content-categories').style.display = tab === 'categories' ? 'block' : 'none';
        }

        function toggleCollapsible(sectionId) {
            const content = document.getElementById(sectionId);
            const icon = document.getElementById(sectionId + '-icon');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            }
        }

        async function loadBackupList() {
            const container = document.getElementById('backup-list');
            if (!container) return;
            
            try {
                const result = await window.api.listBackups();
                if (!result.success || !result.backups || result.backups.length === 0) {
                    container.innerHTML = '<p class="text-muted">暂无备份记录</p>';
                    return;
                }
                
                const configTypes = {
                    'opencode': 'OpenCode 配置',
                    'oh-my-opencode': 'Oh-My-OpenCode 配置',
                    'oh': 'Oh-My-OpenCode 配置',
                    'auth': '认证配置'
                };
                
                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>配置类型</th>
                                <th>备份时间</th>
                                <th style="text-align: right;">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.backups.map(b => {
                                const parts = b.name.split('-');
                                const type = parts[0];
                                const typeName = configTypes[type] || type;
                                const time = new Date(b.time).toLocaleString('zh-CN');
                                return `
                                    <tr>
                                        <td>${typeName}</td>
                                        <td>${time}</td>
                                        <td class="table-actions">
                                            <button class="btn btn-ghost btn-sm" onclick="previewBackup('${b.name}')">预览</button>
                                            <button class="btn btn-ghost btn-sm" onclick="restoreBackup('${b.name}')" style="color: var(--accent);">还原</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            } catch (e) {
                container.innerHTML = '<p class="text-muted">加载备份列表失败: ' + e.message + '</p>';
            }
        }

        window.createManualBackup = async () => {
            try {
                showToast('正在创建备份...', 'info');
                
                const opencodeResult = await window.api.getOpencodeConfig();
                if (opencodeResult.success && opencodeResult.data) {
                    await window.api.saveConfigWithBackup('opencode', opencodeResult.data);
                }
                
                const omoResult = await window.api.getOhMyOpencodeConfig();
                if (omoResult.success && omoResult.data) {
                    await window.api.saveConfigWithBackup('oh-my-opencode', omoResult.data);
                }
                
                showToast('备份创建成功', 'success');
                loadBackupList();
            } catch (e) {
                showToast('备份失败: ' + e.message, 'error');
            }
        };

        window.previewBackup = async (backupName) => {
            try {
                const configDir = await window.api.getConfigDir();
                const backupPath = configDir + '/backups/' + backupName;
                showToast('备份文件: ' + backupPath, 'info');
            } catch (e) {
                showToast('预览失败: ' + e.message, 'error');
            }
        };

        window.restoreBackup = async (backupName) => {
            if (!confirm('确定要还原此备份吗？当前配置将被覆盖。')) {
                return;
            }
            
            try {
                const result = await window.api.restoreBackup(backupName);
                if (result.success) {
                    showToast('还原成功，请重启应用以生效', 'success');
                } else {
                    showToast('还原失败: ' + result.error, 'error');
                }
            } catch (e) {
                showToast('还原失败: ' + e.message, 'error');
            }
        };

        // ==================== Auto Update ====================
        let updateInfo = null;

        function initUpdater() {
            if (!window.updater) return;

            window.updater.onUpdateAvailable((info) => {
                updateInfo = info;
                showUpdateBanner(info.version);
            });

            window.updater.onUpdateDownloaded((info) => {
                hideUpdateBanner();
                showUpdateReadyModal(info.version);
            });

            window.updater.onUpdaterStatus((status) => {
                if (status.event === 'download-progress') {
                    updateDownloadProgress(status.data.percent);
                } else if (status.event === 'update-error') {
                    showToast('更新失败: ' + status.data.message, 'error');
                    resetUpdateBanner();
                }
            });

            window.updater.getVersion().then(version => {
                const versionEl = document.getElementById('app-version');
                if (versionEl) versionEl.textContent = 'v' + version;
            });
        }

        function showUpdateBanner(version) {
            const banner = document.getElementById('update-banner');
            const versionEl = document.getElementById('update-version');
            if (banner && versionEl) {
                versionEl.textContent = 'v' + version;
                banner.classList.remove('hidden');
                document.body.classList.add('has-update-banner');
            }
        }

        function hideUpdateBanner() {
            const banner = document.getElementById('update-banner');
            if (banner) {
                banner.classList.add('hidden');
                document.body.classList.remove('has-update-banner');
            }
        }

        function dismissUpdate() {
            hideUpdateBanner();
        }

        async function downloadUpdate() {
            const btn = document.getElementById('btn-download-update');
            const progressEl = document.getElementById('update-progress');
            
            if (btn) btn.disabled = true;
            if (progressEl) progressEl.classList.remove('hidden');
            
            try {
                const result = await window.updater.downloadUpdate();
                if (!result.success) {
                    showToast('下载失败: ' + result.error, 'error');
                    resetUpdateBanner();
                }
            } catch (e) {
                showToast('下载失败: ' + e.message, 'error');
                resetUpdateBanner();
            }
        }

        function updateDownloadProgress(percent) {
            const fill = document.getElementById('progress-fill');
            const text = document.getElementById('progress-text');
            if (fill) fill.style.width = percent + '%';
            if (text) text.textContent = Math.round(percent) + '%';
        }

        function resetUpdateBanner() {
            const btn = document.getElementById('btn-download-update');
            const progressEl = document.getElementById('update-progress');
            if (btn) btn.disabled = false;
            if (progressEl) progressEl.classList.add('hidden');
            updateDownloadProgress(0);
        }

        function showUpdateReadyModal(version) {
            const modal = document.getElementById('update-ready-modal');
            const versionEl = document.getElementById('ready-version');
            if (modal && versionEl) {
                versionEl.textContent = 'v' + version;
                modal.classList.remove('hidden');
            }
        }

        function closeUpdateModal() {
            const modal = document.getElementById('update-ready-modal');
            if (modal) modal.classList.add('hidden');
        }

        function installUpdate() {
            window.updater.installUpdate();
        }

        window.checkForUpdates = async () => {
            showToast('正在检查更新...', 'info');
            try {
                const result = await window.updater.checkForUpdates();
                if (result.success) {
                    if (result.updateAvailable) {
                        showToast('发现新版本 v' + result.version, 'success');
                    } else {
                        showToast('当前已是最新版本', 'success');
                    }
                } else {
                    showToast('检查更新失败: ' + result.error, 'error');
                }
            } catch (e) {
                showToast('检查更新失败: ' + e.message, 'error');
            }
        };


        // ==================== User Center ====================
        let ucState = {
            loggedIn: false,
            user: null,
            tokens: [],
            selectedPlan: 'free',
            config: null,
            logs: [],
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            lastUsername: localStorage.getItem('uc_last_username') || ''
        };

        async function loadUserCenter() {
            // 如果已经登录，直接显示已登录界面
            if (ucState.loggedIn && ucState.user) {
                showLoggedIn();
                return;
            }
            
            try {
                const configResult = await window.api.hostedGetConfig();
                if (configResult.success) {
                    ucState.config = configResult.data;
                    ucState.selectedPlan = configResult.data.plan || 'free';
                    if (configResult.data.username) {
                        ucState.lastUsername = configResult.data.username;
                    }
                }
                if (ucState.config && ucState.config.enabled) {
                    const userResult = await window.api.hostedGetCurrentUser();
                    if (userResult.success && userResult.data && userResult.data.data) {
                        const remoteUser = userResult.data.data;
                        if (ucState.config.username && remoteUser.username !== ucState.config.username) {
                            console.log('[user-center] Session user mismatch, clearing local state');
                            ucState.config.enabled = false;
                            await window.api.hostedSaveConfig({ enabled: false });
                            await window.api.hostedLogout();
                            showNotLoggedIn();
                            return;
                        }
                        ucState.loggedIn = true;
                        ucState.user = remoteUser;
                        ucState.lastUsername = ucState.user.username;
                        localStorage.setItem('uc_last_username', ucState.lastUsername);
                        showLoggedIn();
                        return;
                    }
                }
                showNotLoggedIn();
            } catch (e) {
                console.error('Failed to load user center:', e);
                showNotLoggedIn();
            }
        }

        function showNotLoggedIn() {
            ucState.loggedIn = false;
            el('uc-not-logged-in').classList.remove('hidden');
            el('uc-logged-in').classList.add('hidden');
            
            if (ucState.lastUsername) {
                el('uc-login-username').value = ucState.lastUsername;
                el('uc-switch-account-link').classList.add('hidden');
                el('uc-use-other-link').classList.remove('hidden');
            }
            el('uc-form-register').classList.add('hidden');
            el('uc-form-login').classList.remove('hidden');
        }

        function switchToLogin() {
            el('uc-form-register').classList.add('hidden');
            el('uc-form-login').classList.remove('hidden');
            el('uc-switch-account-link').classList.remove('hidden');
            el('uc-use-other-link').classList.add('hidden');
            el('uc-login-username').value = '';
            el('uc-login-password').value = '';
        }

        function switchToRegister() {
            el('uc-form-login').classList.add('hidden');
            el('uc-form-register').classList.remove('hidden');
            el('uc-reg-username').value = '';
            el('uc-reg-email').value = '';
            el('uc-reg-code').value = '';
            el('uc-reg-password').value = '';
        }

        let verificationCodeCountdown = 0;
        async function sendVerificationCode() {
            const email = el('uc-reg-email').value.trim();
            if (!email) {
                showToast('请先输入邮箱');
                return;
            }
            if (verificationCodeCountdown > 0) {
                return;
            }
            
            const btn = el('uc-send-code-btn');
            btn.disabled = true;
            btn.textContent = '发送中...';
            
            try {
                const result = await window.api.hostedSendVerificationCode(email);
                if (result.success) {
                    showToast('验证码已发送，请查收邮箱');
                    verificationCodeCountdown = 60;
                    const timer = setInterval(() => {
                        verificationCodeCountdown--;
                        if (verificationCodeCountdown <= 0) {
                            clearInterval(timer);
                            btn.disabled = false;
                            btn.textContent = '发送验证码';
                        } else {
                            btn.textContent = verificationCodeCountdown + 's';
                        }
                    }, 1000);
                } else {
                    showToast('发送失败: ' + (result.error || '未知错误'));
                    btn.disabled = false;
                    btn.textContent = '发送验证码';
                }
            } catch (e) {
                showToast('发送失败: ' + e.message);
                btn.disabled = false;
                btn.textContent = '发送验证码';
            }
        }

        async function showLoggedIn() {
            el('uc-not-logged-in').classList.add('hidden');
            el('uc-logged-in').classList.remove('hidden');
            if (ucState.user) {
                el('uc-username').textContent = ucState.user.username || '';
                el('uc-balance').textContent = '$' + ((ucState.user.quota || 0) / 500000).toFixed(2);
                el('uc-used-quota').textContent = '$' + ((ucState.user.used_quota || 0) / 500000).toFixed(2);
                el('uc-total-requests').textContent = (ucState.user.request_count || 0).toLocaleString();
                el('uc-aff-count').textContent = (ucState.user.aff_count || 0).toLocaleString();
                el('uc-aff-quota').textContent = '$' + ((ucState.user.aff_quota || 0) / 500000).toFixed(2);
                
                // 更新邀请链接
                var affCode = ucState.user.aff_code || '';
                el('uc-invite-link').value = affCode ? 'http://8.153.201.122:3000/register?aff=' + affCode : '';
            }
            updatePlanSelection();
            await loadTokens();
            await refreshLogs();
            await loadUsageChart();
            updateConfigStatus();
        }

        async function loadUsageChart() {
            try {
                // 获取最近7天的数据
                const now = Math.floor(Date.now() / 1000);
                const sevenDaysAgo = now - 7 * 24 * 60 * 60;
                const result = await window.api.hostedGetStatistics(sevenDaysAgo, now);
                
                if (result.success && result.data && result.data.data) {
                    renderUsageChart(result.data.data);
                } else {
                    showEmptyChart();
                }
            } catch (e) {
                console.error('Failed to load usage chart:', e);
                showEmptyChart();
            }
        }

        function renderUsageChart(data) {
            const barsContainer = el('usage-chart-bars');
            const labelsContainer = el('usage-chart-labels');
            const emptyEl = el('usage-chart-empty');
            
            if (!data || data.length === 0) {
                showEmptyChart();
                return;
            }
            
            emptyEl.style.display = 'none';
            
            // 按日期分组统计
            const dailyData = {};
            const today = new Date();
            
            // 初始化最近7天
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                dailyData[key] = 0;
            }
            
            // 累加数据
            data.forEach(item => {
                if (item.created_at) {
                    const date = new Date(item.created_at * 1000).toISOString().split('T')[0];
                    if (dailyData.hasOwnProperty(date)) {
                        dailyData[date] += (item.quota || 0);
                    }
                }
            });
            
            const values = Object.values(dailyData);
            const maxValue = Math.max(...values, 1);
            
            // 渲染柱状图
            let barsHtml = '';
            let labelsHtml = '';
            
            Object.entries(dailyData).forEach(([date, value]) => {
                const height = Math.max((value / maxValue) * 80, 2);
                const displayValue = (value / 500000).toFixed(2);
                const dayLabel = date.slice(5).replace('-', '/');
                
                barsHtml += '<div style="display: flex; flex-direction: column; align-items: center; flex: 1;">';
                barsHtml += '<div style="font-size: 10px; color: var(--text-muted); margin-bottom: 4px;">$' + displayValue + '</div>';
                barsHtml += '<div style="width: 24px; height: ' + height + 'px; background: var(--accent); border-radius: 2px;"></div>';
                barsHtml += '</div>';
                
                labelsHtml += '<span>' + dayLabel + '</span>';
            });
            
            barsContainer.innerHTML = barsHtml;
            labelsContainer.innerHTML = labelsHtml;
        }

        function showEmptyChart() {
            el('usage-chart-bars').innerHTML = '';
            el('usage-chart-labels').innerHTML = '';
            el('usage-chart-empty').style.display = 'block';
        }

        const HOSTED_TOKEN_NAME = 'superopencode';

        async function ensureHostedToken() {
            // 检查是否已存在 superopencode 密钥
            try {
                const tokensResult = await window.api.hostedGetTokens(1, 50);
                if (tokensResult.success && tokensResult.data && tokensResult.data.data) {
                    const tokens = tokensResult.data.data.items || [];
                    const existingToken = tokens.find(t => t.name === HOSTED_TOKEN_NAME);
                    
                    if (existingToken && existingToken.key) {
                        // 已存在，直接使用
                        return existingToken.key;
                    }
                }
                
                // 不存在，创建新密钥
                const createResult = await window.api.hostedCreateToken(HOSTED_TOKEN_NAME, 500000, false, -1);
                if (createResult.success && createResult.data && createResult.data.data) {
                    return createResult.data.data.key;
                }
                
                return null;
            } catch (e) {
                console.error('Failed to ensure hosted token:', e);
                return null;
            }
        }

        async function autoConfigureHostedService() {
            showToast('正在配置托管服务...', 'info');
            
            // 1. 确保有 superopencode 密钥
            const apiKey = await ensureHostedToken();
            if (!apiKey) {
                showToast('创建密钥失败', 'error');
                return false;
            }
            
            // 2. 应用配置到 opencode
            try {
                const result = await window.api.hostedApplyConfig(apiKey, ucState.selectedPlan || 'free');
                if (result.success) {
                    ucState.config = Object.assign({}, ucState.config, { 
                        apiKey: apiKey, 
                        plan: ucState.selectedPlan || 'free', 
                        enabled: true 
                    });
                    showToast('托管服务已自动配置', 'success');
                    return true;
                } else {
                    showToast('配置失败: ' + result.error, 'error');
                    return false;
                }
            } catch (e) {
                showToast('配置失败: ' + e.message, 'error');
                return false;
            }
        }

        async function doLogin() {
            const username = el('uc-login-username').value.trim();
            const password = el('uc-login-password').value;
            if (!username || !password) { showToast('请输入用户名和密码'); return; }
            try {
                const result = await window.api.hostedLogin(username, password);
                if (result.success) {
                    showToast('登录成功');
                    ucState.loggedIn = true;
                    ucState.lastUsername = username;
                    localStorage.setItem('uc_last_username', username);
                    await window.api.hostedSaveConfig({ username: username });
                    const userResult = await window.api.hostedGetCurrentUser();
                    if (userResult.success && userResult.data && userResult.data.data) {
                        ucState.user = userResult.data.data;
                    }
                    
                    // 自动配置托管服务
                    await autoConfigureHostedService();
                    
                    showLoggedIn();
                } else { showToast('登录失败: ' + result.error); }
            } catch (e) { showToast('登录失败: ' + e.message); }
        }

        async function doRegister() {
            const username = el('uc-reg-username').value.trim();
            const email = el('uc-reg-email').value.trim();
            const verificationCode = el('uc-reg-code').value.trim();
            const password = el('uc-reg-password').value;
            if (!username || !email || !password) { showToast('请填写所有必填项'); return; }
            if (!verificationCode) { showToast('请输入邮箱验证码'); return; }
            if (password.length < 8) { showToast('密码至少需要8位'); return; }
            try {
                const result = await window.api.hostedRegister(username, password, email, verificationCode, '');
                if (result.success) {
                    showToast('注册成功，请登录');
                    ucState.lastUsername = username;
                    localStorage.setItem('uc_last_username', username);
                    el('uc-form-register').classList.add('hidden');
                    el('uc-form-login').classList.remove('hidden');
                    el('uc-login-username').value = username;
                    el('uc-login-password').value = '';
                    el('uc-switch-account-link').classList.add('hidden');
                    el('uc-use-other-link').classList.remove('hidden');
                } else { showToast('注册失败: ' + result.error); }
            } catch (e) { showToast('注册失败: ' + e.message); }
        }

        async function doLogout() {
            try {
                await window.api.hostedLogout();
                ucState.loggedIn = false;
                ucState.user = null;
                ucState.tokens = [];
                ucState.lastUsername = '';
                localStorage.removeItem('uc_last_username');
                await window.api.hostedSaveConfig({ enabled: false, apiKey: '', username: '' });
                showNotLoggedIn();
                showToast('已退出登录');
            } catch (e) { showToast('退出失败: ' + e.message); }
        }

        async function loadTokens() {
            try {
                const result = await window.api.hostedGetTokens(1, 50);
                if (result.success && result.data && result.data.data) {
                    ucState.tokens = result.data.data.items || [];
                    renderTokens();
                }
            } catch (e) { console.error('Failed to load tokens:', e); }
        }

        function renderTokens() {
            const container = el('uc-tokens-list');
            const select = el('uc-token-select');
            if (!ucState.tokens || ucState.tokens.length === 0) {
                container.innerHTML = '<p class="text-muted">暂无 Token</p>';
                select.innerHTML = '<option value="">-- 请先创建 Token --</option>';
                return;
            }
            let html = '<table class="table"><thead><tr><th>名称</th><th>Key</th><th style="text-align:right;">操作</th></tr></thead><tbody>';
            ucState.tokens.forEach(function(t) {
                html += '<tr><td>' + (t.name || '-') + '</td><td><code style="font-size:12px;">' + (t.key ? t.key.slice(0,12) + '...' : '-') + '</code></td>';
                html += '<td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="copyToken(\'' + t.key + '\')">复制</button>';
                html += '<button class="btn btn-ghost btn-sm" onclick="deleteToken(' + t.id + ')" style="color:var(--danger);">删除</button></td></tr>';
            });
            html += '</tbody></table>';
            container.innerHTML = html;
            let opts = '<option value="">-- 选择 Token --</option>';
            ucState.tokens.forEach(function(t) { opts += '<option value="' + t.key + '">' + (t.name || '-') + '</option>'; });
            select.innerHTML = opts;
            if (ucState.config && ucState.config.apiKey) select.value = ucState.config.apiKey;
        }

        async function createToken() {
            const name = el('new-token-name').value.trim();
            if (!name) { showToast('请输入名称'); return; }
            try {
                const result = await window.api.hostedCreateToken(name, 500000, false, -1);
                if (result.success) { showToast('创建成功'); el('new-token-name').value = ''; await loadTokens(); }
                else { showToast('创建失败: ' + result.error); }
            } catch (e) { showToast('创建失败: ' + e.message); }
        }

        async function deleteToken(id) {
            if (!confirm('确定删除？')) return;
            try {
                const result = await window.api.hostedDeleteToken(id);
                if (result.success) { showToast('已删除'); await loadTokens(); }
                else { showToast('删除失败: ' + result.error); }
            } catch (e) { showToast('删除失败: ' + e.message); }
        }

        function copyToken(key) {
            navigator.clipboard.writeText(key).then(function() { showToast('已复制'); }).catch(function() { showToast('复制失败'); });
        }

        function updatePlanSelection() {
            ['free', 'pro', 'ultimate'].forEach(function(p) {
                var card = el('plan-' + p);
                if (card) card.classList.toggle('selected', p === ucState.selectedPlan);
            });
        }

        async function applyConfig() {
            const apiKey = el('uc-token-select').value;
            if (!apiKey) { showToast('请选择 Token'); return; }
            try {
                const result = await window.api.hostedApplyConfig(apiKey, ucState.selectedPlan);
                if (result.success) {
                    showToast('配置已应用');
                    ucState.config = Object.assign({}, ucState.config, { apiKey: apiKey, plan: ucState.selectedPlan, enabled: true });
                    updateConfigStatus();
                } else { showToast('应用失败: ' + result.error); }
            } catch (e) { showToast('应用失败: ' + e.message); }
        }

        async function removeConfig() {
            if (!confirm('确定移除配置？')) return;
            try {
                const result = await window.api.hostedRemoveConfig();
                if (result.success) {
                    showToast('已移除');
                    ucState.config = Object.assign({}, ucState.config, { enabled: false, apiKey: '' });
                    updateConfigStatus();
                } else { showToast('移除失败: ' + result.error); }
            } catch (e) { showToast('移除失败: ' + e.message); }
        }

        function updateConfigStatus() {
            var statusEl = el('uc-config-status');
            if (!statusEl) return;
            var plans = { free: '免费版', pro: '专业版', ultimate: '旗舰版' };
            if (ucState.config && ucState.config.enabled && ucState.config.apiKey) {
                statusEl.innerHTML = '<div style="padding:12px;background:rgba(34,197,94,0.1);border-radius:8px;color:#22c55e;"><strong>✓ 已启用</strong> - ' + (plans[ucState.config.plan] || '免费版') + '</div>';
            } else {
                statusEl.innerHTML = '<div style="padding:12px;background:#E4E4E7;border-radius:8px;color:#A1A1AA;">未启用</div>';
            }
        }

        async function refreshLogs() {
            try {
                const result = await window.api.hostedGetUsageLogs(ucState.currentPage, ucState.pageSize);
                if (result.success && result.data && result.data.data) {
                    ucState.logs = result.data.data.items || [];
                    ucState.totalPages = Math.ceil((result.data.data.total || 0) / ucState.pageSize);
                    renderLogs();
                }
            } catch (e) { console.error('Failed to load logs:', e); }
        }

        function renderLogs() {
            var tbody = el('uc-logs-body');
            var pag = el('uc-logs-pagination');
            if (!ucState.logs || ucState.logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:24px;">暂无记录</td></tr>';
                pag.innerHTML = '';
                return;
            }
            tbody.innerHTML = ucState.logs.map(function(log) {
                var time = new Date(log.created_at * 1000).toLocaleString('zh-CN');
                var tokens = ((log.prompt_tokens || 0) + (log.completion_tokens || 0)).toLocaleString();
                return '<tr><td style="font-size:12px;color:#A1A1AA;">' + time + '</td><td><code style="font-size:12px;">' + (log.model_name || log.model || '-') + '</code></td><td>' + tokens + '</td><td>$' + ((log.quota || 0) / 500000).toFixed(4) + '</td></tr>';
            }).join('');
            if (ucState.totalPages > 1) {
                var h = '';
                if (ucState.currentPage > 1) h += '<button class="btn btn-ghost btn-sm" onclick="goToPage(' + (ucState.currentPage - 1) + ')">上一页</button>';
                h += '<span style="padding:0 12px;color:#A1A1AA;">' + ucState.currentPage + '/' + ucState.totalPages + '</span>';
                if (ucState.currentPage < ucState.totalPages) h += '<button class="btn btn-ghost btn-sm" onclick="goToPage(' + (ucState.currentPage + 1) + ')">下一页</button>';
                pag.innerHTML = h;
            } else { pag.innerHTML = ''; }
        }

        function goToPage(p) { ucState.currentPage = p; refreshLogs(); }

        async function redeemCode() {
            var input = el('redeem-code-input');
            var code = input.value.trim();
            if (!code) { showToast('请输入兑换码'); return; }
            try {
                const result = await window.api.hostedRedeemCode(code);
                if (result.success && result.data && result.data.success) {
                    showToast('兑换成功！$' + ((result.data.data || 0) / 500000).toFixed(2));
                    input.value = '';
                    const userResult = await window.api.hostedGetCurrentUser();
                    if (userResult.success && userResult.data && userResult.data.data) {
                        ucState.user = userResult.data.data;
                        el('uc-balance').textContent = '$' + ((ucState.user.quota || 0) / 500000).toFixed(2);
                    }
                } else { showToast((result.data && result.data.message) || result.error || '兑换失败'); }
            } catch (e) { showToast('兑换失败: ' + e.message); }
        }

        function copyAffCode() {
            var code = el('uc-aff-code').value;
            if (!code) { showToast('暂无邀请码'); return; }
            navigator.clipboard.writeText(code).then(function() { showToast('已复制'); }).catch(function() { showToast('复制失败'); });
        }

        function switchUcTab(tab) {
            ['overview', 'plan', 'keys'].forEach(function(t) {
                var tabEl = el('uc-tab-' + t);
                var panelEl = el('uc-panel-' + t);
                if (tabEl) tabEl.classList.toggle('active', t === tab);
                if (panelEl) panelEl.classList.toggle('hidden', t !== tab);
            });
            
            // 切换时加载对应数据
            if (tab === 'overview') {
                refreshLogs();
                loadUsageChart();
            } else if (tab === 'keys') {
                loadTokens();
            }
        }

        function showBuyModal() {
            el('uc-modal-overlay').classList.remove('hidden');
            el('uc-modal-buy').classList.remove('hidden');
            el('uc-modal-redeem').classList.add('hidden');
            el('uc-modal-invite').classList.add('hidden');
        }

        function showRedeemModal() {
            el('uc-modal-overlay').classList.remove('hidden');
            el('uc-modal-buy').classList.add('hidden');
            el('uc-modal-redeem').classList.remove('hidden');
            el('uc-modal-invite').classList.add('hidden');
            el('redeem-code-input').value = '';
        }

        function showInviteModal() {
            el('uc-modal-overlay').classList.remove('hidden');
            el('uc-modal-buy').classList.add('hidden');
            el('uc-modal-redeem').classList.add('hidden');
            el('uc-modal-invite').classList.remove('hidden');
            var affCode = ucState.user ? ucState.user.aff_code : '';
            el('uc-invite-link').value = affCode ? 'http://8.153.201.122:3000/register?aff=' + affCode : '';
        }

        function closeUcModal(event) {
            if (event && event.target !== el('uc-modal-overlay')) return;
            el('uc-modal-overlay').classList.add('hidden');
        }

        function copyInviteLink() {
            var link = el('uc-invite-link').value;
            if (!link) { showToast('暂无邀请链接'); return; }
            navigator.clipboard.writeText(link).then(function() { showToast('邀请链接已复制'); }).catch(function() { showToast('复制失败'); });
        }

        function selectPlan(plan) {
            showToast('套餐功能暂未开放');
            ucState.selectedPlan = plan;
            updatePlanSelection();
        }

        // --- Feishu Bot Logic ---
        
        async function loadFeishuConfig() {
            try {
                const result = await window.api.getFeishuConfig();
                if (result.success && result.data) {
                    el('feishu-app-id').value = result.data.app_id;
                    el('feishu-app-secret').value = result.data.app_secret;
                    el('feishu-working-dir').value = result.data.working_dir;
                    el('feishu-server-host').value = result.data.server_host;
                    el('feishu-server-port').value = result.data.server_port;
                    el('feishu-server-mode').checked = result.data.use_server_mode;
                }
                
                // Check status
                updateFeishuStatus();
            } catch (e) {
                console.error('Failed to load Feishu config:', e);
            }
        }
        
        async function saveFeishuConfig() {
            const config = {
                app_id: el('feishu-app-id').value,
                app_secret: el('feishu-app-secret').value,
                working_dir: el('feishu-working-dir').value,
                server_host: el('feishu-server-host').value,
                server_port: parseInt(el('feishu-server-port').value) || 4096,
                use_server_mode: el('feishu-server-mode').checked
            };
            
            const result = await window.api.saveFeishuConfig(config);
            if (result.success) {
                showToast('飞书配置已保存');
            } else {
                showToast('保存失败: ' + result.error);
            }
        }
        
        async function startFeishuBot() {
            el('feishu-log-area').innerHTML = '<div class="text-muted">正在启动...</div>';
            const result = await window.api.startFeishuBot();
            if (result.success) {
                showToast('启动指令已发送');
                updateFeishuStatus();
            } else {
                showToast('启动失败: ' + result.error);
                el('feishu-log-area').innerHTML += `<div style="color: var(--danger)">启动失败: ${result.error}</div>`;
            }
        }
        
        async function stopFeishuBot() {
            const result = await window.api.stopFeishuBot();
            if (result.success) {
                showToast('已停止');
                updateFeishuStatus();
            } else {
                showToast('停止失败: ' + result.error);
            }
        }
        
        async function updateFeishuStatus() {
            const result = await window.api.getFeishuBotStatus();
            const isRunning = result.success && result.data.running;
            
            const indicator = el('feishu-status-indicator');
            const startBtn = el('btn-start-feishu');
            const stopBtn = el('btn-stop-feishu');
            
            if (isRunning) {
                indicator.innerHTML = `
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--success);"></div>
                    <span style="color: var(--success)">运行中</span>
                `;
                startBtn.disabled = true;
                stopBtn.disabled = false;
            } else {
                indicator.innerHTML = `
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted);"></div>
                    <span class="text-muted">未运行</span>
                `;
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }
        }
        
        // Listen for logs
        if (window.api.onFeishuBotLog) {
            window.api.onFeishuBotLog((log) => {
                const logArea = el('feishu-log-area');
                const div = document.createElement('div');
                div.textContent = log;
                logArea.appendChild(div);
                logArea.scrollTop = logArea.scrollHeight;
            });
        }
        
        if (window.api.onFeishuBotStatus) {
            window.api.onFeishuBotStatus((status) => {
                updateFeishuStatus();
                if (!status.running && status.code !== 0 && status.code !== null) {
                    const logArea = el('feishu-log-area');
                    const div = document.createElement('div');
                    div.style.color = 'var(--danger)';
                    div.textContent = `Process exited with code ${status.code}`;
                    logArea.appendChild(div);
                    logArea.scrollTop = logArea.scrollHeight;
                }
            });
        }

        // --- Appear Tab Switching (Tech Stack / Design Style) ---
        window.switchAppearTab = (tab) => {
            const tabStack = el('appear-tab-stack');
            const tabStyle = el('appear-tab-style');
            const panelStack = el('appear-panel-stack');
            const panelStyle = el('appear-panel-style');

            if (tab === 'stack') {
                tabStack.style.borderBottomColor = 'var(--accent)';
                tabStack.style.color = 'var(--text-primary)';
                tabStyle.style.borderBottomColor = 'transparent';
                tabStyle.style.color = 'var(--text-muted)';
                panelStack.style.display = '';
                panelStyle.style.display = 'none';
            } else {
                tabStyle.style.borderBottomColor = 'var(--accent)';
                tabStyle.style.color = 'var(--text-primary)';
                tabStack.style.borderBottomColor = 'transparent';
                tabStack.style.color = 'var(--text-muted)';
                panelStack.style.display = 'none';
                panelStyle.style.display = '';
            }
        };

        // Start
        init();
        initUpdater();

