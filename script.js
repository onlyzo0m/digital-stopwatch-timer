// Digital Stopwatch & Timer Logic with Smooth Indicators and Fade Transitions

document.addEventListener('DOMContentLoaded', () => {

    // DOM Element selections
    const navHome = document.getElementById('nav-home');
    const navAbout = document.getElementById('nav-about');
    const navIndicator = document.getElementById('nav-indicator');

    const tabStopwatch = document.getElementById('tab-stopwatch');
    const tabTimer = document.getElementById('tab-timer');
    const tabIndicator = document.getElementById('tab-indicator');

    const stopwatchSection = document.getElementById('stopwatch-section');
    const timerSection = document.getElementById('timer-section');
    const mainWrapper = document.getElementById('main-wrapper');

    const aboutModal = document.getElementById('about-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Stopwatch DOM elements
    const swDisplay = document.getElementById('stopwatch-display');
    const swStartBtn = document.getElementById('sw-start-btn');
    const swStartLabel = document.getElementById('sw-start-label');
    const swPlayIcon = swStartBtn.querySelector('.icon-play');
    const swPauseIcon = swStartBtn.querySelector('.icon-pause');
    const swLapBtn = document.getElementById('sw-lap-btn');
    const swResetBtn = document.getElementById('sw-reset-btn');
    const lapsList = document.getElementById('laps-list');
    const clearLapsBtn = document.getElementById('clear-laps-btn');

    // Timer DOM elements
    const tmDisplay = document.getElementById('timer-display');
    const tmHoursInput = document.getElementById('timer-hours');
    const tmMinutesInput = document.getElementById('timer-minutes');
    const tmSecondsInput = document.getElementById('timer-seconds');
    const tmStartBtn = document.getElementById('tm-start-btn');
    const tmStartLabel = document.getElementById('tm-start-label');
    const tmPlayIcon = tmStartBtn.querySelector('.icon-play');
    const tmPauseIcon = tmStartBtn.querySelector('.icon-pause');
    const tmResetBtn = document.getElementById('tm-reset-btn');

    // State variables
    let swStartTime = 0;
    let swElapsedTime = 0;
    let swTimerInterval = null;
    let swIsRunning = false;
    let lapCount = 0;

    let tmRemainingTime = 300000;
    let tmTimerInterval = null;
    let tmIsRunning = false;
    let tmInitialTime = 300000;

    // Helper: Position sliding line indicators smoothly
    function updateSlidingIndicator(activeElement, indicatorElement) {
        if (!activeElement || !indicatorElement) return;
        const container = indicatorElement.parentElement;
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();

        const offsetLeft = elementRect.left - containerRect.left;
        indicatorElement.style.left = `${offsetLeft}px`;
        indicatorElement.style.width = `${elementRect.width}px`;
    }

    // Initialize indicators after layout paint
    setTimeout(() => {
        const activeNav = document.querySelector('.nav-item.active');
        const activeTab = document.querySelector('.tab-btn.active');
        updateSlidingIndicator(activeNav, navIndicator);
        updateSlidingIndicator(activeTab, tabIndicator);
    }, 50);

    window.addEventListener('resize', () => {
        const activeNav = document.querySelector('.nav-item.active');
        const activeTab = document.querySelector('.tab-btn.active');
        updateSlidingIndicator(activeNav, navIndicator);
        updateSlidingIndicator(activeTab, tabIndicator);
    });

    // Time Formatting
    function formatTime(timeInMs) {
        if (timeInMs < 0) timeInMs = 0;

        const hours = Math.floor(timeInMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((timeInMs % 1000) / 10);

        const padHours = String(hours).padStart(2, '0');
        const padMinutes = String(minutes).padStart(2, '0');
        const padSeconds = String(seconds).padStart(2, '0');
        const padMs = String(milliseconds).padStart(2, '0');

        return `${padHours}:${padMinutes}:${padSeconds}.${padMs}`;
    }

    function updateStopwatch() {
        const currentTime = performance.now();
        const nowElapsed = swElapsedTime + (currentTime - swStartTime);
        swDisplay.textContent = formatTime(nowElapsed);
        swTimerInterval = requestAnimationFrame(updateStopwatch);
    }

    function toggleStopwatch() {
        if (!swIsRunning) {
            swIsRunning = true;
            swStartTime = performance.now();
            swTimerInterval = requestAnimationFrame(updateStopwatch);

            swStartLabel.textContent = 'Pause';
            swPlayIcon.classList.add('d-none');
            swPauseIcon.classList.remove('d-none');
            swLapBtn.disabled = false;
            swResetBtn.disabled = false;
        } else {
            swIsRunning = false;
            cancelAnimationFrame(swTimerInterval);
            swElapsedTime += performance.now() - swStartTime;

            swStartLabel.textContent = 'Start';
            swPlayIcon.classList.remove('d-none');
            swPauseIcon.classList.add('d-none');
            swLapBtn.disabled = false;
            swResetBtn.disabled = false;
        }
    }

    function recordLap() {
        if (swElapsedTime === 0 && !swIsRunning) return;

        const currentLapMs = swIsRunning 
            ? swElapsedTime + (performance.now() - swStartTime) 
            : swElapsedTime;
            
        const formattedLapTime = formatTime(currentLapMs);
        lapCount++;

        const emptyMsg = lapsList.querySelector('.empty-laps-msg');
        if (emptyMsg) {
            emptyMsg.remove();
        }

        const lapItem = document.createElement('li');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">Lap ${lapCount}</span>
            <span class="lap-separator">—</span>
            <span class="lap-time">${formattedLapTime}</span>
        `;

        lapsList.insertBefore(lapItem, lapsList.firstChild);
    }

    function resetStopwatch() {
        swIsRunning = false;
        cancelAnimationFrame(swTimerInterval);
        swElapsedTime = 0;
        swStartTime = 0;

        swDisplay.textContent = '00:00:00.00';

        swStartLabel.textContent = 'Start';
        swPlayIcon.classList.remove('d-none');
        swPauseIcon.classList.add('d-none');
        swLapBtn.disabled = true;
        swResetBtn.disabled = true;
    }

    function clearLaps() {
        lapsList.innerHTML = '<li class="empty-laps-msg">No laps recorded yet.</li>';
        lapCount = 0;
    }

    function getTimerInputInMs() {
        const hrs = parseInt(tmHoursInput.value, 10) || 0;
        const mins = parseInt(tmMinutesInput.value, 10) || 0;
        const secs = parseInt(tmSecondsInput.value, 10) || 0;

        return ((hrs * 3600) + (mins * 60) + secs) * 1000;
    }

    function playAlarmSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            
            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = 880;
                
                gain.gain.setValueAtTime(0.3, ctx.currentTime + (i * 0.25));
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i * 0.25) + 0.2);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + (i * 0.25));
                osc.stop(ctx.currentTime + (i * 0.25) + 0.2);
            }
        } catch (e) {
            console.log('Audio notification fallback:', e);
        }
    }

    function toggleTimer() {
        if (!tmIsRunning) {
            if (tmRemainingTime <= 0) {
                tmRemainingTime = getTimerInputInMs();
                tmInitialTime = tmRemainingTime;
            }

            if (tmRemainingTime <= 0) {
                alert('Please enter a valid time duration.');
                return;
            }

            tmIsRunning = true;
            let lastTick = performance.now();

            tmHoursInput.disabled = true;
            tmMinutesInput.disabled = true;
            tmSecondsInput.disabled = true;

            tmStartLabel.textContent = 'Pause';
            tmPlayIcon.classList.add('d-none');
            tmPauseIcon.classList.remove('d-none');

            function timerStep() {
                const now = performance.now();
                const delta = now - lastTick;
                lastTick = now;

                tmRemainingTime -= delta;

                if (tmRemainingTime <= 0) {
                    tmRemainingTime = 0;
                    tmDisplay.textContent = '00:00:00.00';
                    resetTimerUI();
                    playAlarmSound();
                    setTimeout(() => alert('⏰ Time is up!'), 50);
                    return;
                }

                tmDisplay.textContent = formatTime(tmRemainingTime);
                tmTimerInterval = requestAnimationFrame(timerStep);
            }

            tmTimerInterval = requestAnimationFrame(timerStep);
        } else {
            tmIsRunning = false;
            cancelAnimationFrame(tmTimerInterval);

            tmStartLabel.textContent = 'Start';
            tmPlayIcon.classList.remove('d-none');
            tmPauseIcon.classList.add('d-none');
        }
    }

    function resetTimerUI() {
        tmIsRunning = false;
        cancelAnimationFrame(tmTimerInterval);

        tmHoursInput.disabled = false;
        tmMinutesInput.disabled = false;
        tmSecondsInput.disabled = false;

        tmStartLabel.textContent = 'Start';
        tmPlayIcon.classList.remove('d-none');
        tmPauseIcon.classList.add('d-none');
    }

    function resetTimer() {
        resetTimerUI();
        tmRemainingTime = getTimerInputInMs();
        if (tmRemainingTime <= 0) tmRemainingTime = 300000;
        tmDisplay.textContent = formatTime(tmRemainingTime);
    }

    // Event listeners
    swStartBtn.addEventListener('click', toggleStopwatch);
    swLapBtn.addEventListener('click', recordLap);
    swResetBtn.addEventListener('click', resetStopwatch);
    clearLapsBtn.addEventListener('click', clearLaps);

    tmStartBtn.addEventListener('click', toggleTimer);
    tmResetBtn.addEventListener('click', resetTimer);

    [tmHoursInput, tmMinutesInput, tmSecondsInput].forEach(input => {
        input.addEventListener('input', () => {
            if (!tmIsRunning) {
                tmRemainingTime = getTimerInputInMs();
                tmDisplay.textContent = formatTime(tmRemainingTime);
            }
        });
    });

    // Smooth tab switching between Stopwatch and Timer with Fade effect
    function switchTab(newTab, targetSection, otherTab, otherSection) {
        if (newTab.classList.contains('active')) return;

        otherTab.classList.remove('active');
        newTab.classList.add('active');
        updateSlidingIndicator(newTab, tabIndicator);

        // Fade out current section and fade in target section smoothly
        otherSection.style.opacity = '0';
        otherSection.style.transform = 'translateY(10px)';

        setTimeout(() => {
            otherSection.classList.remove('active');
            targetSection.classList.add('active');
            // Trigger reflow for CSS transition
            void targetSection.offsetWidth;
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 200);
    }

    tabStopwatch.addEventListener('click', () => {
        switchTab(tabStopwatch, stopwatchSection, tabTimer, timerSection);
    });

    tabTimer.addEventListener('click', () => {
        switchTab(tabTimer, timerSection, tabStopwatch, stopwatchSection);
        tmRemainingTime = getTimerInputInMs();
        tmDisplay.textContent = formatTime(tmRemainingTime);
    });

    // Smooth Navigation & About Modal Fade Transitions
    navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        navHome.classList.remove('active');
        navAbout.classList.add('active');
        updateSlidingIndicator(navAbout, navIndicator);

        aboutModal.classList.add('active');
    });

    function closeAboutModal() {
        aboutModal.classList.remove('active');
        navAbout.classList.remove('active');
        navHome.classList.add('active');
        updateSlidingIndicator(navHome, navIndicator);
    }

    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        closeAboutModal();
    });

    modalCloseBtn.addEventListener('click', closeAboutModal);

    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            closeAboutModal();
        }
    });

});
