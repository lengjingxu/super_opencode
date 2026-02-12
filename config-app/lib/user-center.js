let ucState = {
    loggedIn: false,
    user: null,
    tokens: [],
    selectedPlan: 'free',
    config: null,
    logs: [],
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
};

async function loadUserCenter() {
    try {
        const configResult = await window.api.hostedGetConfig();
        if (configResult.success) {
            ucState.config = configResult.data;
            ucState.selectedPlan = configResult.data.plan || 'free';
        }
        
        if (ucState.config && ucState.config.enabled) {
            const userResult = await window.api.hostedGetCurrentUser();
            if (userResult.success && userResult.data && userResult.data.data) {
                ucState.loggedIn = true;
                ucState.user = userResult.data.data;
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
}

async function showLoggedIn() {
    el('uc-not-logged-in').classList.add('hidden');
    el('uc-logged-in').classList.remove('hidden');
    
    if (ucState.user) {
        el('uc-username').textContent = ucState.user.username || ucState.user.display_name || '';
        el('uc-balance').textContent = '¥' + ((ucState.user.quota || 0) / 500000).toFixed(2);
        el('uc-used-quota').textContent = '¥' + ((ucState.user.used_quota || 0) / 500000).toFixed(2);
        el('uc-total-requests').textContent = (ucState.user.request_count || 0).toLocaleString();
        el('uc-aff-count').textContent = (ucState.user.aff_count || 0).toLocaleString();
        el('uc-aff-code').value = ucState.user.aff_code || '';
        el('uc-aff-quota').textContent = '¥' + ((ucState.user.aff_quota || 0) / 500000).toFixed(2);
    }
    
    updatePlanSelection();
    await loadTokens();
    await refreshLogs();
    updateConfigStatus();
}

async function doLogin() {
    const username = el('uc-login-username').value.trim();
    const password = el('uc-login-password').value;
    
    if (!username || !password) {
        showToast('请输入用户名和密码');
        return;
    }
    
    try {
        const result = await window.api.hostedLogin(username, password);
        if (result.success) {
            showToast('登录成功');
            ucState.loggedIn = true;
            
            const userResult = await window.api.hostedGetCurrentUser();
            if (userResult.success && userResult.data && userResult.data.data) {
                ucState.user = userResult.data.data;
            }
            
            showLoggedIn();
        } else {
            showToast('登录失败: ' + result.error);
        }
    } catch (e) {
        showToast('登录失败: ' + e.message);
    }
}

async function doRegister() {
    const username = el('uc-reg-username').value.trim();
    const email = el('uc-reg-email').value.trim();
    const password = el('uc-reg-password').value;
    
    if (!username || !email || !password) {
        showToast('请填写所有必填项');
        return;
    }
    
    if (password.length < 8) {
        showToast('密码至少需要8位');
        return;
    }
    
    try {
        const result = await window.api.hostedRegister(username, password, email, '', '');
        if (result.success) {
            showToast('注册成功，请登录');
            el('uc-login-username').value = username;
            el('uc-reg-username').value = '';
            el('uc-reg-email').value = '';
            el('uc-reg-password').value = '';
        } else {
            showToast('注册失败: ' + result.error);
        }
    } catch (e) {
        showToast('注册失败: ' + e.message);
    }
}

async function doLogout() {
    try {
        await window.api.hostedLogout();
        ucState.loggedIn = false;
        ucState.user = null;
        ucState.tokens = [];
        showNotLoggedIn();
        showToast('已退出登录');
    } catch (e) {
        showToast('退出失败: ' + e.message);
    }
}

async function loadTokens() {
    try {
        const result = await window.api.hostedGetTokens(1, 50);
        if (result.success && result.data && result.data.data) {
            ucState.tokens = result.data.data.items || [];
            renderTokens();
        }
    } catch (e) {
        console.error('Failed to load tokens:', e);
    }
}

function renderTokens() {
    const container = el('uc-tokens-list');
    const select = el('uc-token-select');
    
    if (!ucState.tokens || ucState.tokens.length === 0) {
        container.innerHTML = '<p class="text-muted">暂无 Token，请创建一个</p>';
        select.innerHTML = '<option value="">-- 请先创建 Token --</option>';
        return;
    }
    
    container.innerHTML = '<table class="table"><thead><tr><th>名称</th><th>Key</th><th>状态</th><th style="text-align: right;">操作</th></tr></thead><tbody>' +
        ucState.tokens.map(t => '<tr><td style="font-weight: 500;">' + (t.name || '未命名') + '</td><td><code style="font-size: 12px;">' + (t.key ? t.key.slice(0, 12) + '...' : '-') + '</code></td><td><span class="badge" style="background: ' + (t.status === 1 ? 'var(--success)' : 'var(--danger)') + '; color: white;">' + (t.status === 1 ? '正常' : '禁用') + '</span></td><td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="copyToken(\'' + t.key + '\')">复制</button><button class="btn btn-ghost btn-sm" onclick="deleteToken(' + t.id + ')" style="color: var(--danger);">删除</button></td></tr>').join('') +
        '</tbody></table>';
    
    select.innerHTML = '<option value="">-- 选择 Token --</option>' +
        ucState.tokens.map(t => '<option value="' + t.key + '">' + (t.name || '未命名') + '</option>').join('');
    
    if (ucState.config && ucState.config.apiKey) {
        select.value = ucState.config.apiKey;
    }
}

async function createToken() {
    const name = el('new-token-name').value.trim();
    if (!name) {
        showToast('请输入 Token 名称');
        return;
    }
    
    try {
        const result = await window.api.hostedCreateToken(name, 500000, false, -1);
        if (result.success) {
            showToast('Token 创建成功');
            el('new-token-name').value = '';
            await loadTokens();
        } else {
            showToast('创建失败: ' + result.error);
        }
    } catch (e) {
        showToast('创建失败: ' + e.message);
    }
}

async function deleteToken(id) {
    if (!confirm('确定要删除这个 Token 吗？')) return;
    
    try {
        const result = await window.api.hostedDeleteToken(id);
        if (result.success) {
            showToast('Token 已删除');
            await loadTokens();
        } else {
            showToast('删除失败: ' + result.error);
        }
    } catch (e) {
        showToast('删除失败: ' + e.message);
    }
}

function copyToken(key) {
    navigator.clipboard.writeText(key).then(() => showToast('已复制')).catch(() => showToast('复制失败'));
}

function selectPlan(plan) {
    ucState.selectedPlan = plan;
    updatePlanSelection();
}

function updatePlanSelection() {
    ['free', 'pro', 'ultimate'].forEach(p => {
        const card = el('plan-' + p);
        if (card) card.classList.toggle('selected', p === ucState.selectedPlan);
    });
}

async function applyConfig() {
    const apiKey = el('uc-token-select').value;
    if (!apiKey) {
        showToast('请选择一个 Token');
        return;
    }
    
    try {
        const result = await window.api.hostedApplyConfig(apiKey, ucState.selectedPlan);
        if (result.success) {
            showToast('配置已应用');
            ucState.config = { ...ucState.config, apiKey, plan: ucState.selectedPlan, enabled: true };
            updateConfigStatus();
        } else {
            showToast('应用失败: ' + result.error);
        }
    } catch (e) {
        showToast('应用失败: ' + e.message);
    }
}

async function removeConfig() {
    if (!confirm('确定要移除托管配置吗？')) return;
    
    try {
        const result = await window.api.hostedRemoveConfig();
        if (result.success) {
            showToast('配置已移除');
            ucState.config = { ...ucState.config, enabled: false, apiKey: '' };
            updateConfigStatus();
        } else {
            showToast('移除失败: ' + result.error);
        }
    } catch (e) {
        showToast('移除失败: ' + e.message);
    }
}

function updateConfigStatus() {
    const statusEl = el('uc-config-status');
    if (!statusEl) return;
    
    if (ucState.config && ucState.config.enabled && ucState.config.apiKey) {
        const planNames = { free: '免费版', pro: '专业版', ultimate: '旗舰版' };
        statusEl.innerHTML = '<div style="padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; color: #22c55e;"><strong>✓ 托管服务已启用</strong> - ' + (planNames[ucState.config.plan] || '免费版') + '</div>';
    } else {
        statusEl.innerHTML = '<div style="padding: 12px; background: #E4E4E7; border-radius: 8px; color: #A1A1AA;">托管服务未启用</div>';
    }
}

async function refreshLogs() {
    try {
        const result = await window.api.hostedGetUsageLogs(ucState.currentPage, ucState.pageSize);
        if (result.success && result.data && result.data.data) {
            const data = result.data.data;
            ucState.logs = data.items || [];
            ucState.totalPages = Math.ceil((data.total || 0) / ucState.pageSize);
            renderLogs();
        }
    } catch (e) {
        console.error('Failed to load logs:', e);
    }
}

function renderLogs() {
    const tbody = el('uc-logs-body');
    const pagination = el('uc-logs-pagination');
    
    if (!ucState.logs || ucState.logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align: center; padding: 24px;">暂无消费记录</td></tr>';
        pagination.innerHTML = '';
        return;
    }
    
    tbody.innerHTML = ucState.logs.map(log => {
        const time = new Date(log.created_at * 1000).toLocaleString('zh-CN');
        const model = log.model_name || log.model || '-';
        const tokens = ((log.prompt_tokens || 0) + (log.completion_tokens || 0)).toLocaleString();
        const cost = '¥' + ((log.quota || 0) / 500000).toFixed(4);
        return '<tr><td style="font-size: 12px; color: #A1A1AA;">' + time + '</td><td><code style="font-size: 12px;">' + model + '</code></td><td>' + tokens + '</td><td style="color: #18181B;">' + cost + '</td></tr>';
    }).join('');
    
    if (ucState.totalPages > 1) {
        let html = '';
        if (ucState.currentPage > 1) html += '<button class="btn btn-ghost btn-sm" onclick="goToPage(' + (ucState.currentPage - 1) + ')">上一页</button>';
        html += '<span style="padding: 0 12px; color: #A1A1AA;">' + ucState.currentPage + ' / ' + ucState.totalPages + '</span>';
        if (ucState.currentPage < ucState.totalPages) html += '<button class="btn btn-ghost btn-sm" onclick="goToPage(' + (ucState.currentPage + 1) + ')">下一页</button>';
        pagination.innerHTML = html;
    } else {
        pagination.innerHTML = '';
    }
}

function goToPage(page) {
    ucState.currentPage = page;
    refreshLogs();
}

async function redeemCode() {
    const input = el('redeem-code-input');
    const code = input.value.trim();
    
    if (!code) {
        showToast('请输入兑换码');
        return;
    }
    
    try {
        const result = await window.api.hostedRedeemCode(code);
        if (result.success && result.data && result.data.success) {
            const amount = result.data.data || 0;
            showToast('兑换成功！充值 ¥' + (amount / 500000).toFixed(2));
            input.value = '';
            const userResult = await window.api.hostedGetCurrentUser();
            if (userResult.success && userResult.data && userResult.data.data) {
                ucState.user = userResult.data.data;
                el('uc-balance').textContent = '¥' + ((ucState.user.quota || 0) / 500000).toFixed(2);
            }
        } else {
            showToast(result.data?.message || result.error || '兑换失败');
        }
    } catch (e) {
        showToast('兑换失败: ' + e.message);
    }
}

function copyAffCode() {
    const code = el('uc-aff-code').value;
    if (!code) { showToast('暂无邀请码'); return; }
    navigator.clipboard.writeText(code).then(() => showToast('邀请码已复制')).catch(() => showToast('复制失败'));
}
