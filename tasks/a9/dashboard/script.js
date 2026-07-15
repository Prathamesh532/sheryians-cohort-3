// APP STATE
const STATE = {
  theme: localStorage.getItem('theme') || 'light',
  todos: JSON.parse(localStorage.getItem('todos')) || [],
  goals: JSON.parse(localStorage.getItem('goals')) || [],
  planner: JSON.parse(localStorage.getItem('planner')) || {},
  pomodoro: {
    timeLeft: 25 * 60,
    isRunning: false,
    intervalId: null,
    mode: 'work' // 'work' or 'break'
  }
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initDateTime();
  initWeather();
  initBackground();
  
  initTodos();
  initGoals();
  initPlanner();
  initPomodoro();
  initQuotes();
});

// --- NAVIGATION ---
function initNavigation() {
  const dashCards = document.querySelectorAll('.dash-card');
  const views = document.querySelectorAll('.view');
  const backBtns = document.querySelectorAll('.btn-back');

  function switchView(targetId) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
  }

  dashCards.forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-target');
      switchView(target);
    });
  });

  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView('view-dashboard');
    });
  });
}

// --- THEME & BACKGROUND ---
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  
  function applyTheme() {
    if (STATE.theme === 'dark') {
      document.body.classList.add('theme-dark');
      icon.textContent = '☀️';
    } else {
      document.body.classList.remove('theme-dark');
      icon.textContent = '🌙';
    }
  }

  applyTheme(); // apply on load

  toggleBtn.addEventListener('click', () => {
    STATE.theme = STATE.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', STATE.theme);
    applyTheme();
  });
}

function initBackground() {
  const bg = document.getElementById('bg-overlay');
  const hour = new Date().getHours();
  
  let imageUrl = '';
  if (hour >= 5 && hour < 12) {
    imageUrl = 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2000'; // morning nature
  } else if (hour >= 12 && hour < 17) {
    imageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000'; // afternoon beach/bright
  } else if (hour >= 17 && hour < 21) {
    imageUrl = 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2000'; // sunset
  } else {
    imageUrl = 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?q=80&w=2000'; // night sky
  }
  
  bg.style.backgroundImage = `url('${imageUrl}')`;
}

// --- DATE & TIME ---
function initDateTime() {
  const timeEl = document.getElementById('current-time');
  const dateEl = document.getElementById('current-date');

  function update() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  update();
  setInterval(update, 1000);
}

// --- WEATHER WIDGET ---
async function initWeather() {
  const locEl = document.getElementById('weather-loc');
  const tempEl = document.getElementById('weather-temp');
  const iconEl = document.getElementById('weather-icon');
  const descEl = document.getElementById('weather-desc');

  // Default coordinates (London) if geolocation fails or is denied
  let lat = 51.5074;
  let lon = -0.1278;

  async function fetchWeather(latitude, longitude) {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      const temp = Math.round(data.current_weather.temperature);
      const code = data.current_weather.weathercode;
      
      // Simple weather code mapping
      let icon = '☁️';
      let desc = 'Cloudy';
      if (code === 0) { icon = '☀️'; desc = 'Clear sky'; }
      else if (code >= 1 && code <= 3) { icon = '⛅'; desc = 'Partly cloudy'; }
      else if (code >= 45 && code <= 48) { icon = '🌫️'; desc = 'Foggy'; }
      else if (code >= 51 && code <= 67) { icon = '🌧️'; desc = 'Rain'; }
      else if (code >= 71 && code <= 77) { icon = '❄️'; desc = 'Snow'; }
      else if (code >= 95) { icon = '⛈️'; desc = 'Thunderstorm'; }

      tempEl.textContent = `${temp}°C`;
      iconEl.textContent = icon;
      descEl.textContent = desc;
      locEl.textContent = 'Current Location';

    } catch (err) {
      tempEl.textContent = '--°';
      descEl.textContent = 'Weather unavailable';
      locEl.textContent = 'Offline';
    }
  }

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Fallback
        locEl.textContent = 'London (Fallback)';
        fetchWeather(lat, lon);
      }
    );
  } else {
    fetchWeather(lat, lon);
  }
}

// --- TODO LIST ---
function initTodos() {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');

  function render() {
    list.innerHTML = '';
    STATE.todos.forEach((todo, idx) => {
      const li = document.createElement('li');
      li.className = `task-item ${todo.completed ? 'completed' : ''} ${todo.important ? 'important' : ''}`;
      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" data-idx="${idx}" class="todo-check" ${todo.completed ? 'checked' : ''}>
          <span class="task-text">${todo.text}</span>
        </div>
        <div class="task-actions">
          <button data-idx="${idx}" class="task-btn todo-star ${todo.important ? 'active-star' : ''}">★</button>
          <button data-idx="${idx}" class="task-btn todo-delete">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });
    localStorage.setItem('todos', JSON.stringify(STATE.todos));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    STATE.todos.push({ text, completed: false, important: false });
    input.value = '';
    render();
  });

  list.addEventListener('click', (e) => {
    const idx = e.target.getAttribute('data-idx');
    if (idx === null) return;
    
    if (e.target.classList.contains('todo-check')) {
      STATE.todos[idx].completed = e.target.checked;
    } else if (e.target.classList.contains('todo-star')) {
      STATE.todos[idx].important = !STATE.todos[idx].important;
    } else if (e.target.classList.contains('todo-delete')) {
      STATE.todos.splice(idx, 1);
    }
    render();
  });

  render();
}

// --- DAILY GOALS ---
function initGoals() {
  const form = document.getElementById('goals-form');
  const input = document.getElementById('goal-input');
  const list = document.getElementById('goals-list');
  const textCount = document.getElementById('goals-count-text');
  const progressBar = document.getElementById('goals-progress-bar');
  const dashPreview = document.getElementById('goals-preview');

  function render() {
    list.innerHTML = '';
    let completedCount = 0;

    STATE.goals.forEach((goal, idx) => {
      if (goal.completed) completedCount++;
      const li = document.createElement('li');
      li.className = `task-item ${goal.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" data-idx="${idx}" class="goal-check" ${goal.completed ? 'checked' : ''}>
          <span class="task-text">${goal.text}</span>
        </div>
        <div class="task-actions">
          <button data-idx="${idx}" class="task-btn goal-delete">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });

    const total = STATE.goals.length;
    const progress = total === 0 ? 0 : (completedCount / total) * 100;
    
    const statusText = `${completedCount} of ${total} completed`;
    textCount.textContent = statusText;
    dashPreview.textContent = statusText;
    progressBar.style.width = `${progress}%`;

    localStorage.setItem('goals', JSON.stringify(STATE.goals));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    STATE.goals.push({ text, completed: false });
    input.value = '';
    render();
  });

  list.addEventListener('click', (e) => {
    const idx = e.target.getAttribute('data-idx');
    if (idx === null) return;
    
    if (e.target.classList.contains('goal-check')) {
      STATE.goals[idx].completed = e.target.checked;
    } else if (e.target.classList.contains('goal-delete')) {
      STATE.goals.splice(idx, 1);
    }
    render();
  });

  render();
}

// --- DAILY PLANNER ---
function initPlanner() {
  const container = document.getElementById('planner-slots');
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    const isCurrent = i === currentHour;
    const timeString = new Date(2000, 0, 1, i, 0).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    const slot = document.createElement('div');
    slot.className = `time-slot ${isCurrent ? 'current-hour' : ''}`;
    
    const val = STATE.planner[i] || '';
    
    slot.innerHTML = `
      <div class="time-label">${timeString}</div>
      <input type="text" class="time-input" data-hour="${i}" value="${val}" placeholder="Plan your hour...">
    `;
    container.appendChild(slot);
  }

  container.addEventListener('input', (e) => {
    if (e.target.classList.contains('time-input')) {
      const hour = e.target.getAttribute('data-hour');
      STATE.planner[hour] = e.target.value;
      localStorage.setItem('planner', JSON.stringify(STATE.planner));
    }
  });

  // Scroll to current hour automatically
  setTimeout(() => {
    const currentSlot = document.querySelector('.current-hour');
    if (currentSlot) {
      currentSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 500);
}

// --- POMODORO TIMER ---
function initPomodoro() {
  const display = document.getElementById('pomo-time');
  const title = document.getElementById('pomo-session-type');
  const btnStart = document.getElementById('btn-pomo-start');
  const btnPause = document.getElementById('btn-pomo-pause');
  const btnReset = document.getElementById('btn-pomo-reset');
  const btnWork = document.getElementById('btn-pomo-work');
  const btnBreak = document.getElementById('btn-pomo-break');

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  function updateDisplay() {
    const m = Math.floor(STATE.pomodoro.timeLeft / 60).toString().padStart(2, '0');
    const s = (STATE.pomodoro.timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
  }

  function setMode(mode) {
    clearInterval(STATE.pomodoro.intervalId);
    STATE.pomodoro.isRunning = false;
    STATE.pomodoro.mode = mode;
    STATE.pomodoro.timeLeft = mode === 'work' ? WORK_TIME : BREAK_TIME;
    
    title.textContent = mode === 'work' ? 'Work Session' : 'Break Time';
    btnWork.classList.toggle('active', mode === 'work');
    btnBreak.classList.toggle('active', mode === 'break');
    
    updateDisplay();
  }

  function tick() {
    if (STATE.pomodoro.timeLeft > 0) {
      STATE.pomodoro.timeLeft--;
      updateDisplay();
    } else {
      clearInterval(STATE.pomodoro.intervalId);
      STATE.pomodoro.isRunning = false;
      alert(`Pomodoro ${STATE.pomodoro.mode} session completed!`);
      // Auto toggle
      setMode(STATE.pomodoro.mode === 'work' ? 'break' : 'work');
    }
  }

  btnStart.addEventListener('click', () => {
    if (!STATE.pomodoro.isRunning) {
      STATE.pomodoro.isRunning = true;
      STATE.pomodoro.intervalId = setInterval(tick, 1000);
    }
  });

  btnPause.addEventListener('click', () => {
    STATE.pomodoro.isRunning = false;
    clearInterval(STATE.pomodoro.intervalId);
  });

  btnReset.addEventListener('click', () => {
    setMode(STATE.pomodoro.mode);
  });

  btnWork.addEventListener('click', () => setMode('work'));
  btnBreak.addEventListener('click', () => setMode('break'));

  updateDisplay();
}

// --- MOTIVATION QUOTES ---
async function initQuotes() {
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const btnNew = document.getElementById('btn-new-quote');

  async function fetchQuote() {
    quoteText.textContent = "Loading inspiration...";
    quoteAuthor.textContent = "";
    try {
      const res = await fetch('https://dummyjson.com/quotes/random');
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      
      quoteText.textContent = `"${data.quote}"`;
      quoteAuthor.textContent = `- ${data.author}`;
    } catch (err) {
      quoteText.textContent = "Failure is the opportunity to begin again more intelligently.";
      quoteAuthor.textContent = "- Henry Ford (Fallback)";
    }
  }

  btnNew.addEventListener('click', fetchQuote);
  
  // Fetch initial quote on load
  fetchQuote();
}
