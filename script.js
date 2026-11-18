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
/* ============================================================
   ENLACES DEL MENÚ  <<< EDITA ESTAS DOS LÍNEAS >>>
   ============================================================
   Aquí defines a dónde llevan las opciones del menú lateral.

   homeUrl   = la página de inicio de tu sitio.
   reviewUrl = la página o formulario para evaluar el laberinto.

   EJEMPLOS DE reviewUrl según lo que uses:

     Un formulario de Google:
       "https://forms.gle/XXXXXXXXXX"

     Una página de tu WordPress:
       "https://laberintosanfernando.cl/evaluanos"

     Tu ficha de Google Maps (para reseñas públicas):
       "https://g.page/r/XXXXXXXXXX/review"

   Si todavía no tienes la página de evaluación, deja el valor
   como está: la opción aparecerá atenuada y no hará nada hasta
   que pongas una URL real.
   ------------------------------------------------------------ */
const menuLinks = {
  homeUrl: "https://laberintosanfernando.cl/",
  reviewUrl:
    "https://www.google.com/search?sxsrf=AKL5yDhV21po2whlzlfqhH5hyqP2eMP0-w:1795021188906&q=laberinto+de+san+fernando&si=AE1YtOqiKPb2pdLXAi8quZ9vbH4aVq_aX8-3H9iFBLpRNK95c_aX6v5u4diY2FvDfKqhpKEVAupWnz4YA8QD2pPRRc-e3-uqNq0kLdUYBql_Ju7cQzkReACQzTVuRi4tQnVCGpi18vlZR6YvUN5d2DSmqOYCne2JGA%3D%3D&uds=AE2AFgYcgXKcOQKR0sfn4TCYCERBFVptYFIPidbBexY70m9bnMib8kJwAsyS4thjRqB5m9j-0bMUuwceqk8k1mgrbSTpPOW_75n6xUWgDNbztsJhFduRO9GJlPULmOtO4Pfu3bONNKnS#lrd=0x966491f5d2db2d37:0x22506b66ad45425b,3", // <-- reemplaza por tu URL de evaluación
};

/* ------------------------------------------------------------
   TEXTOS DE LA INTERFAZ EN AMBOS IDIOMAS
   Son las etiquetas fijas que no dependen del punto del tour.
   ------------------------------------------------------------ */
const uiText = {
  es: {
    htmlLang: "es",
    tourLabel: "Audio Tour LSF",
    pointWord: "Punto",
    relatoTitle: "Relato del Hito",
    relatoSubtitle: "Escucha el relato de este punto del laberinto",
    welcomePrefix: "Bienvenida a",
    btnBack: "Atrás",
    btnNext: "Siguiente",
    btnFinish: "Finalizar tour",
    endMessage: "¡Has completado el recorrido por el Laberinto San Fernando!",
    playLabel: "Reproducir",
    pauseLabel: "Pausar",
    audioNotice: "", // vacío: el audio está en español, no hace falta avisar
    menuTitle: "Menú",
    menuHome: "Ir al inicio",
    menuReview: "Evaluar el laberinto",
    menuLang: "Idioma",
    menuOpenLabel: "Abrir menú",
    menuCloseLabel: "Cerrar menú",
    homeLabel: "Volver al inicio",
    reviewPending: "Evaluación disponible pronto",
  },
  en: {
    htmlLang: "en",
    tourLabel: "LSF Audio Tour",
    pointWord: "Stop",
    relatoTitle: "Story of this Stop",
    relatoSubtitle: "Listen to the story of this point in the maze",
    welcomePrefix: "Welcome to",
    btnBack: "Back",
    btnNext: "Next",
    btnFinish: "Finish tour",
    endMessage: "You have completed the San Fernando Maze tour!",
    playLabel: "Play",
    pauseLabel: "Pause",
    // Aviso que se muestra cuando aún no existe el audio en inglés.
    // Cuando grabes los audios en inglés, puedes dejarlo vacío: "".
    audioNotice:
      "Audio narration is currently available in Spanish only. The written text above is in English.",
    menuTitle: "Menu",
    menuHome: "Go to home page",
    menuReview: "Rate the maze",
    menuLang: "Language",
    menuOpenLabel: "Open menu",
    menuCloseLabel: "Close menu",
    homeLabel: "Back to home",
    reviewPending: "Rating page coming soon",
  },
};

/* ------------------------------------------------------------
   DATOS DE LOS PUNTOS DEL TOUR

   Cada punto tiene ahora una sección "es" y una "en".
   Para traducir, solo edita los campos dentro de "en".

   SOBRE EL AUDIO:
   - "audioSrc" dentro de cada idioma es opcional.
   - Si el audio en inglés NO existe todavía, deja la línea
     "audioSrc" fuera (o en null) y la página usará el audio en
     español automáticamente, mostrando un aviso al visitante.
   - Cuando grabes los audios en inglés, súbelos a la carpeta
     audio/en/ y agrega la línea audioSrc dentro de "en".
   ------------------------------------------------------------ */
const tourPoints = [
  {
    index: 1,
    slug: "pinos",
    es: {
      title: "Laberinto de Pinos",
      trackName: "1. Laberinto de Pinos",
      description:
        "Te encuentras ante nuestro desafío principal, una estructura viva esculpida directamente en la naturaleza. " +
        "Los imponentes muros de pino purifican el aire mientras ocultan la salida entre sus pasillos. " +
        "Respira hondo el aroma del bosque y acepta el desafío.",
      audioSrc: "audio/01-laberinto-pinos.mp3",
    },
    en: {
      title: "Pine Maze",
      trackName: "1. Pine Maze",
      description:
        "You stand before our main challenge, a living structure sculpted directly from nature. " +
        "Towering pine walls purify the air while hiding the exit among their corridors. " +
        "Breathe in the forest aroma and take on the challenge.",
      // audioSrc: "audio/en/01-pine-maze.mp3"  <- descomenta cuando lo grabes
    },
  },
  {
    index: 2,
    slug: "guardian",
    es: {
      title: "El Guardián del Laberinto",
      trackName: "2. El Guardián del Laberinto",
      description:
        "Frente a ti se alza la mítica figura de Creta, el gran símbolo de este recorrido. " +
        "Contempla los detalles de la escultura y activa el audio para descubrir la fascinante " +
        "historia del monstruo que dio origen a todos los laberintos del mundo.",
      audioSrc: "audio/02-guardian-minotauro.mp3",
    },
    en: {
      title: "The Guardian of the Maze",
      trackName: "2. The Guardian of the Maze",
      description:
        "Before you rises the mythical figure of Crete, the great symbol of this tour. " +
        "Take in the details of the sculpture and play the audio to discover the fascinating " +
        "story of the monster that gave rise to every maze in the world.",
      // audioSrc: "audio/en/02-guardian-minotaur.mp3"
    },
  },
  {
    index: 3,
    slug: "madera",
    es: {
      title: "Laberinto de Madera",
      trackName: "3. Laberinto de Madera",
      description:
        "Estas empalizadas de troncos no solo ocultan el camino, sino que te desafían a superar puentes, " +
        "cuerdas flojas y postes de equilibrio. Una aventura rústica diseñada para los más exploradores. " +
        "Ajusta tus zapatillas, mantén la concentración y demuestra tu destreza.",
      audioSrc: "audio/03-laberinto-madera.mp3",
    },
    en: {
      title: "Wooden Maze",
      trackName: "3. Wooden Maze",
      description:
        "These log palisades not only hide the path, they challenge you to cross bridges, " +
        "slacklines and balance posts. A rustic adventure built for true explorers. " +
        "Tighten your shoes, stay focused and show your skill.",
      // audioSrc: "audio/en/03-wooden-maze.mp3"
    },
  },
  {
    index: 4,
    slug: "lavanda",
    es: {
      title: "Laberinto de Lavanda",
      trackName: "4. Laberinto de Lavanda",
      description:
        "Bienvenido al rincón más relajante del parque. " +
        "Aquí los tonos violetas y el perfume natural de las flores se combinan para liberar el estrés " +
        "y reconectarte con el entorno. " +
        "Camina despacio, respira profundo y deja que el aroma sea tu guía.",
      audioSrc: "audio/04-laberinto-lavanda.mp3",
    },
    en: {
      title: "Lavender Maze",
      trackName: "4. Lavender Maze",
      description:
        "Welcome to the most relaxing corner of the park. " +
        "Here violet hues and the natural perfume of the flowers combine to release stress " +
        "and reconnect you with your surroundings. " +
        "Walk slowly, breathe deeply and let the scent be your guide.",
      // audioSrc: "audio/en/04-lavender-maze.mp3"
    },
  },
  {
    index: 5,
    slug: "espejos",
    es: {
      title: "Laberinto de Espejos",
      trackName: "5. Laberinto de Espejos",
      description:
        "Estás a punto de entrar a un mundo de ilusiones infinitas. " +
        "A tu alrededor, los reflejos se multiplicarán en ángulos precisos para confundir a tu cerebro. " +
        "Avanza con calma, confía en tus manos y descubre qué es real y qué es solo un reflejo.",
      audioSrc: "audio/05-laberinto-espejos.mp3",
    },
    en: {
      title: "Mirror Maze",
      trackName: "5. Mirror Maze",
      description:
        "You are about to enter a world of endless illusions. " +
        "All around you, reflections multiply at precise angles to confuse your brain. " +
        "Move calmly, trust your hands and discover what is real and what is only a reflection.",
      // audioSrc: "audio/en/05-mirror-maze.mp3"
    },
  },
  {
    index: 6,
    slug: "granja",
    es: {
      title: "Mini Granja Educativa",
      trackName: "6. Mini Granja Educativa",
      description:
        "Los elegantes pavos reales y los pacíficos ciervitos te dan la bienvenida a este rincón lleno de vida. " +
        "Descubre la historia mística de estos animales, el secreto de sus plumas y el poder de sus cornamentas " +
        "mientras disfrutas de su tranquilidad.",
      audioSrc: "audio/06-mini-granja.mp3",
    },
    en: {
      title: "Educational Mini Farm",
      trackName: "6. Educational Mini Farm",
      description:
        "Elegant peacocks and peaceful young deer welcome you to this corner full of life. " +
        "Discover the mystical history of these animals, the secret of their feathers and the power of their antlers " +
        "while you enjoy their calm.",
      // audioSrc: "audio/en/06-mini-farm.mp3"
    },
  },
  {
    index: 7,
    slug: "tulipanes",
    es: {
      title: "Jardín de Tulipanes",
      trackName: "7. Jardín de Tulipanes",
      description:
        "Un estallido de elegancia y color te da la bienvenida a este rincón primaveral. " +
        "Descubre la fascinante historia de los tulipanes, el secreto de su simetría y el origen de su fama mundial " +
        "mientras disfrutas de su efímero esplendor.",
      audioSrc: "audio/07-jardin-tulipanes.mp3",
    },
    en: {
      title: "Tulip Garden",
      trackName: "7. Tulip Garden",
      description:
        "A burst of elegance and colour welcomes you to this springtime corner. " +
        "Discover the fascinating history of tulips, the secret of their symmetry and the origin of their worldwide fame " +
        "while you enjoy their fleeting splendour.",
      // audioSrc: "audio/en/07-tulip-garden.mp3"
    },
  },
  {
    index: 8,
    slug: "girasoles",
    es: {
      title: "Jardín de Girasoles",
      trackName: "8. Jardín de Girasoles",
      description:
        "Los imponentes gigantes dorados te dan la bienvenida a este rincón lleno de luz y energía. " +
        "Descubre la historia sagrada de los girasoles, el misterio de su danza persiguiendo al sol " +
        "y su geometría perfecta mientras contemplas su calidez veraniega.",
      audioSrc: "audio/08-jardin-girasoles.mp3",
    },
    en: {
      title: "Sunflower Garden",
      trackName: "8. Sunflower Garden",
      description:
        "Towering golden giants welcome you to this corner full of light and energy. " +
        "Discover the sacred history of sunflowers, the mystery of their dance following the sun " +
        "and their perfect geometry as you take in their summer warmth.",
      // audioSrc: "audio/en/08-sunflower-garden.mp3"
    },
  },
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
  const raw = (params.get("punto") || params.get("p") || "")
    .trim()
    .toLowerCase();

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

/* ------------------------------------------------------------
   IDIOMA: de dónde sale y cómo se recuerda

   Orden de prioridad:
   1. El parámetro ?lang= de la URL (permite tener un QR directo
      en inglés si algún día lo quieres).
   2. Lo que el visitante eligió antes en este teléfono.
   3. El idioma del navegador: si no es español, parte en inglés.
   4. Español por defecto.
   ------------------------------------------------------------ */
function getStartLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get("lang") || params.get("idioma") || "")
    .trim()
    .toLowerCase();

  // SEGURIDAD: lista blanca estricta. Solo "es" o "en" son válidos.
  if (raw === "es" || raw === "en") return raw;

  // Preferencia guardada en este dispositivo.
  try {
    const guardado = localStorage.getItem("lsf_lang");
    if (guardado === "es" || guardado === "en") return guardado;
  } catch (e) {
    // Algunos navegadores bloquean localStorage en modo privado.
    // No es un problema: simplemente seguimos con la detección.
  }

  // Idioma del navegador del visitante.
  const navLang = (navigator.language || "es").toLowerCase();
  if (!navLang.startsWith("es")) return "en";

  return "es";
}

/* Guarda la preferencia de idioma para la próxima visita. */
function saveLang(lang) {
  try {
    localStorage.setItem("lsf_lang", lang);
  } catch (e) {
    // Si el navegador no lo permite, no pasa nada.
  }
}

/* Mantiene la URL sincronizada con el punto Y el idioma, para que el
   visitante pueda compartir o recargar y seguir donde estaba. */
function updateURL(index, lang) {
  const point = tourPoints[index];
  // SEGURIDAD: encodeURIComponent evita que cualquier carácter especial
  // termine alterando la estructura de la URL.
  let newURL = `${window.location.pathname}?punto=${encodeURIComponent(point.index)}`;
  // Solo agregamos ?lang= si NO es español, para que los QR impresos
  // (que no llevan el parámetro) sigan viéndose limpios.
  if (lang === "en") {
    newURL += "&lang=en";
  }
  history.replaceState({ punto: point.index, lang }, "", newURL);
}

/* -------------------- 3. ESTADO GLOBAL -------------------- */
let currentIndex = 0; // índice del punto actual (0 a tourPoints.length - 1)
let currentLang = "es"; // idioma activo: "es" o "en"
let audioContext = null; // contexto de Web Audio API (se crea al primer uso)
let currentWaveformData = null; // picos de amplitud calculados para el audio actual
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

const tourLabelEl = document.getElementById("tourLabel");
const relatoTitleEl = document.getElementById("relatoTitle");
const relatoSubtitleEl = document.getElementById("relatoSubtitle");
const audioNoticeEl = document.getElementById("audioNotice");
const langButtons = Array.from(document.querySelectorAll(".lang-btn"));

// Elementos del menú lateral
const menuBtn = document.getElementById("menuBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const menuTitleEl = document.getElementById("menuTitle");
const menuHomeEl = document.getElementById("menuHome");
const menuHomeTextEl = document.getElementById("menuHomeText");
const menuReviewEl = document.getElementById("menuReview");
const menuReviewTextEl = document.getElementById("menuReviewText");
const menuLangLabelEl = document.getElementById("menuLangLabel");

const btnAtras = document.getElementById("btnAtras");
const btnSiguiente = document.getElementById("btnSiguiente");

/* -------------------- 4. CARGAR UN PUNTO DEL TOUR -------------------- */
/*
  loadPoint recibe el número de punto y el idioma.
  Si no se pasa idioma, usa el que esté activo en ese momento.
*/
function loadPoint(index, lang) {
  // SEGURIDAD: validamos el índice contra el rango real del arreglo.
  if (!Number.isInteger(index) || index < 0 || index >= tourPoints.length) {
    index = 0;
  }
  // SEGURIDAD: el idioma solo puede ser uno de los dos permitidos.
  if (lang !== "es" && lang !== "en") {
    lang = currentLang;
  }

  const point = tourPoints[index];
  // Si por algún motivo faltara la traducción, caemos al español
  // para que la página nunca quede en blanco.
  const contenido = point[lang] || point.es;
  const ui = uiText[lang] || uiText.es;

  currentIndex = index;
  currentLang = lang;

  // Marca el idioma del documento: ayuda a los lectores de pantalla
  // y a que el navegador ofrezca traducir correctamente.
  document.documentElement.lang = ui.htmlLang;

  // Actualiza los textos de las tarjetas.
  // NOTA DE SEGURIDAD: siempre usamos .textContent y NUNCA .innerHTML.
  pointIndexLabel.textContent = `${ui.pointWord} ${point.index}`;
  pointNameLabel.textContent = contenido.title;
  pointDescription.textContent = contenido.description;
  trackNameEl.textContent = contenido.trackName;

  // TÍTULO DE BIENVENIDA DINÁMICO, ya traducido:
  // ES -> "Bienvenida a Jardín de Tulipanes"
  // EN -> "Welcome to Tulip Garden"
  welcomeTitle.textContent = `${ui.welcomePrefix} ${contenido.title}`;

  // Etiquetas fijas de la interfaz.
  tourLabelEl.textContent = ui.tourLabel;
  aplicarTextosMenu(ui);
  relatoTitleEl.textContent = ui.relatoTitle;
  relatoSubtitleEl.textContent = ui.relatoSubtitle;

  // Estado visual de los botones de idioma.
  langButtons.forEach((btn) => {
    const activo = btn.dataset.lang.toLowerCase() === lang;
    btn.classList.toggle("active", activo);
    btn.setAttribute("aria-pressed", activo ? "true" : "false");
  });

  // ----- Botones de navegación -----
  btnAtras.textContent = "";
  const flechaAtras = document.createElement("span");
  flechaAtras.className = "btn-arrow";
  flechaAtras.textContent = "❮";
  btnAtras.append(flechaAtras, " " + ui.btnBack);
  btnAtras.disabled = index === 0;

  btnSiguiente.textContent = "";
  if (index === tourPoints.length - 1) {
    btnSiguiente.append(ui.btnFinish);
  } else {
    const flechaSig = document.createElement("span");
    flechaSig.className = "btn-arrow";
    flechaSig.textContent = "❯";
    btnSiguiente.append(ui.btnNext + " ", flechaSig);
  }

  // ----- AUDIO: con respaldo al español -----
  /*
    Si el punto no tiene audio en el idioma elegido, usamos el
    español y mostramos un aviso para que el visitante entienda
    por qué escucha otro idioma del que está leyendo.
  */
  const audioDelIdioma = contenido.audioSrc;
  const audioFinal = audioDelIdioma || point.es.audioSrc;
  const usandoRespaldo = !audioDelIdioma;

  if (usandoRespaldo && ui.audioNotice) {
    audioNoticeEl.textContent = ui.audioNotice;
    audioNoticeEl.hidden = false;
  } else {
    audioNoticeEl.textContent = "";
    audioNoticeEl.hidden = true;
  }

  // Etiquetas accesibles del botón de reproducción.
  playBtn.setAttribute("aria-label", ui.playLabel);

  // Reinicia el reproductor y carga el audio.
  isPlaying = false;
  setPlayIcon(false);
  currentWaveformData = null;
  drawWaveform(); // limpia el canvas mientras carga

  audioEl.pause();
  audioEl.src = encodeURI(audioFinal);
  audioEl.currentTime = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  // Genera la forma de onda real decodificando el archivo de audio.
  generateWaveform(encodeURI(audioFinal));

  // Mantiene la URL en sincronía con el punto y el idioma.
  updateURL(index, lang);
}

/* Cambia solo el idioma, conservando el punto actual.
   NO recarga la página: el cambio es instantáneo. */
function setLanguage(lang) {
  if (lang !== "es" && lang !== "en") return;
  if (lang === currentLang) return;

  // Recordamos si el audio estaba sonando y en qué segundo,
  // para no interrumpir la experiencia del visitante.
  const estabaSonando = !audioEl.paused;
  const segundo = audioEl.currentTime;
  const audioAnterior = audioEl.src;

  saveLang(lang);
  loadPoint(currentIndex, lang);

  // Si el audio es exactamente el mismo archivo (porque el inglés
  // todavía usa el audio en español), retomamos donde iba.
  if (audioEl.src === audioAnterior && segundo > 0) {
    audioEl.currentTime = segundo;
    if (estabaSonando) {
      audioEl.play().catch(() => {
        /* iOS puede bloquearlo; no es error */
      });
    }
  }
}

/* -------------------- 5. NAVEGACIÓN ATRÁS / SIGUIENTE -------------------- */
btnAtras.addEventListener("click", () => {
  if (currentIndex > 0) {
    loadPoint(currentIndex - 1, currentLang);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

btnSiguiente.addEventListener("click", () => {
  if (currentIndex < tourPoints.length - 1) {
    loadPoint(currentIndex + 1, currentLang);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Último punto: aquí podrías redirigir a una pantalla de "fin del tour".
    alert(uiText[currentLang].endMessage);
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
  const ui = uiText[currentLang] || uiText.es;
  playBtn.setAttribute("aria-label", playing ? ui.pauseLabel : ui.playLabel);
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
    const response = await fetch(src, {
      credentials: "omit",
      mode: "same-origin",
    });
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
    console.warn(
      "No se pudo decodificar el audio, usando waveform de muestra:",
      err,
    );
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
    const base =
      Math.abs(Math.sin(i * 0.15)) * 0.6 + Math.abs(Math.sin(i * 0.4)) * 0.4;
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
  const progress = audioEl.duration
    ? audioEl.currentTime / audioEl.duration
    : 0;
  const progressBarIndex = Math.floor(progress * barCount);

  // Colores tomados de la paleta CSS (verde y café).
  const colorPlayed = "#6b4226"; // café — parte ya reproducida
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
  if (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
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
window.addEventListener("mouseup", () => {
  isDragging = false;
});

// Soporte táctil (móvil).
canvas.addEventListener(
  "touchstart",
  (e) => {
    seekFromEvent(e.touches[0].clientX);
  },
  { passive: true },
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    seekFromEvent(e.touches[0].clientX);
  },
  { passive: true },
);

/* Redibuja el waveform si cambia el tamaño de la ventana. */
window.addEventListener("resize", drawWaveform);

/* -------------------- 11. BOTONES DE IDIOMA (ES / EN) -------------------- */
/*
  Al tocar ES o EN se traduce la página completa al instante,
  sin recargar y sin perder el punto en el que va el visitante.
*/
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = (btn.dataset.lang || "").toLowerCase();
    setLanguage(lang);
  });
});

/* -------------------- 13. MENÚ LATERAL -------------------- */
/*
  El botón ☰ del header abre un panel deslizante con las opciones
  de navegación. Se cierra tocando la X, la zona oscura, el botón
  Atrás del teléfono, la tecla Escape, o eligiendo una opción.
*/

/* Comprueba que una URL configurada sea utilizable y segura.
   Solo aceptamos http:// y https://, nunca javascript: ni data:. */
function urlValida(valor) {
  if (!valor || valor === "PENDIENTE") return false;
  try {
    const u = new URL(valor, window.location.href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

/* Escribe los textos del menú en el idioma activo y
   configura los destinos de cada opción. */
function aplicarTextosMenu(ui) {
  menuTitleEl.textContent = ui.menuTitle;
  menuHomeTextEl.textContent = ui.menuHome;
  menuLangLabelEl.textContent = ui.menuLang;
  menuBtn.setAttribute("aria-label", ui.menuOpenLabel);
  menuCloseBtn.setAttribute("aria-label", ui.menuCloseLabel);

  // --- Opción "Ir al inicio" ---
  if (urlValida(menuLinks.homeUrl)) {
    menuHomeEl.href = menuLinks.homeUrl;
    menuHomeEl.removeAttribute("aria-disabled");
    menuHomeEl.classList.remove("disabled");
  } else {
    menuHomeEl.href = "#";
    menuHomeEl.setAttribute("aria-disabled", "true");
    menuHomeEl.classList.add("disabled");
  }

  // --- Opción "Evaluar el laberinto" ---
  if (urlValida(menuLinks.reviewUrl)) {
    menuReviewEl.href = menuLinks.reviewUrl;
    menuReviewTextEl.textContent = ui.menuReview;
    menuReviewEl.removeAttribute("aria-disabled");
    menuReviewEl.classList.remove("disabled");
    // Se abre en una pestaña nueva para no perder el punto del tour.
    // rel="noopener noreferrer" es obligatorio por seguridad al usar target.
    menuReviewEl.target = "_blank";
    menuReviewEl.rel = "noopener noreferrer";
  } else {
    // Sin URL configurada: la opción se ve atenuada y no navega.
    menuReviewEl.href = "#";
    menuReviewTextEl.textContent = ui.reviewPending;
    menuReviewEl.setAttribute("aria-disabled", "true");
    menuReviewEl.classList.add("disabled");
    menuReviewEl.removeAttribute("target");
  }
}

let menuAbierto = false;

function abrirMenu() {
  if (menuAbierto) return;
  menuAbierto = true;

  menuOverlay.hidden = false;
  // Forzamos un reflow para que la transición de opacidad se vea.
  void menuOverlay.offsetWidth;

  sideMenu.classList.add("open");
  menuOverlay.classList.add("open");
  sideMenu.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");

  // Añadimos una entrada al historial para que el botón "Atrás"
  // del teléfono cierre el menú en vez de salir de la página.
  // Es lo que un usuario de Android espera que ocurra.
  history.pushState({ menu: true }, "");

  // Movemos el foco al menú para quien navega con teclado o lector.
  menuCloseBtn.focus();
}

function cerrarMenu(desdeHistorial) {
  if (!menuAbierto) return;
  menuAbierto = false;

  sideMenu.classList.remove("open");
  menuOverlay.classList.remove("open");
  sideMenu.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");

  // Ocultamos la capa oscura cuando termina la animación.
  setTimeout(() => {
    if (!menuAbierto) menuOverlay.hidden = true;
  }, 280);

  // Si no venimos del botón Atrás, retiramos la entrada del historial.
  if (!desdeHistorial && history.state && history.state.menu) {
    history.back();
  }

  menuBtn.focus();
}

menuBtn.addEventListener("click", abrirMenu);
menuCloseBtn.addEventListener("click", () => cerrarMenu(false));
menuOverlay.addEventListener("click", () => cerrarMenu(false));

/* El botón Atrás del teléfono cierra el menú. */
window.addEventListener("popstate", () => {
  if (menuAbierto) cerrarMenu(true);
});

/* La tecla Escape también cierra el menú. */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuAbierto) cerrarMenu(false);
});

/* Al elegir una opción, cerramos el menú.
   Si la opción está deshabilitada, no hacemos nada. */
[menuHomeEl, menuReviewEl].forEach((item) => {
  item.addEventListener("click", (e) => {
    if (item.getAttribute("aria-disabled") === "true") {
      e.preventDefault();
      return;
    }
    cerrarMenu(false);
  });
});

/* Deslizar el dedo hacia la izquierda sobre el menú lo cierra.
   Es el gesto natural en un teléfono. */
let touchInicioX = null;
sideMenu.addEventListener(
  "touchstart",
  (e) => {
    touchInicioX = e.touches[0].clientX;
  },
  { passive: true },
);

sideMenu.addEventListener(
  "touchend",
  (e) => {
    if (touchInicioX === null) return;
    const recorrido = e.changedTouches[0].clientX - touchInicioX;
    // Más de 60px hacia la izquierda = cerrar.
    if (recorrido < -60) cerrarMenu(false);
    touchInicioX = null;
  },
  { passive: true },
);

/* -------------------- 14. INICIALIZACIÓN -------------------- */
currentIndex = getStartIndexFromURL();
currentLang = getStartLangFromURL();
loadPoint(currentIndex, currentLang);
