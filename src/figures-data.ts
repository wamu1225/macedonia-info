// 自作SVG模式図のHTML文字列を一元管理する単一の真実源（SSOT）。
// React版（App.tsx の {{figure:KEY}} 展開）と prerender の双方が使う。
// テーマ：王国の紫紅 #7a2e2a × 金 #b8912f × 羊皮紙 #f4efe4。
// 地図は実海岸線（Natural Earth 50m）に基づき、北を上にした正距円筒図法で描く。

import { LAND_PATH } from './land-path';
import { BALKANS } from './balkans-data';
import { GREECE_LAND } from './greece-path';

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
    { color: OLIVE, terr: '西アジア', llon: 58, llat: 34.5, anchor: 'middle', poly: [[34, 37.6], [36, 35.8], [38, 33], [42, 31], [47, 29], [50, 25], [82, 25], [82, 47], [34, 47]] }, // セレウコス朝（東アナトリア〜シリア〜メソポタミア〜ペルシア〜東方。西アナトリアは除外・上辺右辺は画面外へ逃がす）
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

// 7) 支配勢力の移り変わりの帯年表（時間の長さを帯の幅で示す・地図ではない概念図）
function rulersSvg(): string {
  const RW = 344, RH = 150, RPAD = 16;
  const YMIN = -150, YMAX = 1920;
  const tx = (y: number) => +(RPAD + ((y - YMIN) / (YMAX - YMIN)) * (RW - 2 * RPAD)).toFixed(1);
  const BY = 60, BH = 32;
  const bands: [number, number, string, string, string][] = [
    [-146, 1000, STONE, 'ローマ／東ローマ帝国', INK],
    [1000, 1400, OLIVE, '', '#fff'],
    [1400, 1912, PORPHYRY, 'オスマン帝国', '#fff'],
  ];
  let band = '';
  for (const [y0, y1, c, label, fill] of bands) {
    const x0 = tx(y0), x1 = tx(y1);
    band += `<rect x="${x0}" y="${BY}" width="${(x1 - x0).toFixed(1)}" height="${BH}" fill="${c}"/>`;
    if (label) band += `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${BY + BH / 2 + 3.5}" font-size="9.5" fill="${fill}" text-anchor="middle" font-weight="700">${label}</text>`;
  }
  let div = '';
  for (const y of [-146, 1000, 1400, 1912]) div += `<line x1="${tx(y)}" y1="${BY - 4}" x2="${tx(y)}" y2="${BY + BH + 4}" stroke="${BG}" stroke-width="1.4"/>`;
  let axis = `<line x1="${tx(YMIN)}" y1="${BY + BH + 13}" x2="${tx(YMAX)}" y2="${BY + BH + 13}" stroke="${STONE}" stroke-width="1"/>`;
  for (const [y, t] of [[-146, '前146'], [500, '500'], [1000, '1000'], [1500, '1500'], [1912, '1912']] as [number, string][]) {
    const x = tx(y);
    axis += `<line x1="${x}" y1="${BY + BH + 9}" x2="${x}" y2="${BY + BH + 17}" stroke="${STONE}" stroke-width="1"/>`;
    axis += `<text x="${x}" y="${BY + BH + 29}" font-size="8" fill="#6b5a45" text-anchor="middle">${t}年</text>`;
  }
  const sx = tx(650);
  const slav =
    `<line x1="${sx}" y1="${BY - 20}" x2="${sx}" y2="${BY}" stroke="${DEEP}" stroke-width="1" stroke-dasharray="2 2"/>` +
    `<circle cx="${sx}" cy="${BY - 20}" r="2.6" fill="${DEEP}"/>` +
    `<text x="${sx + 5}" y="${BY - 22}" font-size="8" fill="${DEEP}" font-weight="600" text-anchor="start" paint-order="stroke" stroke="${BG}" stroke-width="2.4">6〜7世紀 スラヴ人の定住</text>`;
  const midMed = ((tx(1000) + tx(1400)) / 2).toFixed(1);
  const medLabel =
    `<line x1="${midMed}" y1="${BY + BH}" x2="${midMed}" y2="${BY + BH + 33}" stroke="${OLIVE}" stroke-width="0.8" stroke-dasharray="2 2"/>` +
    `<text x="${midMed}" y="${BY + BH + 44}" font-size="8.5" fill="${OLIVE}" text-anchor="middle" font-weight="700">中世＝諸勢力の交替</text>`;
  return (
    `<svg class="diagram-single" viewBox="0 0 ${RW} ${RH}" width="100%" role="img" aria-label="マケドニアの地を治めた勢力の移り変わりを、帯の幅で各時代の長さを表した帯年表。ローマから東ローマ帝国（紀元前146年から約1000年ごろ）、中世の諸勢力の交替、オスマン帝国（およそ1400年から1912年まで約500年）の順に続く">` +
    `<rect width="${RW}" height="${RH}" fill="${BG}"/>` +
    `<text x="${RW / 2}" y="18" font-size="11" fill="${DEEP}" text-anchor="middle" font-weight="700">マケドニアの地を治めた勢力の移り変わり</text>` +
    `<text x="${RW / 2}" y="31" font-size="8" fill="#6b5a45" text-anchor="middle">帯の幅は、その支配が続いたおよその長さを表す</text>` +
    slav + band + div + axis + medLabel +
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

// 5) 現代の北マケドニアと近隣国の位置図（Natural Earth の実国境・北が上）
function balkansSvg(): string {
  const { W, H, land, out } = BALKANS;
  const BLON0 = 18.8, BLAT_TOP = 44.2, BSX = 51.25, BSY = 68.4, BPAD = 8;
  const bx = (lon: number) => +(BPAD + (lon - BLON0) * BSX).toFixed(1);
  const by = (lat: number) => +(BPAD + (BLAT_TOP - lat) * BSY).toFixed(1);
  const STONE_L = '#e7dcc4', STONE_B = '#b6a888';
  const lbl = (lon: number, lat: number, t: string, o: { s?: number; f?: string; a?: string; w?: number; halo?: string } = {}) =>
    `<text x="${bx(lon)}" y="${by(lat)}" font-size="${o.s || 10}" fill="${o.f || INK}" text-anchor="${o.a || 'middle'}" font-weight="${o.w || 600}" paint-order="stroke" stroke="${o.halo || BG}" stroke-width="2.6">${t}</text>`;
  const neighbors = ['srb', 'kos', 'bgr', 'grc', 'alb'];
  const cx = W - 20, cy = 22;
  return (
    `<svg class="diagram-single" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="現代の北マケドニア共和国と、それを囲むセルビア・コソボ・ブルガリア・ギリシャ・アルバニアの位置を、北を上にした地図で示す">` +
    `<rect width="${W}" height="${H}" fill="${SEA}"/>` +
    `<path d="${land}" fill="${BG}" stroke="${STONE_B}" stroke-width="0.5"/>` +
    neighbors.map((k) => `<path d="${out[k]}" fill="${STONE_L}" stroke="${STONE_B}" stroke-width="0.8"/>`).join('') +
    `<path d="${out.nmk}" fill="${PORPHYRY}" fill-opacity="0.62" stroke="${DEEP}" stroke-width="1.3"/>` +
    lbl(21.0, 43.5, 'セルビア') + lbl(20.6, 42.55, 'コソボ', { s: 8 }) + lbl(23.6, 42.2, 'ブルガリア') +
    lbl(22.3, 40.15, 'ギリシャ') + lbl(19.85, 40.72, 'アルバニア', { s: 9 }) +
    lbl(21.75, 41.35, '北マケドニア', { f: '#fff', w: 700, s: 11, halo: DEEP }) +
    `<circle cx="${bx(21.43)}" cy="${by(42.0)}" r="3.4" fill="${GOLD}" stroke="#fff" stroke-width="1"/>` +
    lbl(21.52, 42.07, 'スコピエ', { a: 'start', s: 8.5, f: '#fff', halo: DEEP }) +
    `<circle cx="${bx(20.72)}" cy="${by(41.05)}" r="3" fill="${SEA}" stroke="#3c5560" stroke-width="0.9"/>` +
    lbl(20.55, 41.0, 'オフリド湖', { a: 'end', s: 8 }) +
    // 方位
    `<circle cx="${cx}" cy="${cy}" r="13" fill="${BG}" stroke="${INK}" stroke-width="1"/>` +
    `<path d="M${cx} ${cy - 11} l4 12 l-4 -3 l-4 3 Z" fill="${PORPHYRY}"/>` +
    `<text x="${cx}" y="${cy - 12.5}" font-size="7.5" fill="${INK}" text-anchor="middle" font-weight="700">N</text>` +
    `<text x="${W - 6}" y="${H - 6}" font-size="7" fill="${DEEP}" text-anchor="end" font-style="italic">地図データ: Natural Earth</text>` +
    `</svg>`
  );
}

// 6) マケドニアと南部ギリシャのポリスの位置図（Natural Earth 10m の実海岸線・北が上）
function greeceSvg(): string {
  const GW = 344, GH = 373, GPAD = 8;
  const GLON0 = 19.4, GLAT_TOP = 41.9, GSX = 40, GSY = 51.0404;
  const gx = (lon: number) => +(GPAD + (lon - GLON0) * GSX).toFixed(1);
  const gy = (lat: number) => +(GPAD + (GLAT_TOP - lat) * GSY).toFixed(1);
  const STONE_B = '#b6a888', SEA_INK = '#3c5560', EARTH = '#6b5a45';
  type O = { s?: number; f?: string; a?: string; w?: number; halo?: string; dx?: number; dy?: number; i?: boolean };
  const lbl = (lon: number, lat: number, t: string, o: O = {}) =>
    `<text x="${gx(lon) + (o.dx || 0)}" y="${gy(lat) + (o.dy || 0)}" font-size="${o.s || 10}" fill="${o.f || INK}" text-anchor="${o.a || 'middle'}" font-weight="${o.w || 600}" paint-order="stroke" stroke="${o.halo || BG}" stroke-width="2.6"${o.i ? ' font-style="italic"' : ''}>${t}</text>`;
  const dot = (lon: number, lat: number, r: number, fill: string) =>
    `<circle cx="${gx(lon)}" cy="${gy(lat)}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="1"/>`;
  // 王家の都と南部のおもなポリス（座標は実地点）
  const royal: [number, number, string, string, number, number][] = [
    [22.52, 40.76, 'ペラ', 'start', 4, -3],
    [22.32, 40.48, 'アイガイ', 'end', -5, 4],
  ];
  const poleis: [number, number, string, string, number, number][] = [
    [23.73, 37.98, 'アテナイ', 'start', 5, 1],
    [23.32, 38.32, 'テーバイ', 'start', 5, -4],
    [22.93, 37.94, 'コリントス', 'end', -5, -3],
    [22.72, 37.63, 'アルゴス', 'start', 5, 7],
    [22.43, 37.07, 'スパルタ', 'start', 5, 3],
    [21.63, 37.64, 'オリュンピア', 'end', -5, 3],
  ];
  return (
    `<svg class="diagram-single" viewBox="0 0 ${GW} ${GH}" width="100%" role="img" aria-label="マケドニア王国の都ペラ・アイガイと、南部ギリシャのポリス（アテナイ・テーバイ・コリントス・アルゴス・スパルタ・オリュンピア）の位置を、北を上にした地図で示す">` +
    `<rect width="${GW}" height="${GH}" fill="${SEA}"/>` +
    `<path d="${GREECE_LAND}" fill="${BG}" stroke="${STONE_B}" stroke-width="0.6"/>` +
    lbl(25.4, 38.9, 'エーゲ海', { f: SEA_INK, halo: SEA, i: true, w: 500 }) +
    lbl(19.95, 38.2, 'イオニア海', { f: SEA_INK, halo: SEA, i: true, w: 500, s: 9 }) +
    lbl(23.25, 35.35, '地中海', { f: SEA_INK, halo: SEA, i: true, w: 500, s: 9 }) +
    lbl(21.6, 41.1, 'マケドニア', { s: 11, f: DEEP, w: 700 }) +
    lbl(21.9, 39.6, 'テッサリア', { s: 9, f: EARTH }) +
    lbl(21.95, 36.72, 'ペロポネソス半島', { s: 8.5, f: EARTH }) +
    lbl(24.9, 35.25, 'クレタ島', { s: 8.5, f: EARTH }) +
    royal.map(([lo, la, t, a, dx, dy]) => dot(lo, la, 4, PORPHYRY) + lbl(lo, la, t, { a, dx, dy, s: 10, w: 700, f: DEEP })).join('') +
    poleis.map(([lo, la, t, a, dx, dy]) => dot(lo, la, 3.2, GOLD) + lbl(lo, la, t, { a, dx, dy, s: 9.5 })).join('') +
    // 方位
    `<circle cx="${GW - 20}" cy="22" r="13" fill="${BG}" stroke="${INK}" stroke-width="1"/>` +
    `<path d="M${GW - 20} 11 l4 12 l-4 -3 l-4 3 Z" fill="${PORPHYRY}"/>` +
    `<text x="${GW - 20}" y="9.5" font-size="7.5" fill="${INK}" text-anchor="middle" font-weight="700">N</text>` +
    // 凡例
    `<g transform="translate(10,${GH - 44})">` +
    `<rect x="0" y="0" width="118" height="34" rx="3" fill="${BG}" fill-opacity="0.92" stroke="${STONE_B}" stroke-width="0.7"/>` +
    `<circle cx="11" cy="11" r="4" fill="${PORPHYRY}" stroke="#fff" stroke-width="1"/>` +
    `<text x="21" y="14" font-size="8.5" fill="${INK}">マケドニア王家の都</text>` +
    `<circle cx="11" cy="25" r="3.2" fill="${GOLD}" stroke="#fff" stroke-width="1"/>` +
    `<text x="21" y="28" font-size="8.5" fill="${INK}">南部のおもなポリス</text></g>` +
    `<text x="${GW - 6}" y="${GH - 6}" font-size="7" fill="${DEEP}" text-anchor="end" font-style="italic">地図データ: Natural Earth</text>` +
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
  'greece': {
    caption: 'マケドニアと南部ギリシャの位置図（北が上）。マケドニアはエーゲ海の北に位置し、王家の都ペラとアイガイ（現在のヴェルギナ）は海に近い平野にあった。南のペロポネソス半島やアッティカには、アテナイ・スパルタ・テーバイ・アルゴス・コリントスといったポリスが並ぶ。王家が起源を主張したアルゴスも、王が参加を望んだ競技の地オリュンピアも、この南部にある。海岸線は Natural Earth のデータに基づき、都市の位置は実際の座標による。当時の勢力の境は示していない。',
    inner: `<div class="diagram-wrap">${greeceSvg()}</div>`,
  },
  'balkans': {
    caption: '現代の北マケドニア共和国と近隣国の位置図（北が上）。内陸のこの国は、北のセルビアとコソボ、東のブルガリア、南のギリシャ、西のアルバニアに囲まれている。金の点が首都スコピエ、南西の青い点が世界遺産のオフリド湖。国境は Natural Earth のデータに基づく。',
    inner: `<div class="diagram-wrap">${balkansSvg()}</div>`,
  },
  'rulers': {
    caption: 'マケドニアの地を治めた勢力の移り変わりを示した帯年表（北が上ではなく、左から右へ時間が進む）。帯の幅は、その支配がおよそどれだけ続いたかを表す。ローマ帝国からその流れをくむ東ローマ（ビザンティン）帝国までが千年あまりを占め、6から7世紀にはスラヴ人の定住が進んだ。中世にはブルガリアやセルビアなどの勢力が入れ替わり、およそ1400年ごろから1912年まで、五百年ほどオスマン帝国の統治が続いた。年の区切りはおおよそのもの。',
    inner: `<div class="diagram-wrap">${rulersSvg()}</div>`,
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
