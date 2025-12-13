document.addEventListener('DOMContentLoaded', () => {
    // --- Map Initialization ---
    // Coordinates for Taiwan (Center)
    const mapCenter = [23.5, 121];
    const initialZoom = 7;

    const map = L.map('map').setView(mapCenter, initialZoom);

    // Modern Base Layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map); // Default

    // Logic for additional layers will be here
    // Note: Simulated Historical Layers for demo purposes
    // In a real app, you would use WMTS from Academia Sinica GIS

    // Placeholder logic for historical overlay
    // We will use a different map style to represent "history" for this demo if we can't fetch real tiles easily without auth
    // Using Stamen Watercolor or similar public artistic tiles as a proxy for "Old Map" visual
    // Update: Stamen tiles are hosted by Stadia now and require API key mostly. 
    // Let's use a hue-rotated OSM or standard OSM with a filter for the "historical" vibe simulation in pure CSS if needed, 
    // but better, let's just use a Satellite layer as the "Top" layer to show CHANGE.
    // Or, we can use the actual Taiwan e-Map WMTS if it's public. 
    // For this educational purpose, let's use a specific public tile set that looks different.

    // Let's define the layers
    const layers = {
        modern: osmLayer,
        // Using a dark theme or different style to denote "Historical" contrast
        // Actually, let's try to load a specific openly available historical map tile if possible.
        // If not, we use a grayscale version of OSM as "Old".
        history_1904: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            opacity: 0.7
        }),
        history_1921: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            opacity: 0.7
        })
    };

    let currentOverlay = null;

    // --- Controls ---
    const baseSelect = document.getElementById('base-layer-select');
    const overlaySelect = document.getElementById('overlay-layer-select');
    const opacitySlider = document.getElementById('opacity-slider');

    // Base Layer Change
    baseSelect.addEventListener('change', (e) => {
        // In this simple demo, we just keep OSM as base, but valid to swap
        // For now, let's just log it or swap if we had more base options implemented
        console.log(`Base layer changed to ${e.target.value}`);
        if (e.target.value === 'satellite') {
            // Demo: switch base to satellite
            map.removeLayer(layers.modern);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(map);
        } else {
            // Restore OSM
            map.eachLayer((layer) => {
                if (layer !== currentOverlay) map.removeLayer(layer);
            });
            layers.modern.addTo(map);
            if (currentOverlay) currentOverlay.addTo(map);
        }
    });

    // Overlay Layer Change
    overlaySelect.addEventListener('change', (e) => {
        const selected = e.target.value;

        // Remove old overlay
        if (currentOverlay) {
            map.removeLayer(currentOverlay);
            currentOverlay = null;
        }

        if (selected !== 'none' && layers[selected]) {
            currentOverlay = layers[selected];
            currentOverlay.setOpacity(opacitySlider.value);
            currentOverlay.addTo(map);

            // Zoom to a specific interesting area for demo
            if (selected === 'history_1904') {
                map.flyTo([25.0330, 121.5654], 13); // Taipei 101 area
            }
        }
    });

    // Opacity Slider
    opacitySlider.addEventListener('input', (e) => {
        if (currentOverlay) {
            currentOverlay.setOpacity(e.target.value);
        }
    });

    // --- Time Detective Game ---
    const missions = [
        {
            id: 1,
            title: "尋找消失的台北城牆",
            desc: "1904年的地圖上，台北城牆還清晰可見。請在地圖上找到「北門」的位置。",
            target: [25.0478, 121.5113], // North Gate coords
            targetName: "北門 (承恩門)",
            zoom: 15
        },
        {
            id: 2,
            title: "變遷的河流：基隆河截彎取直",
            desc: "基隆河曾經非常蜿蜒。請移動到大直、松山一帶，觀察河道的變化。",
            target: [25.0718, 121.5476], // Near Dazhi
            targetName: "基隆河舊河道",
            zoom: 14
        },
        {
            id: 3,
            title: "打狗 vs 高雄",
            desc: "高雄舊稱「打狗」。請將地圖移至高雄港區，尋找最早的火車站位置。",
            target: [22.6225, 120.2798], // Kaohsiung Port area
            targetName: "打狗驛 (舊高雄車站)",
            zoom: 14
        }
    ];

    let currentMissionIndex = -1;
    let score = 0;

    const startBtn = document.getElementById('start-game-btn');
    const missionText = document.getElementById('mission-text');
    const feedbackArea = document.getElementById('feedback-area');
    const scoreDisplay = document.getElementById('score');
    const taskCountDisplay = document.getElementById('task-count');
    const clueList = document.getElementById('clue-list');

    let gameMarkers = [];

    startBtn.addEventListener('click', () => {
        if (currentMissionIndex === -1) {
            startGame();
        } else {
            nextMission();
        }
    });

    function startGame() {
        score = 0;
        currentMissionIndex = 0;
        updateScore();
        loadMission(currentMissionIndex);
        startBtn.textContent = "跳過此題 / 下一題";
    }

    function loadMission(index) {
        if (index >= missions.length) {
            missionText.innerHTML = "🎉 恭喜！你已完成所有偵探任務！<br>你對這塊土地的歷史記憶有了更深的認識。";
            startBtn.style.display = 'none';
            return;
        }

        const mission = missions[index];
        missionText.innerHTML = `<strong>任務 ${index + 1}: ${mission.title}</strong><br>${mission.desc}`;
        taskCountDisplay.textContent = `${index + 1}/${missions.length}`;
        feedbackArea.innerHTML = '';
        feedbackArea.className = 'hidden';

        // Add a marker to the map that users have to find (or click)
        // For simplicity in this v1, we will Add the marker but hide it initially? 
        // Or make user click ANYWHERE? 
        // Let's simplified game: We show a "Search Zone" circle, user has to click near the center.
        // OR better: We simply Place a Marker that says "Investigation Point" and user clicks it to verify.

        // Clear old markers
        gameMarkers.forEach(m => map.removeLayer(m));
        gameMarkers = [];

        // Add correct target marker but maybe customize icon to be a "Question Mark"
        const marker = L.marker(mission.target).addTo(map);
        marker.bindPopup(`<b>???</b><br>點擊以調查此處`).openPopup();

        marker.on('click', () => {
            if (feedbackArea.innerHTML === '') { // Prevent double scoring
                score += 100;
                updateScore();
                marker.bindPopup(`<b>${mission.targetName}</b><br>發現線索！`).openPopup();
                feedbackArea.innerHTML = `<div class="correct"><i class="fa-solid fa-check-circle"></i> 正確！這裡是 ${mission.targetName}。</div>`;
                feedbackArea.classList.remove('hidden');

                // Add to clues
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check"></i> 發現：${mission.targetName}`;
                clueList.appendChild(li);

                // Auto next after 2 seconds
                // setTimeout(() => nextMission(), 3000); 
                startBtn.textContent = "下一題";
            }
        });

        gameMarkers.push(marker);

        // Auto fly to general area so user isn't lost
        map.flyTo(mission.target, mission.zoom - 1);
    }

    function nextMission() {
        currentMissionIndex++;
        loadMission(currentMissionIndex);
    }

    function updateScore() {
        scoreDisplay.textContent = score;
    }

    // Add some random interactive clues on map just for fun (non-game)
    const interests = [
        { lat: 24.1477, lng: 120.6736, title: "台中公園" },
        { lat: 22.9997, lng: 120.2270, title: "台南赤崁樓" }
    ];

    interests.forEach(poi => {
        L.marker([poi.lat, poi.lng]).addTo(map)
            .bindPopup(poi.title);
    });

});
