const fs = require("fs");
const path = require("path");

const input = process.argv[2] || path.join(__dirname, "..", "data", "notion-verbs.csv");
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
  if (!match) return { word: value.trim(), forms: [] };
  return {
    word: match[1].trim(),
    forms: match[2].split(",").map((part) => part.trim()).filter(Boolean),
  };
}

function convertRow(row, index) {
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
}

const csv = fs.readFileSync(input, "utf8").replace(/^\uFEFF/, "");
const words = parseCsv(csv).map(convertRow);

fs.writeFileSync(output, `${JSON.stringify(words, null, 2)}\n`, "utf8");
console.log(`Converted ${words.length} rows: ${input} -> ${output}`);
