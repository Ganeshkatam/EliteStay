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

function generateTree(dirPath, prefix = '', isLast = true) {
  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) return '';

  const basename = path.basename(dirPath);
  let treeStr = '';

  // Root directory
  if (prefix === '') {
    treeStr += `${basename}\n`;
  }

  const items = fs.readdirSync(dirPath).filter(item => !IGNORED_DIRS.has(item));
  
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
      treeStr += generateTree(itemPath, childPrefix, isItemLast);
    }
  });

  return treeStr;
}

const targetDir = process.argv[2] || process.cwd();

try {
  console.log(`Generating tree for: ${path.resolve(targetDir)}\n`);
  const tree = generateTree(targetDir);
  console.log(tree);
  
  const markdownContent = `# Project Tree\n\nGenerated on: ${new Date().toISOString()}\n\n\`\`\`\n${tree}\n\`\`\`\n`;

  // Write to project_tree.md in root
  const rootTreePath = path.join(process.cwd(), 'project_tree.md');
  fs.writeFileSync(rootTreePath, markdownContent);
  console.log(`\nUpdated ${rootTreePath}`);

  // Write to docs/tree with timestamp
  const docsTreeDir = path.join(process.cwd(), 'docs', 'tree');
  if (!fs.existsSync(docsTreeDir)) {
    fs.mkdirSync(docsTreeDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const timestampedPath = path.join(docsTreeDir, `tree-${timestamp}.md`);
  fs.writeFileSync(timestampedPath, markdownContent);
  console.log(`Saved backup to ${timestampedPath}`);
  
} catch (error) {
  console.error('Error generating tree:', error.message);
}
