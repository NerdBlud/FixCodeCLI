#!/usr/bin/env node
const { program } = require("commander");
const path = require("path");
const { fixFile } = require("../src/index");
const { setupApiKey } = require("../src/setup");

program
  .name("fixcode")
  .description("AI-powered multi-model code fixer")
  .option("--setup", "Set up your API keys")
  .option("--apply", "Overwrite original file")
  .option("--explain", "Show reasoning behind fixes")
  .option("--ai <provider>", "Choose AI provider (openai | gemini)")
  .argument("[file]", "File to fix")
  .action(async (file, options) => {
    if (options.setup) return setupApiKey();

    if (!file) {
      console.error("❌ No file provided. Example: npx fixcode ./index.js");
      process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), file);
    await fixFile(filePath, options);
  });

program.parse(process.argv);
