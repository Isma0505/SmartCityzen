import { spawn } from 'child_process';
import { createServer } from 'http';

const PORT = 3000;
let child: any = null;

function startServer() {
  child = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    cwd: '/home/z/my-project',
    stdio: ['inherit', 'inherit', 'inherit'],
    env: { ...process.env },
  });

  child.on('exit', (code: number) => {
    console.log(`Next.js exited with code ${code}. Restarting in 2s...`);
    setTimeout(startServer, 2000);
  });

  child.on('error', (err: Error) => {
    console.error('Failed to start Next.js:', err);
    setTimeout(startServer, 2000);
  });
}

// Health check server
createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('keep-alive');
}).listen(3999, () => {
  console.log('Keep-alive monitor on port 3999');
});

startServer();
console.log('Next.js wrapper started');