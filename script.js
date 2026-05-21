// Update this array if the image filenames in /img change.
// Keep the files in presentation order.
const slides = [
  "img/slide-01.png",
  "img/slide-02.png",
  "img/slide-03.png",
  "img/slide-04.png",
  "img/slide-05.png",
  "img/slide-06.png",
  "img/slide-07.png",
  "img/slide-08.png",
];

const imageCache = new Map();

function preloadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(src);
    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

function preloadAdjacentSlides(index) {
  [index - 1, index, index + 1, index + 2].forEach((slideIndex) => {
    if (slides[slideIndex]) {
      preloadImage(slides[slideIndex]);
    }
  });
}

function initDeck() {
  const introScreen = document.getElementById("introScreen");
  const startButton = document.getElementById("startButton");
  const slideImage = document.getElementById("slideImage");
  const slideCount = document.getElementById("slideCount");
  const progressBar = document.getElementById("progressBar");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const restartButton = document.getElementById("restartButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const dotStrip = document.getElementById("dotStrip");

  if (!slideImage) {
    return;
  }

  let currentSlide = 0;
  let hasStarted = false;

  function clampSlide(index) {
    return Math.max(0, Math.min(index, slides.length - 1));
  }

  function updateDots() {
    const dots = dotStrip.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentSlide);
      dot.setAttribute("aria-current", index === currentSlide ? "true" : "false");
    });
  }

  function updateButtons() {
    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;
  }

  async function updateSlide(index, animate = true) {
    const nextIndex = clampSlide(index);
    const nextSrc = slides[nextIndex];

    if (nextIndex === currentSlide && slideImage.src.includes(nextSrc)) {
      return;
    }

    await preloadImage(nextSrc);
    currentSlide = nextIndex;

    const showSlide = () => {
      slideImage.src = nextSrc;
      slideImage.alt = `Hylander Mobile pitch deck slide ${currentSlide + 1}`;
      slideCount.textContent = `Slide ${currentSlide + 1} / ${slides.length}`;
      progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
      updateDots();
      updateButtons();
      slideImage.classList.remove("is-fading");
      preloadAdjacentSlides(currentSlide);
    };

    if (!animate) {
      showSlide();
      return;
    }

    slideImage.classList.add("is-fading");
    window.setTimeout(showSlide, 170);
  }

  function nextSlide() {
    updateSlide(currentSlide + 1);
  }

  function previousSlide() {
    updateSlide(currentSlide - 1);
  }

  function startPresentation() {
    hasStarted = true;
    introScreen.classList.add("is-hidden");
    updateSlide(0, false);
  }

  function restartPresentation() {
    currentSlide = 0;
    startPresentation();
  }

  function toggleFullscreen() {
    const target = document.querySelector(".deck-hero") || document.documentElement;

    if (!document.fullscreenElement) {
      target.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
  }

  function buildDots() {
    dotStrip.innerHTML = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.addEventListener("click", () => {
        if (!hasStarted) {
          introScreen.classList.add("is-hidden");
          hasStarted = true;
        }
        updateSlide(index);
      });
      dotStrip.appendChild(dot);
    });
  }

  startButton.addEventListener("click", startPresentation);
  prevButton.addEventListener("click", previousSlide);
  nextButton.addEventListener("click", nextSlide);
  restartButton.addEventListener("click", restartPresentation);
  fullscreenButton.addEventListener("click", toggleFullscreen);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
      return;
    }

    if (!hasStarted && (event.key === "ArrowRight" || event.key === " ")) {
      event.preventDefault();
      startPresentation();
      return;
    }

    if (!hasStarted) {
      return;
    }

    if (event.key === "ArrowLeft") {
      previousSlide();
    }

    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      nextSlide();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
  });

  buildDots();
  updateSlide(0, false);
  slides.forEach((src) => preloadImage(src));
}

function initCounters() {
  const counters = document.querySelectorAll("[data-count]");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);

    if (!target) {
      return;
    }

    let current = 0;
    const steps = 34;
    const increment = target / steps;

    const timer = window.setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        window.clearInterval(timer);
      }

      counter.textContent = `$${Math.round(current).toLocaleString()}`;
    }, 24);
  });
}

initDeck();
initCounters();
