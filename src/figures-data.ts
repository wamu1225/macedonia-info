// 自作SVG模式図のHTML文字列を一元管理する単一の真実源（SSOT）。
// React版（App.tsx の {{figure:KEY}} 展開）と prerender の双方が使う。
// テーマ：王国の紫紅 #7a2e2a × 金 #b8912f × 羊皮紙 #f4efe4。
// 地図は実海岸線（Natural Earth 50m）に基づき、北を上にした正距円筒図法で描く。

import { LAND_PATH } from './land-path';

const BG = '#f4efe4';
const PORPHYRY = '#7a2e2a';
const DEEP = '#5c1f1f';
const GOLD = '#b8912f';
const GOLD_SOFT = '#d7b968';
const INK = '#2b2622';
const STONE = '#cabfa6';
const SEA = '#a9c3cf';
const SEA_LINE = '#7c9aa6';
const OLIVE = '#5f7a6a';

// ─── 共有ベースマップ（正距円筒＝経度緯度をそのまま平面に置く。北が上・東が右） ───
// 図の向きが「適当」という指摘（2026-07-19）を受け、実座標に基づく向きの正しい地図に作り替えた。
// 縮尺は概略・海岸線は簡略化しているが、東西南北と地点どうしの相対位置は実地理に沿う。
const MAP_W = 344;
const MAP_H = 188;
const LON0 = 19, LAT_TOP = 44;      // 左上の基準（経度19度・緯度44度）
const SX = 5.6, SY = 6.6;           // 1度あたりのピクセル（緯度33度付近で東西を圧縮）
const PAD = 10;
function px(lon: number): number { return +(PAD + (lon - LON0) * SX).toFixed(1); }
function py(lat: number): number { return +(PAD + (LAT_TOP - lat) * SY).toFixed(1); }
function baseMap(): string {
  const seaLabel = (lon: number, lat: number, t: string, size = 8) =>
    `<text x="${px(lon)}" y="${py(lat)}" font-size="${size}" fill="#3c5560" text-anchor="middle" font-style="italic">${t}</text>`;
  // 方位（右上・北が上）
  const cx = MAP_W - 20, cy = 22;
  const compass =
    `<circle cx="${cx}" cy="${cy}" r="13" fill="${BG}" stroke="${INK}" stroke-width="1"/>` +
    `<path d="M${cx} ${cy - 11} l4 12 l-4 -3 l-4 3 Z" fill="${PORPHYRY}"/>` +
    `<text x="${cx}" y="${cy - 12.5}" font-size="7.5" fill="${INK}" text-anchor="middle" font-weight="700">N</text>`;
  return (
    // 海を全面に敷き、実海岸線に基づく陸地を羊皮紙色で重ねる
    `<rect width="${MAP_W}" height="${MAP_H}" fill="${SEA}"/>` +
    `<path d="${LAND_PATH}" fill="${BG}" stroke="${SEA_LINE}" stroke-width="0.6"/>` +
    seaLabel(27, 34.3, '地中海') + seaLabel(34.5, 43, '黒海', 7.5) +
    seaLabel(51, 27.2, 'ペルシア湾', 7) + seaLabel(50.5, 41.5, 'カスピ海', 7) + seaLabel(36.2, 22.5, '紅海', 7) +
    compass
  );
}

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

// 2) 東方遠征の地図（実座標に基づく・北が上）。進軍路と四つの決戦（B1a）を重ねる。
function campaignSvg(): string {
  type P = { lon: number; lat: number; label: string; kind: 'battle' | 'city'; year?: string; ldx: number; ldy: number; anchor: string };
  // 進軍の順（この順でルート線を引く）。座標はおおよその実地点。ラベルは衝突を避けて個別配置。
  const pts: P[] = [
    { lon: 22.5, lat: 40.8, label: 'ペラ',            kind: 'city',   ldx: -7, ldy: -9, anchor: 'end' },
    { lon: 27.3, lat: 40.2, label: 'グラニコス',       kind: 'battle', year: '前334', ldx: 7, ldy: -9, anchor: 'start' },
    { lon: 36.2, lat: 36.9, label: 'イッソス',         kind: 'battle', year: '前333', ldx: -9, ldy: 5, anchor: 'end' },
    { lon: 29.9, lat: 31.2, label: 'アレクサンドリア',  kind: 'city',   ldx: 0, ldy: 17, anchor: 'middle' },
    { lon: 43.4, lat: 36.4, label: 'ガウガメラ',       kind: 'battle', year: '前331', ldx: 0, ldy: -11, anchor: 'middle' },
    { lon: 44.4, lat: 32.5, label: 'バビロン',         kind: 'city',   ldx: -6, ldy: 16, anchor: 'end' },
    { lon: 52.9, lat: 29.9, label: 'ペルセポリス',      kind: 'city',   ldx: 8, ldy: 4, anchor: 'start' },
    { lon: 73.7, lat: 32.9, label: 'ヒュダスペス',      kind: 'battle', year: '前326', ldx: -7, ldy: -11, anchor: 'end' },
  ];
  const route = pts.map((p) => `${px(p.lon)},${py(p.lat)}`).join(' ');
  let marks = '';
  for (const p of pts) {
    const x = px(p.lon), y = py(p.lat);
    if (p.kind === 'battle') {
      marks += `<path d="M${x} ${y - 6} L${x + 6} ${y} L${x} ${y + 6} L${x - 6} ${y} Z" fill="${PORPHYRY}" stroke="${GOLD}" stroke-width="1.2"/>`;
    } else {
      marks += `<circle cx="${x}" cy="${y}" r="3.6" fill="${INK}"/>`;
    }
    const lx = x + p.ldx, ly = y + p.ldy;
    marks += `<text x="${lx}" y="${ly}" font-size="9" fill="${INK}" text-anchor="${p.anchor}" font-weight="600" paint-order="stroke" stroke="${BG}" stroke-width="2.4">${p.label}</text>`;
    if (p.year) marks += `<text x="${lx}" y="${p.ldy < 0 ? ly - 11 : ly + 11}" font-size="7.5" fill="${DEEP}" text-anchor="${p.anchor}" paint-order="stroke" stroke="${BG}" stroke-width="2.2">${p.year}</text>`;
  }
  return (
    `<svg class="diagram-single" viewBox="0 0 ${MAP_W} ${MAP_H}" width="100%" role="img" aria-label="アレクサンドロス大王の東方遠征の進軍路と四つの決戦（グラニコス・イッソス・ガウガメラ・ヒュダスペス）を、北を上にした地図上に示す">` +
    baseMap() +
    `<polyline points="${route}" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` +
    marks +
    // 凡例
    `<path d="M14 ${MAP_H - 10} l5 -5 l5 5 l-5 5 Z" fill="${PORPHYRY}" stroke="${GOLD}" stroke-width="1"/>` +
    `<text x="26" y="${MAP_H - 7} " font-size="8" fill="${INK}">決戦</text>` +
    `<circle cx="66" cy="${MAP_H - 10}" r="3.4" fill="${INK}"/>` +
    `<text x="74" y="${MAP_H - 7}" font-size="8" fill="${INK}">おもな都市</text>` +
    `<text x="${MAP_W - 6}" y="${MAP_H - 6}" font-size="7" fill="${DEEP}" text-anchor="end" font-style="italic">地図データ: Natural Earth</text>` +
    `</svg>`
  );
}

// 3) ヘレニズム三王国の勢力範囲（実座標に基づく・北が上）。色分けで王朝を示す。
function kingdomsSvg(): string {
  // 各王朝の勢力範囲を、実海岸線でクリップした領域として塗る（楕円をやめ、海にはみ出さず陸地に沿わせる）。
  const clipDef = `<defs><clipPath id="hk-land"><path d="${LAND_PATH}"/></clipPath></defs>`;
  type R = { color: string; terr: string; llon: number; llat: number; anchor: string; poly: [number, number][] };
  const regions: R[] = [
    { color: OLIVE, terr: '西アジア', llon: 53, llat: 35.5, anchor: 'middle', poly: [[35, 41.8], [78, 41.8], [78, 28], [49, 28], [40, 32], [35, 35.5]] },       // セレウコス朝（シリア〜メソポタミア〜ペルシア〜東方）
    { color: GOLD, terr: 'エジプト', llon: 30, llat: 27, anchor: 'middle', poly: [[24.5, 32], [35, 32], [35, 29], [34, 24], [30, 22], [25, 22.5], [24.5, 28]] }, // プトレマイオス朝（エジプト〜南レバント沿岸）
    { color: PORPHYRY, terr: 'マケドニア', llon: 20.4, llat: 38.6, anchor: 'start', poly: [[18.8, 41.8], [25, 41.8], [25, 36], [18.8, 36]] },                    // アンティゴノス朝（マケドニア〜ギリシア）
  ];
  let shapes = '';
  for (const r of regions) {
    const poly = r.poly.map(([lo, la]) => `${px(lo)},${py(la)}`).join(' ');
    shapes += `<polygon points="${poly}" fill="${r.color}" fill-opacity="0.5" clip-path="url(#hk-land)"/>`;
  }
  for (const r of regions) {
    shapes += `<text x="${px(r.llon)}" y="${py(r.llat)}" font-size="10" fill="${INK}" text-anchor="${r.anchor}" font-weight="700" paint-order="stroke" stroke="${BG}" stroke-width="2.8">${r.terr}</text>`;
  }
  const legend: { color: string; name: string }[] = [
    { color: PORPHYRY, name: 'アンティゴノス朝' },
    { color: GOLD, name: 'プトレマイオス朝' },
    { color: OLIVE, name: 'セレウコス朝' },
  ];
  let leg = '';
  let lx = 12;
  const ly = MAP_H - 6;
  for (const item of legend) {
    leg += `<rect x="${lx}" y="${ly - 7}" width="9" height="9" rx="1.5" fill="${item.color}" fill-opacity="0.5" stroke="${item.color}" stroke-width="1.2"/>`;
    leg += `<text x="${lx + 13}" y="${ly + 1}" font-size="8.5" fill="${INK}">${item.name}</text>`;
    lx += item.name.length * 9 + 26;
  }
  return (
    `<svg class="diagram-single" viewBox="0 0 ${MAP_W} ${MAP_H + 12}" width="100%" role="img" aria-label="ディアドコイの争いののちに分かれたヘレニズム三王国（アンティゴノス朝・プトレマイオス朝・セレウコス朝）の勢力範囲を、北を上にした地図上に色分けして示す">` +
    clipDef +
    baseMap() +
    shapes +
    `<g transform="translate(0 12)">${leg}</g>` +
    `<text x="${MAP_W - 6}" y="${MAP_H - 6}" font-size="7" fill="${DEEP}" text-anchor="end" font-style="italic">範囲は概略・正確な国境ではない</text>` +
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
    caption: '東方遠征の道すじと四つの決戦の地図（北が上）。西のマケドニア（ペラ）を発ち、グラニコス・イッソスで勝ち、南のエジプトへ回ったのち、ガウガメラでアケメネス朝を破り、東のヒュダスペス（インダス川の支流）にまで達した。◆が決戦の地、●がおもな都市で、位置はおおよその実地点。海岸線は Natural Earth のデータに基づく。',
    inner: `<div class="diagram-wrap">${campaignSvg()}</div>`,
  },
  'kingdoms': {
    caption: 'ディアドコイの争いののちに分かれたヘレニズム三王国の地図（北が上）。マケドニアを**アンティゴノス朝**、エジプトを**プトレマイオス朝**、シリアからペルシアにかけての西アジアを**セレウコス朝**が治めた。海岸線は Natural Earth のデータに基づき、色分けした範囲は勢力のおおよその広がりで、正確な国境ではない。',
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
