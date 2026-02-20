import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

// Detect dark mode
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

mermaid.initialize({
  startOnLoad: false,
  theme: isDark ? "dark" : "default",
  securityLevel: "loose",
});

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

// Debounce utility
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Extract mermaid content from text (supports raw mermaid or fenced blocks)
function extractMermaid(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";

  // Extract from fenced code blocks: ```mermaid ... ```
  const fenceRegex = /```mermaid\s*\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = fenceRegex.exec(trimmed)) !== null) {
    blocks.push(match[1].trim());
  }

  if (blocks.length > 0) {
    return blocks.join("\n\n");
  }

  // Otherwise, treat entire input as raw mermaid syntax
  return trimmed;
}

let renderCounter = 0;

async function renderDiagram() {
  const raw = editor.value;
  const code = extractMermaid(raw);

  if (!code) {
    preview.innerHTML = '<div class="placeholder">Enter Mermaid syntax to see a preview</div>';
    return;
  }

  try {
    const id = `mermaid-${++renderCounter}`;
    const { svg } = await mermaid.render(id, code);
    preview.innerHTML = svg;
  } catch (err) {
    preview.innerHTML = `<div class="error">${escapeHtml(err.message || String(err))}</div>`;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Live render on input
editor.addEventListener("input", debounce(renderDiagram, 300));

// Load initial content from server
async function loadInitialContent() {
  try {
    const res = await fetch("./api/content");
    const data = await res.json();
    if (data.content) {
      editor.value = data.content;
      renderDiagram();
    }
  } catch {
    // Server may not have initial content — that's fine
  }
}

// Divider drag to resize panes
function setupDivider() {
  const divider = document.getElementById("divider");
  const container = document.querySelector(".container");
  let dragging = false;

  divider.addEventListener("mousedown", (e) => {
    e.preventDefault();
    dragging = true;
    divider.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    const isVertical = window.innerWidth <= 700;

    if (isVertical) {
      const ratio = ((e.clientY - rect.top) / rect.height) * 100;
      const clamped = Math.min(Math.max(ratio, 20), 80);
      container.style.gridTemplateRows = `${clamped}% 6px ${100 - clamped}%`;
      container.style.gridTemplateColumns = "1fr";
    } else {
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(Math.max(ratio, 20), 80);
      container.style.gridTemplateColumns = `${clamped}% 6px ${100 - clamped}%`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });
}

// Tab key support in editor
editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
  }
});

// React to dark mode changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  mermaid.initialize({
    startOnLoad: false,
    theme: e.matches ? "dark" : "default",
    securityLevel: "loose",
  });
  renderDiagram();
});

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

setupDivider();
loadInitialContent();
