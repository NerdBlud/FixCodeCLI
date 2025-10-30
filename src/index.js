const { Command } = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// AI SDKs
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const program = new Command();

program
  .name("fixcode")
  .description("AI-powered code fixer supporting OpenAI and Gemini")
  .option("--setup", "Set up API keys for OpenAI or Gemini")
  .option("--apply", "Overwrite original file after fixing")
  .option("--explain", "Include reasoning for the fixes")
  .option("--ai <provider>", "AI provider: openai | gemini", "openai")
  .argument("[file]", "File to fix")
  .action(async (file, options) => {
    if (options.setup) return await setupKeys();

    if (!file) {
      console.error(chalk.red("❌ No file provided. Example: npx fixcode ./main.py"));
      process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`❌ File not found: ${file}`));
      process.exit(1);
    }

    const code = await fs.readFile(filePath, "utf8");
    const lang = path.extname(filePath).slice(1) || "text";

    console.log(chalk.cyan(`🧠 Using ${options.ai} to fix ${lang} code...`));

    const fixedCode = await fixWithAI({
      provider: options.ai,
      code,
      lang,
      explain: options.explain,
    });

    const outFile = options.apply
      ? filePath
      : filePath.replace(/(\.\w+)$/, ".fixed$1");

    await fs.writeFile(outFile, fixedCode, "utf8");
    console.log(chalk.green(`✅ Fixed code saved to ${outFile}`));
  });

program.parse(process.argv);

/* --------------------------------------------------
   🧩 SETUP FUNCTION
-------------------------------------------------- */
async function setupKeys() {
  console.log(chalk.cyan("🔑 Setup API Keys for OpenAI and/or Gemini"));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Which provider do you want to set up?",
      choices: ["openai", "gemini"],
    },
    {
      type: "input",
      name: "apiKey",
      message: "Enter your API key:",
      validate: (input) => input.length > 10 || "Please enter a valid key",
    },
  ]);

  const envPath = path.resolve(process.cwd(), ".env");
  let envData = "";

  if (fs.existsSync(envPath)) {
    envData = await fs.readFile(envPath, "utf8");
  }

  const newKey =
    answers.provider === "openai"
      ? `OPENAI_API_KEY=${answers.apiKey}`
      : `GEMINI_API_KEY=${answers.apiKey}`;

  const updatedEnv = envData
    .split("\n")
    .filter((line) => !line.startsWith("OPENAI_API_KEY") && !line.startsWith("GEMINI_API_KEY"))
    .concat(newKey)
    .join("\n");

  await fs.writeFile(envPath, updatedEnv);
  console.log(chalk.green(`✅ ${answers.provider} key saved to .env`));
}

/* --------------------------------------------------
   🧠 AI FIX LOGIC
-------------------------------------------------- */
async function fixWithAI({ provider, code, lang, explain }) {
  if (provider === "openai") {
    return await useOpenAI(code, lang, explain);
  } else if (provider === "gemini") {
    return await useGemini(code, lang, explain);
  } else {
    console.error(chalk.red(`❌ Unknown provider: ${provider}`));
    process.exit(1);
  }
}

/* --------------------------------------------------
   🧩 OpenAI Logic
-------------------------------------------------- */
async function useOpenAI(code, lang, explain) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(chalk.red("❌ Missing OPENAI_API_KEY. Run `npx fixcode --setup`."));
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });
  const prompt = `
You are an expert ${lang} developer.
Fix and improve the following code while preserving functionality.
${explain ? "Explain your reasoning first, then show the corrected code." : ""}
---
${code}
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  return response.output[0].content[0].text;
}

/* --------------------------------------------------
   🧩 Gemini Logic
-------------------------------------------------- */
async function useGemini(code, lang, explain) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(chalk.red("❌ Missing GEMINI_API_KEY. Run `npx fixcode --setup`."));
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert ${lang} developer.
Fix and improve the following code while preserving functionality.
${explain ? "Explain your reasoning first, then show the corrected code." : ""}
---
${code}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
