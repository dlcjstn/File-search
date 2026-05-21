import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

async function build() {
  // Build main process
  await esbuild.build({
    entryPoints: ['src/electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/main.cjs',
    format: 'cjs',
    external: ['electron'],
    sourcemap: false,
    minify: false,
  });
  
  console.log('Main process built successfully!');

  // Build preload script
  await esbuild.build({
    entryPoints: ['src/electron/preload.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/preload.cjs',
    format: 'cjs',
    external: ['electron'],
    sourcemap: false,
    minify: false,
  });
  
  console.log('Preload script built successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
