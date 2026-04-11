/* ===================================
   Ch01 細胞的構造與功能 - 互動教學平台
   JavaScript 核心邏輯
   =================================== */

// ===== 全域狀態 =====
const APP = {
    currentSection: 0,
    completedTopics: new Set(),
    quizAnswers: {},
    quizHistory: [],
    learningLog: [],
    matchState: { left: null, right: null, matched: new Set() },
};

// ===== 測驗題庫 =====
const QUIZ_DATA = [
    // 1-1 細胞的構造
    {
        id: 'q1', section: '1-1',
        question: '下列何者與細胞學說的內容無關？',
        options: [
            'A. 生物體都是由細胞所構成',
            'B. 細胞是生物體構造和功能的基本單位',
            'C. 細胞皆由已存在的細胞分裂所產生',
            'D. 細胞分裂時染色體會平均分配給子細胞'
        ],
        answer: 3,
        explanation: '細胞學說三大要點為：(1) 生物體皆由細胞構成 (2) 細胞是構造和功能的基本單位 (3) 細胞來自已存在的細胞。染色體分配屬於細胞分裂的內容，不屬於細胞學說。'
    },
    {
        id: 'q2', section: '1-1',
        question: '大腸桿菌與水稻細胞共同具有的構造為？',
        options: ['A. 核仁', 'B. 核糖體', 'C. 粒線體', 'D. 內質網'],
        answer: 1,
        explanation: '大腸桿菌為原核生物，不具核仁、粒線體、內質網等膜狀胞器，但具有核糖體。水稻為真核生物也有核糖體，因此核糖體是兩者共有的構造。'
    },
    {
        id: 'q3', section: '1-1',
        question: '關於虎克（Robert Hooke），以下敘述何者正確？',
        options: [
            'A. 他發現了細胞核',
            'B. 他觀察軟木切片並命名了「細胞」',
            'C. 他提出「細胞來自已存在的細胞」',
            'D. 他發明了第一臺顯微鏡'
        ],
        answer: 1,
        explanation: '虎克於 1665 年用複式顯微鏡觀察軟木切片，看到蜂窩狀小空格，將其命名為細胞（Cell）。發現細胞核的是布朗，提出「細胞來自細胞」的是魏修。'
    },
    {
        id: 'q4', section: '1-1',
        question: '下列哪一個胞器被稱為「細胞發電廠」？',
        options: ['A. 葉綠體', 'B. 核糖體', 'C. 粒線體', 'D. 高基氏體'],
        answer: 2,
        explanation: '粒線體是進行呼吸作用的主要場所，能將有機物中的能量轉換成 ATP，故有「細胞發電廠」之稱。'
    },
    {
        id: 'q5', section: '1-1',
        question: '以下何者是植物細胞有但動物細胞沒有的構造？',
        options: ['A. 粒線體', 'B. 中心粒', 'C. 葉綠體', 'D. 核糖體'],
        answer: 2,
        explanation: '葉綠體是植物細胞特有的胞器，用於進行光合作用。中心粒則是動物細胞有但植物細胞通常沒有的構造。粒線體和核糖體兩者都有。'
    },
    {
        id: 'q6', section: '1-1',
        question: '細胞膜的主要功能為何？',
        options: [
            'A. 合成蛋白質',
            'B. 進行光合作用',
            'C. 區隔細胞內外環境並控制物質出入',
            'D. 儲存遺傳物質'
        ],
        answer: 2,
        explanation: '細胞膜由磷脂質、蛋白質和醣類組成，主要功能是區隔細胞內外環境，並選擇性地讓物質進出細胞。'
    },
    {
        id: 'q7', section: '1-1',
        question: '原核細胞與真核細胞最主要的差異是？',
        options: [
            'A. 有無細胞膜',
            'B. 有無核膜包圍的細胞核',
            'C. 有無 DNA',
            'D. 有無細胞壁'
        ],
        answer: 1,
        explanation: '最主要差異在於原核細胞沒有核膜包圍的細胞核，DNA 散佈於細胞質中；真核細胞則有核膜包圍形成的細胞核。兩者都有細胞膜和 DNA。'
    },
    // 1-2 細胞及能量
    {
        id: 'q8', section: '1-2',
        question: '關於 ATP，下列敘述何者正確？',
        options: [
            'A. ATP 是由腺嘌呤、葡萄糖和三個磷酸基組成',
            'B. ATP 是細胞所需能量的直接來源',
            'C. ATP 水解後產生 AMP 和兩個磷酸基',
            'D. ATP 只能由光合作用產生'
        ],
        answer: 1,
        explanation: 'ATP 是細胞所需能量的直接來源，也是細胞內通用的能量貨幣。ATP 由腺嘌呤、核糖和三個磷酸基組成，水解後產生 ADP 和一個磷酸根（Pi）。'
    },
    {
        id: 'q9', section: '1-2',
        question: '有關光合作用，下列何者有誤？',
        options: [
            'A. 光合作用在葉綠體中進行',
            'B. 光反應在類囊體膜上進行',
            'C. 固碳反應不需要任何能量',
            'D. 光合作用的產物包括醣類和氧'
        ],
        answer: 2,
        explanation: '固碳反應需要光反應產生的 ATP 和 NADPH 提供能量，才能將二氧化碳固定成醣類，因此固碳反應需要能量。'
    },
    {
        id: 'q10', section: '1-2',
        question: '發酵作用在粒線體中進行，此說法是否正確？',
        options: [
            'A. 正確',
            'B. 不正確，發酵作用僅在細胞質中進行',
            'C. 不正確，發酵作用在葉綠體中進行',
            'D. 正確，但只有酒精發酵在粒線體'
        ],
        answer: 1,
        explanation: '發酵作用不需氧氣參與，整個過程僅在細胞質中進行。丙酮酸不會進入粒線體，而是留在細胞質中轉變為酒精或乳酸。'
    },
    {
        id: 'q11', section: '1-2',
        question: '下列何者不是異化代謝的特徵？',
        options: [
            'A. 將複雜分子分解成簡單分子',
            'B. 通常釋出能量',
            'C. 將簡單分子合成為複雜分子',
            'D. 呼吸作用屬於異化代謝'
        ],
        answer: 2,
        explanation: '將簡單分子合成為複雜分子是同化代謝的特徵，通常需要消耗能量。異化代謝是將複雜分子分解成簡單分子，通常會釋出能量。'
    },
    {
        id: 'q12', section: '1-2',
        question: '有氧呼吸與發酵作用相比，有氧呼吸的 ATP 產量如何？',
        options: ['A. 較少', 'B. 相同', 'C. 較多', 'D. 不產生 ATP'],
        answer: 2,
        explanation: '有氧呼吸因為丙酮酸會進入粒線體進一步分解，能產生多量 ATP；發酵作用僅在細胞質中進行，只產生少量 ATP。'
    },
    {
        id: 'q13', section: '1-2',
        question: '植物的葉肉細胞同時進行光合作用和呼吸作用，此說法是否正確？',
        options: [
            'A. 不正確，細胞只能進行其中一種',
            'B. 正確，有些植物細胞可同時進行兩者',
            'C. 不正確，光合作用和呼吸作用不會在同一細胞發生',
            'D. 只有在黑暗中才同時進行'
        ],
        answer: 1,
        explanation: '植物的葉肉細胞同時具有葉綠體和粒線體，因此可以同時進行光合作用和呼吸作用。白天光合作用速率通常大於呼吸作用。'
    },
    // 1-3 細胞週期與分裂
    {
        id: 'q14', section: '1-3',
        question: '細胞週期中，間期約占總時間的多少？',
        options: ['A. 10%', 'B. 50%', 'C. 75%', 'D. 90%'],
        answer: 3,
        explanation: '間期是細胞的生長期，細胞在此期間製造酵素、蛋白質、進行染色質複製等準備工作，約占細胞週期時間的 90%。'
    },
    {
        id: 'q15', section: '1-3',
        question: '有絲分裂最終產生幾個子細胞？',
        options: ['A. 1 個', 'B. 2 個', 'C. 4 個', 'D. 8 個'],
        answer: 1,
        explanation: '有絲分裂經過一次分裂，將複製好的染色體平均分配，最終產生 2 個與母細胞幾乎完全相同的子細胞。'
    },
    {
        id: 'q16', section: '1-3',
        question: '減數分裂的結果，子細胞染色體數目會如何變化？',
        options: ['A. 2n → 2n', 'B. 2n → n', 'C. n → 2n', 'D. n → n'],
        answer: 1,
        explanation: '減數分裂發生在生殖母細胞，經連續兩次分裂後，子細胞的染色體數目從二倍數 (2n) 減半為單倍數 (n)。'
    },
    {
        id: 'q17', section: '1-3',
        question: '人類體細胞有幾條染色體？',
        options: ['A. 23 條', 'B. 44 條', 'C. 46 條', 'D. 92 條'],
        answer: 2,
        explanation: '人類體細胞有 46 條染色體（23 對同源染色體），其染色體倍數為 2n = 46。生殖細胞則只有 23 條（n = 23）。'
    },
    {
        id: 'q18', section: '1-3',
        question: '「聯會」現象發生在哪個過程中？',
        options: ['A. 有絲分裂', 'B. 減數分裂 I', 'C. 減數分裂 II', 'D. 間期'],
        answer: 1,
        explanation: '聯會是減數分裂 I 特有的現象，兩條同源的二分體並排配對形成四分體。有絲分裂不會發生聯會。'
    },
    {
        id: 'q19', section: '1-3',
        question: '關於動、植物細胞分裂的差異，下列何者正確？',
        options: [
            'A. 動物細胞形成細胞板',
            'B. 植物細胞形成分裂溝',
            'C. 動物細胞有中心粒，植物一般沒有',
            'D. 兩者沒有差異'
        ],
        answer: 2,
        explanation: '動物細胞有中心粒，分裂時形成分裂溝；植物細胞通常無中心粒，分裂時形成細胞板生長為新的細胞膜和細胞壁。'
    },
    {
        id: 'q20', section: '1-3',
        question: '人類卵原細胞經減數分裂後產生幾個卵細胞？',
        options: ['A. 1 個', 'B. 2 個', 'C. 3 個', 'D. 4 個'],
        answer: 0,
        explanation: '卵原細胞經減數分裂，會產生 1 個次級卵母細胞和 1 個極體（減數 I），再經減數 II 後只產生 1 個卵細胞和極體。精原細胞則能產生 4 個精子。'
    }
];

// ===== AI 知識庫 =====
const AI_KNOWLEDGE = {
    '細胞學說': `📜 **細胞學說**是生物學的重要基礎理論，其建立歷程如下：

🔬 **發展歷程：**
- 1665 年，**虎克**觀察軟木切片，發現並命名「細胞」
- 1831 年，**布朗**發現細胞核
- 1838 年，**許來登**提出植物由細胞構成
- 1839 年，**許旺**擴展至動植物
- 1855 年，**魏修**提出「細胞來自已存在的細胞」

📌 **三大要點：**
1. 生物體皆由細胞所構成
2. 細胞是構造和功能的基本單位
3. 細胞由已存在的細胞分裂而來

💡 **重要意義：**闡明生物體構造的一致性，暗示生物具有共同起源。`,

    '原核': `⚖️ **原核細胞 vs 真核細胞：**

🦠 **原核細胞** (如大腸桿菌、藍綠菌)：
- ❌ 無核膜包圍的細胞核
- DNA 散佈於細胞質中
- ❌ 不含膜狀胞器
- ✅ 有核糖體、細胞膜、多數有細胞壁
- 大小：1～10 μm

🧫 **真核細胞** (如動物、植物)：
- ✅ 有核膜包圍的細胞核
- DNA 位於細胞核內
- ✅ 含膜狀胞器（粒線體、內質網等）
- ✅ 有核糖體
- 大小：10～100 μm

兩者最關鍵的差異在於**有無核膜**形成的細胞核！`,

    'ATP': `⚡ **ATP（腺苷三磷酸）— 細胞的能量貨幣**

🔧 **結構：**
腺嘌呤 + 核糖 + P~P~P（三個磷酸基）

🔄 **能量轉換：**
- ATP → ADP + Pi + **能量**（水解釋能）
- ADP + Pi + 能量 → ATP（合成儲能）

💰 **為什麼叫能量貨幣？**
- 葡萄糖無法直接供應細胞使用
- 必須先透過呼吸作用將能量轉移至 ATP
- ATP 再水解提供各種生理反應所需能量
- ATP 就像通用貨幣，可以「花」在各種地方

🎯 **用途：**物質合成、物質運輸、肌肉收縮、鞭毛運動等。`,

    '光合作用': `☀️ **光合作用**

📝 **簡式：** H₂O + CO₂ →（光能）→ 醣類 + O₂

光合作用分為**兩個階段**：

🌅 **光反應**（類囊體膜上）：
- 葉綠素吸收光能
- 分解水產生 O₂
- 能量轉移至 ATP 和 NADPH
- 本質：光能 → 化學能

🌿 **固碳反應**（葉綠體基質）：
- 利用光反應的 ATP + NADPH
- 固定 CO₂
- 合成醣類

⚠️ **注意：**固碳反應以前叫「暗反應」，但其實某些酵素需要光刺激才有活性，所以不適合稱為暗反應。

🌡️ **影響因素：**光照強度、溫度、CO₂濃度、水`,

    '呼吸': `🔥 **呼吸作用**

🫁 **有氧呼吸：**
葡萄糖 + O₂ → CO₂ + H₂O + **多量 ATP**
- 步驟1：細胞質中，葡萄糖 → 丙酮酸（少量 ATP）
- 步驟2：粒線體中，丙酮酸 → CO₂ + H₂O（多量 ATP）

🍺 **發酵作用（不需氧）：**
- **酒精發酵：**葡萄糖 → 酒精 + CO₂ + 少量 ATP
  （酵母菌、植物細胞）
- **乳酸發酵：**葡萄糖 → 乳酸 + 少量 ATP
  （乳酸菌、肌肉細胞）

⚠️ 發酵時丙酮酸**不進入粒線體**，只在細胞質中反應，所以 ATP 產量遠少於有氧呼吸。`,

    '分裂': `🔄 **有絲分裂 vs 減數分裂**

🔬 **有絲分裂：**
- 發生於：體細胞
- 複製 1 次、分裂 1 次
- 產生 **2 個**子細胞
- 染色體：2n → 2n（不改變）
- 作用：生長、修復

➗ **減數分裂：**
- 發生於：生殖母細胞
- 複製 1 次、分裂 **2 次**
- 產生 **4 個**子細胞
- 染色體：2n → **n**（減半）
- 特有現象：**聯會**（同源染色體配對形成四分體）
- 作用：產生配子

🔑 **減數分裂 I：**同源染色體分離
🔑 **減數分裂 II：**姊妹染色分體分離

👶 **配子形成：**
- 精原細胞 → 4 個精子
- 卵原細胞 → **1 個**卵細胞 + 極體`
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    initNavigation();
    initSubTabs();
    initAccordion();
    initRevealButtons();
    initOrganelleInteraction();
    initMatchingGame();
    initQuiz();
    initAIAssistant();
    initScrollEffects();
    initHeroParticles();
    updateProgressDisplay();
    updateChecklist();
    updateCardProgress();
});

// ===== 導覽系統 =====
function initNavigation() {
    // 上方導覽
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(parseInt(btn.dataset.section)));
    });

    // 行動裝置選單
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileClose = document.getElementById('mobile-close');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileOverlay.classList.add('show');
            mobileSidebar.classList.add('show');
        });
    }

    [mobileOverlay, mobileClose].forEach(el => {
        if (el) el.addEventListener('click', () => {
            mobileOverlay.classList.remove('show');
            mobileSidebar.classList.remove('show');
        });
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(parseInt(btn.dataset.section));
            mobileOverlay.classList.remove('show');
            mobileSidebar.classList.remove('show');
        });
    });

    // 概念圖與卡片導覽
    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', () => switchSection(parseInt(el.dataset.goto)));
    });

    // 前後導覽按鈕
    document.querySelectorAll('[data-goto-section]').forEach(btn => {
        btn.addEventListener('click', () => switchSection(parseInt(btn.dataset.gotoSection)));
    });

    // 開始學習按鈕
    const startBtn = document.getElementById('start-learning-btn');
    if (startBtn) startBtn.addEventListener('click', () => switchSection(1));

    // Logo 回首頁
    const logo = document.getElementById('logo-btn');
    if (logo) logo.addEventListener('click', () => switchSection(0));

    // 完成閱讀按鈕
    document.querySelectorAll('.read-complete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.dataset.topic;
            if (!APP.completedTopics.has(topic)) {
                APP.completedTopics.add(topic);
                btn.classList.add('completed');
                btn.textContent = '✅ 已完成';
                addLearningLog(topic);
                saveProgress();
                updateProgressDisplay();
                updateChecklist();
                updateCardProgress();
            }
        });
    });
}

function switchSection(idx) {
    APP.currentSection = idx;
    // 更新活動區域
    document.querySelectorAll('.content-section').forEach((sec, i) => {
        sec.classList.toggle('active', i === idx);
    });
    // 更新導覽按鈕
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.section) === idx);
    });
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.section) === idx);
    });
    // 捲動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 更新測驗或學習軌跡
    if (idx === 4) renderQuiz();
    if (idx === 5) {
        updateProgressDisplay();
        updateChecklist();
        renderLearningLog();
        renderQuizHistory();
    }
}

// ===== 子分頁標籤 =====
function initSubTabs() {
    document.querySelectorAll('.sub-tabs').forEach(tabGroup => {
        tabGroup.querySelectorAll('.sub-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const id = tab.dataset.subtab;
                // 更新活動標籤
                tabGroup.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // 更新內容
                const section = tabGroup.closest('.content-section');
                section.querySelectorAll('.sub-content').forEach(sc => sc.classList.remove('active'));
                const target = document.getElementById('subtab-' + id);
                if (target) target.classList.add('active');
            });
        });
    });
}

// ===== 手風琴 =====
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('open');
        });
    });
}

// ===== 顯示/隱藏提示 =====
function initRevealButtons() {
    document.querySelectorAll('.reveal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.reveal;
            const content = document.getElementById(targetId);
            if (content) {
                content.classList.toggle('show');
                btn.textContent = content.classList.contains('show') ? '隱藏提示' : '顯示提示';
            }
        });
    });
}

// ===== 胞器互動 =====
function initOrganelleInteraction() {
    const infoTitle = document.getElementById('org-info-title');
    const infoDesc = document.getElementById('org-info-desc');

    document.querySelectorAll('.organelle').forEach(org => {
        org.addEventListener('click', () => {
            document.querySelectorAll('.organelle').forEach(o => o.classList.remove('active-org'));
            org.classList.add('active-org');
            if (infoTitle) infoTitle.textContent = org.dataset.name;
            if (infoDesc) infoDesc.textContent = org.dataset.info;
        });
    });

    // 切換顯示模式
    const showAll = document.getElementById('show-all-org');
    const showPlant = document.getElementById('show-plant-org');
    const showAnimal = document.getElementById('show-animal-org');

    function setFilter(mode) {
        [showAll, showPlant, showAnimal].forEach(b => b && b.classList.remove('active'));
        document.querySelectorAll('.organelle').forEach(org => {
            org.classList.remove('hidden-org');
            if (mode === 'plant' && org.classList.contains('animal-only')) org.classList.add('hidden-org');
            if (mode === 'animal' && org.classList.contains('plant-only')) org.classList.add('hidden-org');
        });
    }

    if (showAll) showAll.addEventListener('click', () => { setFilter('all'); showAll.classList.add('active'); });
    if (showPlant) showPlant.addEventListener('click', () => { setFilter('plant'); showPlant.classList.add('active'); });
    if (showAnimal) showAnimal.addEventListener('click', () => { setFilter('animal'); showAnimal.classList.add('active'); });
}

// ===== 配對遊戲 =====
function initMatchingGame() {
    const game = document.getElementById('matching-game-1');
    if (!game) return;

    const leftItems = game.querySelectorAll('.match-left .match-item');
    const rightItems = game.querySelectorAll('.match-right .match-item');
    const resultEl = document.getElementById('match-result-1');
    let selectedLeft = null;
    let matchedCount = 0;

    leftItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('matched')) return;
            leftItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedLeft = item;
            checkMatch();
        });
    });

    rightItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('matched')) return;
            rightItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            checkMatch();
        });
    });

    function checkMatch() {
        const selectedRight = game.querySelector('.match-right .match-item.selected');
        if (!selectedLeft || !selectedRight) return;

        if (selectedLeft.dataset.match === selectedRight.dataset.match) {
            selectedLeft.classList.remove('selected');
            selectedRight.classList.remove('selected');
            selectedLeft.classList.add('matched');
            selectedRight.classList.add('matched');
            matchedCount++;
            selectedLeft = null;
            if (matchedCount === leftItems.length) {
                resultEl.textContent = '🎉 全部配對完成！太棒了！';
                resultEl.style.color = '#10b981';
            }
        } else {
            selectedLeft.classList.add('wrong');
            selectedRight.classList.add('wrong');
            setTimeout(() => {
                selectedLeft.classList.remove('wrong', 'selected');
                selectedRight.classList.remove('wrong', 'selected');
                selectedLeft = null;
            }, 600);
        }
    }
}

// ===== 自我測驗 =====
function initQuiz() {
    const filterSelect = document.getElementById('quiz-filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', renderQuiz);
    }
    const retryBtn = document.getElementById('retry-quiz-btn');
    if (retryBtn) retryBtn.addEventListener('click', retryQuiz);
}

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    const filterSelect = document.getElementById('quiz-filter-select');
    const resultPanel = document.getElementById('quiz-result-panel');
    if (!container) return;

    resultPanel.style.display = 'none';
    const filter = filterSelect ? filterSelect.value : 'all';
    const questions = filter === 'all' ? QUIZ_DATA : QUIZ_DATA.filter(q => q.section === filter);

    container.innerHTML = '';
    APP.quizAnswers = {};

    questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.id = 'quiz-card-' + q.id;

        const optionsHTML = q.options.map((opt, oi) =>
            `<button class="quiz-option" data-qid="${q.id}" data-oidx="${oi}">${opt}</button>`
        ).join('');

        card.innerHTML = `
            <div class="quiz-question-num">第 ${idx + 1} 題 ／ 範圍：${q.section}</div>
            <div class="quiz-question">${q.question}</div>
            <div class="quiz-options">${optionsHTML}</div>
            <div class="quiz-explanation" id="exp-${q.id}">💡 ${q.explanation}</div>
        `;
        container.appendChild(card);
    });

    // 更新分數
    updateQuizScore(questions);

    // 綁定選項事件
    container.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => handleQuizAnswer(opt, questions));
    });
}

function handleQuizAnswer(opt, questions) {
    const qid = opt.dataset.qid;
    const oidx = parseInt(opt.dataset.oidx);
    if (APP.quizAnswers[qid] !== undefined) return; // 已作答

    const q = QUIZ_DATA.find(x => x.id === qid);
    APP.quizAnswers[qid] = oidx;
    const isCorrect = oidx === q.answer;

    const card = document.getElementById('quiz-card-' + qid);
    card.querySelectorAll('.quiz-option').forEach((o, i) => {
        o.classList.add('disabled');
        if (i === q.answer) o.classList.add('show-correct');
        if (i === oidx && !isCorrect) o.classList.add('selected-wrong');
        if (i === oidx && isCorrect) o.classList.add('selected-correct');
    });

    card.classList.add(isCorrect ? 'correct-card' : 'wrong-card');
    const expEl = document.getElementById('exp-' + qid);
    if (expEl) expEl.classList.add('show');

    updateQuizScore(questions);

    // 所有題目作答完成
    if (Object.keys(APP.quizAnswers).length === questions.length) {
        showQuizResult(questions);
    }
}

function updateQuizScore(questions) {
    const correctEl = document.getElementById('quiz-correct');
    const totalEl = document.getElementById('quiz-total');
    const fillEl = document.getElementById('quiz-score-fill');

    let correct = 0;
    questions.forEach(q => {
        if (APP.quizAnswers[q.id] === q.answer) correct++;
    });

    const answered = Object.keys(APP.quizAnswers).length;
    if (correctEl) correctEl.textContent = correct;
    if (totalEl) totalEl.textContent = answered;
    if (fillEl) fillEl.style.width = (answered > 0 ? (correct / questions.length * 100) : 0) + '%';
}

function showQuizResult(questions) {
    const panel = document.getElementById('quiz-result-panel');
    const scoreEl = document.getElementById('result-score');
    const feedbackEl = document.getElementById('result-feedback');

    let correct = 0;
    questions.forEach(q => {
        if (APP.quizAnswers[q.id] === q.answer) correct++;
    });

    const pct = Math.round((correct / questions.length) * 100);
    scoreEl.textContent = `${correct} / ${questions.length}（${pct}%）`;

    let feedback = '';
    if (pct >= 90) feedback = '🏆 太棒了！你對本章內容掌握得非常好！';
    else if (pct >= 70) feedback = '👍 不錯！再複習一些重點就能更完美！';
    else if (pct >= 50) feedback = '💪 繼續加油！建議重新閱讀較弱的章節。';
    else feedback = '📖 建議從頭複習本章內容，加油！';
    feedbackEl.textContent = feedback;

    panel.style.display = 'block';

    // 記錄測驗歷史
    const record = {
        time: new Date().toISOString(),
        total: questions.length,
        correct: correct,
        pct: pct
    };
    APP.quizHistory.push(record);
    saveProgress();
}

function retryQuiz() {
    APP.quizAnswers = {};
    renderQuiz();
}

// ===== 學習進度 =====
const TOPIC_NAMES = {
    '1-1': '細胞學說',
    '1-2': '形態與功能',
    '1-3': '原核vs真核',
    '1-4': '真核細胞構造',
    '1-5': '細胞膜・核・質',
    '2-1': '代謝與ATP',
    '2-2': '光合作用',
    '2-3': '呼吸與發酵',
    '3-1': '染色體',
    '3-2': '細胞週期與有絲分裂',
    '3-3': '減數分裂',
    '3-4': '配子與受精卵',
};

function addLearningLog(topic) {
    APP.learningLog.push({
        topic: topic,
        name: TOPIC_NAMES[topic] || topic,
        time: new Date().toISOString()
    });
}

function updateProgressDisplay() {
    const total = Object.keys(TOPIC_NAMES).length;
    const completed = APP.completedTopics.size;
    const pct = Math.round((completed / total) * 100);

    // 更新進度條
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = pct + '%';

    // 更新 Hero 顯示
    const overallDisplay = document.getElementById('overall-progress-display');
    if (overallDisplay) overallDisplay.textContent = pct + '%';

    // 更新圓形進度
    const ring = document.getElementById('progress-ring');
    const text = document.getElementById('progress-text');
    if (ring) {
        const circumference = 2 * Math.PI * 54; // r=54
        ring.style.strokeDashoffset = circumference - (pct / 100 * circumference);
        ring.style.stroke = pct > 0 ? '#6366f1' : 'rgba(99,102,241,0.1)';
    }
    if (text) text.textContent = pct + '%';

    // 更新已完成按鈕外觀
    document.querySelectorAll('.read-complete-btn').forEach(btn => {
        const topic = btn.dataset.topic;
        if (APP.completedTopics.has(topic)) {
            btn.classList.add('completed');
            btn.textContent = '✅ 已完成';
        }
    });
}

function updateCardProgress() {
    const sec1Topics = ['1-1', '1-2', '1-3', '1-4', '1-5'];
    const sec2Topics = ['2-1', '2-2', '2-3'];
    const sec3Topics = ['3-1', '3-2', '3-3', '3-4'];

    function calcPct(topics) {
        const done = topics.filter(t => APP.completedTopics.has(t)).length;
        return (done / topics.length * 100);
    }

    const fill1 = document.getElementById('card-progress-1');
    const fill2 = document.getElementById('card-progress-2');
    const fill3 = document.getElementById('card-progress-3');
    if (fill1) fill1.style.width = calcPct(sec1Topics) + '%';
    if (fill2) fill2.style.width = calcPct(sec2Topics) + '%';
    if (fill3) fill3.style.width = calcPct(sec3Topics) + '%';
}

function updateChecklist() {
    const grid = document.getElementById('checklist-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(TOPIC_NAMES).forEach(([key, name]) => {
        const done = APP.completedTopics.has(key);
        const el = document.createElement('div');
        el.className = 'checklist-item' + (done ? ' completed' : '');
        el.innerHTML = `<span class="checklist-icon">${done ? '✅' : '⬜'}</span><span>${key} ${name}</span>`;
        grid.appendChild(el);
    });
}

function renderLearningLog() {
    const container = document.getElementById('learning-log');
    if (!container) return;
    if (APP.learningLog.length === 0) {
        container.innerHTML = '<p class="log-empty">尚未有學習紀錄，開始閱讀並標記完成吧！</p>';
        return;
    }
    container.innerHTML = APP.learningLog.map(log => {
        const d = new Date(log.time);
        const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        return `<div class="log-entry"><span class="log-entry-topic">✅ ${log.name}</span><span class="log-entry-time">${timeStr}</span></div>`;
    }).join('');
}

function renderQuizHistory() {
    const container = document.getElementById('quiz-history');
    if (!container) return;
    if (APP.quizHistory.length === 0) {
        container.innerHTML = '<p class="log-empty">尚未有測驗紀錄。</p>';
        return;
    }
    container.innerHTML = APP.quizHistory.map((rec, i) => {
        const d = new Date(rec.time);
        const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        return `<div class="log-entry"><span class="log-entry-topic">第 ${i + 1} 次：${rec.correct}/${rec.total}（${rec.pct}%）</span><span class="log-entry-time">${timeStr}</span></div>`;
    }).join('');
}

// ===== 資料持久化 =====
function saveProgress() {
    const data = {
        completedTopics: Array.from(APP.completedTopics),
        quizHistory: APP.quizHistory,
        learningLog: APP.learningLog,
    };
    try {
        localStorage.setItem('biology_ch01_progress', JSON.stringify(data));
    } catch (e) { /* 無 localStorage 時忽略 */ }
}

function loadProgress() {
    try {
        const raw = localStorage.getItem('biology_ch01_progress');
        if (raw) {
            const data = JSON.parse(raw);
            APP.completedTopics = new Set(data.completedTopics || []);
            APP.quizHistory = data.quizHistory || [];
            APP.learningLog = data.learningLog || [];
        }
    } catch (e) { /* 忽略 */ }
}

// 匯出、重置按鈕
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-progress-btn');
    const resetBtn = document.getElementById('reset-progress-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                completedTopics: Array.from(APP.completedTopics),
                quizHistory: APP.quizHistory,
                learningLog: APP.learningLog,
                exportTime: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'biology_ch01_progress.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('確定要重置所有學習進度嗎？此操作無法復原！')) {
                APP.completedTopics = new Set();
                APP.quizHistory = [];
                APP.learningLog = [];
                APP.quizAnswers = {};
                localStorage.removeItem('biology_ch01_progress');
                updateProgressDisplay();
                updateChecklist();
                updateCardProgress();
                renderLearningLog();
                renderQuizHistory();
                // 重置完成按鈕
                document.querySelectorAll('.read-complete-btn').forEach(btn => {
                    btn.classList.remove('completed');
                    btn.textContent = '✅ 我已讀完本節';
                });
                alert('已重置所有進度！');
            }
        });
    }
});

// ===== AI 助理 =====
function initAIAssistant() {
    const panel = document.getElementById('ai-panel');
    const toggleBtn = document.getElementById('ai-toggle-btn');
    const closeBtn = document.getElementById('ai-close-btn');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');

    if (toggleBtn) toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    if (sendBtn) sendBtn.addEventListener('click', sendAIMessage);
    if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') sendAIMessage(); });

    // 快速問題按鈕
    document.querySelectorAll('.quick-q').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = btn.dataset.question;
            sendAIMessage();
        });
    });
}

function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('ai-chat-messages');
    const question = input.value.trim();
    if (!question) return;

    // 使用者訊息
    appendAIMessage('user', question);
    input.value = '';

    // 顯示打字動畫
    const typingEl = document.createElement('div');
    typingEl.className = 'ai-message ai-bot';
    typingEl.innerHTML = `<div class="ai-avatar">🤖</div><div class="ai-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;

    // 模擬回應延遲
    setTimeout(() => {
        typingEl.remove();
        const answer = generateAIResponse(question);
        appendAIMessage('bot', answer);
    }, 800 + Math.random() * 600);
}

function appendAIMessage(role, text) {
    const messages = document.getElementById('ai-chat-messages');
    const div = document.createElement('div');
    div.className = 'ai-message ' + (role === 'user' ? 'ai-user' : 'ai-bot');

    const avatar = role === 'user' ? '👤' : '🤖';
    // 將 markdown 粗體轉為 HTML
    const htmlText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    div.innerHTML = `<div class="ai-avatar">${avatar}</div><div class="ai-bubble"><p>${htmlText}</p></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function generateAIResponse(question) {
    const q = question.toLowerCase();

    // 搜尋知識庫
    for (const [key, value] of Object.entries(AI_KNOWLEDGE)) {
        if (q.includes(key.toLowerCase()) || q.includes(key)) {
            return value;
        }
    }

    // 關鍵字匹配
    if (q.includes('細胞學說') || q.includes('虎克') || q.includes('許來登') || q.includes('許旺') || q.includes('魏修')) {
        return AI_KNOWLEDGE['細胞學說'];
    }
    if (q.includes('原核') || q.includes('真核') || q.includes('大腸桿菌')) {
        return AI_KNOWLEDGE['原核'];
    }
    if (q.includes('atp') || q.includes('能量貨幣') || q.includes('腺苷三磷酸') || q.includes('能量')) {
        return AI_KNOWLEDGE['ATP'];
    }
    if (q.includes('光合') || q.includes('葉綠體') || q.includes('光反應') || q.includes('固碳')) {
        return AI_KNOWLEDGE['光合作用'];
    }
    if (q.includes('呼吸') || q.includes('發酵') || q.includes('粒線體') || q.includes('有氧')) {
        return AI_KNOWLEDGE['呼吸'];
    }
    if (q.includes('分裂') || q.includes('有絲') || q.includes('減數') || q.includes('染色體') || q.includes('配子') || q.includes('精子') || q.includes('卵')) {
        return AI_KNOWLEDGE['分裂'];
    }
    if (q.includes('細胞膜') || q.includes('磷脂質')) {
        return `🔵 **細胞膜**主要由**磷脂質**（雙層排列）、**蛋白質**（鑲嵌其中）和**醣類**（附著外側）組成。\n\n主要功能：\n- 區隔細胞內外環境\n- **選擇性**地控制物質進出\n- 蛋白質可接收化學刺激\n- 醣類與細胞辨識（自我vs外來）有關`;
    }
    if (q.includes('核糖體')) {
        return `🔬 **核糖體**是由 RNA 和蛋白質組成的**顆粒狀、非膜狀**構造，主要功能是**合成蛋白質**。\n\n核糖體有兩種分布位置：\n1. 分布於**細胞質**中（游離核糖體）\n2. 附著於**內質網**表面 → 形成**粗糙內質網**\n\n💡 核糖體是原核細胞和真核細胞**共同具有**的構造！`;
    }
    if (q.includes('核') && (q.includes('細胞核') || q.includes('核膜'))) {
        return `🟣 **細胞核**由核膜包圍，是細胞的控制中心。\n\n組成：\n- **核膜**：雙層膜，有核孔管控物質出入\n- **核質**：核內膠狀物質\n- **染色質**：DNA + 蛋白質，攜帶遺傳訊息\n- **核仁**：RNA + 蛋白質，合成核糖體的場所`;
    }
    if (q.includes('半自主')) {
        return `💡 **半自主胞器**指的是**粒線體**和**葉綠體**。\n\n它們被稱為「半自主」是因為：\n1. 內含自己的 **DNA** 和**核糖體**\n2. 能自行合成一小部分所需的蛋白質\n3. 能自行**分裂增殖**\n\n但它們仍需依賴細胞核提供大部分蛋白質的遺傳訊息，所以是「半」自主。`;
    }
    if (q.includes('癌') || q.includes('腫瘤')) {
        return `⚠️ **癌症**是細胞分裂**失去控制**的現象。\n\n**原因：**負責細胞週期調控或 DNA 修復的基因發生突變。\n\n**誘因比例：**\n- ~95% **外在環境因素**：紫外線、亞硝酸鹽、病毒等\n- ~5% **遺傳因素**：如 BRCA1 基因突變\n\n**防治重點：**\n- 定期篩檢、早期發現早期治療\n- 健康飲食、規律運動\n- 增強免疫力`;
    }

    // 預設回應
    return `🤔 這是個好問題！以下是我的理解：\n\n這個問題可能與「細胞的構造與功能」有關。建議你可以：\n\n1. 查看課程中**相關章節**的內容\n2. 嘗試用更具體的關鍵字提問，例如：\n   - 「細胞學說」「原核 vs 真核」\n   - 「ATP」「光合作用」「呼吸作用」\n   - 「有絲分裂」「減數分裂」\n\n你也可以點擊下方的**快速問題按鈕**來獲得常見問題的解答！😊`;
}

// ===== 滾動效果 =====
function initScrollEffects() {
    const header = document.getElementById('main-header');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        // 標頭陰影
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
        // 回到頂部按鈕
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

// ===== 英雄橫幅粒子效果 =====
function initHeroParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = 4 + Math.random() * 12;
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 8}s;
            animation-duration: ${6 + Math.random() * 6}s;
        `;
        container.appendChild(particle);
    }
}
