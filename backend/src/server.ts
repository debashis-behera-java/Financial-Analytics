import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();

 app.listen(env.port, '0.0.0.0', () => {
  console.log(`Backend listening on 0.0.0.0:${env.port}`);
});
}

main().catch((err) => {
  console.error('Failed to start backend:', err instanceof Error ? err.message : err);
  process.exit(1);
});
