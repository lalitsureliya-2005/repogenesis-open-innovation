import { __selfTestZip } from './workflow.js';

(async () => {
  try {
    const result = await __selfTestZip();
    console.log('[zip self-test] buffer size:', result.size);
  } catch (e) {
    console.error('Self-test failed:', e);
    process.exit(1);
  }
})();
