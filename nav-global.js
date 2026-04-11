/**
 * 全站導覽列 — 自動注入到每個頁面
 * 功能：統一導覽、深色模式切換、全站搜尋、行動版漢堡選單
 */
(function () {
    'use strict';

    // === 計算相對於根目錄的路徑前綴 ===
    const scriptTag = document.currentScript;
    const scriptSrc = scriptTag ? scriptTag.getAttribute('src') : '';
    const basePath = scriptSrc.replace(/nav-global\.js$/, '');

    // === 搜尋索引（所有可搜尋的頁面） ===
    const SEARCH_INDEX = [
        { title: '首頁', desc: '教學資源總覽入口', icon: '🏠', url: basePath + 'index.html' },
        { title: '互動教學資源', desc: '物理、生物、國文、地理等互動模擬', icon: '📚', url: basePath + 'courses.html' },
        { title: 'GitHub 使用教學', desc: '隱藏玩法、快捷鍵、自動化', icon: '🐙', url: basePath + 'github/HowToUseGithub.html' },
        { title: '教學新聞', desc: '楊梅高中及教育科技新聞', icon: '📰', url: basePath + 'news/news.html' },
        { title: 'Google AI 應用指南', desc: 'Stitch 與 Jules 教學實踐', icon: '🤖', url: basePath + 'StitchAndJules/index.html' },
        { title: 'AI 外掛工具集', desc: 'Voyager、Kortex 等瀏覽器擴充', icon: '🧩', url: basePath + 'AIPlugin/index.html' },
        { title: '學習路徑', desc: '各科建議學習順序', icon: '🗺️', url: basePath + 'learning-paths.html' },
        { title: '教師工具箱', desc: '教案產生器、嵌入代碼', icon: '🧰', url: basePath + 'teacher-tools.html' },
        { title: '學習進度', desc: '學習成果儀表板', icon: '📊', url: basePath + 'progress.html' },
        { title: '社群討論', desc: 'Giscus 學習討論區', icon: '💬', url: basePath + 'discussions.html' },
        // --- 互動課程 ---
        { title: '生物多樣性與保育', desc: '棲地模擬實驗室', icon: '🌿', url: basePath + 'biodiversity-sim/index.html' },
        { title: '分子遺傳學中心法則', desc: 'DNA 複製、轉錄與轉譯', icon: '🧬', url: basePath + 'central-dogma-sim/index.html' },
        { title: '思辨與閱讀平台', desc: '議題辯論模擬', icon: '💬', url: basePath + 'chinese-debate-platform/index.html' },
        { title: '多媒體故事工坊', desc: 'AI 劇本建築師 / 詩詞共鳴', icon: '🎭', url: basePath + 'chinese-multimedia-lab/index.html' },
        { title: '設計思考挑戰', desc: '校園永續改造實作', icon: '💡', url: basePath + 'design-thinking-sim/index.html' },
        { title: '電磁波與光速', desc: '馬克士威方程組視覺化', icon: '📡', url: basePath + 'electromagnetic-waves/index.html' },
        { title: '海岸守護者', desc: '氣候韌性城市規劃', icon: '🌊', url: basePath + 'environmental-impact-sim/index.html' },
        { title: '時空地圖實驗室', desc: 'GIS 古今地圖疊合', icon: '🗺️', url: basePath + 'gis-spatial-history/index.html' },
        { title: '國際議題與批判性閱讀', desc: '媒體識讀、觀點偵探', icon: '🌐', url: basePath + 'international-issues/index.html' },
        { title: '光的干涉及繞射', desc: '惠更斯原理、雙狹縫干涉', icon: '🌈', url: basePath + 'light-interference/index.html' },
        { title: '機電整合與控制', desc: '馬達控制、感測器', icon: '⚙️', url: basePath + 'mechatronics-control-sim/index.html' },
        { title: '量子現象實驗室', desc: '原子光譜、光電效應', icon: '⚛️', url: basePath + 'quantum-phenomena/index.html' },
        { title: '萬有引力定律', desc: '引力場視覺化', icon: '🪐', url: basePath + 'universal-gravitation/index.html' },
        { title: '簡諧運動(SHM)彈簧振子', desc: '位置/速度/能量轉換', icon: '⚙️', url: basePath + 'physics-shm/index.html' },
        { title: '克卜勒行星運動定律', desc: '橢圓軌道與掃掠面積', icon: '🪐', url: basePath + 'physics-kepler/index.html' },
        { title: '細胞構造與功能', desc: '互動概念圖與自我評量', icon: '🔬', url: basePath + 'biology/index.html' },
        { title: '細胞分裂：有絲 vs 減數', desc: '染色體動態變化對比', icon: '🔬', url: basePath + 'biology-cell-division/index.html' },
        { title: '生態金字塔與能量流動', desc: '10% 能量傳遞定律', icon: '🌲', url: basePath + 'biology-eco-pyramid/index.html' },
        { title: '經濟學供需模型', desc: '價格與數量均衡點', icon: '📈', url: basePath + 'social-econ-model/index.html' },
        { title: '台灣歷史時間軸', desc: '關鍵歷史時刻與轉捩點', icon: '📜', url: basePath + 'history-timeline/index.html' },
        { title: '色彩理論與混色圖學', desc: 'RGB / CMYK 與互補色', icon: '🎨', url: basePath + 'art-color-theory/index.html' },
        // --- 數學（新增） ---
        { title: '二次函數圖形探索', desc: '參數即時調整拋物線', icon: '📐', url: basePath + 'math-quadratic/index.html' },
        { title: '三角函數視覺化', desc: '單位圓 + 波形同步動畫', icon: '📏', url: basePath + 'math-trigonometry/index.html' },
        { title: '統計與機率模擬', desc: '骰子模擬、常態分佈', icon: '🎲', url: basePath + 'math-statistics/index.html' },
        { title: '向量與空間概念', desc: '2D 向量加法/內積/外積', icon: '📐', url: basePath + 'math-vectors/index.html' },
        { title: '排列組合計算器', desc: 'P(n,r)/C(n,r) 樹狀圖', icon: '🎯', url: basePath + 'math-combinatorics/index.html' },
        { title: '微積分初步', desc: '極限與導數、黎曼和定積分', icon: '📉', url: basePath + 'math-calculus/index.html' },
        // --- 化學（新增） ---
        { title: '互動週期表', desc: '元素性質、電子組態查詢', icon: '⚗️', url: basePath + 'chemistry-periodic-table/index.html' },
        { title: '酸鹼滴定模擬', desc: '虛擬滴定實驗與 pH 曲線', icon: '🧪', url: basePath + 'chemistry-titration/index.html' },
        { title: '化學平衡與勒沙特列原理', desc: '反應速率與平衡移動動力學', icon: '⚖️', url: basePath + 'chemistry-equilibrium/index.html' },
    ];

    // === 導覽項目定義 ===
    const NAV_ITEMS = [
        { label: '首頁', icon: '🏠', href: basePath + 'index.html', id: 'home' },
        { label: '課程', icon: '📚', href: basePath + 'courses.html', id: 'courses' },
        { label: 'GitHub', icon: '🐙', href: basePath + 'github/HowToUseGithub.html', id: 'github' },
        { label: '新聞', icon: '📰', href: basePath + 'news/news.html', id: 'news' },
        { label: 'AI 工具', icon: '🤖', href: basePath + 'StitchAndJules/index.html', id: 'ai' },
        { label: '路徑', icon: '🗺️', href: basePath + 'learning-paths.html', id: 'paths' },
        { label: '工具', icon: '🧰', href: basePath + 'teacher-tools.html', id: 'teacher' },
        { label: '社群', icon: '💬', href: basePath + 'discussions.html', id: 'community' },
    ];

    // === 深色模式管理 ===
    function getTheme() {
        return localStorage.getItem('teach-theme') || 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('teach-theme', theme);
        const btn = document.querySelector('.theme-toggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    function toggleTheme() {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    // === 偵測當前頁面以標記 active ===
    function isActivePage(href) {
        const currentPath = window.location.pathname;
        const linkPath = new URL(href, window.location.origin).pathname;
        if (linkPath.endsWith('index.html') && currentPath.endsWith('index.html') && !currentPath.includes('/')) return true;
        return currentPath.includes(linkPath.replace(/^\//, '').replace('index.html', ''));
    }

    // === 建立導覽列 HTML ===
    function buildNav() {
        const nav = document.createElement('nav');
        nav.className = 'global-nav';
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', '全站導覽');

        // 桌面版連結
        const linksHTML = NAV_ITEMS.map(item => {
            const active = isActivePage(item.href) ? ' active' : '';
            return `<a href="${item.href}" class="global-nav__link${active}" data-nav="${item.id}" aria-label="${item.label}">
                <span class="global-nav__link-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');

        nav.innerHTML = `
            <div class="global-nav__inner">
                <a href="${basePath}index.html" class="global-nav__logo" aria-label="回到首頁">
                    <span class="global-nav__logo-icon">🎓</span>
                    教學資源網
                </a>

                <div class="global-nav__links" role="menubar">
                    ${linksHTML}
                </div>

                <div class="global-nav__actions">
                    <button class="search-toggle" aria-label="搜尋" onclick="window.__teachNav.openSearch()">
                        <span class="search-toggle__icon">🔍</span>
                        <span>搜尋課程...</span>
                        <span class="search-toggle__shortcut">Ctrl+K</span>
                    </button>
                    <button class="theme-toggle" aria-label="切換深色模式" onclick="window.__teachNav.toggleTheme()">
                        ${getTheme() === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button class="global-nav__hamburger" aria-label="開啟選單" onclick="window.__teachNav.toggleMobile()">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        `;

        // 行動版選單
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'global-nav__mobile-menu';
        mobileMenu.innerHTML = NAV_ITEMS.map(item => {
            const active = isActivePage(item.href) ? ' active' : '';
            return `<a href="${item.href}" class="global-nav__link${active}">
                <span class="global-nav__link-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');

        // 搜尋對話框
        const searchDialog = document.createElement('div');
        searchDialog.className = 'search-dialog';
        searchDialog.setAttribute('role', 'dialog');
        searchDialog.setAttribute('aria-label', '搜尋');
        searchDialog.innerHTML = `
            <div class="search-dialog__content">
                <div class="search-dialog__input-wrap">
                    <span class="search-icon">🔍</span>
                    <input class="search-dialog__input" type="text" placeholder="搜尋課程、工具或主題..." aria-label="搜尋關鍵字" />
                </div>
                <div class="search-dialog__results"></div>
            </div>
        `;

        document.body.prepend(searchDialog);
        document.body.prepend(mobileMenu);
        document.body.prepend(nav);

        // === A11y 無障礙支援 ===
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = "#main-content";
            skipLink.className = "skip-link";
            skipLink.textContent = "跳至主要內容";
            document.body.prepend(skipLink);
        }

        const mainContent = document.querySelector('.page-container') || document.querySelector('main');
        if (mainContent && !mainContent.id) {
            mainContent.id = "main-content";
            if(mainContent.tagName.toLowerCase() !== 'main') {
                mainContent.setAttribute("role", "main");
            }
        }
    }

    // === 搜尋功能 ===
    function openSearch() {
        const dialog = document.querySelector('.search-dialog');
        dialog.classList.add('open');
        const input = dialog.querySelector('.search-dialog__input');
        input.value = '';
        input.focus();
        renderResults('');
    }

    function closeSearch() {
        document.querySelector('.search-dialog').classList.remove('open');
    }

    function renderResults(query) {
        const container = document.querySelector('.search-dialog__results');
        const q = query.toLowerCase().trim();

        if (!q) {
            // 顯示所有項目（分組顯示前 10 個）
            const items = SEARCH_INDEX.slice(0, 12);
            container.innerHTML = items.map(item =>
                `<a href="${item.url}" class="search-result-item">
                    <span class="search-result-item__icon">${item.icon}</span>
                    <div class="search-result-item__info">
                        <div class="search-result-item__title">${item.title}</div>
                        <div class="search-result-item__desc">${item.desc}</div>
                    </div>
                </a>`
            ).join('');
            return;
        }

        const results = SEARCH_INDEX.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q)
        );

        if (results.length === 0) {
            container.innerHTML = `<div class="search-dialog__empty">找不到「${query}」相關的結果 🤔</div>`;
            return;
        }

        container.innerHTML = results.map(item =>
            `<a href="${item.url}" class="search-result-item">
                <span class="search-result-item__icon">${item.icon}</span>
                <div class="search-result-item__info">
                    <div class="search-result-item__title">${item.title}</div>
                    <div class="search-result-item__desc">${item.desc}</div>
                </div>
            </a>`
        ).join('');
    }

    // === 行動版選單 ===
    function toggleMobile() {
        const menu = document.querySelector('.global-nav__mobile-menu');
        const btn = document.querySelector('.global-nav__hamburger');
        menu.classList.toggle('open');
        btn.classList.toggle('open');
    }

    // === 捲動時加陰影 ===
    function handleScroll() {
        const nav = document.querySelector('.global-nav');
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 10);
        }
    }

    // === 初始化 ===
    function init() {
        // 套用深色模式
        setTheme(getTheme());

        // 注入導覽列
        buildNav();

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            // Ctrl+K 或 Cmd+K 開啟搜尋
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            // Esc 關閉搜尋
            if (e.key === 'Escape') {
                closeSearch();
            }
        });

        // 搜尋輸入事件
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-dialog__input')) {
                renderResults(e.target.value);
            }
        });

        // 點擊背景關閉搜尋
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-dialog')) {
                closeSearch();
            }
        });

        // 捲動事件
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // 暴露 API
    window.__teachNav = {
        toggleTheme,
        openSearch,
        closeSearch,
        toggleMobile,
    };

    // DOM 載入後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
