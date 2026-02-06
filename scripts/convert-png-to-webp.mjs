import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = join(process.cwd(), 'src', 'assets');
const quality = process.env.WEBP_QUALITY ?? '90';
const dryRun = process.argv.includes('--dry-run');

async function listPngFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listPngFiles(fullPath);
      }
      if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
}

function runFfmpeg(inputPath) {
  const outputPath = inputPath.replace(/\.png$/i, '.webp');
  const args = [
    '-y',
    '-i',
    inputPath,
    '-c:v',
    'libwebp',
    '-quality',
    quality,
    '-compression_level',
    '6',
    outputPath
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: 'ignore' });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`ffmpeg failed for ${inputPath} with code ${code}`));
      }
    });
  });
}

async function main() {
  const pngFiles = await listPngFiles(rootDir);
  if (!pngFiles.length) {
    console.log('No PNG files found under src/assets.');
    return;
  }

  if (dryRun) {
    console.log(`Found ${pngFiles.length} PNG files under src/assets:`);
    pngFiles.forEach((file) => console.log(file));
    return;
  }

  for (const png of pngFiles) {
    // Convert sequentially to avoid spiking memory on large sprite sheets.
    const webp = await runFfmpeg(png);
    console.log(`Converted: ${png} -> ${webp}`);
  }

  console.log(`Done. Converted ${pngFiles.length} file(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
