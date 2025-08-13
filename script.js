// --- Unified App Logic ---
document.addEventListener('DOMContentLoaded', function () {
  // SETTINGS MODAL
  const settingsBtn = document.getElementById('settings');
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  const pomodoroInput = document.getElementById('pomodoro-minutes');
  const shortInput = document.getElementById('short-minutes');
  const longInput = document.getElementById('long-minutes');
  const saveTimerBtn = document.getElementById('save-timer-settings');
  const volumeSlider = document.getElementById('settings-volume');
  const colorPicker = document.getElementById('theme-color-picker');
  const saveColorBtn = document.getElementById('save-theme-color');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const root = document.documentElement;

  // --- DARK MODE: Load preference on startup ---
  if (localStorage.getItem('darkMode') === 'true') {
    root.classList.add('dark-mode');
    if (darkModeToggle) darkModeToggle.checked = true;
  } else {
    root.classList.remove('dark-mode');
    if (darkModeToggle) darkModeToggle.checked = false;
  }

  // --- DARK MODE: Toggle on checkbox change ---
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function () {
      if (this.checked) {
        root.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        root.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
    });
  }

  // --- DARK MODE: Apply when Save Color is clicked ---
  if (saveColorBtn && darkModeToggle) {
    saveColorBtn.addEventListener('click', function () {
      // Save theme color as before
      if (colorPicker) {
        localStorage.setItem('themeColor', colorPicker.value);
        applyThemeColor(colorPicker.value);
      }
      // Apply dark mode state based on toggle
      if (darkModeToggle.checked) {
        root.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        root.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
      // Close modal and reload to apply color everywhere
      if (settingsModal) settingsModal.style.display = 'none';
      window.location.reload();
    });
  }

  // Open settings
  if (settingsBtn && settingsModal && settingsClose) {
    settingsBtn.addEventListener('click', function () {
      settingsModal.style.display = 'flex';
      pomodoroInput.value = localStorage.getItem('pomodoroMinutes') || 45;
      shortInput.value = localStorage.getItem('shortMinutes') || 5;
      longInput.value = localStorage.getItem('longMinutes') || 15;
      volumeSlider.value = localStorage.getItem('playerVolume') || 0.5;
      // Set color picker value to saved color or default
      const savedColor = localStorage.getItem('themeColor') || '#1bbcdc';
      if (colorPicker) colorPicker.value = savedColor;
      // Set dark mode toggle state
      if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
      }
    });
    settingsClose.addEventListener('click', function () {
      settingsModal.style.display = 'none';
    });
    settingsModal.addEventListener('click', function (e) {
      if (e.target === settingsModal) settingsModal.style.display = 'none';
    });
  }

  // Save timer settings
  if (saveTimerBtn) {
    saveTimerBtn.addEventListener('click', () => {
      localStorage.setItem('pomodoroMinutes', pomodoroInput.value);
      localStorage.setItem('shortMinutes', shortInput.value);
      localStorage.setItem('longMinutes', longInput.value);
      settingsModal.style.display = 'none';
      window.location.reload();
    });
  }

  // Volume control
  if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
      localStorage.setItem('playerVolume', this.value);
      const audio = document.querySelector('audio');
      if (audio) audio.volume = parseFloat(this.value);
    });
  }

  // Theme color change
  function applyThemeColor(color) {
    // Set on <html> for global effect
    document.documentElement.style.setProperty('--main-color', color);
    // Also set on <body> for legacy selectors if needed
    document.body.style.setProperty('--main-color', color);
  }
  // Apply theme color on load
  applyThemeColor(localStorage.getItem('themeColor') || '#1bbcdc');

  // MUSIC PLAYER
  const soundSources = {
    'nature': 'sounds/Nature.mp3',
    'rain': 'sounds/Rain.mp3',
    'fireplace': 'sounds/Fireplace.mp3',
    'white-noise': 'sounds/White Noise.mp3',
  };
  const musicSources = [
    'sounds/Lofi.mp3',
    'sounds/Classical.mp3',
    'sounds/Jazz.mp3',
    'sounds/Minecraft.mp3',
  ];
  let currentMusicIdx = 0;
  let currentMode = null;
  let currentSoundKey = null;
  let audio = document.createElement('audio');
  audio.preload = 'auto';
  audio.loop = true;
  document.body.appendChild(audio);
  let savedVol = localStorage.getItem('playerVolume');
  audio.volume = savedVol !== null ? parseFloat(savedVol) : 0.5;
  const playBtn = document.querySelector('.music-controls .play');
  const prevBtn = document.querySelector('.music-controls .previous');
  const nextBtn = document.querySelector('.music-controls .next');
  const currentTimeSpan = document.querySelector('.current-time');
  const totalTimeSpan = document.querySelector('.total-time');
  const progressBar = document.querySelector('.progress');
  function playAudio() {
    audio.play();
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  }
  function pauseAudio() {
    audio.pause();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
  playBtn.addEventListener('click', function () {
    if (!audio.src) return;
    if (audio.paused) playAudio();
    else pauseAudio();
  });
  audio.addEventListener('timeupdate', function () {
    if (audio.duration) {
      progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
      currentTimeSpan.textContent = formatTime(audio.currentTime);
      totalTimeSpan.textContent = formatTime(audio.duration);
    }
  });
  progressBar.parentElement.addEventListener('click', function (e) {
    if (!audio.duration) return;
    const rect = this.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  });
  function formatTime(sec) {
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60).toString().padStart(1, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
  function loadMusic(idx, play = false) {
    audio.src = musicSources[idx];
    audio.loop = true;
    currentMode = 'music';
    currentMusicIdx = idx;
    if (play) playAudio();
    else pauseAudio();
  }
  prevBtn.addEventListener('click', function () {
    if (!currentMode) return;
    if (currentMode === 'music') {
      currentMusicIdx = (currentMusicIdx - 1 + musicSources.length) % musicSources.length;
      loadMusic(currentMusicIdx, true);
    } else if (currentMode === 'sound') {
      const keys = Object.keys(soundSources);
      let idx = keys.indexOf(currentSoundKey);
      idx = (idx - 1 + keys.length) % keys.length;
      playSound(keys[idx]);
    }
  });
  nextBtn.addEventListener('click', function () {
    if (!currentMode) return;
    if (currentMode === 'music') {
      currentMusicIdx = (currentMusicIdx + 1) % musicSources.length;
      loadMusic(currentMusicIdx, true);
    } else if (currentMode === 'sound') {
      const keys = Object.keys(soundSources);
      let idx = keys.indexOf(currentSoundKey);
      idx = (idx + 1) % keys.length;
      playSound(keys[idx]);
    }
  });
  function playSound(key) {
    audio.src = soundSources[key];
    audio.loop = true;
    currentMode = 'sound';
    currentSoundKey = key;
    playAudio();
  }
  Object.keys(soundSources).forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      el.addEventListener('click', function () {
        playSound(key);
      });
    }
  });
  const musicOptionIds = ['lofi-music', 'classical', 'jazz', 'minecraft'];
  musicOptionIds.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function () {
        loadMusic(idx % musicSources.length, true);
      });
    }
  });
  audio.src = '';
  pauseAudio();

  // TO-DO LIST
  const tasksContainer = document.querySelector('.tasks');
  const addBtn = document.getElementById('add');
  const input = document.querySelector('.task-container input[type="text"]');
  const clearBtn = document.getElementById('clear');
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasksContainer.innerHTML = '';
    tasks.forEach((task, idx) => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'task';
      if (task.completed) taskDiv.classList.add('completed');
      const leftDiv = document.createElement('div');
      leftDiv.className = 'task-left';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => toggleTask(idx));
      const p = document.createElement('p');
      p.textContent = task.text;
      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(p);
      const trash = document.createElement('i');
      trash.className = 'fa-solid fa-trash-can';
      trash.addEventListener('click', () => deleteTask(idx));
      taskDiv.appendChild(leftDiv);
      taskDiv.appendChild(trash);
      tasksContainer.appendChild(taskDiv);
    });
  }
  function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  function addTask() {
    const text = input.value.trim();
    if (!text) return;
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push({ text, completed: false });
    saveTasks(tasks);
    input.value = '';
    loadTasks();
  }
  function toggleTask(idx) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks(tasks);
    loadTasks();
  }
  function deleteTask(idx) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.splice(idx, 1);
    saveTasks(tasks);
    loadTasks();
  }
  function clearCompleted() {
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks = tasks.filter(task => !task.completed);
    saveTasks(tasks);
    loadTasks();
  }
  addBtn.addEventListener('click', addTask);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
  });
  clearBtn.addEventListener('click', clearCompleted);
  loadTasks();

  // TIMER
  const pomodoroBtn = document.getElementById('pomodoro');
  const shortBreakBtn = document.getElementById('short-break');
  const longBreakBtn = document.getElementById('long-break');
  const startBtn = document.querySelector('#start');
  const pauseBtn = document.querySelector('#pause');
  const restartBtn = document.querySelector('.restart');
  const countdownDisplay = document.querySelector('.countdown');
  let currentTime = (parseInt(localStorage.getItem('pomodoroMinutes')) || 45) * 60;
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
  pomodoroBtn.addEventListener('click', () => setTime(parseInt(localStorage.getItem('pomodoroMinutes')) || 45, pomodoroBtn));
  shortBreakBtn.addEventListener('click', () => setTime(parseInt(localStorage.getItem('shortMinutes')) || 5, shortBreakBtn));
  longBreakBtn.addEventListener('click', () => setTime(parseInt(localStorage.getItem('longMinutes')) || 15, longBreakBtn));
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
    currentTime = (parseInt(localStorage.getItem('pomodoroMinutes')) || 45) * 60;
    updateDisplay();
    setActive(pomodoroBtn);
    startBtn.classList.add('active');
    pauseBtn.classList.remove('active');
  });
  updateDisplay();
});