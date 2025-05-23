// 75-Day Hard Tracker JavaScript

class HardTracker {
    constructor() {
        this.tasks = [
            'workout12', 'intense', 'steps', 'water', 'calories', 
            'nocheat', 'dsa', 'webdev', 'aptitude', 'video', 'meditation'
        ];
        
        this.taskNames = {
            'workout12': 'Morning 12-min Workout',
            'intense': 'Intense Workout',
            'steps': '10,000 Steps',
            'water': '9 Glasses of Water',
            'calories': '1300/1500 Calories',
            'nocheat': 'No Cheat Food',
            'dsa': '6 Hours DSA',
            'webdev': '2 Hours Web Dev',
            'aptitude': '2 Hours Aptitude + Core',
            'video': '1-min Video',
            'meditation': 'Meditation'
        };
        
        this.currentDay = 1;
        this.startDate = null;
        this.challengeData = {};
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        
        // Check if challenge is already started
        if (this.startDate) {
            this.showTracker();
        } else {
            this.showSetup();
        }
    }
    
    setupEventListeners() {
        // Setup form
        document.getElementById('startChallenge').addEventListener('click', () => {
            this.startChallenge();
        });
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Task checkboxes
        this.tasks.forEach(task => {
            const checkbox = document.getElementById(task);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updateTask(task, e.target.checked);
                });
            }
        });
        
        // Extra notes
        document.getElementById('extraNotes').addEventListener('input', (e) => {
            this.updateExtraNotes(e.target.value);
        });
        
        // Day navigation
        document.getElementById('prevDay').addEventListener('click', () => {
            this.changeDay(-1);
        });
        
        document.getElementById('nextDay').addEventListener('click', () => {
            this.changeDay(1);
        });
        
        // Reset button
        document.getElementById('resetChallenge').addEventListener('click', () => {
            this.resetChallenge();
        });
    }
    
    startChallenge() {
        const startDateInput = document.getElementById('startDate');
        if (!startDateInput.value) {
            alert('Please select a start date');
            return;
        }
        
        this.startDate = new Date(startDateInput.value);
        this.currentDay = this.calculateCurrentDay();
        this.saveData();
        this.showTracker();
        this.updateDisplay();
    }
    
    calculateCurrentDay() {
        if (!this.startDate) return 1;
        
        const today = new Date();
        const diffTime = today - this.startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return Math.max(1, Math.min(75, diffDays));
    }
    
    showSetup() {
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('trackerSection').style.display = 'none';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
    }
    
    showTracker() {
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('trackerSection').style.display = 'block';
        this.loadDayData();
        this.generateCalendar();
        this.updateProgress();
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Refresh calendar if switching to calendar tab
        if (tabName === 'calendar') {
            this.generateCalendar();
        }
        
        // Refresh progress if switching to progress tab
        if (tabName === 'progress') {
            this.updateProgress();
        }
    }
    
    updateTask(taskName, completed) {
        if (!this.challengeData[this.currentDay]) {
            this.challengeData[this.currentDay] = {};
        }
        
        this.challengeData[this.currentDay][taskName] = completed;
        this.saveData();
        this.updateTaskUI(taskName, completed);
        this.updateDisplay();
    }
    
    updateTaskUI(taskName, completed) {
        const taskItem = document.querySelector(`[data-task="${taskName}"]`);
        if (taskItem) {
            taskItem.classList.toggle('completed', completed);
        }
    }
    
    updateExtraNotes(notes) {
        if (!this.challengeData[this.currentDay]) {
            this.challengeData[this.currentDay] = {};
        }
        
        this.challengeData[this.currentDay].extraNotes = notes;
        this.saveData();
    }
    
    changeDay(direction) {
        const newDay = this.currentDay + direction;
        if (newDay >= 1 && newDay <= 75) {
            this.currentDay = newDay;
            this.loadDayData();
            this.updateDisplay();
        }
    }
    
    loadDayData() {
        const dayData = this.challengeData[this.currentDay] || {};
        
        // Update task checkboxes
        this.tasks.forEach(task => {
            const checkbox = document.getElementById(task);
            if (checkbox) {
                checkbox.checked = dayData[task] || false;
                this.updateTaskUI(task, checkbox.checked);
            }
        });
        
        // Update extra notes
        const extraNotes = document.getElementById('extraNotes');
        if (extraNotes) {
            extraNotes.value = dayData.extraNotes || '';
        }
        
        // Update day display
        document.getElementById('dayNumber').textContent = this.currentDay;
        
        // Update current date display
        const currentDate = new Date(this.startDate);
        currentDate.setDate(currentDate.getDate() + this.currentDay - 1);
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update navigation buttons
        document.getElementById('prevDay').disabled = this.currentDay === 1;
        document.getElementById('nextDay').disabled = this.currentDay === 75;
    }
    
    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        for (let day = 1; day <= 75; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="completion-percentage"></div>
            `;
            
            // Calculate completion status
            const dayData = this.challengeData[day] || {};
            const completedTasks = this.tasks.filter(task => dayData[task]).length;
            const completionPercentage = Math.round((completedTasks / this.tasks.length) * 100);
            
            // Set day status
            const actualDay = this.calculateCurrentDay();
            if (day === this.currentDay) {
                dayElement.classList.add('current');
            } else if (day > actualDay) {
                dayElement.classList.add('future');
            } else if (completionPercentage === 100) {
                dayElement.classList.add('completed');
            } else if (completionPercentage > 0) {
                dayElement.classList.add('partial');
            }
            
            // Show completion percentage
            if (completionPercentage > 0 && day <= actualDay) {
                dayElement.querySelector('.completion-percentage').textContent = `${completionPercentage}%`;
            }
            
            // Add click event to navigate to day
            dayElement.addEventListener('click', () => {
                if (day <= actualDay) {
                    this.currentDay = day;
                    this.switchTab('daily');
                    this.loadDayData();
                    this.updateDisplay();
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    updateProgress() {
        const actualDay = this.calculateCurrentDay();
        const totalDaysCompleted = Math.min(actualDay - 1, 75);
        
        // Calculate overall progress
        let totalPossibleTasks = totalDaysCompleted * this.tasks.length;
        let totalCompletedTasks = 0;
        
        for (let day = 1; day <= totalDaysCompleted; day++) {
            const dayData = this.challengeData[day] || {};
            totalCompletedTasks += this.tasks.filter(task => dayData[task]).length;
        }
        
        const overallPercentage = totalPossibleTasks > 0 ? 
            Math.round((totalCompletedTasks / totalPossibleTasks) * 100) : 0;
        
        // Update overall progress bar
        document.getElementById('overallProgress').style.width = `${overallPercentage}%`;
        document.getElementById('overallPercentage').textContent = `${overallPercentage}%`;
        
        // Update task-wise progress
        this.updateTaskProgress(totalDaysCompleted);
    }
    
    updateTaskProgress(totalDaysCompleted) {
        const taskProgressBars = document.getElementById('taskProgressBars');
        taskProgressBars.innerHTML = '';
        
        this.tasks.forEach(task => {
            let taskCompletedDays = 0;
            
            for (let day = 1; day <= totalDaysCompleted; day++) {
                const dayData = this.challengeData[day] || {};
                if (dayData[task]) {
                    taskCompletedDays++;
                }
            }
            
            const taskPercentage = totalDaysCompleted > 0 ? 
                Math.round((taskCompletedDays / totalDaysCompleted) * 100) : 0;
            
            const taskProgressItem = document.createElement('div');
            taskProgressItem.className = 'task-progress-item';
            taskProgressItem.innerHTML = `
                <div class="task-name">${this.taskNames[task]}</div>
                <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width: ${taskPercentage}%"></div>
                </div>
                <div class="task-percentage">${taskPercentage}%</div>
            `;
            
            taskProgressBars.appendChild(taskProgressItem);
        });
    }
    
    updateDisplay() {
        const actualDay = this.calculateCurrentDay();
        const daysLeft = Math.max(0, 75 - actualDay + 1);
        const streak = this.calculateStreak();
        
        // Update header stats
        document.getElementById('currentDay').textContent = actualDay;
        document.getElementById('daysLeft').textContent = daysLeft;
        document.getElementById('streak').textContent = streak;
    }
    
    calculateStreak() {
        let streak = 0;
        const actualDay = this.calculateCurrentDay();
        
        // Calculate streak from current day backwards
        for (let day = Math.min(actualDay - 1, 75); day >= 1; day--) {
            const dayData = this.challengeData[day] || {};
            const completedTasks = this.tasks.filter(task => dayData[task]).length;
            
            if (completedTasks === this.tasks.length) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    resetChallenge() {
        if (confirm('Are you sure you want to reset your entire challenge? This cannot be undone.')) {
            // Clear all data
            this.challengeData = {};
            this.startDate = null;
            this.currentDay = 1;
            
            // Clear storage
            localStorage.removeItem('hardTrackerData');
            localStorage.removeItem('hardTrackerStartDate');
            
            // Show setup section
            this.showSetup();
            this.updateDisplay();
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('hardTrackerData', JSON.stringify(this.challengeData));
            if (this.startDate) {
                localStorage.setItem('hardTrackerStartDate', this.startDate.toISOString());
            }
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
            // Fallback: Keep data in memory for the session
        }
    }
    
    loadData() {
        try {
            // Load challenge data
            const savedData = localStorage.getItem('hardTrackerData');
            if (savedData) {
                this.challengeData = JSON.parse(savedData);
            }
            
            // Load start date
            const savedStartDate = localStorage.getItem('hardTrackerStartDate');
            if (savedStartDate) {
                this.startDate = new Date(savedStartDate);
                this.currentDay = this.calculateCurrentDay();
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
            // Continue with empty data
            this.challengeData = {};
            this.startDate = null;
        }
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HardTracker();
});