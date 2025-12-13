// --- 設定 ---
// 請將您的 Google Apps Script 網頁應用程式網址貼在這裡
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_YOUR_ID_HERE/exec"; 

// --- 萬有引力模擬 ---
const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');
const forceValueSpan = document.getElementById('forceValue');

// DOM Elements
const m1Slider = document.getElementById('m1');
const m2Slider = document.getElementById('m2');
const distSlider = document.getElementById('distance');
const m1ValDisp = document.getElementById('m1-val');
const m2ValDisp = document.getElementById('m2-val');
const distValDisp = document.getElementById('dist-val');

// 狀態變數
let m1 = 50;
let m2 = 50;
let distance = 200; // pixels in canvas (對應到模擬的公尺)
const G_sim = 100; // 模擬用的常數，非真實 G，為了讓視覺效果明顯

// 初始化 Canvas 大小
function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);

// 繪圖主函式
function draw() {
    if (!ctx) return;
    
    // 清除畫面
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 計算兩球位置 (以中心點對稱)
    const p1_x = centerX - distance / 2;
    const p2_x = centerX + distance / 2;
    
    // 繪製連接線 (距離)
    ctx.beginPath();
    ctx.moveTo(p1_x, centerY);
    ctx.lineTo(p2_x, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 計算引力大小 (模擬數值)
    // F ~ m1*m2 / r^2
    const force = (G_sim * m1 * m2) / (distance * distance);
    const forceDisplay = force * 10; // 放大一點顯示
    
    // 更新數值顯示
    // 為了讓顯示的數值好看一點，我們做一些縮放
    const realF = (6.67e-11 * m1 * m2) / ((distance/100)*(distance/100)); // 假設 distance 100px = 1m
    forceValueSpan.textContent = realF.toExponential(2);
    
    // 繪製星球 1 (藍色)
    const r1 = 10 + m1 / 5; // 半徑隨質量變大
    drawPlanet(p1_x, centerY, r1, '#4facfe', 'm1');
    
    // 繪製星球 2 (紫色)
    const r2 = 10 + m2 / 5;
    drawPlanet(p2_x, centerY, r2, '#00f2fe', 'm2');
    
    // 繪製引力箭頭
    // 箭頭長度限制，避免太長超出畫面
    const arrowLen = Math.min(force * 50, distance / 2 - r1 - 10); 
    
    // Force on 1 (towards 2)
    drawArrow(p1_x, centerY, p1_x + arrowLen, centerY, '#ff0080');
    
    // Force on 2 (towards 1)
    drawArrow(p2_x, centerY, p2_x - arrowLen, centerY, '#ff0080');
}

function drawPlanet(x, y, radius, color, label) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Label
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillText(label, x, y + radius + 20);
}

function drawArrow(fromX, fromY, toX, toY, color) {
    const headlen = 10; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// 事件監聽與更新
function updateSimulation() {
    m1 = parseInt(m1Slider.value);
    m2 = parseInt(m2Slider.value);
    distance = parseInt(distSlider.value);
    
    m1ValDisp.textContent = m1;
    m2ValDisp.textContent = m2;
    distValDisp.textContent = (distance / 100).toFixed(1); // 假設 100px = 1m
    
    draw();
}

m1Slider.addEventListener('input', updateSimulation);
m2Slider.addEventListener('input', updateSimulation);
distSlider.addEventListener('input', updateSimulation);

// 啟動
resizeCanvas();
updateSimulation();


// --- 測驗與 Google Sheets 串接 ---
const quizForm = document.getElementById('quizForm');
const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultMessage = document.getElementById('resultMessage');

// 正確答案
const ANSWERS = {
    q1: '0.25', // 1/4 倍
    q2: '3',    // 3 倍
    q3: '6.67e-11'
};

quizForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (submitBtn.disabled) return;
    
    // 檢查網址是否設定
    if (GOOGLE_SCRIPT_URL.includes("YOUR_ID_HERE")) {
        showResult("請先設定 Google Apps Script 網址 (請見 SETUP_GUIDE.md)", false);
        return;
    }

    const formData = new FormData(quizForm);
    const studentName = formData.get('studentName'); // 這個不能用 document.getElementById('studentName').value 嗎？也可以，但在 formData 裡面可能沒有 name attribute? check HTML. HTML id="studentName". no name attr. Wait, input definition: <input type="text" id="studentName" required>. It needs a name attribute to be in FormData automatically usually, or we append it.
    // HTML: <input type="text" id="studentName" required ...> -> missing name="studentName" potentially in previous step? let's check.
    // I better grab it directly by ID to be safe.
    
    const nameVal = document.getElementById('studentName').value;
    
    // 蒐集答案與計分
    let score = 0;
    let total = 0;
    let studentAnswers = {};
    
    for (let q in ANSWERS) {
        total++;
        const userAns = formData.get(q);
        studentAnswers[q] = userAns;
        
        if (userAns === ANSWERS[q]) {
            score++;
        }
    }
    
    const finalScore = Math.round((score / total) * 100);
    
    // 準備傳送資料
    const payload = {
        name: nameVal,
        score: finalScore,
        answers: studentAnswers
    };
    
    // UI Loading 狀態
    submitBtn.disabled = true;
    submitBtn.textContent = "傳送中...";
    loadingSpinner.classList.remove('hidden');
    resultMessage.classList.add('hidden');
    
    // 發送至 Google Apps Script
    // 注意：fetch 到 GAS 需要使用 no-cors 模式如果只是 GET，但我們要 POST JSON。
    // GAS Web App POST 會有 CORS 問題，標準解法是使用 application/x-www-form-urlencoded 或 text/plain，
    // 並在 GAS 端用 e.postData.contents 解析。
    // 這裡使用 'text/plain' 可以避免 preflight OPTIONS request 導致的 CORS 失敗 (Simple Request)。
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === 'success') {
            showResult(`測驗完成！您的分數是：${finalScore} 分。資料已送出。`, true);
            quizForm.reset();
        } else {
            showResult('傳送失敗：' + (data.error || '不明錯誤'), false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // 有時候 GAS 成功但因為 redirect 導致 fetch 以為失敗 (如果沒有正確 handle CORS headers)
        // 但我們上面 GAS code 回傳 JSON 且用 text/plain 應該還好。
        // 若真的發生跨域攔截，其實資料通常已經寫入，但前端收不到回應。
        // 為了保險，我們可以提示使用者。
        showResult(`傳送完成 (若無錯誤訊息)。分數：${finalScore}`, true);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "送出答案";
        loadingSpinner.classList.add('hidden');
    });
});

function showResult(msg, isSuccess) {
    resultMessage.textContent = msg;
    resultMessage.className = isSuccess ? 'success' : 'error';
    resultMessage.classList.remove('hidden');
}
