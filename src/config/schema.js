const { DEFAULTS } = require("./presets");

const CONFIG_VERSION = 1;

function createDefaultConfig(overrides = {}) {
  const mergedOccupancyRatio = {
    ...DEFAULTS.occupancyRatio,
    ...(overrides.occupancyRatio || {})
  };

  return {
    version: CONFIG_VERSION,
    quality: DEFAULTS.quality,
    outputSize: DEFAULTS.outputSize,
    backgroundColor: DEFAULTS.backgroundColor,
    ...overrides,
    occupancyRatio: mergedOccupancyRatio
  };
}

module.exports = {
  CONFIG_VERSION,
  createDefaultConfig
};
