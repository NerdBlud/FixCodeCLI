# FixCodeCLI — AI Code Fixer

Fix and clean up your code using OpenAI or Gemini directly from your terminal.

```bash
npx fixcode ./file.js
```

---

## Setup API Key

Before using FixCodeCLI, configure your API key for OpenAI or Gemini.

```bash
npx fixcode --setup
```

This command launches an interactive prompt to securely store your API key in your `.env` file.

---

## Example Usage

```bash
# Fix code using OpenAI
npx fixcode ./main.py --ai openai

# Fix code using Gemini
npx fixcode ./index.js --ai gemini

# Apply fixes directly (overwrite file)
npx fixcode ./app.js --apply

# Include reasoning before the fixed code
npx fixcode ./script.rb --explain
```

---

## Requirements

* Node.js 18 or higher
* Internet connection
* A valid OpenAI or Gemini API key stored in `.env`

---

## Environment Variables

Create a `.env` file in your project root:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
AI_PROVIDER=openai
```

---

## Commands

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npx fixcode ./file.js` | Fixes the given file                        |
| `npx fixcode --setup`   | Interactive API key setup                   |
| `--apply`               | Overwrite the original file with fixed code |
| `--explain`             | Show reasoning for each fix                 |
| `--ai <provider>`       | Choose AI provider (`openai` or `gemini`)   |

---

## Features

* Supports multiple programming languages
* Works with OpenAI and Gemini models
* Automatically saves fixed code as `<filename>.fixed.ext`
* Secure API key management using `.env`
* Optional overwrite and explanation output

---

## Quick Start

```bash
git clone https://github.com/nerdblud/FixCodeCLI.git
cd FixCodeCLI
npm install
npx fixcode --setup
npx fixcode ./file.js
```

---

## License

MIT License © 2025

---
