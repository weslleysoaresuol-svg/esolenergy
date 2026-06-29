const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const status = execSync('git status', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  fs.writeFileSync(path.join(__dirname, 'git_status.txt'), status, 'utf8');
  console.log("Git status written to scratch/git_status.txt");
} catch (error) {
  fs.writeFileSync(path.join(__dirname, 'git_status.txt'), error.message + '\n' + error.stack, 'utf8');
  console.error("Error running git status:", error);
}
