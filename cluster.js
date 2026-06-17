const cluster = require('cluster');

if (cluster.isPrimary) {
  const workers = parseInt(process.env.WEB_CONCURRENCY, 10) || 4;
  console.log(`Primary ${process.pid} starting ${workers} workers`);
  for (let i = 0; i < workers; i++) fork();

  // resurrect a worker if it dies, unless we're shutting down, also track fast crashes and exit if too many happen in a row
  let shuttingDown = false;
  let fastCrashes = 0;
  cluster.on('exit', (worker, code, signal) => {
    if (shuttingDown) return;
    const ranForMs = Date.now() - worker.startedAt;
    if (ranForMs < 5000) {
      fastCrashes++;
      console.error(`Worker ${worker.process.pid} died after ${ranForMs}ms (${signal || code}) [fast-crash ${fastCrashes}/${workers}]`);
      if (fastCrashes >= workers) {
        console.error('Too many fast worker crashes; exiting for the service manager to restart.');
        process.exit(1);
      }
    } else {
      fastCrashes = 0; // a healthy run clears the streak
      console.log(`Worker ${worker.process.pid} died after ${Math.round(ranForMs / 1000)}s (${signal || code}); respawning`);
    }
    fork();
  });

  for (const sig of ['SIGTERM', 'SIGINT']) {
    process.on(sig, () => {
      shuttingDown = true;
      for (const w of Object.values(cluster.workers)) w.kill(sig);
    });
  }
} else {
  require('probot').run([process.argv[0], process.argv[1], './index.js']);
}

function fork() {
  const worker = cluster.fork();
  worker.startedAt = Date.now();
  return worker;
}
