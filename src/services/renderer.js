const fs = require("fs/promises");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const {
  FFMPEG_QUALITY_PROFILES,
  OUTPUT_CANVAS_BY_SIZE
} = require("../config/ffmpegProfiles");

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const activeCommands = new Set();

function createScaleAndPadFilter(width, height, backgroundColor, occupancyRatio) {
  return (
    `scale=iw*min((${width}*${occupancyRatio})/iw\\,` +
    `(${height}*${occupancyRatio})/ih):` +
    `ih*min((${width}*${occupancyRatio})/iw\\,` +
    `(${height}*${occupancyRatio})/ih),` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:${backgroundColor}`
  );
}

function renderOne(inputPath, outputPath, options) {
  const { width, height, backgroundColor, quality, occupancyRatio } = options;
  const profile = FFMPEG_QUALITY_PROFILES[quality];

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoFilters(createScaleAndPadFilter(width, height, backgroundColor, occupancyRatio))
      .outputOptions([
        `-c:v ${profile.videoCodec}`,
        `-preset ${profile.preset}`,
        `-crf ${profile.crf}`,
        "-pix_fmt yuv420p",
        "-movflags +faststart",
        "-c:a aac",
        `-b:a ${profile.audioBitrate}`
      ])
      .on("start", () => activeCommands.add(command))
      .on("end", () => {
        activeCommands.delete(command);
        resolve();
      })
      .on("error", (error) => {
        activeCommands.delete(command);
        reject(error);
      })
      .save(outputPath);
  });
}

function cancelActiveRenders() {
  for (const command of activeCommands) {
    try {
      command.kill("SIGKILL");
    } catch (error) {
      // no-op
    }
  }
  activeCommands.clear();
}

function probeVideo(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }
      const videoStream = (metadata.streams || []).find((stream) => stream.codec_type === "video");
      if (!videoStream || !videoStream.width || !videoStream.height) {
        reject(new Error("Could not detect video width/height."));
        return;
      }
      resolve({
        width: videoStream.width,
        height: videoStream.height
      });
    });
  });
}

async function getMovFiles(inputsDir) {
  const entries = await fs.readdir(inputsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.mov$/i.test(entry.name))
    .map((entry) => entry.name);
}

async function renderAllMovFiles(config, paths, target, shouldStop = () => false) {
  const movFiles = await getMovFiles(paths.inputsDir);
  if (movFiles.length === 0) {
    throw new Error(`No .mov files found in ${paths.inputsDir}`);
  }

  const outputCanvas = OUTPUT_CANVAS_BY_SIZE[config.outputSize];
  let successCount = 0;
  let failureCount = 0;

  for (const fileName of movFiles) {
    if (shouldStop()) {
      break;
    }
    const inputPath = path.join(paths.inputsDir, fileName);
    const baseName = path.parse(fileName).name;
    const outputPath =
      target === "mobile"
        ? path.join(paths.mobileDir, `${baseName}_mobile.mp4`)
        : path.join(paths.desktopDir, `${baseName}_desktop.mp4`);

    process.stdout.write(`Analyzing ${fileName} ... `);

    try {
      const sourceInfo = await probeVideo(inputPath);
      if (shouldStop()) {
        break;
      }
      process.stdout.write(`${sourceInfo.width}x${sourceInfo.height}. Rendering ... `);
      const outputOptions =
        target === "mobile"
          ? {
              ...outputCanvas.mobile,
              quality: config.quality,
              backgroundColor: config.backgroundColor,
              occupancyRatio: config.occupancyRatio.mobile
            }
          : {
              ...outputCanvas.desktop,
              quality: config.quality,
              backgroundColor: config.backgroundColor,
              occupancyRatio: config.occupancyRatio.desktop
            };
      await renderOne(inputPath, outputPath, outputOptions);
      successCount += 1;
      console.log("done");
    } catch (error) {
      failureCount += 1;
      console.log("failed");
      console.error(`  ${error.message}`);
      if (shouldStop()) {
        break;
      }
    }
  }

  return { total: movFiles.length, successCount, failureCount };
}

module.exports = {
  renderAllMovFiles,
  cancelActiveRenders
};
