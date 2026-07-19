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
const SEA = '#aec6cf';
const OLIVE = '#5f7a6a';

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

// 2) 東方遠征の模式地図（2D配置・正確な地理ではない）。西→東の広がりと、南のエジプトへの
//    迂回、メソポタミアへの転進を大づかみに示し、決戦4つ（B1a）を◆で重ねる。
function campaignSvg(): string {
  type P = { x: number; y: number; label: string; kind: 'battle' | 'city'; year?: string; up?: boolean; anchor?: string };
  // 進軍の順に並べる（この順でルート線を引く）
  const pts: P[] = [
    { x: 34,  y: 44,  label: 'ペラ',        kind: 'city',   up: true },
    { x: 82,  y: 50,  label: 'グラニコス',   kind: 'battle', year: '前334', up: true },
    { x: 128, y: 78,  label: 'イッソス',     kind: 'battle', year: '前333', up: false },
    { x: 96,  y: 150, label: 'エジプト',     kind: 'city',   up: false },
    { x: 176, y: 92,  label: 'ガウガメラ',   kind: 'battle', year: '前331', up: true },
    { x: 196, y: 120, label: 'バビロン',     kind: 'city',   up: false },
    { x: 300, y: 96,  label: 'ヒュダスペス',  kind: 'battle', year: '前326', up: true, anchor: 'end' },
  ];
  const route = pts.map((p) => `${p.x},${p.y}`).join(' ');
  let marks = '';
  for (const p of pts) {
    if (p.kind === 'battle') {
      // ◆（決戦の地）
      marks += `<path d="M${p.x} ${p.y - 6} L${p.x + 6} ${p.y} L${p.x} ${p.y + 6} L${p.x - 6} ${p.y} Z" fill="${PORPHYRY}" stroke="${GOLD}" stroke-width="1.2"/>`;
    } else {
      marks += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${INK}"/>`;
    }
    const anchor = p.anchor || 'middle';
    const lx = anchor === 'end' ? p.x + 6 : p.x;
    const ly = p.up ? p.y - 11 : p.y + 17;
    marks += `<text x="${lx}" y="${ly}" font-size="9" fill="${INK}" text-anchor="${anchor}" font-weight="600">${p.label}</text>`;
    if (p.year) marks += `<text x="${lx}" y="${p.up ? p.y - 22 : p.y + 28}" font-size="7.5" fill="${DEEP}" text-anchor="${anchor}">${p.year}</text>`;
  }
  return (
    `<svg class="diagram-single" viewBox="0 0 320 200" width="100%" role="img" aria-label="アレクサンドロス大王の東方遠征の道すじと四つの決戦（グラニコス・イッソス・ガウガメラ・ヒュダスペス）を示す模式地図">` +
    `<rect width="320" height="200" fill="${BG}"/>` +
    // 地中海（左上のおおまかな海域）
    `<path d="M0 20 Q70 30 110 44 Q140 55 120 74 Q80 96 30 86 Q8 82 0 96 Z" fill="${SEA}" opacity="0.55"/>` +
    `<text x="40" y="60" font-size="8.5" fill="#3c5560" text-anchor="middle" font-style="italic">地中海</text>` +
    // 遠征ルート
    `<polyline points="${route}" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` +
    // ルート終端の矢じり（ヒュダスペス手前）
    `<path d="M292 90 l10 6 l-11 5" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linejoin="round"/>` +
    marks +
    // 凡例
    `<path d="M18 176 l5 -5 l5 5 l-5 5 Z" fill="${PORPHYRY}" stroke="${GOLD}" stroke-width="1"/>` +
    `<text x="30" y="179" font-size="8" fill="${INK}">決戦</text>` +
    `<circle cx="70" cy="176" r="3.5" fill="${INK}"/>` +
    `<text x="78" y="179" font-size="8" fill="${INK}">おもな都市</text>` +
    `<text x="316" y="192" font-size="7.5" fill="${DEEP}" text-anchor="end" font-style="italic">配置は模式・正確な地理ではない</text>` +
    `</svg>`
  );
}

// 3) ディアドコイの争いのすえに分かれたヘレニズム三王国（勢力範囲の模式地図）
function kingdomsSvg(): string {
  // 大きいセレウコス朝を背面に、その上に他2つを重ねる。色は凡例で王朝に対応づける。
  type R = { cx: number; cy: number; rx: number; ry: number; color: string; terr: string };
  const regions: R[] = [
    { cx: 214, cy: 104, rx: 96, ry: 50, color: OLIVE, terr: '西アジア' },      // セレウコス朝
    { cx: 92,  cy: 158, rx: 40, ry: 22, color: GOLD, terr: 'エジプト' },        // プトレマイオス朝
    { cx: 50,  cy: 46,  rx: 30, ry: 19, color: PORPHYRY, terr: 'マケドニア' },  // アンティゴノス朝
  ];
  let shapes = '';
  for (const r of regions) {
    shapes += `<ellipse cx="${r.cx}" cy="${r.cy}" rx="${r.rx}" ry="${r.ry}" fill="${r.color}" fill-opacity="0.24" stroke="${r.color}" stroke-width="2"/>`;
    shapes += `<text x="${r.cx}" y="${r.cy + 4}" font-size="10" fill="${INK}" text-anchor="middle" font-weight="700">${r.terr}</text>`;
  }
  // 凡例（色→王朝名）
  const legend: { color: string; name: string }[] = [
    { color: PORPHYRY, name: 'アンティゴノス朝' },
    { color: GOLD, name: 'プトレマイオス朝' },
    { color: OLIVE, name: 'セレウコス朝' },
  ];
  let leg = '';
  let lx = 12;
  const ly = 190;
  for (const item of legend) {
    leg += `<rect x="${lx}" y="${ly - 7}" width="9" height="9" rx="1.5" fill="${item.color}" fill-opacity="0.5" stroke="${item.color}" stroke-width="1.2"/>`;
    leg += `<text x="${lx + 13}" y="${ly + 1}" font-size="8.5" fill="${INK}">${item.name}</text>`;
    lx += item.name.length * 9 + 26;
  }
  return (
    `<svg class="diagram-single" viewBox="0 0 320 205" width="100%" role="img" aria-label="ディアドコイの争いののちに分かれたヘレニズム三王国（アンティゴノス朝・プトレマイオス朝・セレウコス朝）の勢力範囲を色分けした模式地図">` +
    `<rect width="320" height="205" fill="${BG}"/>` +
    // 地中海（三王国の間の海域）
    `<path d="M78 44 Q120 54 150 70 Q166 82 150 96 Q112 112 84 100 Q70 92 78 76 Z" fill="${SEA}" fill-opacity="0.5"/>` +
    `<text x="112" y="82" font-size="8" fill="#3c5560" text-anchor="middle" font-style="italic">地中海</text>` +
    shapes +
    leg +
    `<text x="308" y="176" font-size="7.5" fill="${DEEP}" text-anchor="end" font-style="italic">範囲は大づかみの模式・正確な国境ではない</text>` +
    `</svg>`
  );
}

// 4) ヴェルギナの王墓と星（納骨箱の意匠）
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
    `<text x="80" y="136" font-size="9" fill="${INK}" text-anchor="middle">王墓と黄金の納骨箱</text>` +
    // 星の意匠
    star +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${GOLD_SOFT}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${DEEP}" stroke-width="1.2"/>` +
    `<text x="${cx}" y="132" font-size="9" fill="${INK}" text-anchor="middle">アルゲアス朝の星</text>` +
    `</svg>`
  );
}

const FIGURE_DATA: Record<string, { caption: string; inner: string }> = {
  'phalanx': {
    caption: 'サリサとファランクスの模式図。長槍サリサ（約5.5から6メートル）を構えた兵が密集し、後列の槍も前方に届いて、幾重もの槍ぶすまをつくった。図は仕組みを示すもので、隊列の人数や寸法は正確ではない。',
    inner: `<div class="diagram-wrap">${phalanxSvg()}</div>`,
  },
  'campaign': {
    caption: '東方遠征の道すじと四つの決戦の模式地図。西のマケドニア（ペラ）を発ち、グラニコス・イッソスで勝ち、南のエジプトへ回ったのち、ガウガメラでアケメネス朝を破り、東のヒュダスペス（インダス川の支流）にまで達した。◆が決戦の地、●がおもな都市を表す。配置は大づかみの模式で、正確な地理ではない。',
    inner: `<div class="diagram-wrap">${campaignSvg()}</div>`,
  },
  'kingdoms': {
    caption: 'ディアドコイの争いののちに分かれたヘレニズム三王国の模式地図。マケドニアを**アンティゴノス朝**、エジプトを**プトレマイオス朝**、シリアからペルシアにかけての西アジアを**セレウコス朝**が治めた。色分けは勢力のおおよその範囲を示すもので、正確な国境ではない。',
    inner: `<div class="diagram-wrap">${kingdomsSvg()}</div>`,
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
