// Launcher so the preview spawner (which starts from the workspace root) runs
// Next with its working directory set to THIS project folder. Without this,
// Next resolves postcss/tailwind config + content globs against the wrong cwd
// and Tailwind utilities never get generated.
process.chdir(__dirname);
// Make the Next CLI see the "dev" subcommand: [node, next-bin, "dev"].
process.argv = [process.argv[0], require.resolve("next/dist/bin/next"), "dev"];
require("next/dist/bin/next");
