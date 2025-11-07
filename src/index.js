import { Game } from './core/Game.js';

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === "/play") {
    const game = new Game();
    game.startGame()
	// Expose game instance for debugging
	window.game = game;
    } else {
	load()
    }
});

async function load(page){
    // Initial index.html page loads the game. Instead, copy that html
    // content into a variable and replace it with the welcome page.
    let bck = document.body.innerHTML
    let welcome = await fetch("/welcome.html")
    let loading = await fetch("/loading.html")
    document.body.innerHTML = await welcome.text()
	new BootScreen();
	document.getElementById("startGame").addEventListener("click",async ()=>{
	    // window.location.replace("/play")
	    document.body.innerHTML = await loading.text()
	    setTimeout(async () => {
		// welcomeScript()
		document.body.innerHTML = bck
		const game = new Game();
		// wait until everything loads
		await game.gameLoaded()
		game.startGame()
	    }, 2000)
	})
    
    // let script = document.createElement("script")
    // script.src = "/script.js"
    // document.body.appendChild(script)
    // document.body.innerHTML = bck
    // window.location.replace("/welcome.html")
}

// function welcomeScript(){
class BootScreen {
        constructor() {
            this.gridOverlay = document.getElementById('gridOverlay');
            this.systemInfo = document.getElementById('systemInfo');
            this.bootText = document.getElementById('bootText');
            this.init();
	    document.getElementById('startGame').addEventListener('click', ()=>{
		window.game = new Game()
	    });
        }

        init() {
            this.createGridBlocks();
            this.createParticles();
            this.createBackgroundElements();
            this.createProgressBars();
            this.startBootSequence();
        }

        createGridBlocks() {
            const totalBlocks = 20 * 15;
            for (let i = 0; i < totalBlocks; i++) {
                const block = document.createElement('div');
                block.className = 'grid-block';
                block.style.animationDelay = `${Math.random() * 2}s`;
                this.gridOverlay.appendChild(block);
            }
        }
	createBinaryRain() {
            const rainContainer = document.getElementById('binaryRain');
            for (let i = 0; i < 50; i++) {
                const column = document.createElement('div');
                column.className = 'binary-column';
                column.style.left = Math.random() * 100 + '%';
                column.style.animationDelay = Math.random() * 6 + 's';
                column.style.animationDuration = (4 + Math.random() * 4) + 's';
                
                let binaryText = '';
                for (let j = 0; j < 20; j++) {
                    binaryText += Math.random() > 0.5 ? '1' : '0';
                    if (j % 4 === 3) binaryText += '<br>';
                }
                column.innerHTML = binaryText;
                rainContainer.appendChild(column);
            }
        }

        createParticles() {
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (4 + Math.random() * 3) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        createBackgroundElements() {
            // Circuit lines
            const circuitContainer = document.getElementById('circuitLines');
            for (let i = 0; i < 8; i++) {
                const line = document.createElement('div');
                line.className = i % 2 === 0 ? 'circuit-line' : 'circuit-line vertical';
                line.style.top = Math.random() * 100 + '%';
                line.style.left = Math.random() * 100 + '%';
                line.style.animationDelay = Math.random() * 4 + 's';
                circuitContainer.appendChild(line);
            }

            // Floating icons
            const iconContainer = document.getElementById('floatingIcons');
            const icons = ['◆', '◇', '●', '○', '▲', '△', '■', '□', '★', '☆'];
            for (let i = 0; i < 15; i++) {
                const icon = document.createElement('div');
                icon.className = 'floating-icon';
                icon.textContent = icons[Math.floor(Math.random() * icons.length)];
                icon.style.left = Math.random() * 100 + '%';
                icon.style.animationDelay = Math.random() * 8 + 's';
                icon.style.animationDuration = (6 + Math.random() * 4) + 's';
                iconContainer.appendChild(icon);
            }
        }

        createProgressBars() {
            const barIds = ['cpuBar', 'memoryBar'];
            barIds.forEach(barId => {
                const bar = document.getElementById(barId);
                for (let i = 0; i < 20; i++) {
                    const segment = document.createElement('div');
                    segment.className = 'stat-bar-segment';
                    bar.appendChild(segment);
                }
            });
        }

        startBootSequence() {
            setTimeout(() => {
                this.animateGridDisappear();
            }, 3000);

            setTimeout(() => {
                this.gridOverlay.classList.add('fade-out');
                this.showSystemInfo();
		this.createBinaryRain();
            }, 5000);

            setTimeout(() => {
                this.animateSystemStats();
            }, 6000);

            // Show boot text after system stats are loaded
            setTimeout(() => {
                this.showBootText();
            }, 8000);
        }

        animateGridDisappear() {
            const blocks = document.querySelectorAll('.grid-block');
            blocks.forEach((block, index) => {
                setTimeout(() => {
                    block.style.animation = 'blockDisappear 0.5s ease-out forwards';
                }, Math.random() * 1000);
            });
        }

        showSystemInfo() {
            this.systemInfo.classList.add('show');
        }

        showBootText() {
            this.bootText.classList.add('show');
        }

        animateSystemStats() {
            const stats = [
                { id: 'cpu', value: 45, max: 100, unit: '%', temp: '52°C' },
                { id: 'memory', value: 72, max: 100, unit: '%', detail: '23GB / 32GB' }];

            stats.forEach((stat, index) => {
                setTimeout(() => {
                    this.animateStat(stat);
                }, index * 500);
            });

            setInterval(() => {
                this.updateStats();
            }, 4000);
        }

        animateStat(stat) {
            const valueElement = document.getElementById(stat.id + 'Value');
            const barElement = document.getElementById(stat.id + 'Bar');
            const segments = barElement.querySelectorAll('.stat-bar-segment');
            
            let currentValue = 0;
            const targetValue = stat.value;
            const increment = targetValue / 60;
            const totalSegments = segments.length;

            const animate = () => {
                if (currentValue < targetValue) {
                    currentValue += increment;
                    const displayValue = Math.min(Math.round(currentValue), targetValue);
                    valueElement.textContent = displayValue + stat.unit;
                    
                    // Animate segments
                    const activeSegments = Math.floor((displayValue / stat.max) * totalSegments);
                    segments.forEach((segment, index) => {
                        setTimeout(() => {
                            if (index < activeSegments) {
                                segment.classList.add('active');
                            }
                        }, index * 50);
                    });
                    
                    requestAnimationFrame(animate);
                } else {
                    // Update additional details
                    if (stat.id === 'cpu' && document.getElementById('cpuTemp')) {
                        document.getElementById('cpuTemp').textContent = stat.temp;
                    }
                    if (stat.detail) {
                        const detailElement = document.getElementById(stat.id === 'memory' ? 'memoryUsed' :
                                                                      stat.id === 'disk' ? 'diskUsed' : 'networkStatus');
                        if (detailElement) detailElement.textContent = stat.detail;
                    }
                }
            };
            animate();
        }

        updateStats() {
            const stats = [
                { id: 'cpu', min: 20, max: 80, unit: '%', tempMin: 45, tempMax: 70 },
                { id: 'memory', min: 60, max: 85, unit: '%' }
                // { id: 'disk', min: 35, max: 45, unit: '%' },
                // { id: 'network', min: 5, max: 50, unit: ' MB/s' }
            ];

            stats.forEach(stat => {
                const newValue = Math.floor(Math.random() * (stat.max - stat.min + 1)) + stat.min;
                const valueElement = document.getElementById(stat.id + 'Value');
                const barElement = document.getElementById(stat.id + 'Bar');
                const segments = barElement.querySelectorAll('.stat-bar-segment');
                
                valueElement.textContent = newValue + stat.unit;
                
                // Update segments
                const activeSegments = Math.floor((newValue / 100) * segments.length);
                segments.forEach((segment, index) => {
                    if (index < activeSegments) {
                        segment.classList.add('active');
                    } else {
                        segment.classList.remove('active');
                    }
                });

                // Update temperature for CPU
                if (stat.id === 'cpu' && stat.tempMin) {
                    const temp = Math.floor(Math.random() * (stat.tempMax - stat.tempMin + 1)) + stat.tempMin;
                    document.getElementById('cpuTemp').textContent = temp + '°C';
                }
            });
        }
    }

// loadFirstPage()
