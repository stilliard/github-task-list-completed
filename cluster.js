const cluster = require('cluster');

if (cluster.isPrimary) {
  const workers = parseInt(process.env.WEB_CONCURRENCY, 10) || 4;
  console.log(`Primary ${process.pid} starting ${workers} workers`);
  for (let i = 0; i < workers; i++) cluster.fork();

  // resurrect a worker if it dies, unless we're shutting down
  let shuttingDown = false;
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code})`);
    if (!shuttingDown) cluster.fork();
  });
  for (const sig of ['SIGTERM', 'SIGINT']) {
    process.on(sig, () => {
      shuttingDown = true;
      for (const w of Object.values(cluster.workers)) w.kill(sig);
    });
  }
} else {
  require('probot').run(require('./index'));
}
