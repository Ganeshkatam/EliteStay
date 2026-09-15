/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.swc',
  '.vscode',
  'dist',
  'build',
  'coverage',
]);

function generateTree(dirPath, prefix = '') {
  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) return '';

  const basename = path.basename(dirPath);
  let treeStr = '';

  // Root directory
  if (prefix === '') {
    treeStr += `${basename}\n`;
  }

  const items = fs
    .readdirSync(dirPath)
    .filter((item) => !IGNORED_DIRS.has(item));

  // Sort directories first, then files
  items.sort((a, b) => {
    const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
    const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  items.forEach((item, index) => {
    const itemPath = path.join(dirPath, item);
    const isItemLast = index === items.length - 1;
    const itemStats = fs.statSync(itemPath);

    const connector = isItemLast ? '└── ' : '├── ';
    treeStr += `${prefix}${connector}${item}\n`;

    if (itemStats.isDirectory()) {
      const childPrefix = prefix + (isItemLast ? '    ' : '│   ');
      treeStr += generateTree(itemPath, childPrefix);
    }
  });

  return treeStr;
}

const targetDir = process.argv[2] || process.cwd();

try {
  console.log(`Generating tree for: ${path.resolve(targetDir)}`);
  const tree = generateTree(targetDir);

  const now = new Date();

  // Format for file name: YYYY-MM-DD-HH-mm-ss
  const pad = (n) => n.toString().padStart(2, '0');
  const filenameTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  // Format for markdown content
  const formattedDate = now.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });

  const markdownContent = `# Project Tree\n\nGenerated on: ${formattedDate}\n\n\`\`\`\n${tree}\n\`\`\`\n`;

  // Write to project_tree.md in root
  const rootTreePath = path.join(process.cwd(), 'project_tree.md');
  fs.writeFileSync(rootTreePath, markdownContent);
  console.log(`\nUpdated ${rootTreePath}`);

  // Write to docs/tree with timestamp
  const docsTreeDir = path.join(process.cwd(), 'docs', 'tree');
  if (!fs.existsSync(docsTreeDir)) {
    fs.mkdirSync(docsTreeDir, { recursive: true });
  }

  const timestampedPath = path.join(
    docsTreeDir,
    `tree-${filenameTimestamp}.md`
  );
  fs.writeFileSync(timestampedPath, markdownContent);
  console.log(`Saved backup to ${timestampedPath}`);
} catch (error) {
  console.error('Error generating tree:', error.message);
}
