const FFMPEG_QUALITY_PROFILES = {
  HIGH: {
    videoCodec: "libx264",
    preset: "slow",
    crf: "18",
    audioBitrate: "192k"
  },
  MEDIUM: {
    videoCodec: "libx264",
    preset: "medium",
    crf: "23",
    audioBitrate: "128k"
  },
  LOW: {
    videoCodec: "libx264",
    preset: "veryfast",
    crf: "28",
    audioBitrate: "96k"
  }
};

const OUTPUT_CANVAS_BY_SIZE = {
  "1080p": {
    mobile: { width: 1080, height: 1920 },
    desktop: { width: 1920, height: 1080 }
  },
  "720p": {
    mobile: { width: 720, height: 1280 },
    desktop: { width: 1280, height: 720 }
  },
  "480p": {
    mobile: { width: 480, height: 854 },
    desktop: { width: 854, height: 480 }
  }
};

module.exports = {
  FFMPEG_QUALITY_PROFILES,
  OUTPUT_CANVAS_BY_SIZE
};
