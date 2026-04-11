/**
 * Environmental Impact Simulator Logic
 * 
 * Core Components:
 * 1. State Manager: Handles resources (Population, Budget), Global Sea Level parameters.
 * 2. Grid System: 2D array representing the map. Each cell has Type (water, land), Height, and Building.
 * 3. Interaction Handler: Mouse events for placing buildings.
 * 4. Simulation Engine: Calculates flooding based on height < sea level.
 */

// --- Configuration ---
const CONFIG = {
    gridRows: 15, // matches css grid
    gridCols: 20, // matches css grid
    startBudget: 10000,
    startPopulation: 5000,
    costs: {
        residential: 500,
        commercial: 1000,
        seawall: 2000,
        wetland: 800,
        demolish: 100
    },
    popGain: {
        residential: 200,
        commercial: 50
    },
    income: {
        residential: 10,
        commercial: 50
    }
};

// --- State ---
let state = {
    budget: CONFIG.startBudget,
    population: CONFIG.startPopulation,
    seaLevel: 0,
    resilience: 100,
    currentTool: 'inspect', // inspect, residential, commercial, seawall, wetland, demolish
    grid: [], // 2D array of Tile Objects
    isSimulating: false
};

// --- Tile Class ---
class Tile {
    constructor(r, c, type, height) {
        this.r = r;
        this.c = c;
        this.type = type; // deep-water, water, sand, grass, forest, mountain
        this.baseHeight = height;
        this.building = null; // null, residential, commercial, seawall, wetland
        this.flooded = false;
        this.element = null; // DOM reference
    }

    get effectiveHeight() {
        if (this.building === 'seawall') return this.baseHeight + 3; // Seawalls add height protection
        return this.baseHeight;
    }

    render() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.className = 'tile';
            this.element.dataset.r = this.r;
            this.element.dataset.c = this.c;
            this.element.onclick = () => handleTileClick(this);
            this.element.onmouseenter = () => handleTileHover(this);
        }

        // Update Attributes
        this.element.dataset.type = this.type;
        if (this.building) {
            this.element.dataset.building = this.building;
        } else {
            delete this.element.dataset.building;
        }

        if (this.flooded) {
            this.element.classList.add('flooded');
        } else {
            this.element.classList.remove('flooded');
        }

        // Tooltip title
        let info = `${getTypeName(this.type)} (${this.baseHeight}m)`;
        if (this.building) info += ` | ${getBuildingName(this.building)}`;
        if (this.flooded) info += ` [淹沒]`;
        this.element.title = info;

        return this.element;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    setupUI();
    updateDashboard();
    log("歡迎來到模擬器！請觀察地形並建設城市。", "system");
});

function initGrid() {
    const gridEl = document.getElementById('simulation-grid');
    gridEl.innerHTML = '';
    state.grid = [];

    // Simple Terrain Generation (Perlin-ish or Gradient-ish)
    // Create a slope from left (high) to right (water)
    for (let r = 0; r < CONFIG.gridRows; r++) {
        let row = [];
        for (let c = 0; c < CONFIG.gridCols; c++) {
            // Generate height map: higher on left, lower on right, plus some noise
            let noise = Math.random() * 2 - 1;
            let slope = (1 - (c / CONFIG.gridCols)) * 10; // 10m to 0m
            let height = Math.floor(Math.max(-2, slope + noise));

            // Determine type based on height
            let type = 'grass';
            if (height <= -2) type = 'deep-water';
            else if (height <= 0) type = 'water';
            else if (height <= 1) type = 'sand';
            else if (height <= 5) type = 'grass';
            else if (height <= 8) type = 'forest';
            else type = 'mountain';

            // Override some for visual variety
            if (type === 'grass' && Math.random() < 0.2) type = 'forest';
            if (type === 'deep-water' && Math.random() < 0.1) type = 'water';

            let tile = new Tile(r, c, type, height);
            row.push(tile);
            gridEl.appendChild(tile.render());
        }
        state.grid.push(row);
    }
}

function setupUI() {
    // Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentTool = btn.dataset.tool;
            log(`已選擇工具: ${getToolName(state.currentTool)}`);
        };
    });

    // Slider
    const slider = document.getElementById('sea-level-slider');
    const display = document.getElementById('slider-val');
    const seaDisplay = document.getElementById('sea-level-display');

    slider.oninput = (e) => {
        let val = parseFloat(e.target.value);
        display.textContent = `預測設定: +${val}m`;
        state.seaLevel = val;
        seaDisplay.textContent = `+${val}m`;

        // Real-time preview (optional, or wait for button)
        // clearFloods();
        // simulateFloods(); 
    };

    // Actions
    document.getElementById('sim-tide').onclick = () => runSimulation('tide');
    document.getElementById('sim-storm').onclick = () => runSimulation('storm');

    // Modal
    document.getElementById('close-modal').onclick = () => {
        document.getElementById('result-modal').classList.remove('visible');
        document.getElementById('result-modal').classList.add('hidden');
    };

    // View Toggles
    document.getElementById('toggle-risk').onclick = () => {
        // Toggle visual mode (implementation skipped for brevity, focused on mechanics first)
        log("切換風險視圖功能尚未實裝");
    };
}

// --- Interaction ---
function handleTileClick(tile) {
    if (state.currentTool === 'inspect') {
        log(`位址 [${tile.r},${tile.c}] | 地形: ${getTypeName(tile.type)} | 高度: ${tile.baseHeight}m`);
        return;
    }

    const cost = CONFIG.costs[state.currentTool];

    if (state.currentTool === 'demolish') {
        if (!tile.building) {
            log("這裡沒有建築物可以拆除。", "alert");
            return;
        }
        tile.building = null;
        state.budget -= cost;
        tile.render();
        updateDashboard();
        log("已拆除建築物。");
        return;
    }

    // Building logic
    if (state.budget < cost) {
        log("資金不足！", "alert");
        return;
    }

    // Rules: Can't build on water unless it's specific reclamation (simpler rule: only non-water or shallow water for seawall)
    const isWater = ['deep-water', 'water'].includes(tile.type);

    if (state.currentTool === 'seawall') {
        // Seawalls can be built on land or shallow water
        if (tile.type === 'deep-water') {
            log("無法在深海建設防波堤。", "alert");
            return;
        }
    } else {
        // Regular buildings need land
        if (isWater) {
            log("必須在陸地上建設。", "alert");
            return;
        }
    }

    if (tile.building) {
        log("這裡已經有建築物了。", "alert");
        return;
    }

    // Execute Build
    tile.building = state.currentTool;
    state.budget -= cost;

    // Immediate effects
    if (state.currentTool === 'residential') state.population += CONFIG.popGain.residential;
    if (state.currentTool === 'commercial') state.population += CONFIG.popGain.commercial;

    tile.render();
    updateDashboard();
    log(`建造了 ${getBuildingName(state.currentTool)} (-$${cost})`);
}

function handleTileHover(tile) {
    // Optional highlight logic
}

// --- Simulation Logic ---

function runSimulation(type) {
    log(`開始模擬: ${type === 'tide' ? '大潮' : '風暴潮'}...`, "system");

    // Reset floods
    state.grid.flat().forEach(t => {
        t.flooded = false;
        t.render();
    });

    // Determine water level
    // Base Sea Level (from slider) + Tide/Surge bonus
    let surge = type === 'tide' ? 0.5 : 2.5;
    let currentWaterLevel = state.seaLevel + surge;

    // Flood Fill Algorithm
    // Start from all 'deep-water' or 'water' tiles on the edges
    let queue = [];
    state.grid.flat().forEach(t => {
        if (['deep-water', 'water'].includes(t.type)) {
            // These are sources of water.
            // Check if they are actually water sources (height usually < 0)
            if (t.baseHeight <= 0) {
                queue.push(t);
                t.flooded = true; // By definition, ocean is wet
            }
        }
    });

    // BFS
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (queue.length > 0) {
        let curr = queue.shift();

        for (let d of directions) {
            let nr = curr.r + d[0];
            let nc = curr.c + d[1];

            if (nr >= 0 && nr < CONFIG.gridRows && nc >= 0 && nc < CONFIG.gridCols) {
                let neighbor = state.grid[nr][nc];

                if (!neighbor.flooded) {
                    // Check if water flows to neighbor
                    // Logic: If neighbor height is less than current water level, it floods
                    // AND there is a path (usually implicit if adjacent is flooded and water level represents absolute height)

                    // Defense check: Seawall logic is handled in 'effectiveHeight'
                    // If neighbor effective height < currentWaterLevel, it floods

                    if (neighbor.effectiveHeight < currentWaterLevel) {
                        neighbor.flooded = true;
                        neighbor.render();
                        queue.push(neighbor);
                    }
                }
            }
        }
    }

    // Calculate Damage
    calculateDamage(currentWaterLevel);
}

function calculateDamage(waterLevel) {
    let floodedBuildings = 0;
    let floodedPop = 0;
    let economicLoss = 0;

    state.grid.flat().forEach(t => {
        if (t.flooded && t.building) {
            floodedBuildings++;
            if (t.building !== 'seawall') { // Seawalls are designed to be wet, but if they are flooded (overtopped), they don't count as 'damaged' in the same way, or maybe they do? Let's say built infrastructure gets damaged.
                // Assuming flooded means water is ABOVE the building foundation
                if (['residential', 'commercial'].includes(t.building)) {
                    economicLoss += 2000; // Repair cost
                    floodedPop += (t.building === 'residential' ? 200 : 50);
                }
            }
            if (t.building === 'wetland') {
                // Wetlands absorb water, they are fine actually. Bonus?
                economicLoss -= 100; // They mitigate damage elsewhere (abstracted)
            }
        }
    });

    let resultHtml = `
        <p><strong>模擬水位:</strong> +${waterLevel.toFixed(1)}m</p>
        <p><strong>受災建築:</strong> ${floodedBuildings} 棟</p>
        <p><strong>受影響人口:</strong> ${floodedPop} 人</p>
        <p><strong>預估經濟損失:</strong> <span class="text-warning">$${economicLoss}</span></p>
    `;

    if (floodedPop > 1000) {
        resultHtml += `<p class="text-danger"><strong>警告:</strong> 重大災害！城市韌性不足。</p>`;
    } else if (floodedPop === 0 && floodedBuildings === 0) {
        resultHtml += `<p style="color:var(--color-success)"><strong>結果:</strong> 防禦成功！沒有災情。</p>`;
    }

    showModal("模擬報告", resultHtml);
    log(`模擬結束。受災人口: ${floodedPop}，損失: $${economicLoss}`);
}


// --- Helpers ---

function updateDashboard() {
    document.getElementById('population-display').textContent = state.population.toLocaleString();
    document.getElementById('budget-display').textContent = '$' + state.budget.toLocaleString();
    // Resilience calculation can be complex, for now simplified
    // e.g. Ratio of Wetlands/Seawalls to Total Buildings
    let totalBuildings = 0;
    let defenseBuildings = 0;
    state.grid.flat().forEach(t => {
        if (t.building) {
            totalBuildings++;
            if (['seawall', 'wetland'].includes(t.building)) defenseBuildings++;
        }
    });
    let res = totalBuildings === 0 ? 0 : Math.round((defenseBuildings / totalBuildings) * 100);
    document.getElementById('resilience-display').textContent = res + '%';
}

function log(msg, type = 'info') {
    const logEl = document.getElementById('event-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const time = new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerHTML = `<span class="time">[${time}]</span> <span class="content">${msg}</span>`;

    logEl.prepend(entry);
}

function showModal(title, body) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('result-modal').classList.remove('hidden');
    document.getElementById('result-modal').classList.add('visible');
}

function getTypeName(t) {
    const map = {
        'deep-water': '深海', 'water': '淺海', 'sand': '沙灘',
        'grass': '平原', 'forest': '森林', 'mountain': '高地'
    };
    return map[t] || t;
}

function getBuildingName(b) {
    const map = {
        'residential': '住宅區', 'commercial': '商業區',
        'seawall': '防波堤', 'wetland': '人工濕地'
    };
    return map[b] || b;
}

function getToolName(t) {
    if (t === 'inspect') return '觀察模式';
    if (t === 'demolish') return '拆除模式';
    return getBuildingName(t);
}
