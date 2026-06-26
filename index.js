#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import prompts from "prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // ask user for project name
  const response = await prompts({
    type: "text",
    name: "projectName",
    message: "Project name:",
    initial: "my-backend-app",
  });

  if (!response.projectName) {
    console.log("❌ Project name is required");
    process.exit(1);
  }

  // Prevent path traversal attacks via crafted project names (e.g. "../../etc")
  const safeName = /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(response.projectName);
  if (!safeName) {
    console.log("❌ Project name can only contain letters, numbers, hyphens, underscores, and dots.");
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), response.projectName);
  const resolvedTarget = path.resolve(targetDir);
  const resolvedCwd = path.resolve(process.cwd());
  if (!resolvedTarget.startsWith(resolvedCwd + path.sep)) {
    console.log("❌ Invalid project name.");
    process.exit(1);
  }

  // copy template folder
  const templateDir = path.join(__dirname, "templates", "server");
  await fs.copy(templateDir, targetDir);

  console.log(`\n✅ Backend project created at: ${targetDir}`);
  console.log(`\n👉 Next steps:\n`);
  console.log(`   cd ${response.projectName}`);
  console.log(`   npm install`);
  console.log(`   npm run dev`);
}

main();
