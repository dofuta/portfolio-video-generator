const { QUALITY_PRESETS, OUTPUT_RESOLUTION_PRESETS } = require("./presets");
const { OUTPUT_CANVAS_BY_SIZE, FFMPEG_QUALITY_PROFILES } = require("./ffmpegProfiles");

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6})$/;

function ensureEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: "${value}"`);
  }
}

function ensureHexColor(value, fieldName) {
  if (!HEX_COLOR_REGEX.test(value)) {
    throw new Error(`Invalid ${fieldName}: "${value}" (expected #RRGGBB)`);
  }
}

function ensureRatio(value, fieldName) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0 || value > 1) {
    throw new Error(`Invalid ${fieldName}: "${value}" (expected number > 0 and <= 1)`);
  }
}

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Config is missing or malformed.");
  }

  ensureEnum(config.quality, QUALITY_PRESETS.map((item) => item.value), "quality");
  ensureEnum(
    config.outputSize,
    OUTPUT_RESOLUTION_PRESETS.map((item) => item.value),
    "outputSize"
  );
  ensureHexColor(config.backgroundColor, "backgroundColor");
  if (!config.occupancyRatio || typeof config.occupancyRatio !== "object") {
    throw new Error("Invalid occupancyRatio: expected object with mobile and desktop.");
  }
  ensureRatio(config.occupancyRatio.mobile, "occupancyRatio.mobile");
  ensureRatio(config.occupancyRatio.desktop, "occupancyRatio.desktop");

  if (!FFMPEG_QUALITY_PROFILES[config.quality]) {
    throw new Error(`No ffmpeg profile found for quality "${config.quality}"`);
  }

  if (!OUTPUT_CANVAS_BY_SIZE[config.outputSize]) {
    throw new Error(`No output canvas found for outputSize "${config.outputSize}"`);
  }

  return true;
}

function validateProjectName(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "Project name is required.";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return "Use only alphanumeric, underscore, or hyphen.";
  }
  return true;
}

module.exports = {
  validateConfig,
  validateProjectName,
  ensureHexColor
};
