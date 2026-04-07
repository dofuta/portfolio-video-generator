const fs = require("fs/promises");
const {
  QUALITY_PRESETS,
  OUTPUT_RESOLUTION_PRESETS,
  BACKGROUND_COLOR_PRESETS,
  DEFAULTS
} = require("../config/presets");
const { createDefaultConfig } = require("../config/schema");
const { ensureHexColor, validateProjectName } = require("../config/validate");
const { WORKS_DIR, getWorkPaths, ensureDir } = require("../utils/workspace");

async function runInitCommand() {
  const { default: inquirer } = await import("inquirer");
  await ensureDir(WORKS_DIR);

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      validate: validateProjectName
    },
    {
      type: "list",
      name: "quality",
      message: "Quality preset:",
      choices: QUALITY_PRESETS,
      default: DEFAULTS.quality
    },
    {
      type: "list",
      name: "outputSize",
      message: "Output resolution:",
      choices: OUTPUT_RESOLUTION_PRESETS,
      default: DEFAULTS.outputSize
    },
    {
      type: "list",
      name: "backgroundColorChoice",
      message: "Background color:",
      choices: BACKGROUND_COLOR_PRESETS,
      default: DEFAULTS.backgroundColor
    },
    {
      type: "input",
      name: "backgroundColorCustom",
      message: "Custom hex color (#RRGGBB):",
      when: (answersInner) => answersInner.backgroundColorChoice === "CUSTOM",
      validate: (input) => {
        try {
          ensureHexColor(input, "backgroundColor");
          return true;
        } catch (error) {
          return error.message;
        }
      }
    },
    {
      type: "input",
      name: "mobileOccupancyRatio",
      message: "Mobile occupancy ratio (0.1 - 1.0):",
      default: String(DEFAULTS.occupancyRatio.mobile),
      validate: (input) => {
        const value = Number(input);
        if (!Number.isFinite(value) || value <= 0 || value > 1) {
          return "Enter a number greater than 0 and up to 1.";
        }
        return true;
      }
    },
    {
      type: "input",
      name: "desktopOccupancyRatio",
      message: "Desktop occupancy ratio (0.1 - 1.0):",
      default: String(DEFAULTS.occupancyRatio.desktop),
      validate: (input) => {
        const value = Number(input);
        if (!Number.isFinite(value) || value <= 0 || value > 1) {
          return "Enter a number greater than 0 and up to 1.";
        }
        return true;
      }
    }
  ]);

  const projectName = answers.projectName.trim();
  const workPaths = getWorkPaths(projectName);

  try {
    await fs.access(workPaths.workDir);
    throw new Error(`Work directory already exists: ${workPaths.workDir}`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await Promise.all([
    ensureDir(workPaths.inputsDir),
    ensureDir(workPaths.mobileDir),
    ensureDir(workPaths.desktopDir)
  ]);

  const backgroundColor =
    answers.backgroundColorChoice === "CUSTOM"
      ? answers.backgroundColorCustom.toUpperCase()
      : answers.backgroundColorChoice;

  const config = createDefaultConfig({
    quality: answers.quality,
    outputSize: answers.outputSize,
    backgroundColor,
    occupancyRatio: {
      mobile: Number(answers.mobileOccupancyRatio),
      desktop: Number(answers.desktopOccupancyRatio)
    }
  });

  await fs.writeFile(workPaths.configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  console.log(`Created work: ${workPaths.workDir}`);
  console.log(`Config: ${workPaths.configPath}`);
  console.log(`Put .mov files into: ${workPaths.inputsDir}`);
}

module.exports = {
  runInitCommand
};
