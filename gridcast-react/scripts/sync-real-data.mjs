import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const sourceDir = path.join(repoRoot, "data", "public", "data");
const targetDir = path.join(appRoot, "public", "data");

const requiredFiles = [
  "forecast_24h.json",
  "forecast_48h.json",
  "forecast_72h.json",
  "metrics.json",
  "residuals.json",
];

if (!fs.existsSync(sourceDir)) {
  console.error(`[sync:data] Source directory missing: ${sourceDir}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });

let hasMissingRequired = false;
for (const model of ["xgboost", "lstm"]) {
  for (const fileName of requiredFiles) {
    const expectedPath = path.join(targetDir, model, fileName);
    if (!fs.existsSync(expectedPath)) {
      hasMissingRequired = true;
      console.error(`[sync:data] Missing ${model}/${fileName} after sync`);
    }
  }
}

if (hasMissingRequired) {
  process.exit(1);
}

console.log(`[sync:data] Synced real model artifacts from ${sourceDir}`);
console.log(`[sync:data] Destination: ${targetDir}`);
