// Topic Data
const topicData = {
    gender: {
        title: "性別議題：打破框架",
        content: `
            <h4>議題背景</h4>
            <p>性別議題在當代社會引發廣泛討論，從職場天花板到性別氣質的多元展現。傳統的二元性別觀念正受到挑戰。</p>
            <h4>關鍵文本</h4>
            <ul>
                <li>西蒙·波娃《第二性》：探討女性如何被建構為「他者」。</li>
                <li>朱迪斯·巴特勒《性別麻煩》：性別展演理論。</li>
            </ul>
            <h4>思考方向</h4>
            <p>如何看待「玫瑰少年」事件？性別刻板印象如何限制個人的發展？</p>
        `
    },
    'human-rights': {
        title: "人權議題：尊嚴與正義",
        content: `
            <h4>議題背景</h4>
            <p>人權是與生俱來的權利，但在現實中常因戰爭、貧窮或政治因素而受損。從難民危機到勞工權益，人權議題無處不在。</p>
            <h4>關鍵文本</h4>
            <ul>
                <li>《世界人權宣言》</li>
                <li>漢娜·鄂蘭《極權主義的起源》</li>
            </ul>
            <h4>思考方向</h4>
            <p>「平庸的邪惡」如何在現代社會重現？我們對遠方的苦難負有什麼責任？</p>
        `
    },
    ocean: {
        title: "海洋議題：藍色的呼喚",
        content: `
            <h4>議題背景</h4>
            <p>海洋佔地球表面的70%，調節著氣候並孕育無數生命。然而，過度捕撈、塑膠污染與酸化正威脅著海洋生態。</p>
            <h4>關鍵數據</h4>
            <ul>
                <li>預計2050年，海洋中的塑膠重量將超過魚類。</li>
                <li>大堡礁正因海水暖化而大規模白化。</li>
            </ul>
            <h4>思考方向</h4>
            <p>減塑生活知易行難，政策與個人行動該如何配合？</p>
        `
    },
    environment: {
        title: "環境議題：永續的挑戰",
        content: `
            <h4>議題背景</h4>
            <p>氣候變遷已不再是未來的預言，而是現在的危機。極端氣候頻發，能源轉型迫在眉睫。</p>
            <h4>關鍵概念</h4>
            <ul>
                <li>碳足跡 (Carbon Footprint)</li>
                <li>氣候正義 (Climate Justice)</li>
            </ul>
            <h4>思考方向</h4>
            <p>經濟發展與環境保護真的是零和遊戲嗎？</p>
        `
    }
};

// Reading Section Logic
document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', () => {
        const topicKey = card.dataset.topic;
        loadTopic(topicKey);
    });
});

function loadTopic(key) {
    const data = topicData[key];
    if (!data) return;

    document.getElementById('content-title').innerText = data.title;
    document.getElementById('content-body').innerHTML = data.content;

    const contentArea = document.getElementById('reading-content');
    contentArea.classList.remove('hidden');
    contentArea.scrollIntoView({ behavior: 'smooth' });
}

function closeReading() {
    document.getElementById('reading-content').classList.add('hidden');
}

// Report Submission
document.getElementById('report-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate submission
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;

    btn.innerText = "提交中...";
    btn.disabled = true;

    setTimeout(() => {
        alert("報告已成功提交！將由教師進行批閱。");
        btn.innerText = "已提交";
        e.target.reset();
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
        }, 2000);
    }, 1000);
});

// Debate Simulator Logic
let scores = {
    pro: 0,
    con: 0
};

const ARGUMENT_WEIGHTS = {
    data: 3,    // High impact
    expert: 2,  // Medium impact
    example: 1  // Low impact
};

function addArgument(side) {
    const inputId = `${side}-input`;
    const typeId = `${side}-type`;
    const listId = `${side}-arguments`;

    const text = document.getElementById(inputId).value.trim();
    const type = document.getElementById(typeId).value;

    if (!text) {
        alert("請輸入論點內容！");
        return;
    }

    // Add to Visual List
    const list = document.getElementById(listId);
    const item = document.createElement('div');
    item.className = 'argument-item';
    item.innerHTML = `
        <span class="argument-type">${getArgumentTypeLabel(type)}</span>
        ${text}
    `;
    list.prepend(item); // Add to top

    // Update Score
    const points = ARGUMENT_WEIGHTS[type];
    scores[side] += points;
    updateScoreUI(side);
    updateGauge();

    // Clear input
    document.getElementById(inputId).value = '';
}

function getArgumentTypeLabel(type) {
    switch (type) {
        case 'data': return '📊 數據佐證';
        case 'expert': return '🎓 專家意見';
        case 'example': return '💡 實例';
        default: return '論點';
    }
}

function updateScoreUI(side) {
    document.getElementById(`${side}-score`).innerText = scores[side];
}

function updateGauge() {
    const total = scores.pro + scores.con;
    if (total === 0) {
        setGauge(50);
        return;
    }

    // Calculate Pro percentage
    // If Pro has 100% of points, gauge should be at Top (0% top)?
    // Or let's imply Pro is Up/Top, Con is Down/Bottom.
    // However, usually gauges go 0 to 100.
    // Let's say 50% is center.
    // If Pro has more points, we move towards 0% top (Up).
    // If Con has more points, we move towards 100% top (Down).

    // Pro Ratio: scores.pro / total
    // If Pro = 10, Con = 0 -> Ratio = 1. We want position 0%.
    // If Pro = 0, Con = 10 -> Ratio = 0. We want position 100%.
    // Formula: (1 - (scores.pro / total)) * 100

    const proRatio = scores.pro / total;
    const targetTop = (1 - proRatio) * 100;

    setGauge(targetTop);
}

function setGauge(percentage) {
    // Clamp between 5% and 95% to avoid going off track visualily
    const clamped = Math.max(5, Math.min(95, percentage));

    const needle = document.getElementById('gauge-needle');
    needle.style.top = `${clamped}%`;

    // Color indication
    if (clamped < 45) {
        needle.style.background = '#3498db'; // Pro Color
    } else if (clamped > 55) {
        needle.style.background = '#e74c3c'; // Con Color
    } else {
        needle.style.background = '#fff'; // Neutral
    }
}
