/**
 * Critical Lens - Core Application Logic
 * Handles navigation, state management, and interactive modules.
 */

const appData = {
    missions: {
        climate: {
            title: "Climate Crisis: Fact vs. Fear",
            sourceA: {
                title: "Eco-Watch Daily",
                content: "The planet is <span class='token'>burning</span>. We are facing an <span class='token'>existential threat</span> unlike anything in history. <span class='token'>Global temperatures have risen by 1.1°C</span> since the late 19th century, a shift driven largely by increased carbon dioxide emissions."
            },
            sourceB: {
                title: "Industrial Times",
                content: "While <span class='token'>temperatures have risen 1.1°C</span>, alarmists are creating unnecessary <span class='token'>panic</span> to stifle economic growth. The climate has always changed naturally, and human ingenuity will surely <span class='token'>conquer</span> any challenges."
            },
            sortData: [
                { id: 'd1', text: "1880: Global Temp Baseline", order: 1 },
                { id: 'd2', text: "1950: CO2 levels cross 300ppm", order: 2 },
                { id: 'd3', text: "2016: Hottest Year on Record", order: 3 },
                { id: 'd4', text: "2050: Projected +2.0°C (High Emission)", order: 4 }
            ],
            sortLabels: ["Past (19th Century)", "Mid-20th Century", "Present Day", "Future Projection"],
            quiz: [
                { text: "Global warming is a hoax created to stop progress.", type: "biased" },
                { text: "Temperatures have risen by approximately 1.1°C.", type: "factual" }
            ]
        },
        ai: {
            title: "The AI Age: Savior or Destroyer?",
            sourceA: {
                title: "Tech Futurists",
                content: "AI will <span class='token'>liberate</span> humanity from drudgery. <span class='token'>Productivity has increased by 40%</span> in pilot programs. We are on the verge of a <span class='token'>glorious</span> new era of abundance."
            },
            sourceB: {
                title: "Labor Union Voice",
                content: "Corporations are using <span class='token'>soulless algorithms</span> to replace human workers. While <span class='token'>productivity is up 40%</span>, wages remain stagnant. This is a <span class='token'>ruthless</span> attack on the working class."
            },
            sortData: [
                { id: 'a1', text: "Weak AI (Siri, Chess)", order: 1 },
                { id: 'a2', text: "Generative AI (ChatGPT, Midjourney)", order: 2 },
                { id: 'a3', text: "AGI (Human-level Intelligence)", order: 3 },
                { id: 'a4', text: "Superintelligence (Beyond Human)", order: 4 }
            ],
            sortLabels: ["Narrow Intelligence", "Generative Models", "General Intelligence", "Superintelligence"],
            quiz: []
        }
    }
};

const app = {
    state: {
        currentMission: null,
        currentStep: 1,
        highlightTool: 'red', // red for bias, green for fact
        score: 0
    },

    init: () => {
        console.log("Critical Lens App Initialized");
        app.setupHighlighter();
        app.setupDragDrop();
    },

    loadMission: (missionId) => {
        const mission = appData.missions[missionId];
        if (!mission) return;

        app.state.currentMission = mission;
        app.state.currentStep = 1;

        // UI Updates
        document.getElementById('current-mission-title').innerText = mission.title;
        document.querySelector('.hero-section').classList.add('hidden');
        document.getElementById('mission-hub').classList.add('hidden');
        document.getElementById('workspace').classList.remove('hidden');

        // Load Module 1 Content
        document.getElementById('source-a-title').innerText = mission.sourceA.title;
        document.getElementById('text-a').innerHTML = mission.sourceA.content;
        document.getElementById('source-b-title').innerText = mission.sourceB.title;
        document.getElementById('text-b').innerHTML = mission.sourceB.content;

        // Reset Views
        app.showStep(1);

        // Load Data Loader for later
        app.preloadSorter(mission);
        app.preloadEditor(mission);
    },

    returnToHub: () => {
        document.getElementById('workspace').classList.add('hidden');
        document.querySelector('.hero-section').classList.remove('hidden');
        document.getElementById('mission-hub').classList.remove('hidden');
    },

    showStep: (stepNumber) => {
        app.state.currentStep = stepNumber;

        // Update Indicators
        document.querySelectorAll('.step').forEach(el => {
            el.classList.toggle('active', parseInt(el.dataset.step) === stepNumber);
        });

        // Hide all modules
        document.querySelectorAll('.module').forEach(el => el.classList.add('hidden'));

        // Show current module
        if (stepNumber === 1) document.getElementById('module-compare').classList.remove('hidden');
        if (stepNumber === 2) document.getElementById('module-sort').classList.remove('hidden');
        if (stepNumber === 3) document.getElementById('module-analyze').classList.remove('hidden');
    },

    nextStep: () => {
        if (app.state.currentStep < 3) {
            app.showStep(app.state.currentStep + 1);
        }
    },

    // --- Module 1: Highlighter Logic ---
    setupHighlighter: () => {
        // Tool Selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                app.state.highlightTool = btn.dataset.color;
            });
        });

        // Text Clicking (Event Delegation)
        document.querySelectorAll('.text-content').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('token')) {
                    const colorClass = `highlight-${app.state.highlightTool}`;

                    // Toggle Logic
                    if (e.target.classList.contains(colorClass)) {
                        e.target.classList.remove(colorClass); // Remove if same
                    } else {
                        e.target.classList.remove('highlight-red', 'highlight-green'); // Clear others
                        e.target.classList.add(colorClass); // Add new
                    }
                }
            });
        });
    },

    // --- Module 2: Drag & Drop Logic ---
    preloadSorter: (mission) => {
        const pool = document.getElementById('card-pool');
        const zones = document.getElementById('drop-zones');
        pool.innerHTML = '';
        zones.innerHTML = '';

        // Create Cards (shuffled)
        const shuffled = [...mission.sortData].sort(() => Math.random() - 0.5);
        shuffled.forEach(item => {
            const card = document.createElement('div');
            card.className = 'data-card';
            card.draggable = true;
            card.innerText = item.text;
            card.dataset.id = item.id;
            card.dataset.order = item.order; // Secret answer

            card.addEventListener('dragstart', app.dragStart);
            pool.appendChild(card);
        });

        // Create Zones
        mission.sortLabels.forEach((label, index) => {
            const zone = document.createElement('div');
            zone.className = 'drop-zone';
            zone.dataset.label = label;
            zone.dataset.expectedOrder = index + 1;

            zone.addEventListener('dragover', app.dragOver);
            zone.addEventListener('dragleave', app.dragLeave);
            zone.addEventListener('drop', app.drop);
            zones.appendChild(zone);
        });
    },

    setupDragDrop: () => {
        // Basic wiring handled in preloadSorter via event listeners
    },

    dragStart: (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
    },

    dragOver: (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    },

    dragLeave: (e) => {
        e.currentTarget.classList.remove('drag-over');
    },

    drop: (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.querySelector(`[data-id="${id}"]`);
        e.currentTarget.classList.remove('drag-over');

        // Use appendChild to move the element
        if (draggable) {
            e.currentTarget.appendChild(draggable);
            draggable.classList.remove('dragging');
        }
    },

    checkSort: () => {
        let correctCount = 0;
        const total = app.state.currentMission.sortData.length;

        document.querySelectorAll('.drop-zone').forEach(zone => {
            const card = zone.querySelector('.data-card');
            if (card) {
                if (parseInt(card.dataset.order) === parseInt(zone.dataset.expectedOrder)) {
                    card.classList.add('success');
                    card.classList.remove('error');
                    correctCount++;
                } else {
                    card.classList.add('error');
                    card.classList.remove('success');
                }
            }
        });

        if (correctCount === total) {
            document.getElementById('btn-next-sort').disabled = false;
            alert("Correct! Sorting sequence verified.");
        }
    },

    // --- Module 3: Editor Logic ---
    preloadEditor: (mission) => {
        const optionGrid = document.getElementById('q1-options');
        optionGrid.innerHTML = '';

        if (mission.quiz && mission.quiz.length > 0) {
            mission.quiz.forEach((q, idx) => {
                const opt = document.createElement('div');
                opt.className = 'option-card';
                opt.innerText = q.text;
                opt.onclick = () => {
                    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                    opt.classList.add('selected');
                };
                optionGrid.appendChild(opt);
            });
        } else {
            // Fallback if no quiz data
            optionGrid.innerHTML = '<p style="color: grey;">(No multiple choice for this mission)</p>';
        }
    },

    finishMission: () => {
        alert("Mission Report Submitted! Great work analyzing the sources.");
        app.returnToHub();
    }
};

// Start
document.addEventListener('DOMContentLoaded', app.init);
