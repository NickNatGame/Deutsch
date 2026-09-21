const fs = require("fs");
const path = require("path");

const input = process.argv[2] || path.join(__dirname, "..", "data");
const output = process.argv[3] || path.join(__dirname, "..", "words.json");

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

function listInputFiles(inputPath) {
  const stats = fs.statSync(inputPath);
  if (!stats.isDirectory()) return [inputPath];

  return fs
    .readdirSync(inputPath)
    .filter((file) => /\.(csv|json)$/i.test(file))
    .map((file) => path.join(inputPath, file))
    .sort((a, b) => a.localeCompare(b));
}

function extractJsonObjects(text) {
  const objects = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(JSON.parse(text.slice(start, i + 1)));
        start = -1;
      }
    }
  }

  return objects;
}

function parseDataFile(file) {
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return extractJsonObjects(trimmed);
    }
  }

  return parseCsv(text);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function splitVerbForms(value) {
  const match = value.match(/^(.+?)\s*\((.+)\)$/);
  if (!match) return { word: value.trim(), forms: [], source: value.trim() };
  const [praeteritum, perfekt, ...rest] = match[2].split(",").map((part) => part.trim()).filter(Boolean);
  const forms = [
    praeteritum ? `Präteritum: ${praeteritum}` : "",
    perfekt ? `Perfekt: ${perfekt}` : "",
    ...rest,
  ].filter(Boolean);

  return {
    word: match[1].trim(),
    forms,
    source: value.trim(),
  };
}

function splitMeanings(value) {
  return value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeForms(forms) {
  const cleanForms = (Array.isArray(forms) ? forms : [])
    .map((form) => String(form).trim())
    .filter(Boolean);

  if (cleanForms.length === 2 && cleanForms.every((form) => !form.includes(":"))) {
    return [`Präteritum: ${cleanForms[0]}`, `Perfekt: ${cleanForms[1]}`];
  }

  return cleanForms;
}

function caseFromRow(row) {
  const rawCategory = row.Kasus || row.category || "";
  if (rawCategory && rawCategory !== "Weitere") return rawCategory;

  const meanings = Array.isArray(row.meanings) ? row.meanings.map(String) : [];
  const firstMeaning = meanings[0] || "";
  if (/dativ|akkusativ|akk\.|dat\.|\+/.test(firstMeaning.toLowerCase())) return firstMeaning;

  return rawCategory || "Weitere";
}

function normalizeExample(example) {
  if (!example) return null;
  if (typeof example === "string") return { de: example, ru: "" };
  return { de: example.de || "", ru: example.ru || "" };
}

function convertRow(row, index, usedIds) {
  const rawVerb = row["Verb (Präteritum, Perfekt)"] || row.Verb || row.word || "";
  const parsedVerb = splitVerbForms(rawVerb);
  const word = parsedVerb.word || row.word || "";
  const forms = normalizeForms(parsedVerb.forms.length ? parsedVerb.forms : row.forms);
  const reconstructedSource = forms.length
    ? `${word} (${forms.map((form) => form.replace(/^[^:]+:\s*/, "")).join(", ")})`
    : word;
  const source = row.source || (/\(.+\)/.test(rawVerb) ? parsedVerb.source : reconstructedSource);
  const kasus = caseFromRow(row);
  const translation = row.Russisch || row.translation || "";
  const example = row.Beispiel || "";
  const examples = Array.isArray(row.examples)
    ? row.examples.map(normalizeExample).filter(Boolean)
    : [normalizeExample(example)].filter(Boolean);
  const baseId = slugify(word) || `word-${index + 1}`;
  const seenCount = usedIds.get(baseId) || 0;
  usedIds.set(baseId, seenCount + 1);

  return {
    id: seenCount ? `${baseId}-${seenCount + 1}` : baseId,
    word,
    source,
    translation,
    part: "Глаголы",
    category: kasus,
    level: "",
    gender: "",
    forms,
    meanings: splitMeanings(translation),
    examples,
    related: [],
    status: "new",
    favorite: false,
  };
}

const rows = listInputFiles(input).flatMap(parseDataFile);
const usedIds = new Map();
const words = rows
  .map((row, index) => convertRow(row, index, usedIds))
  .filter((word) => word.word && word.translation);

fs.writeFileSync(output, `${JSON.stringify(words, null, 2)}\n`, "utf8");
console.log(`Converted ${words.length} rows: ${input} -> ${output}`);
