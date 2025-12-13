// Game State
const state = {
    currentStep: 0,
    empathize: {
        needs: [] // heat, seat, drain, fun
    },
    define: {
        need: '',
        insight: ''
    },
    ideate: {
        selectedIdeas: [] // IDs of selected ideas
    },
    prototype: {
        placedItems: [],
        stats: {
            eco: 10,
            comfort: 10,
            budget: 60000 // Starting budget
        }
    }
};

// Config
const IDEAS_DB = [
    { id: 'green_roof', name: '🌿 屋頂綠化 Green Roof', type: 'eco', cost: 15000, eco: 20, comfort: 10, icon: 'fa-layer-group' },
    { id: 'solar', name: '☀️ 太陽能板 Solar Panels', type: 'eco', cost: 20000, eco: 25, comfort: 0, icon: 'fa-solar-panel' },
    { id: 'rain_barrel', name: '💧 雨水回收桶 Rain Barrel', type: 'eco', cost: 5000, eco: 15, comfort: 5, icon: 'fa-faucet' },
    { id: 'vertical_garden', name: '🧱 植生牆 Vertical Garden', type: 'eco', cost: 12000, eco: 15, comfort: 15, icon: 'fa-seedling' },
    { id: 'wood_bench', name: '🪑 原木座椅 Bench', type: 'comfort', cost: 3000, eco: 5, comfort: 20, icon: 'fa-chair' },
    { id: 'pavilion', name: '⛺ 遮陽涼亭 Pavilion', type: 'comfort', cost: 25000, eco: 5, comfort: 30, icon: 'fa-tent' },
    { id: 'pond', name: '🐟 生態池 Eco Pond', type: 'eco', cost: 18000, eco: 20, comfort: 20, icon: 'fa-water' },
    { id: 'tree', name: '🌳 喬木 Shade Tree', type: 'eco', cost: 8000, eco: 25, comfort: 25, icon: 'fa-tree' }
];

// DOM Elements
const pages = [
    document.getElementById('section-intro'),
    document.getElementById('section-empathize'),
    document.getElementById('section-define'),
    document.getElementById('section-ideate'),
    document.getElementById('section-prototype'),
    document.getElementById('section-test')
];

const indicators = document.querySelectorAll('.step-indicator');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initIdeation();
    initDragDrop();
});

// Navigation
function goToStep(stepIndex) {
    // Validation
    if (stepIndex === 4 && state.ideate.selectedIdeas.length === 0) {
        showToast('請至少選擇一個設計點子！', 'warning');
        return;
    }

    // Update State
    state.currentStep = stepIndex;

    // Update UI
    pages.forEach((page, idx) => {
        if (idx === stepIndex) {
            page.classList.add('active-section');
            page.style.animation = 'fadeIn 0.5s ease';
        } else {
            page.classList.remove('active-section');
        }
    });

    // Update Header Indicators
    indicators.forEach((ind, idx) => {
        if (idx <= stepIndex && stepIndex > 0) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });

    // Special Inits
    if (stepIndex === 3) {
        renderIdeaCloud();
    }
    if (stepIndex === 4) {
        initPrototypeTools();
    }
    if (stepIndex === 5) {
        calculateResults();
    }
}

// === Step 1: Empathize ===
document.querySelectorAll('.check-btn input').forEach(input => {
    input.addEventListener('change', () => {
        const checked = document.querySelectorAll('.check-btn input:checked');
        const btn = document.getElementById('btn-empathize-next');
        if (checked.length > 0) {
            btn.classList.remove('disabled');
        } else {
            btn.classList.add('disabled');
        }

        state.empathize.needs = Array.from(checked).map(cb => cb.value);
    });
});

function checkEmpathize() {
    if (state.empathize.needs.length > 0) {
        showToast('需求確認成功！', 'success');
        goToStep(2);
    }
}

// === Step 2: Define ===
function checkDefine() {
    const need = document.getElementById('pov-need').value;
    const insight = document.getElementById('pov-insight').value;

    if (!need || !insight) {
        showToast('請完整填寫設計觀點宣言！', 'error');
        return;
    }

    state.define.need = need;
    state.define.insight = insight;
    showToast('問題定義完成！', 'success');
    goToStep(3);
}

// === Step 3: Ideate ===
function initIdeation() {
    // Pre-populate is handled by renderIdeaCloud called on nav
}

function renderIdeaCloud() {
    const container = document.getElementById('idea-cloud');
    container.innerHTML = '';

    // Filter ideas based on needs (simplified logic: show all but highlight recommended)
    IDEAS_DB.forEach(idea => {
        const tag = document.createElement('div');
        tag.className = 'idea-tag';
        if (state.ideate.selectedIdeas.includes(idea.id)) {
            tag.classList.add('selected');
        }

        tag.innerHTML = `<i class="fa-solid ${idea.icon}"></i> ${idea.name}`;
        tag.onclick = () => toggleIdea(idea.id, tag);

        // Stagger animation
        tag.style.animationDelay = `${Math.random() * 0.5}s`;

        container.appendChild(tag);
    });
}

function toggleIdea(id, element) {
    const index = state.ideate.selectedIdeas.indexOf(id);
    if (index === -1) {
        state.ideate.selectedIdeas.push(id);
        element.classList.add('selected');
        addItemToInventoryUI(id);
    } else {
        state.ideate.selectedIdeas.splice(index, 1);
        element.classList.remove('selected');
        removeItemFromInventoryUI(id);
    }

    const btn = document.getElementById('btn-ideate-next');
    if (state.ideate.selectedIdeas.length > 0) {
        btn.classList.remove('disabled');
    } else {
        btn.classList.add('disabled');
    }
}

function addItemToInventoryUI(id) {
    const list = document.getElementById('inventory-list');
    const idea = IDEAS_DB.find(i => i.id === id);

    // Remove empty msg if exists
    if (list.querySelector('.empty-msg')) {
        list.innerHTML = '';
    }

    const item = document.createElement('span');
    item.className = 'idea-tag selected sm';
    item.id = `inv-${id}`;
    item.innerHTML = `<i class="fa-solid ${idea.icon}"></i> ${idea.name}`;
    item.style.fontSize = '0.8rem';
    item.style.padding = '5px 10px';
    list.appendChild(item);
}

function removeItemFromInventoryUI(id) {
    const item = document.getElementById(`inv-${id}`);
    if (item) item.remove();

    const list = document.getElementById('inventory-list');
    if (list.children.length === 0) {
        list.innerHTML = '<span class="empty-msg">尚未收集靈感...</span>';
    }
}

// === Step 4: Prototype ===
function initPrototypeTools() {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = '';

    // Only show selected ideas as available tools
    const availableTools = IDEAS_DB.filter(tool => state.ideate.selectedIdeas.includes(tool.id));

    availableTools.forEach(tool => {
        const div = document.createElement('div');
        div.className = 'tool-item';
        div.draggable = true;
        div.innerHTML = `
            <i class="fa-solid ${tool.icon}"></i>
            <strong>${tool.name.split(' ')[1]}</strong>
            <small>$${tool.cost}</small>
        `;

        // Drag Events
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tool.id);
            div.style.opacity = '0.5';
        });

        div.addEventListener('dragend', (e) => {
            div.style.opacity = '1';
        });

        // Click to add (mobile friendly fallback)
        div.addEventListener('click', () => {
            placeItemOnCanvas(tool.id, 50 + Math.random() * 20, 50 + Math.random() * 20); // Random position
        });

        grid.appendChild(div);
    });

    updateStats();
}

function initDragDrop() {
    const canvas = document.getElementById('design-canvas');

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const toolId = e.dataTransfer.getData('text/plain');
        if (toolId) {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            placeItemOnCanvas(toolId, x, y);
        }
    });
}

function placeItemOnCanvas(toolId, xPercent, yPercent) {
    const tool = IDEAS_DB.find(t => t.id === toolId);

    // Check Budget
    if (state.prototype.stats.budget < tool.cost) {
        showToast('預算不足！無法設置此項目。', 'error');
        return;
    }

    // Create Element
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.innerHTML = `<i class="fa-solid ${tool.icon}" style="font-size: 3rem; color: var(--primary-dark);"></i>`;
    el.style.left = xPercent + '%';
    el.style.top = yPercent + '%';

    // Add logic to remove on click?
    el.title = '雙擊移除';
    el.addEventListener('dblclick', () => {
        el.remove();
        refundItem(tool);
    });

    document.getElementById('design-canvas').appendChild(el);

    // Update State
    state.prototype.placedItems.push(tool);
    state.prototype.stats.budget -= tool.cost;
    state.prototype.stats.eco += tool.eco;
    state.prototype.stats.comfort += tool.comfort;

    updateStats();
    showToast(`已設置：${tool.name}`, 'success');
}

function refundItem(tool) {
    state.prototype.stats.budget += tool.cost;
    state.prototype.stats.eco -= tool.eco;
    state.prototype.stats.comfort -= tool.comfort;
    updateStats();
    // Remove from placedItems array (one instance)
    const idx = state.prototype.placedItems.indexOf(tool);
    if (idx > -1) state.prototype.placedItems.splice(idx, 1);
}

function resetCanvas() {
    document.querySelectorAll('.canvas-element').forEach(el => el.remove());
    state.prototype.placedItems = [];
    state.prototype.stats = { eco: 10, comfort: 10, budget: 60000 };
    updateStats();
}

function updateStats() {
    // Cap stats at 100 visually
    const ecoPct = Math.min(state.prototype.stats.eco, 100);
    const comPct = Math.min(state.prototype.stats.comfort, 100);
    const budPct = (state.prototype.stats.budget / 60000) * 100;

    document.getElementById('bar-eco').style.width = ecoPct + '%';
    document.getElementById('bar-comfort').style.width = comPct + '%';

    const budgetBar = document.getElementById('bar-budget');
    budgetBar.style.width = budPct + '%';
    // Change color if low budget
    if (budPct < 20) budgetBar.style.background = '#e74c3c';
    else budgetBar.style.background = '#f1c40f';
}

// === Step 5: Test/Results ===
function calculateResults() {
    const finalEco = state.prototype.stats.eco;
    const finalComfort = state.prototype.stats.comfort;

    // Total calculation algorithm
    let totalScore = Math.floor((finalEco + finalComfort) / 2);
    if (totalScore > 100) totalScore = 100;

    // Clone View
    const canvas = document.getElementById('design-canvas');
    const snapshot = document.getElementById('final-snapshot');
    snapshot.innerHTML = '';
    // Clone children (simplified visual clone)
    Array.from(canvas.children).forEach(child => {
        snapshot.appendChild(child.cloneNode(true));
    });

    // Feedback Text
    let feedback = '';
    if (totalScore >= 80) {
        feedback = '<p class="success-text"><i class="fa-solid fa-star"></i> 太棒了！你的設計兼顧了生態與舒適性，是一個完美的永續校園典範！</p>';
    } else if (totalScore >= 60) {
        feedback = '<p><i class="fa-solid fa-thumbs-up"></i> 不錯的嘗試！但或許可以再增加一些綠化或休憩設施來提升評價喔。</p>';
    } else {
        feedback = '<p><i class="fa-solid fa-triangle-exclamation"></i> 使用者似乎不太滿意。預算還夠嗎？試著多增加一些關鍵設施吧！</p>';
    }

    // Detail breakdown
    feedback += `<ul class="stats-list">
        <li>🌱 生態指標：${finalEco}/100</li>
        <li>😊 舒適指標：${finalComfort}/100</li>
        <li>💰 剩餘預算：$${state.prototype.stats.budget}</li>
    </ul>`;

    document.getElementById('feedback-content').innerHTML = feedback;

    // Animate Score
    setTimeout(() => {
        document.getElementById('final-score-text').textContent = totalScore + '%';
        const circle = document.getElementById('final-score-circle');
        const offset = 100 - totalScore;
        circle.style.strokeDasharray = `${totalScore}, 100`;
    }, 500);
}

function downloadCertificate() {
    showToast('正在列印證書...(模擬)', 'success');
}

// Utility
function showToast(msg, type = 'info') {
    const area = document.getElementById('notification-area');
    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    area.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInToast 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
