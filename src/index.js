const { Command } = require("commander");
const { runInitCommand } = require("./commands/init");
const { runRenderCommand } = require("./commands/render");

const program = new Command();

program
  .name("portfolio-video-generator")
  .description("Create mobile/desktop mp4 outputs from .mov captures")
  .version("1.0.0");

program
  .command("init")
  .description("Create a new work directory and config")
  .action(async () => {
    try {
      await runInitCommand();
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program
  .command("render")
  .description("Render all .mov files for a single target (mobile or desktop)")
  .argument("[projectNameOrTarget]", "work project name or target")
  .argument("[projectNameIfLegacy]", "work project name for legacy argument order")
  .option("-t, --target <target>", "render target: mobile or desktop")
  .action(async (projectNameOrTarget, projectNameIfLegacy, options) => {
    try {
      const allowedTargets = ["mobile", "desktop"];
      const usingLegacyOrder = allowedTargets.includes(projectNameOrTarget) && !options.target;
      const target = usingLegacyOrder ? projectNameOrTarget : options.target;
      const projectName = usingLegacyOrder ? projectNameIfLegacy : projectNameOrTarget;
      await runRenderCommand(projectName, target);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
