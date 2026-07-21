// utils.js

function normalizeInput(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveInteger(value) {
  const normalized = normalizeInput(value);

  if (!/^[0-9]+$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function isDuplicateEntryError(error) {
  return error && error.code === "ER_DUP_ENTRY";
}

module.exports = {
  normalizeInput,
  parsePositiveInteger,
  isDuplicateEntryError,
};
