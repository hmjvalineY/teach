// Data for script templates
const scriptTemplates = {
    campus: {
        act1: "場景：繁忙的校園走廊或安靜的圖書館。<br>事件：主角 {protagonist} 正為了即將到來的考試或比賽進行準備，卻意外發現了 {conflict}。<br>轉折：一個轉學生的出現，打破了主角原本平靜的生活。",
        act2: "場景：社團活動室及夜晚的頂樓。<br>事件：{protagonist} 嘗試解決 {conflict}，但由於誤會，與好朋友產生了激烈的爭吵。<br>高潮：在全校大會上，秘密即將被揭開，主角必須做出選擇。",
        act3: "場景：畢業典禮或最後的比賽現場。<br>解決：{protagonist} 勇敢地面對了真相，修復了友誼。<br>結局：夕陽下，大家約定十年後再見，青春留下了不完美的完美句點。"
    },
    scifi: {
        act1: "場景：霓虹燈閃爍的賽博龐克城市街頭。<br>事件：{protagonist} 在一次數據挖掘任務中，無意間解碼了一份加密檔案，內容涉及 {conflict}。<br>轉折：神秘組織開始追捕主角，主角被迫逃離原本的生活圈。",
        act2: "場景：地下避難所及虛擬網絡空間。<br>事件：{protagonist} 試圖尋找解碼的關鍵，發現自己的身世與 {conflict} 有著驚人的聯繫。<br>高潮：主角潛入超級電腦核心，準備上傳關鍵代碼，卻發現最終反派是自己最信任的導師。",
        act3: "場景：坍塌中的數據中心。<br>解決：{protagonist} 選擇了犧牲部分自我意識來換取人類的自由。<br>結局：城市重歸平靜，透過屏幕，由於一段未署名的代碼，人們彷彿又看見了主角的影子。"
    },
    wuxia: {
        act1: "場景：風雪交加的邊塞客棧。<br>事件：{protagonist} 身懷絕世武功卻隱姓埋名，直到 {conflict} 的消息傳來，打破了江湖的寧靜。<br>轉折：一塊傳說中的令牌重現江湖，仇家找上門來。",
        act2: "場景：懸崖峭壁及幽深的竹林。<br>事件：{protagonist} 在尋找真相的途中，結識了性格迥異的夥伴，共同對抗 {conflict} 背後的黑手。<br>高潮：武林大會上，真相大白，主角不得不與曾經的摯友拔刀相向。",
        act3: "場景：落花紛飛的古亭。<br>解決：一場決戰後，恩怨盡消，{protagonist} 放下了手中的劍。<br>結局：主角轉身離去，只留下一個傳說，從此江湖路遠，不問歸期。"
    },
    suspense: {
        act1: "場景：深夜的無人街道及堆滿卷宗的辦公室。<br>事件：{protagonist} 接手了一樁看似普通的案件，卻發現所有線索都指向 {conflict}。<br>轉折：關鍵證人離奇失蹤，主角收到了一封沒有寄件人的恐嚇信。",
        act2: "場景：廢棄的工廠及充滿迷霧的記憶迷宮。<br>事件：{protagonist} 深入調查，發現自己身邊的人都各懷鬼胎，{conflict} 只是冰山一角。<br>高潮：在對峙中，兇手終於現身，而動機竟然是為了保護主角。",
        act3: "場景：審訊室的單面鏡後。<br>解決：謎題解開，正義得到了伸張，但代價是慘痛的真相。<br>結局：{protagonist} 獨自坐在雨中的車裡，望著城市的燈火，若有所思。"
    }
};

// Data for poems
const poems = {
    jingyesi: {
        title: "靜夜思",
        author: "李白",
        lines: ["床前明月光，", "疑是地上霜。", "舉頭望明月，", "低頭思故鄉。"]
    },
    chibi: {
        title: "念奴嬌·赤壁懷古",
        author: "蘇軾",
        lines: ["大江東去，浪淘盡，", "千古風流人物。", "故壘西邊，人道是，", "三國周郎赤壁。"]
    },
    shuidiao: {
        title: "水調歌頭",
        author: "蘇軾",
        lines: ["明月幾時有？", "把酒問青天。", "不知天上宮闕，", "今夕是何年。"]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupScriptArchitect();
    setupPoetryResonance();
});

// Navigation Handling
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const modules = document.querySelectorAll('.module');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            navBtns.forEach(b => b.classList.remove('active'));
            modules.forEach(m => m.classList.remove('active'));

            // Add active class to clicked button and target module
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Module 1: Script Architect Logic
function setupScriptArchitect() {
    const form = document.getElementById('scriptForm');
    const outputDiv = document.getElementById('scriptOutput');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const genre = document.getElementById('genreSelect').value;
        const protagonist = document.getElementById('protagonistInput').value || "無名主角";
        const conflict = document.getElementById('conflictInput').value || "神秘事件";

        const template = scriptTemplates[genre];

        // Simple string replacement
        const act1 = template.act1.replace(/{protagonist}/g, protagonist).replace(/{conflict}/g, conflict);
        const act2 = template.act2.replace(/{protagonist}/g, protagonist).replace(/{conflict}/g, conflict);
        const act3 = template.act3.replace(/{protagonist}/g, protagonist).replace(/{conflict}/g, conflict);

        // Generate HTML
        outputDiv.innerHTML = `
            <div class="script-act">
                <h4>第一幕：鋪陳 (Setup)</h4>
                <p>${act1}</p>
            </div>
            <div class="script-act">
                <h4>第二幕：衝突 (Confrontation)</h4>
                <p>${act2}</p>
            </div>
            <div class="script-act">
                <h4>第三幕：結局 (Resolution)</h4>
                <p>${act3}</p>
            </div>
            <div style="margin-top: 1rem; color: #636e72; font-size: 0.9rem;">
                <i class="ri-lightbulb-flash-line"></i> 提示：這只是一個骨架，請嘗試加入對話和細節描寫來豐富劇本。
            </div>
        `;
    });
}

// Module 2: Poetic Resonance Logic
// Made global so onclick in HTML works
window.loadPoem = function (poemKey) {
    const poem = poems[poemKey];
    const chips = document.querySelectorAll('.chip');

    // Update active chip UI
    chips.forEach(chip => {
        if (chip.innerText.includes(poem.title) || (poemKey === 'chibi' && chip.innerText.includes('赤壁')) || (poemKey === 'shuidiao' && chip.innerText.includes('水調'))) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Update Content with fade effect
    const display = document.querySelector('.poem-display');
    display.style.opacity = '0';

    setTimeout(() => {
        document.getElementById('poemTitle').innerText = poem.title;
        document.getElementById('poemAuthor').innerText = poem.author;

        const contentDiv = document.getElementById('poemContent');
        contentDiv.innerHTML = poem.lines.map(line => `<p>${line}</p>`).join('');

        display.style.opacity = '1';
    }, 300);
};

function setupPoetryResonance() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    const container = document.getElementById('resonanceContainer');

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            container.setAttribute('data-mood', mood);
        });
    });
}
