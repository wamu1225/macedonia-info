// scripts/generate-ogp.ts — OGP画像（1200×630）を public/ogp.png に生成する。
// 実行: npx tsx scripts/generate-ogp.ts
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const FONT = "'Yu Gothic','Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,'Noto Sans JP',sans-serif";
const SERIF = "'Yu Mincho','Hiragino Mincho ProN','Noto Serif JP',serif";

// 王朝の星（16方向の光線・意匠）
function star(cx: number, cy: number, R: number, r: number): string {
  let s = '';
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    const x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#c8a23a" stroke-width="6"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e8c96a"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5c1f1f" stroke-width="3"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4efe4"/>
  <rect x="0" y="0" width="16" height="630" fill="#7a2e2a"/>
  <rect x="16" y="0" width="6" height="630" fill="#b8912f"/>
  <text x="96" y="210" font-family="${SERIF}" font-size="80" font-weight="700" fill="#5c1f1f">マケドニア史ガイド</text>
  <text x="96" y="300" font-family="${FONT}" font-size="30" fill="#6a5f54">古代マケドニア王国から北マケドニアまで</text>
  <text x="96" y="372" font-family="${FONT}" font-size="25" fill="#6a5f54">フィリッポス2世、アレクサンドロス大王、ヴェルギナの王墓、</text>
  <text x="96" y="410" font-family="${FONT}" font-size="25" fill="#6a5f54">そして「マケドニア」の名がたどった道すじを史料で</text>
  <line x1="96" y1="470" x2="720" y2="470" stroke="#ddd2ba" stroke-width="2"/>
  <text x="96" y="522" font-family="${FONT}" font-size="24" fill="#7a2e2a" font-weight="600">study-apps.com/macedonia-info/</text>
  <g transform="translate(1004 300)">
    <circle r="150" fill="#5c1f1f"/>
    ${star(0, 0, 120, 40)}
  </g>
</svg>`;

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = path.join(PUBLIC_DIR, 'ogp.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ ogp.png (1200x630) を生成: ${outPath}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
