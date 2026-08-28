// ==================== GAME STATE ==================== 
class ReflexGame {
    constructor() {
        this.isGameRunning = false;
        this.isWaiting = false;
        this.startTime = 0;
        this.reactionTime = 0;
        this.attempts = [];
        this.loadData();
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
    }

    // ==================== INITIALIZATION ==================== 
    initializeElements() {
        this.gameArea = document.getElementById('gameArea');
        this.gameStatus = document.getElementById('gameStatus');
        this.startButton = document.getElementById('startButton');
        this.reactButton = document.getElementById('reactButton');
        this.timerValue = document.getElementById('timerValue');
        this.resetButton = document.getElementById('resetButton');
        this.exportButton = document.getElementById('exportButton');
        this.attemptsTimeline = document.getElementById('attemptsTimeline');
        this.attemptsList = document.getElementById('attemptsList');
        this.bestRecord = document.getElementById('bestRecord');
        this.averageTime = document.getElementById('averageTime');
        this.totalAttempts = document.getElementById('totalAttempts');
        this.consistencyScore = document.getElementById('consistencyScore');
        this.progressFill = document.getElementById('progressFill');
        this.progressLabel = document.getElementById('progressLabel');
    }

    attachEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.reactButton.addEventListener('click', () => this.recordAttempt());
        this.resetButton.addEventListener('click', () => this.resetAllStats());
        this.exportButton.addEventListener('click', () => this.exportData());
    }

    // ==================== GAME LOGIC ==================== 
    startGame() {
        this.isGameRunning = true;
        this.startButton.disabled = true;
        this.gameArea.classList.add('active');
        this.gameStatus.textContent = 'Wait for the button...';
        this.reactButton.style.display = 'none';
        this.timerValue.textContent = '0ms';

        // Random delay before showing the react button (1-4 seconds)
        const delay = Math.random() * 3000 + 1000;
        
        setTimeout(() => {
            if (this.isGameRunning) {
                this.showReactButton();
            }
        }, delay);

        // Timeout after 30 seconds if user doesn't click
        setTimeout(() => {
            if (this.isGameRunning && this.isWaiting) {
                this.endGame();
            }
        }, 30000);
    }

    showReactButton() {
        if (!this.isGameRunning) return;
        
        this.isWaiting = true;
        this.startTime = Date.now();
        this.reactButton.style.display = 'inline-block';
        this.gameStatus.textContent = 'Click as fast as you can!';
        
        // Random position for the button
        const maxX = this.gameArea.clientWidth - this.reactButton.clientWidth - 20;
        const maxY = this.gameArea.clientHeight - this.reactButton.clientHeight - 20;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;
        
        this.reactButton.style.position = 'absolute';
        this.reactButton.style.left = randomX + 'px';
        this.reactButton.style.top = randomY + 'px';
    }

    recordAttempt() {
        if (!this.isWaiting) return;

        this.reactionTime = Date.now() - this.startTime;
        
        // Add attempt to history
        const attempt = {
            time: this.reactionTime,
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            rating: this.getRating(this.reactionTime)
        };

        this.attempts.push(attempt);
        this.saveData();
        
        this.timerValue.textContent = this.reactionTime + 'ms';
        this.gameStatus.textContent = this.getReactionMessage(this.reactionTime);
        
        this.endGame();
        this.updateUI();

        // Show feedback animation
        this.showFeedback(this.reactionTime);
    }

    endGame() {
        this.isGameRunning = false;
        this.isWaiting = false;
        this.reactButton.style.display = 'none';
        this.startButton.disabled = false;
        this.startButton.textContent = 'Play Again';
        this.gameArea.classList.remove('active');
    }

    // ==================== RATING & FEEDBACK ==================== 
    getRating(time) {
        if (time < 250) return 'excellent';
        if (time < 350) return 'good';
        if (time < 500) return 'average';
        return 'slow';
    }

    getReactionMessage(time) {
        const rating = this.getRating(time);
        const messages = {
            'excellent': '⚡ Lightning Fast! Incredible reflexes!',
            'good': '✨ Great! Very quick reaction!',
            'average': '👍 Not bad! Room for improvement!',
            'slow': '🐢 Need more practice! Keep training!'
        };
        return messages[rating] || 'Game Over!';
    }

    showFeedback(time) {
        const rating = this.getRating(time);
        const colors = {
            'excellent': '#10b981',
            'good': '#3b82f6',
            'average': '#f59e0b',
            'slow': '#ef4444'
        };

        this.gameArea.style.animation = 'none';
        setTimeout(() => {
            this.gameArea.style.boxShadow = `0 0 30px ${colors[rating]}`;
            this.gameArea.style.animation = 'pulse 0.5s ease';
        }, 10);

        setTimeout(() => {
            this.gameArea.style.boxShadow = 'var(--shadow-lg)';
        }, 1000);
    }

    // ==================== STATISTICS ==================== 
    getBestTime() {
        if (this.attempts.length === 0) return null;
        return Math.min(...this.attempts.map(a => a.time));
    }

    getAverageTime() {
        if (this.attempts.length === 0) return null;
        const sum = this.attempts.reduce((acc, a) => acc + a.time, 0);
        return Math.round(sum / this.attempts.length);
    }

    getConsistencyScore() {
        if (this.attempts.length < 2) return null;
        
        const average = this.getAverageTime();
        const variance = this.attempts.reduce((acc, a) => {
            return acc + Math.pow(a.time - average, 2);
        }, 0) / this.attempts.length;
        
        const stdDev = Math.sqrt(variance);
        
        // Score from 0-100, higher is more consistent
        const score = Math.max(0, 100 - (stdDev / 10));
        return Math.round(score);
    }

    getProgressLevel() {
        const best = this.getBestTime();
        if (!best) return { level: 'Beginner', percentage: 0 };
        
        let percentage = 0;
        let level = 'Beginner';

        if (best >= 500) {
            percentage = 10;
            level = 'Beginner';
        } else if (best >= 400) {
            percentage = 30;
            level = 'Novice';
        } else if (best >= 300) {
            percentage = 50;
            level = 'Intermediate';
        } else if (best >= 250) {
            percentage = 70;
            level = 'Advanced';
        } else if (best >= 200) {
            percentage = 85;
            level = 'Expert';
        } else if (best >= 150) {
            percentage = 95;
            level = 'Master';
        } else {
            percentage = 100;
            level = '🏆 Legend';
        }

        return { level, percentage };
    }

    // ==================== UI UPDATES ==================== 
    updateUI() {
        this.updateStats();
        this.updateTimeline();
        this.updateAttemptsList();
        this.updateProgressBar();
    }

    updateStats() {
        const best = this.getBestTime();
        const average = this.getAverageTime();
        const consistency = this.getConsistencyScore();

        this.bestRecord.textContent = best ? best + 'ms' : '--';
        this.averageTime.textContent = average ? average + 'ms' : '--';
        this.totalAttempts.textContent = this.attempts.length;
        this.consistencyScore.textContent = consistency ? consistency + '%' : '--';
    }

    updateTimeline() {
        if (this.attempts.length === 0) {
            this.attemptsTimeline.innerHTML = '<p class="empty-message">No attempts yet. Start playing!</p>';
            return;
        }

        const maxTime = Math.max(...this.attempts.map(a => a.time));
        const bars = this.attempts.slice(-20).map(attempt => {
            const percentage = (attempt.time / maxTime) * 100;
            const bar = document.createElement('div');
            bar.className = `attempt-bar ${attempt.rating}`;
            bar.style.height = percentage + '%';
            bar.title = `${attempt.time}ms - ${attempt.timestamp}`;
            return bar;
        });

        this.attemptsTimeline.innerHTML = '';
        bars.forEach(bar => this.attemptsTimeline.appendChild(bar));
    }

    updateAttemptsList() {
        if (this.attempts.length === 0) {
            this.attemptsList.innerHTML = '<p class="empty-message">No attempts yet.</p>';
            return;
        }

        const recentAttempts = this.attempts.slice(-10).reverse();
        const html = recentAttempts.map((attempt, index) => {
            const attemptNumber = this.attempts.length - index;
            return `
                <div class="attempt-item ${attempt.rating}">
                    <div class="attempt-info">
                        <span class="attempt-number">#${attemptNumber}</span>
                        <span class="attempt-time">${attempt.time}ms</span>
                        <span class="attempt-badge badge-${attempt.rating}">
                            ${attempt.rating.toUpperCase()}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        this.attemptsList.innerHTML = html;
    }

    updateProgressBar() {
        const { level, percentage } = this.getProgressLevel();
        this.progressFill.style.width = percentage + '%';
        this.progressLabel.textContent = level;
    }

    // ==================== DATA PERSISTENCE ==================== 
    saveData() {
        const data = {
            attempts: this.attempts,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('reflexGameData', JSON.stringify(data));
    }

    loadData() {
        try {
            const data = localStorage.getItem('reflexGameData');
            if (data) {
                const parsed = JSON.parse(data);
                this.attempts = parsed.attempts || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.attempts = [];
        }
    }

    // ==================== ACTIONS ==================== 
    resetAllStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            this.attempts = [];
            this.saveData();
            this.timerValue.textContent = '0ms';
            this.gameStatus.textContent = 'Stats reset! Ready to start?';
            this.updateUI();
            this.startButton.disabled = false;
            this.startButton.textContent = 'Start Game';
        }
    }

    exportData() {
        if (this.attempts.length === 0) {
            alert('No data to export yet. Complete some attempts first!');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalAttempts: this.attempts.length,
            bestTime: this.getBestTime(),
            averageTime: this.getAverageTime(),
            consistencyScore: this.getConsistencyScore(),
            progressLevel: this.getProgressLevel(),
            attempts: this.attempts
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reflex-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Data exported successfully!');
    }
}

// ==================== INITIALIZE GAME ==================== 
document.addEventListener('DOMContentLoaded', () => {
    const game = new ReflexGame();
});

// Prevent context menu on react button
document.addEventListener('contextmenu', (e) => {
    if (e.target.id === 'reactButton') {
        e.preventDefault();
    }
});
