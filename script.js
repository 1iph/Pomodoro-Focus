document.addEventListener("DOMContentLoaded", () => {
  const pomodoroBtn = document.getElementById('pomodoro');
  const shortBreakBtn = document.getElementById('short-break');
  const longBreakBtn = document.getElementById('long-break');
  const startBtn = document.querySelector('#start');
  const pauseBtn = document.querySelector('#pause');
  const restartBtn = document.querySelector('.restart');
  const countdownDisplay = document.querySelector('.countdown');

  let currentTime = 45 * 60;
  let timerInterval;
  let isPaused = false;

  function updateDisplay() {
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toString().padStart(2, '0');
    countdownDisplay.textContent = `${minutes}:${seconds}`;
  }

  function setActive(button) {
    document.querySelectorAll('.options button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }

  function setTime(minutes, button) {
    clearInterval(timerInterval);
    currentTime = minutes * 60;
    updateDisplay();
    setActive(button);
    startBtn.classList.add('active');
    pauseBtn.classList.remove('active');
  }

  pomodoroBtn.addEventListener('click', () => setTime(45, pomodoroBtn));
  shortBreakBtn.addEventListener('click', () => setTime(5, shortBreakBtn));
  longBreakBtn.addEventListener('click', () => setTime(15, longBreakBtn));

  startBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isPaused = false;
    startBtn.classList.remove('active');
    pauseBtn.classList.add('active');

    timerInterval = setInterval(() => {
      if (!isPaused) {
        currentTime--;
        updateDisplay();
        if (currentTime <= 0) {
          clearInterval(timerInterval);
          alert("⏰ Time's up!");
          startBtn.classList.add('active');
          pauseBtn.classList.remove('active');
        }
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    isPaused = true;
    pauseBtn.classList.remove('active');
    startBtn.classList.add('active');
  });

  restartBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentTime = 45 * 60;
    updateDisplay();
    setActive(pomodoroBtn);
    startBtn.classList.add('active');
    pauseBtn.classList.remove('active');
  });

  updateDisplay(); // Show initial time
});
