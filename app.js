const statusLabels = {
  learned: "Изучено",
  review: "На повторении",
  new: "Новое",
};

const viewItems = [
  { id: "all", label: "Alle слова", icon: "list" },
  { id: "cards", label: "Карточки", icon: "cards" },
  { id: "favorite", label: "Избранное", icon: "star" },
  { id: "review", label: "Повторение", icon: "refresh" },
];

const icons = {
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  cards: '<svg viewBox="0 0 24 24"><path d="M7 7.5 15.5 4l4.5 11-8.5 3.5L7 7.5Z"/><path d="M4 9v10a2 2 0 0 0 2 2h10"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6L12 16.76 6.6 19.6l1.03-6-4.36-4.25 6.03-.88L12 3Z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-15.53 6.21M3 12A9 9 0 0 1 18.53 5.79M3 17v4h4M21 7V3h-4"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z"/></svg>',
  plane: '<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4 20-7ZM11 13l4-4"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24"><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1M4 8h16v11H4V8Zm0 5h16"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  utensils: '<svg viewBox="0 0 24 24"><path d="M4 3v8m4-8v8M6 3v18m12-18v18M14 7c0 2.8 1.8 5 4 5"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 4 13c0-6 8-10 16-10 0 8-4 16-10 16Zm0 0c0-4 3-8 8-11"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  flask: '<svg viewBox="0 0 24 24"><path d="M10 2v6l-5.5 9.5A3 3 0 0 0 7 22h10a3 3 0 0 0 2.5-4.5L14 8V2M8 2h8M7 16h10"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01"/></svg>',
  volume: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/></svg>',
  more: '<svg viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01"/></svg>',
};

const categoryIcons = {
  Alltag: "home",
  Reisen: "plane",
  Arbeit: "briefcase",
  Familie: "users",
  "Essen & Trinken": "utensils",
  Natur: "leaf",
  Gesundheit: "heart",
  Kultur: "home",
  Wissenschaft: "flask",
  Sprache: "list",
  Gefuehle: "heart",
  Weitere: "dots",
};

const state = {
  words: [],
  selectedId: null,
  view: "all",
  part: "Все",
  category: "Все",
  query: "",
  sort: "word",
  page: 1,
  perPage: 15,
  cardIndex: 0,
  cardFlipped: false,
};

const els = {
  viewNav: document.querySelector("#viewNav"),
  categoryNav: document.querySelector("#categoryNav"),
  partFilters: document.querySelector("#partFilters"),
  wordList: document.querySelector("#wordList"),
  detailPane: document.querySelector("#detailPane"),
  searchInput: document.querySelector("#searchInput"),
  shownCount: document.querySelector("#shownCount"),
  pageLabel: document.querySelector("#pageLabel"),
  prevPage: document.querySelector("#prevPage"),
  nextPage: document.querySelector("#nextPage"),
  progressBar: document.querySelector("#progressBar"),
  progressPercent: document.querySelector("#progressPercent"),
  totalCount: document.querySelector("#totalCount"),
  learnedCount: document.querySelector("#learnedCount"),
  reviewCount: document.querySelector("#reviewCount"),
  importDialog: document.querySelector("#importDialog"),
  importText: document.querySelector("#importText"),
  dictionaryPane: document.querySelector(".dictionary-pane"),
};

async function loadWords() {
  const response = await fetch("./words.json");
  const bundledWords = normalizeWords(await response.json());
  const saved = localStorage.getItem("deutsch-dictionary.words");
  if (saved) {
    const savedById = new Map(normalizeWords(JSON.parse(saved)).map((word) => [word.id, word]));
    state.words = bundledWords.map((word) => {
      const savedWord = savedById.get(word.id);
      return savedWord ? { ...word, status: savedWord.status, favorite: savedWord.favorite } : word;
    });
  } else {
    state.words = bundledWords;
  }
  state.selectedId = state.words[0]?.id ?? null;
  render();
}

function normalizeWords(words) {
  return words.map((item, index) => ({
    id: item.id || slugify(item.word || `word-${index}`),
    word: item.word || "",
    translation: item.translation || "",
    part: item.part || "Weitere",
    category: item.category || "Weitere",
    level: item.level || "",
    gender: item.gender || "",
    forms: Array.isArray(item.forms) ? item.forms : [],
    meanings: Array.isArray(item.meanings) ? item.meanings : [item.translation].filter(Boolean),
    examples: Array.isArray(item.examples) ? item.examples : [],
    related: Array.isArray(item.related) ? item.related : [],
    status: ["learned", "review", "new"].includes(item.status) ? item.status : "new",
    favorite: Boolean(item.favorite),
  }));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  const [headers, ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), (record[index] || "").trim()])),
  );
}

function splitVerbForms(value) {
  const match = value.match(/^(.+?)\s*\((.+)\)$/);
  if (!match) return { word: value.trim(), forms: [] };
  return {
    word: match[1].trim(),
    forms: match[2].split(",").map((part) => part.trim()).filter(Boolean),
  };
}

function notionCsvToWords(text) {
  return parseCsv(text).map((row, index) => {
    const rawVerb = row["Verb (Präteritum, Perfekt)"] || row.Verb || row.word || "";
    const { word, forms } = splitVerbForms(rawVerb);
    const kasus = row.Kasus || "Weitere";
    const translation = row.Russisch || row.translation || "";
    const example = row.Beispiel || "";

    return {
      id: slugify(word) || `word-${index + 1}`,
      word,
      translation,
      part: "Глаголы",
      category: kasus,
      level: "",
      gender: "",
      forms,
      meanings: [translation].filter(Boolean),
      examples: example ? [{ de: example, ru: "" }] : [],
      related: kasus ? [`${kasus}-Verb`] : [],
      status: "new",
      favorite: false,
    };
  });
}

function parseImportedWords(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Вставь JSON или CSV");
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) throw new Error("JSON должен быть массивом");
    return parsed;
  }
  return notionCsvToWords(trimmed);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function persist() {
  localStorage.setItem("deutsch-dictionary.words", JSON.stringify(state.words, null, 2));
}

function filteredWords() {
  const query = state.query.trim().toLowerCase();
  return state.words
    .filter((word) => {
      if (state.view === "favorite" && !word.favorite) return false;
      if (state.view === "review" && word.status !== "review") return false;
      if (state.part !== "Все" && word.part !== state.part) return false;
      if (state.category !== "Все" && word.category !== state.category) return false;
      if (!query) return true;
      return [word.word, word.translation, word.category, word.part, word.level]
        .concat(word.meanings, word.related)
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => String(a[state.sort]).localeCompare(String(b[state.sort]), "de"));
}

function currentPageWords() {
  const words = filteredWords();
  const maxPage = Math.max(1, Math.ceil(words.length / state.perPage));
  state.page = Math.min(state.page, maxPage);
  const start = (state.page - 1) * state.perPage;
  return words.slice(start, start + state.perPage);
}

function render() {
  renderViews();
  renderCategories();
  renderParts();
  renderList();
  renderDetail();
  renderProgress();
}

function renderViews() {
  const counts = {
    all: state.words.length,
    favorite: state.words.filter((word) => word.favorite).length,
    review: state.words.filter((word) => word.status === "review").length,
  };
  els.viewNav.innerHTML = viewItems
    .map((item) => `
      <button class="nav-item ${state.view === item.id ? "active" : ""}" type="button" data-view="${item.id}">
        ${icons[item.icon]}
        <span>${item.label}</span>
        <span>${counts[item.id]}</span>
      </button>
    `)
    .join("");
}

function renderCategories() {
  const categories = countBy(state.words, "category");
  const items = [["Все", state.words.length], ...Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0], "de"))];
  els.categoryNav.innerHTML = items
    .map(([category, count]) => {
      const icon = category === "Все" ? "list" : categoryIcons[category] || "dots";
      return `
        <button class="category-pill ${state.category === category ? "active" : ""}" type="button" data-category="${escapeHtml(category)}">
          ${icons[icon]}
          <span>${category}</span>
          <span>${count}</span>
        </button>
      `;
    })
    .join("");
}

function renderParts() {
  const parts = ["Все", ...Object.keys(countBy(state.words, "part")).sort((a, b) => a.localeCompare(b, "ru"))];
  els.partFilters.innerHTML = parts
    .map((part) => `<button class="filter-chip ${state.part === part ? "active" : ""}" type="button" data-part="${escapeHtml(part)}">${part}</button>`)
    .join("");
}

function renderList() {
  els.dictionaryPane.classList.toggle("cards-mode", state.view === "cards");
  if (state.view === "cards") {
    renderCards();
    return;
  }

  const pageWords = currentPageWords();
  const allFiltered = filteredWords();
  if (!pageWords.length) {
    els.wordList.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
  } else {
    els.wordList.innerHTML = pageWords.map(wordRow).join("");
  }
  const start = allFiltered.length ? (state.page - 1) * state.perPage + 1 : 0;
  const end = Math.min(state.page * state.perPage, allFiltered.length);
  els.shownCount.textContent = `Показано ${start}-${end} из ${allFiltered.length}`;
  els.pageLabel.textContent = String(state.page);
  els.prevPage.disabled = state.page === 1;
  els.nextPage.disabled = state.page >= Math.ceil(allFiltered.length / state.perPage);
}

function renderCards() {
  const words = filteredWords();
  state.cardIndex = Math.max(0, Math.min(state.cardIndex, words.length - 1));
  const word = words[state.cardIndex];

  els.prevPage.disabled = true;
  els.nextPage.disabled = true;
  els.pageLabel.textContent = "—";
  els.shownCount.textContent = words.length ? `Карточка ${state.cardIndex + 1} из ${words.length}` : "Нет карточек";

  if (!word) {
    els.wordList.innerHTML = '<div class="empty-state">Нет слов для карточек</div>';
    return;
  }

  state.selectedId = word.id;
  els.wordList.innerHTML = `
    <section class="flashcards" aria-label="Карточки Quizlet">
      <div class="flashcard-meta">
        <span>${escapeHtml(word.category || "Weitere")}</span>
        <span>${escapeHtml(word.part || "")}</span>
      </div>

      <button class="flashcard ${state.cardFlipped ? "flipped" : ""}" type="button" data-card-flip aria-label="Перевернуть карточку">
        <span class="flashcard-side flashcard-front">
          <small>Deutsch</small>
          <strong>${escapeHtml(word.word)}</strong>
          <em>${word.forms.map(escapeHtml).join(" · ")}</em>
        </span>
        <span class="flashcard-side flashcard-back">
          <small>Русский</small>
          <strong>${escapeHtml(word.translation)}</strong>
          <em>${escapeHtml(word.examples[0]?.de || "Нет примера")}</em>
        </span>
      </button>

      <div class="flashcard-controls">
        <button class="ghost-button" type="button" data-card-prev>Назад</button>
        <button class="primary-button" type="button" data-card-flip>${state.cardFlipped ? "Слово" : "Ответ"}</button>
        <button class="ghost-button" type="button" data-card-next>Дальше</button>
      </div>

      <div class="flashcard-grades">
        <button type="button" data-card-review>Повторить</button>
        <button type="button" data-card-known>Знаю</button>
      </div>
    </section>
  `;
}

function wordRow(word) {
  return `
    <button class="word-row ${word.id === state.selectedId ? "selected" : ""}" type="button" data-id="${word.id}">
      <span class="star-button ${word.favorite ? "active" : ""}" data-favorite="${word.id}" title="Избранное">★</span>
      <span><strong>${escapeHtml(word.word)}</strong></span>
      <span>${escapeHtml(word.translation)}</span>
      <span>${escapeHtml(word.category)}</span>
      <span class="status ${word.status}">${statusLabels[word.status]}</span>
    </button>
  `;
}

function renderDetail() {
  const word = state.words.find((item) => item.id === state.selectedId) || filteredWords()[0] || state.words[0];
  if (!word) {
    els.detailPane.innerHTML = '<div class="empty-state">Добавь слова через импорт</div>';
    return;
  }
  state.selectedId = word.id;
  const tags = [word.part, word.gender, word.level, ...word.forms].filter(Boolean);
  els.detailPane.innerHTML = `
    <div class="detail-top">
      <div class="detail-title">
        <h2>${escapeHtml(word.word)}</h2>
        <p>${escapeHtml(word.translation)}</p>
      </div>
      <div class="detail-actions">
        <button type="button" data-speak="${word.id}" title="Произнести">${icons.volume}</button>
        <button type="button" data-toggle-favorite="${word.id}" title="Избранное" class="${word.favorite ? "star-button active" : ""}">★</button>
        <button type="button" title="Ещё">${icons.more}</button>
      </div>
    </div>

    <div class="tag-row detail-section">
      ${tags.map((tag) => `<span class="tag ${tag === word.gender ? "article" : ""}">${escapeHtml(tag)}</span>`).join("")}
    </div>

    <section class="detail-section">
      <h3>Значение</h3>
      <ol class="meaning-list">
        ${word.meanings.map((meaning) => `<li>${escapeHtml(meaning)}</li>`).join("")}
      </ol>
    </section>

    <section class="detail-section">
      <h3>Beispiel</h3>
      ${word.examples.map((example) => `
        <p class="example">
          <strong>${escapeHtml(example.de || "")}</strong>
          <span>${escapeHtml(example.ru || "")}</span>
        </p>
      `).join("") || '<p class="example"><span>Пока нет примеров.</span></p>'}
    </section>

    <section class="detail-section">
      <h3>Связанные слова</h3>
      <div class="related-list">
        ${(word.related.length ? word.related : ["Добавь связи"]).map((related) => `<span>${escapeHtml(related)}</span>`).join("")}
      </div>
    </section>

    <section class="detail-section">
      <h3>Статус</h3>
      <div class="status-actions">
        ${Object.entries(statusLabels).map(([key, label]) => `
          <button type="button" class="${word.status === key ? "active" : ""}" data-status="${key}" data-word="${word.id}">${label}</button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderProgress() {
  const total = state.words.length;
  const learned = state.words.filter((word) => word.status === "learned").length;
  const review = state.words.filter((word) => word.status === "review").length;
  const percent = total ? Math.round((learned / total) * 100) : 0;
  els.totalCount.textContent = total;
  els.learnedCount.textContent = learned;
  els.reviewCount.textContent = review;
  els.progressPercent.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function setWordPatch(id, patch) {
  state.words = state.words.map((word) => (word.id === id ? { ...word, ...patch } : word));
  persist();
  render();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    state.view = viewButton.dataset.view;
    state.page = 1;
    state.cardIndex = 0;
    state.cardFlipped = false;
    render();
    return;
  }

  if (event.target.closest("[data-card-flip]")) {
    state.cardFlipped = !state.cardFlipped;
    renderList();
    renderDetail();
    return;
  }

  if (event.target.closest("[data-card-prev]")) {
    state.cardIndex = Math.max(0, state.cardIndex - 1);
    state.cardFlipped = false;
    renderList();
    renderDetail();
    return;
  }

  if (event.target.closest("[data-card-next]")) {
    state.cardIndex = Math.min(filteredWords().length - 1, state.cardIndex + 1);
    state.cardFlipped = false;
    renderList();
    renderDetail();
    return;
  }

  if (event.target.closest("[data-card-known], [data-card-review]")) {
    const words = filteredWords();
    const word = words[state.cardIndex];
    if (!word) return;
    const status = event.target.closest("[data-card-known]") ? "learned" : "review";
    state.words = state.words.map((item) => (item.id === word.id ? { ...item, status } : item));
    state.cardIndex = Math.min(state.cardIndex + 1, Math.max(0, words.length - 1));
    state.cardFlipped = false;
    persist();
    render();
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    state.page = 1;
    render();
    return;
  }

  const partButton = event.target.closest("[data-part]");
  if (partButton) {
    state.part = partButton.dataset.part;
    state.page = 1;
    render();
    return;
  }

  const sortButton = event.target.closest("[data-sort]");
  if (sortButton) {
    state.sort = sortButton.dataset.sort;
    renderList();
    return;
  }

  const row = event.target.closest(".word-row");
  if (row) {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) {
      const word = state.words.find((item) => item.id === favorite.dataset.favorite);
      setWordPatch(word.id, { favorite: !word.favorite });
      return;
    }
    state.selectedId = row.dataset.id;
    render();
    return;
  }

  const toggleFavorite = event.target.closest("[data-toggle-favorite]");
  if (toggleFavorite) {
    const word = state.words.find((item) => item.id === toggleFavorite.dataset.toggleFavorite);
    setWordPatch(word.id, { favorite: !word.favorite });
    return;
  }

  const statusButton = event.target.closest("[data-status]");
  if (statusButton) {
    setWordPatch(statusButton.dataset.word, { status: statusButton.dataset.status });
    return;
  }

  const speakButton = event.target.closest("[data-speak]");
  if (speakButton && "speechSynthesis" in window) {
    const word = state.words.find((item) => item.id === speakButton.dataset.speak);
    const utterance = new SpeechSynthesisUtterance(word.word.replace(/^(der|die|das)\s+/i, ""));
    utterance.lang = "de-DE";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.page = 1;
  renderList();
  renderDetail();
});

els.prevPage.addEventListener("click", () => {
  state.page = Math.max(1, state.page - 1);
  renderList();
});

els.nextPage.addEventListener("click", () => {
  state.page += 1;
  renderList();
});

document.querySelector("#importButton").addEventListener("click", () => {
  els.importText.value = JSON.stringify(state.words, null, 2);
  els.importDialog.showModal();
});

document.querySelector("#applyImport").addEventListener("click", () => {
  try {
    state.words = normalizeWords(parseImportedWords(els.importText.value));
    state.selectedId = state.words[0]?.id ?? null;
    persist();
    els.importDialog.close();
    render();
  } catch (error) {
    alert(`Не получилось импортировать: ${error.message}`);
  }
});

document.querySelector("#exportButton").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.words, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "deutsch-words.json";
  link.click();
  URL.revokeObjectURL(url);
});

loadWords().catch((error) => {
  els.wordList.innerHTML = `<div class="empty-state">Ошибка загрузки: ${escapeHtml(error.message)}</div>`;
});
