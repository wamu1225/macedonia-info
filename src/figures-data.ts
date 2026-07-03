// 自作SVG模式図のHTML文字列を一元管理する単一の真実源（SSOT）。
// React版（App.tsx の {{figure:KEY}} 展開）と prerender の双方が使う。
// テーマ：王国の紫紅 #7a2e2a × 金 #b8912f × 羊皮紙 #f4efe4。すべて模式図であり、
// 縮尺や配置は正確な地理・寸法を表さない（本文とキャプションで断る）。

const BG = '#f4efe4';
const PORPHYRY = '#7a2e2a';
const DEEP = '#5c1f1f';
const GOLD = '#b8912f';
const GOLD_SOFT = '#d7b968';
const INK = '#2b2622';
const STONE = '#cabfa6';

// 1) サリサとファランクス（長槍の密集隊形）
function phalanxSvg(): string {
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3];
  let soldiers = '';
  const x0 = 40, y0 = 44, dx = 20, dy = 26;
  for (const r of rows) {
    for (const c of cols) {
      const x = x0 + c * dx + r * 6;
      const y = y0 + r * dy;
      soldiers += `<circle cx="${x}" cy="${y}" r="5" fill="${PORPHYRY}"/>`;
      // サリサ（前方＝右へ長く伸ばす。後列ほど長く前に届く）
      const len = 70 + r * 26;
      soldiers += `<line x1="${x + 5}" y1="${y}" x2="${x + 5 + len}" y2="${y - 18}" stroke="${GOLD}" stroke-width="2"/>`;
    }
  }
  return (
    `<svg class="diagram-single" viewBox="0 0 300 170" width="100%" role="img" aria-label="長槍サリサを構えたマケドニアの密集隊形ファランクスの模式図">` +
    `<rect width="300" height="170" fill="${BG}"/>` +
    soldiers +
    `<text x="150" y="162" font-size="10" fill="${DEEP}" text-anchor="middle" font-weight="700">後列の長槍も前方に届き、幾重もの槍ぶすまをつくる</text>` +
    `</svg>`
  );
}

// 2) 東方遠征の道すじ（地理ではなく順路の模式図）
function campaignSvg(): string {
  const stops: { x: number; label: string }[] = [
    { x: 24, label: 'マケドニア' },
    { x: 96, label: '小アジア' },
    { x: 160, label: 'エジプト' },
    { x: 220, label: 'ペルシア' },
    { x: 280, label: 'インダス川' },
  ];
  const y = 66;
  let dots = '';
  stops.forEach((s, i) => {
    dots += `<circle cx="${s.x}" cy="${y}" r="5.5" fill="${PORPHYRY}"/>`;
    dots += `<text x="${s.x}" y="${i % 2 === 0 ? y - 14 : y + 22}" font-size="9" fill="${INK}" text-anchor="middle">${s.label}</text>`;
  });
  return (
    `<svg class="diagram-single" viewBox="0 0 300 110" width="100%" role="img" aria-label="アレクサンドロス大王の東方遠征の順路をたどる模式図">` +
    `<rect width="300" height="110" fill="${BG}"/>` +
    `<line x1="24" y1="${y}" x2="280" y2="${y}" stroke="${GOLD}" stroke-width="2.4"/>` +
    `<path d="M274 ${y - 5} l8 5 l-8 5" fill="none" stroke="${GOLD}" stroke-width="2.4"/>` +
    dots +
    `<text x="150" y="102" font-size="9" fill="${DEEP}" text-anchor="middle">西のマケドニアから東のインダス川へ（順路の模式図・地理は正確ではない）</text>` +
    `</svg>`
  );
}

// 3) ヴェルギナの王墓と星（納骨箱の意匠）
function verginaSvg(): string {
  // 8方向×2の星（光線数は出典で確定していないため、意匠として描く）
  const cx = 214, cy = 74, R = 30, r = 11;
  let star = '';
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    const x2 = cx + R * Math.cos(a), y2 = cy + R * Math.sin(a);
    star += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${GOLD}" stroke-width="2.4"/>`;
  }
  return (
    `<svg class="diagram-single" viewBox="0 0 300 160" width="100%" role="img" aria-label="ヴェルギナの大墳丘と王墓、黄金の納骨箱に描かれた星の意匠の模式図">` +
    `<rect width="300" height="160" fill="${BG}"/>` +
    // 大墳丘
    `<path d="M14 120 a96 60 0 0 1 150 0 Z" fill="${STONE}"/>` +
    // 墓室
    `<rect x="60" y="96" width="56" height="24" fill="${DEEP}"/>` +
    // 納骨箱（ラルナクス）
    `<rect x="74" y="102" width="28" height="16" rx="2" fill="${GOLD}"/>` +
    `<rect x="74" y="102" width="28" height="16" rx="2" fill="none" stroke="${DEEP}" stroke-width="1.2"/>` +
    `<text x="88" y="136" font-size="9" fill="${INK}" text-anchor="middle">大墳丘の下の王墓と黄金の納骨箱</text>` +
    // 星の意匠
    star +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${GOLD_SOFT}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${DEEP}" stroke-width="1.2"/>` +
    `<text x="${cx}" y="132" font-size="9" fill="${INK}" text-anchor="middle">アルゲアス朝の象徴とされる星</text>` +
    `</svg>`
  );
}

const FIGURE_DATA: Record<string, { caption: string; inner: string }> = {
  'phalanx': {
    caption: 'サリサとファランクスの模式図。長槍サリサ（約5.5から6メートル）を構えた兵が密集し、後列の槍も前方に届いて、幾重もの槍ぶすまをつくった。図は仕組みを示すもので、隊列の人数や寸法は正確ではない。',
    inner: `<div class="diagram-wrap">${phalanxSvg()}</div>`,
  },
  'campaign': {
    caption: '東方遠征の順路の模式図。アレクサンドロスは西のマケドニアから小アジア、エジプトを経てアケメネス朝ペルシアを滅ぼし、東のインダス川の流域にまで達した。図は順序を示すもので、地理や経路は正確ではない。',
    inner: `<div class="diagram-wrap">${campaignSvg()}</div>`,
  },
  'vergina': {
    caption: 'ヴェルギナの王墓の模式図。大きな墳丘の下に王墓が隠され、黄金の納骨箱（ラルナクス）が納められていた。蓋にはアルゲアス朝の象徴とされる星（太陽）の意匠が描かれていた。図は仕組みを示すもので、光線の数や寸法は正確ではない。',
    inner: `<div class="diagram-wrap">${verginaSvg()}</div>`,
  },
};

export const FIGURE_KEYS = Object.keys(FIGURE_DATA);

export function figureHtml(id: string): string | null {
  const f = FIGURE_DATA[id];
  if (!f) return null;
  return `<div class="content-figure">${f.inner}<p class="figure-caption">${f.caption}</p></div>`;
}
