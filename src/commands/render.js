const fs = require("fs/promises");
const path = require("path");
const { validateConfig } = require("../config/validate");
const { DEFAULTS } = require("../config/presets");
const { getWorkPaths } = require("../utils/workspace");
const { renderAllMovFiles, cancelActiveRenders } = require("../services/renderer");

async function runRenderCommand(projectName, target) {
  if (!projectName) {
    throw new Error("Please provide a project name. Example: render my-project");
  }
  if (!target || !["mobile", "desktop"].includes(target)) {
    throw new Error('Please set --target to "mobile" or "desktop".');
  }

  const paths = getWorkPaths(projectName);
  const rawConfig = await fs.readFile(paths.configPath, "utf8").catch(() => {
    throw new Error(`config.json not found: ${paths.configPath}`);
  });

  let config;
  try {
    config = JSON.parse(rawConfig);
  } catch (error) {
    throw new Error(`Invalid JSON in config file: ${error.message}`);
  }

  config.occupancyRatio = {
    ...DEFAULTS.occupancyRatio,
    ...(config.occupancyRatio || {})
  };

  validateConfig(config);

  await Promise.all([
    fs.mkdir(paths.mobileDir, { recursive: true }),
    fs.mkdir(paths.desktopDir, { recursive: true })
  ]);

  console.log(`Work: ${path.basename(paths.workDir)}`);
  console.log(`Input dir: ${paths.inputsDir}`);
  console.log(`Output dir: ${path.join(paths.outputsDir, target)}`);
  console.log(
    `Settings: quality=${config.quality}, outputSize=${config.outputSize}, background=${config.backgroundColor}, occupancy(mobile=${config.occupancyRatio.mobile},desktop=${config.occupancyRatio.desktop})`
  );
  console.log(`Target: ${target}`);
  console.log("Input capture size is auto-detected per .mov file.");

  let interrupted = false;
  const onSigint = () => {
    interrupted = true;
    console.log("\nStopping active ffmpeg processes...");
    cancelActiveRenders();
  };

  process.once("SIGINT", onSigint);
  try {
    const result = await renderAllMovFiles(config, paths, target, () => interrupted);
    if (interrupted) {
      throw new Error("Render interrupted by user.");
    }
    console.log(
      `Completed. total=${result.total}, success=${result.successCount}, failed=${result.failureCount}`
    );
  } finally {
    process.removeListener("SIGINT", onSigint);
  }
}

module.exports = {
  runRenderCommand
};
