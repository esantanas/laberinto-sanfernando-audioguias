/* ============================================================
   LABERINTO SAN FERNANDO — LÓGICA DEL TOUR DE AUDIO
   ============================================================
   Este script maneja:
   1. Los datos de los puntos del tour (título, texto, audio).
   2. La navegación Atrás / Siguiente entre puntos.
   3. El reproductor de audio personalizado (play/pause, tiempo).
   4. El dibujo del waveform (forma de onda) en un <canvas>,
      usando la Web Audio API para decodificar el archivo real
      y así generar una forma de onda "real" del audio.
   ============================================================ */

/* -------------------- 1. DATOS DE LOS PUNTOS -------------------- */
/*
  Para usar tus propios contenidos:
  - Cambia "title", "description" y "trackName" por tu texto real.
  - Cambia "audioSrc" para que apunte a tu archivo de audio dentro
    de la carpeta /audio (ej: "audio/punto1.wav").
  - Si agregas más puntos, solo añade más objetos a este arreglo;
    la navegación se adapta automáticamente al total de puntos.
*/
const tourPoints = [
  {
    index: 1,
    title: "Laberinto de Pinos",
    slug: "pinos",
    trackName: "1. Laberinto de Pinos",
    description:
      "Te encuentras ante nuestro desafío principal, una estructura viva esculpida directamente en la naturaleza. " +
      "Los imponentes muros de pino purifican el aire mientras ocultan la salida entre sus pasillos. " +
      "Respira hondo el aroma del bosque y acepta el desafío.",
    audioSrc: "audio/01-laberinto-pinos.mp3"
  },
  {
    index: 2,
    title: "El Guardián del Laberinto",
    slug: "guardian",
    trackName: "2. El Guardián del Laberinto",
    description:
      "Frente a ti se alza la mítica figura de Creta, el gran símbolo de este recorrido. " +
      "Contempla los detalles de la escultura y activa el audio para descubrir la fascinante " +
      "historia del monstruo que dio origen a todos los laberintos del mundo.",
    audioSrc: "audio/02-guardian-minotauro.mp3"
  },
  {
    index: 3,
    title: "Laberinto de Madera",
    slug: "madera",
    trackName: "3. Laberinto de Madera",
    description:
      "Estas empalizadas de troncos no solo ocultan el camino, sino que te desafían a superar puentes, " +
      "cuerdas flojas y postes de equilibrio. Una aventura rústica diseñada para los más exploradores. " +
      "Ajusta tus zapatillas, mantén la concentración y demuestra tu destreza.",
    audioSrc: "audio/03-laberinto-madera.mp3"
  },
  {
    index: 4,
    title: "Laberinto de Lavanda",
    slug: "lavanda",
    trackName: "4. Laberinto de Lavanda",
    description:
      "Bienvenido al rincón más relajante del parque. " +
      "Aquí los tonos violetas y el perfume natural de las flores se combinan para liberar el estrés " +
      "y reconectarte con el entorno. " +
      "Camina despacio, respira profundo y deja que el aroma sea tu guía.",
    audioSrc: "audio/04-laberinto-lavanda.mp3"
  },
  {
    index: 5,
    title: "Laberinto de Espejos",
    slug: "espejos",
    trackName: "5. Laberinto de Espejos",
    description:
      "Estás a punto de entrar a un mundo de ilusiones infinitas. " +
      "A tu alrededor, los reflejos se multiplicarán en ángulos precisos para confundir a tu cerebro. " +
      "Avanza con calma, confía en tus manos y descubre qué es real y qué es solo un reflejo.",
    audioSrc: "audio/05-laberinto-espejos.mp3"
  },
  {
    index: 6,
    title: "Mini Granja Educativa",
    slug: "granja",
    trackName: "6. Mini Granja Educativa",
    description:
      "Los elegantes pavos reales y los pacíficos ciervitos te dan la bienvenida a este rincón lleno de vida. " +
      "Descubre la historia mística de estos animales, el secreto de sus plumas y el poder de sus cornamentas " +
      "mientras disfrutas de su tranquilidad.",
    audioSrc: "audio/06-mini-granja.mp3"
  },
  {
    index: 7,
    title: "Jardín de Tulipanes",
    slug: "tulipanes",
    trackName: "7. Jardín de Tulipanes",
    description:
      "Un estallido de elegancia y color te da la bienvenida a este rincón primaveral. " +
      "Descubre la fascinante historia de los tulipanes, el secreto de su simetría y el origen de su fama mundial " +
      "mientras disfrutas de su efímero esplendor.",
    audioSrc: "audio/07-jardin-tulipanes.mp3"
  },
  {
    index: 8,
    title: "Jardín de Girasoles",
    slug: "girasoles",
    trackName: "8. Jardín de Girasoles",
    description:
      "Los imponentes gigantes dorados te dan la bienvenida a este rincón lleno de luz y energía. " +
      "Descubre la historia sagrada de los girasoles, el misterio de su danza persiguiendo al sol " +
      "y su geometría perfecta mientras contemplas su calidez veraniega.",
    audioSrc: "audio/08-jardin-girasoles.mp3"
  }
];

/* -------------------- 2. PUNTO DE ENTRADA DESDE EL QR -------------------- */
/*
  CÓMO FUNCIONA EL QR:
  Cada cartel del laberinto lleva un QR con una URL distinta, pero todas
  apuntan al MISMO index.html. Lo que cambia es el parámetro "?punto=":

      https://laberintosanfernando.cl/?punto=1   -> Laberinto de Pinos
      https://laberintosanfernando.cl/?punto=2   -> El Guardián del Laberinto
      https://laberintosanfernando.cl/?punto=3   -> Laberinto de Madera
      https://laberintosanfernando.cl/?punto=4   -> Laberinto de Lavanda
      https://laberintosanfernando.cl/?punto=5   -> Laberinto de Espejos
      https://laberintosanfernando.cl/?punto=6   -> Mini Granja Educativa
      https://laberintosanfernando.cl/?punto=7   -> Jardín de Tulipanes
      https://laberintosanfernando.cl/?punto=8   -> Jardín de Girasoles

  También acepta el "slug" (nombre corto) en vez del número, si prefieres
  URLs más legibles para el visitante:

      https://laberintosanfernando.cl/?punto=pinos
      https://laberintosanfernando.cl/?punto=tulipanes

  Si la URL no trae parámetro (o trae uno inválido), arranca en el Punto 1.
*/
function getStartIndexFromURL() {
  const params = new URLSearchParams(window.location.search);
  // Acepta ?punto=  y también ?p=  como alias corto (QR más pequeño).
  const raw = (params.get("punto") || params.get("p") || "").trim().toLowerCase();

  if (!raw) return 0;

  // SEGURIDAD: limitamos la longitud y los caracteres aceptados.
  // Solo permitimos letras, números y guiones. Cualquier otra cosa
  // (comillas, <, >, barras, etc.) se descarta de inmediato.
  if (raw.length > 32 || !/^[a-z0-9-]+$/.test(raw)) return 0;

  // Caso 1: viene un número (?punto=3)
  // Usamos una comprobación estricta: el valor debe ser SOLO dígitos.
  // parseInt("3abc") devolvería 3, lo que aceptaría entradas basura.
  if (/^\d+$/.test(raw)) {
    const asNumber = Number(raw);
    // Buscamos por el campo "index" real del punto, no por posición.
    const byIndex = tourPoints.findIndex((p) => p.index === asNumber);
    return byIndex >= 0 ? byIndex : 0;
  }

  // Caso 2: viene un slug (?punto=entrada)
  const bySlug = tourPoints.findIndex((p) => p.slug === raw);
  return bySlug >= 0 ? bySlug : 0;
}

/* Mantiene la URL sincronizada al navegar con Atrás/Siguiente, para que el
   visitante pueda compartir o recargar y seguir en el mismo punto. */
function updateURL(index) {
  const point = tourPoints[index];
  // SEGURIDAD: encodeURIComponent evita que cualquier carácter especial
  // termine alterando la estructura de la URL.
  const newURL = `${window.location.pathname}?punto=${encodeURIComponent(point.index)}`;
  history.replaceState({ punto: point.index }, "", newURL);
}

/* -------------------- 3. ESTADO GLOBAL -------------------- */
let currentIndex = 0;              // índice del punto actual (0 a tourPoints.length - 1)
let audioContext = null;           // contexto de Web Audio API (se crea al primer uso)
let currentWaveformData = null;    // picos de amplitud calculados para el audio actual
let isPlaying = false;

/* -------------------- 3. REFERENCIAS AL DOM -------------------- */
const audioEl = document.getElementById("audioElement");
const playBtn = document.getElementById("playBtn");
const iconPlay = document.getElementById("iconPlay");
const iconPause = document.getElementById("iconPause");
const canvas = document.getElementById("waveformCanvas");
const canvasCtx = canvas.getContext("2d");
const hoverTimeEl = document.getElementById("hoverTime");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const pointIndexLabel = document.getElementById("pointIndexLabel");
const pointNameLabel = document.getElementById("pointNameLabel");
const pointDescription = document.getElementById("pointDescription");
const welcomeTitle = document.getElementById("welcomeTitle");
const trackNameEl = document.getElementById("trackName");

const btnAtras = document.getElementById("btnAtras");
const btnSiguiente = document.getElementById("btnSiguiente");

/* -------------------- 4. CARGAR UN PUNTO DEL TOUR -------------------- */
function loadPoint(index) {
  // SEGURIDAD: nos aseguramos de que el índice esté dentro del rango válido
  // antes de usarlo. Así, aunque llegue un valor manipulado desde la URL,
  // nunca accedemos a una posición inexistente del arreglo.
  if (!Number.isInteger(index) || index < 0 || index >= tourPoints.length) {
    index = 0;
  }

  const point = tourPoints[index];
  currentIndex = index;

  // Actualiza los textos de las tarjetas.
  // NOTA DE SEGURIDAD: siempre usamos .textContent y NUNCA .innerHTML.
  // textContent escribe el texto tal cual, sin interpretarlo como HTML,
  // por lo que es inmune a inyecciones XSS aunque el contenido cambie.
  pointIndexLabel.textContent = `Punto ${point.index}`;
  pointNameLabel.textContent = point.title;
  pointDescription.textContent = point.description;
  trackNameEl.textContent = point.trackName;

  // TÍTULO DE BIENVENIDA DINÁMICO:
  // cambia según la atracción actual -> "Bienvenida a Jardín de Tulipanes"
  welcomeTitle.textContent = `Bienvenida a ${point.title}`;

  // Botón "Atrás" deshabilitado en el primer punto,
  // botón "Siguiente" cambia de texto en el último punto.
  btnAtras.disabled = index === 0;
  btnSiguiente.textContent = "";
  const arrow = document.createElement("span");
  arrow.className = "btn-arrow";
  arrow.textContent = index === tourPoints.length - 1 ? "" : "❯";
  if (index === tourPoints.length - 1) {
    btnSiguiente.append("Finalizar tour ");
  } else {
    btnSiguiente.append("Siguiente ");
    btnSiguiente.append(arrow);
  }

  // Reinicia el reproductor y carga el nuevo audio.
  isPlaying = false;
  setPlayIcon(false);
  currentWaveformData = null;
  drawWaveform(); // limpia el canvas mientras carga

  audioEl.pause();
  audioEl.src = encodeURI(point.audioSrc);
  audioEl.currentTime = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  // Genera la forma de onda real decodificando el archivo de audio.
  generateWaveform(encodeURI(point.audioSrc));

  // Mantiene la URL en sincronía con el punto mostrado.
  updateURL(index);
}

/* -------------------- 5. NAVEGACIÓN ATRÁS / SIGUIENTE -------------------- */
btnAtras.addEventListener("click", () => {
  if (currentIndex > 0) {
    loadPoint(currentIndex - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

btnSiguiente.addEventListener("click", () => {
  if (currentIndex < tourPoints.length - 1) {
    loadPoint(currentIndex + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Último punto: aquí podrías redirigir a una pantalla de "fin del tour".
    alert("¡Has completado el recorrido por el Laberinto San Fernando!");
  }
});

/* -------------------- 6. BOTÓN PLAY / PAUSE -------------------- */
playBtn.addEventListener("click", () => {
  if (audioEl.paused) {
    audioEl.play();
  } else {
    audioEl.pause();
  }
});

audioEl.addEventListener("play", () => {
  isPlaying = true;
  setPlayIcon(true);
});

audioEl.addEventListener("pause", () => {
  isPlaying = false;
  setPlayIcon(false);
});

audioEl.addEventListener("ended", () => {
  isPlaying = false;
  setPlayIcon(false);
});

function setPlayIcon(playing) {
  iconPlay.style.display = playing ? "none" : "block";
  iconPause.style.display = playing ? "block" : "none";
}

/* -------------------- 7. TIEMPO / DURACIÓN -------------------- */
audioEl.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audioEl.duration);
});

audioEl.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(audioEl.currentTime);
  drawWaveform(); // redibuja para actualizar el progreso sobre la forma de onda
});

function formatTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/* -------------------- 8. GENERAR EL WAVEFORM (Web Audio API) -------------------- */
/*
  Para dibujar una forma de onda "real" (como en SoundCloud), descargamos
  el archivo de audio, lo decodificamos con la Web Audio API y calculamos
  el pico de amplitud de cada pequeño segmento del audio. Esos picos son
  los que luego se dibujan como barras verticales en el canvas.
*/
async function generateWaveform(src) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // SEGURIDAD: solo pedimos recursos del propio sitio (same-origin).
    const response = await fetch(src, { credentials: "omit", mode: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Usamos el primer canal de audio (mono o izquierdo).
    const rawData = audioBuffer.getChannelData(0);

    const numberOfBars = 120; // cantidad de barras a dibujar en el waveform
    const blockSize = Math.floor(rawData.length / numberOfBars);
    const peaks = [];

    for (let i = 0; i < numberOfBars; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j] || 0);
      }
      peaks.push(sum / blockSize);
    }

    // Normaliza los picos entre 0 y 1 para que se vean bien en el canvas.
    const maxPeak = Math.max(...peaks) || 1;
    currentWaveformData = peaks.map((p) => p / maxPeak);

    drawWaveform();
  } catch (err) {
    // Si el archivo de audio no existe todavía (placeholder), dibujamos
    // un waveform "de muestra" generado aleatoriamente para no dejar
    // el reproductor vacío mientras el usuario prueba la plantilla.
    console.warn("No se pudo decodificar el audio, usando waveform de muestra:", err);
    currentWaveformData = generateFallbackWaveform();
    drawWaveform();
  }
}

/* Genera una forma de onda de muestra (para cuando no hay archivo de audio real aún). */
function generateFallbackWaveform() {
  const numberOfBars = 120;
  const peaks = [];
  for (let i = 0; i < numberOfBars; i++) {
    // Combina un par de senos para simular una forma orgánica, no puramente aleatoria.
    const base = Math.abs(Math.sin(i * 0.15)) * 0.6 + Math.abs(Math.sin(i * 0.4)) * 0.4;
    const noise = Math.random() * 0.25;
    peaks.push(Math.min(1, base + noise));
  }
  return peaks;
}

/* -------------------- 9. DIBUJAR EL WAVEFORM EN EL CANVAS -------------------- */
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawWaveform() {
  resizeCanvas();
  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  canvasCtx.clearRect(0, 0, width, height);

  if (!currentWaveformData) return;

  const barCount = currentWaveformData.length;
  const barWidth = width / barCount;
  const gap = barWidth * 0.35;

  // Progreso de reproducción (0 a 1) para colorear las barras ya reproducidas.
  const progress = audioEl.duration ? audioEl.currentTime / audioEl.duration : 0;
  const progressBarIndex = Math.floor(progress * barCount);

  // Colores tomados de la paleta CSS (verde y café).
  const colorPlayed = "#6b4226";   // café — parte ya reproducida
  const colorRemaining = "#c9d9c3"; // verde suave — parte restante

  currentWaveformData.forEach((peak, i) => {
    const barHeight = Math.max(3, peak * height);
    const x = i * barWidth;
    const y = (height - barHeight) / 2;

    canvasCtx.fillStyle = i <= progressBarIndex ? colorPlayed : colorRemaining;
    canvasCtx.fillRect(x, y, barWidth - gap, barHeight);
  });
}

/* -------------------- 10. INTERACCIÓN: CLIC / ARRASTRE EN EL WAVEFORM -------------------- */
/*
  Permite al usuario hacer clic (o arrastrar) sobre la forma de onda
  para saltar a esa posición del audio.
*/
function seekFromEvent(clientX) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  if (audioEl.duration) {
    audioEl.currentTime = ratio * audioEl.duration;
    drawWaveform();
  }
  return ratio;
}

let isDragging = false;

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  seekFromEvent(e.clientX);
});
window.addEventListener("mousemove", (e) => {
  if (isDragging) seekFromEvent(e.clientX);

  // Muestra el tiempo al pasar el mouse sobre el waveform.
  const rect = canvas.getBoundingClientRect();
  if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
    const ratio = (e.clientX - rect.left) / rect.width;
    if (audioEl.duration) {
      hoverTimeEl.textContent = formatTime(ratio * audioEl.duration);
      hoverTimeEl.style.left = `${e.clientX - rect.left}px`;
      hoverTimeEl.classList.add("visible");
    }
  } else {
    hoverTimeEl.classList.remove("visible");
  }
});
window.addEventListener("mouseup", () => { isDragging = false; });

// Soporte táctil (móvil).
canvas.addEventListener("touchstart", (e) => {
  seekFromEvent(e.touches[0].clientX);
}, { passive: true });
canvas.addEventListener("touchmove", (e) => {
  seekFromEvent(e.touches[0].clientX);
}, { passive: true });

/* Redibuja el waveform si cambia el tamaño de la ventana. */
window.addEventListener("resize", drawWaveform);

/* -------------------- 11. TOGGLE DE IDIOMA (visual, de muestra) -------------------- */
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    // Aquí podrías cambiar los textos a inglés si tienes esa versión del contenido.
  });
});

/* -------------------- 12. INICIALIZACIÓN -------------------- */
currentIndex = getStartIndexFromURL();
loadPoint(currentIndex);
