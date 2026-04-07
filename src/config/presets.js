const QUALITY_PRESETS = [
  { name: "HIGH", value: "HIGH" },
  { name: "MEDIUM", value: "MEDIUM" },
  { name: "LOW", value: "LOW" }
];

const OUTPUT_RESOLUTION_PRESETS = [
  { name: "1080p", value: "1080p" },
  { name: "720p", value: "720p" },
  { name: "480p", value: "480p" }
];

const BACKGROUND_COLOR_PRESETS = [
  { name: "Black (#000000)", value: "#000000" },
  { name: "White (#FFFFFF)", value: "#FFFFFF" },
  { name: "Off-white (#F8F7F4)", value: "#F8F7F4" },
  { name: "Charcoal (#1A1A1A)", value: "#1A1A1A" },
  { name: "Custom (Enter manually)", value: "CUSTOM" }
];

const DEFAULTS = {
  quality: "HIGH",
  outputSize: "1080p",
  backgroundColor: "#000000",
  occupancyRatio: {
    mobile: 0.7,
    desktop: 0.85
  }
};

module.exports = {
  QUALITY_PRESETS,
  OUTPUT_RESOLUTION_PRESETS,
  BACKGROUND_COLOR_PRESETS,
  DEFAULTS
};
