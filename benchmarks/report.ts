import fs from 'fs';
import path from 'path';

const RESULTS_DIR = path.join(__dirname, 'results');
const SUMMARY_FILE = path.join(RESULTS_DIR, 'SUMMARY.md');

export function generateReport() {
  if (!fs.existsSync(RESULTS_DIR)) {
    console.error('No results directory found.');
    return;
  }

  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('No benchmark results to report.');
    return;
  }

  let md = `# Benchmark Summary\n\n`;
  let allPassed = true;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(RESULTS_DIR, file), 'utf-8');
    const result = JSON.parse(raw);

    if (!result.passed) {
      allPassed = false;
    }

    md += `## ${result.name}\n`;

    if (result.passed) {
      md += `**Status:** ✅ PASS (${result.durationMs.toFixed(2)} ms)\n\n`;
    } else {
      md += `**Status:** ❌ FAIL (${result.durationMs.toFixed(2)} ms)\n`;
      md += `**Error:** ${result.error}\n\n`;
    }

    if (Object.keys(result.metrics).length > 0) {
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;

      for (const [key, value] of Object.entries(result.metrics)) {
        md += `| ${key} | ${value} |\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  fs.writeFileSync(SUMMARY_FILE, md);
  console.log(`\n========================================`);
  console.log(`Benchmark Report generated at: ${SUMMARY_FILE}`);
  console.log(`========================================`);

  if (!allPassed) {
    console.error('❌ Some benchmarks failed. Exiting with code 1.');
    process.exit(1);
  } else {
    console.log('✅ All benchmarks passed.');
  }
}

// If run directly:
if (require.main === module) {
  generateReport();
}
