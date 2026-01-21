import * as esbuild from 'esbuild';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Build JavaScript
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: false,
  format: 'esm',
  platform: 'neutral',
  outdir: '../../dist/libs/shared-ui/src',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});

// Generate type declarations
await execAsync('tsc --emitDeclarationOnly --outDir ../../dist/libs/shared-ui');

console.log('✓ Build complete');
