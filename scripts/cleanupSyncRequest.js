const { execSync } = require('child_process');

if (process.platform === 'win32') {
  process.exit(0);
}

try {
  execSync("pkill -f '[n]ode_modules/sync-rpc/lib/worker.js'", {
    stdio: 'ignore',
  });
} catch {
  // No sync-rpc worker found. Nothing to clean up.
}
