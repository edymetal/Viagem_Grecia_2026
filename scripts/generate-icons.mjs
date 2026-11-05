// Source artwork is code-native SVG; all generated icons are committed and local.
import sharp from 'sharp';
const source = 'public/icon.svg';
for (const size of [192, 512])
  await sharp(source).resize(size, size).png().toFile(`public/icon-${size}.png`);
await sharp(source)
  .resize(340, 340)
  .extend({ top: 86, bottom: 86, left: 86, right: 86, background: '#174f4b' })
  .png()
  .toFile('public/icon-maskable.png');
