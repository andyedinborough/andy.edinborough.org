const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
  const iconDir = path.resolve('./src/icons');
  await fs.rm(iconDir, { recursive: true, force: true });
  await fs.mkdir(path.resolve('./src/icons'));
  const icons = ['twitter', 'linkedin', 'github', 'envelope', 'newspaper'];
  for (const icon of icons) {
    console.log(`copying ${icon}`);
    await fs.copyFile(path.resolve(`./node_modules/bootstrap-icons/icons/${icon}.svg`), path.resolve(iconDir, icon + '.svg'));
  }
}
main();
