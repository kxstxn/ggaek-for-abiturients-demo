const VALID_TABS = new Set(["home", "scores", "ask"]);

const tabButtons = [...document.querySelectorAll(".pill-tabs__btn")];
const panels = document.querySelectorAll("[data-panel]");
const glider = document.getElementById("tab-glider");
const brandLinks = document.querySelectorAll(".brand[data-tab]");

function getTabFromHash() {
  const hash = window.location.hash.replace("#", "");
  return VALID_TABS.has(hash) ? hash : "home";
}

function moveGlider(activeButton) {
  if (!glider || !activeButton) return;

  const track = activeButton.parentElement;
  const trackRect = track.getBoundingClientRect();
  const btnRect = activeButton.getBoundingClientRect();

  glider.style.width = `${btnRect.width}px`;
  glider.style.transform = `translateX(${btnRect.left - trackRect.left}px)`;
}

const scoresChart = document.getElementById("scores-chart");

function playScoresChart(active) {
  if (!scoresChart) return;
  if (!active) {
    scoresChart.classList.remove("is-ready");
    return;
  }
  scoresChart.classList.remove("is-ready");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scoresChart.classList.add("is-ready"));
  });
}

function setActiveTab(tab) {
  const nextTab = VALID_TABS.has(tab) ? tab : "home";
  let activeButton = null;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === nextTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    if (isActive) activeButton = button;
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === nextTab;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  moveGlider(activeButton);
  playScoresChart(nextTab === "scores");

  if (window.location.hash !== `#${nextTab}`) {
    history.replaceState(null, "", `#${nextTab}`);
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

brandLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveTab(link.dataset.tab);
  });
});

window.addEventListener("hashchange", () => setActiveTab(getTabFromHash()));
window.addEventListener("resize", () => {
  const active = document.querySelector(".pill-tabs__btn.is-active");
  moveGlider(active);
});

function syncTab() {
  setActiveTab(getTabFromHash());
}

requestAnimationFrame(syncTab);

if (document.fonts?.ready) {
  document.fonts.ready.then(() => requestAnimationFrame(syncTab));
}

const askForm = document.getElementById("ask-form");
const askStatus = document.getElementById("ask-status");

if (askForm) {
  const fields = [...askForm.querySelectorAll(".field__input")];

  const setStatus = (text, type = "") => {
    if (!askStatus) return;
    askStatus.textContent = text;
    askStatus.classList.toggle("is-ok", type === "ok");
    askStatus.classList.toggle("is-error", type === "error");
  };

  const clearInvalid = () => {
    fields.forEach((field) => field.classList.remove("is-invalid"));
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("is-invalid");
      if (askStatus?.classList.contains("is-error")) setStatus("");
    });
  });

  askForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearInvalid();

    const data = new FormData(askForm);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const topic = String(data.get("topic") || "").trim();
    const question = String(data.get("question") || "").trim();

    const markInvalid = (key) => {
      const el = askForm.elements.namedItem(key);
      if (el && "classList" in el) el.classList.add("is-invalid");
    };

    let valid = true;
    if (!name) {
      markInvalid("name");
      valid = false;
    }
    if (!contact) {
      markInvalid("contact");
      valid = false;
    }
    if (!topic) {
      markInvalid("topic");
      valid = false;
    }
    if (!question) {
      markInvalid("question");
      valid = false;
    }

    if (!valid) {
      setStatus("Заполни все поля", "error");
      return;
    }

    const submitBtn = askForm.querySelector(".ask-submit");
    if (submitBtn) submitBtn.disabled = true;
    setStatus("Отправляем…");

    window.setTimeout(() => {
      askForm.reset();
      if (submitBtn) submitBtn.disabled = false;
      setStatus("Вопрос отправлен. Скоро ответим.", "ok");
    }, 650);
  });
}

const specsStage = document.getElementById("specs-stage");

if (specsStage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let frame = 0;

  const applyTilt = (clientX, clientY) => {
    const rect = specsStage.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    specsStage.style.setProperty("--tilt-y", `${x * 14}deg`);
    specsStage.style.setProperty("--tilt-x", `${-y * 10}deg`);
  };

  specsStage.addEventListener("pointermove", (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => applyTilt(event.clientX, event.clientY));
  });

  specsStage.addEventListener("pointerleave", () => {
    specsStage.style.setProperty("--tilt-x", "0deg");
    specsStage.style.setProperty("--tilt-y", "0deg");
  });
}
