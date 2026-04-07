const fs = require("fs/promises");
const path = require("path");

const ROOT_DIR = process.cwd();
const WORKS_DIR = path.join(ROOT_DIR, "works");

function getWorkDir(projectName) {
  return path.join(WORKS_DIR, projectName);
}

function getWorkPaths(projectName) {
  const workDir = getWorkDir(projectName);
  return {
    workDir,
    inputsDir: path.join(workDir, "inputs"),
    outputsDir: path.join(workDir, "outputs"),
    mobileDir: path.join(workDir, "outputs", "mobile"),
    desktopDir: path.join(workDir, "outputs", "desktop"),
    configPath: path.join(workDir, "config.json")
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

module.exports = {
  ROOT_DIR,
  WORKS_DIR,
  getWorkDir,
  getWorkPaths,
  ensureDir
};
