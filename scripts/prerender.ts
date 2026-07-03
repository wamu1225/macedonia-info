import * as fs from 'fs';
import * as path from 'path';
import { articles } from '../src/data/articles.ts';
import type { Article } from '../src/data/articles.ts';
import { figureHtml } from '../src/figures-data.ts';
import { referencesHtml } from '../src/references.ts';
import { sectionIconSvg } from '../src/section-icons.ts';
import { tokenizeInline } from '../src/lib/inline.ts';
import type { InlineToken } from '../src/lib/inline.ts';
import { TIMELINE } from '../src/data/timeline-data.ts';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://study-apps.com/macedonia-info';
const SITE_NAME = 'マケドニア史ガイド';
const PORPHYRY = '#7a2e2a';
const DEEP = '#5c1f1f';
const GOLD = '#b8912f';

const ico = (name: string, size: number, color = PORPHYRY) =>
  `<span style="color:${color};display:inline-flex;vertical-align:middle">${sectionIconSvg(name, size)}</span>`;

console.log('--- macedonia-info SSG Pre-rendering ---');

if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tokensToHtml(tokens: InlineToken[]): string {
  return tokens
    .map((tok) => {
      if (tok.type === 'text') return escapeHtml(tok.value);
      if (tok.type === 'bold') return `<strong>${tokensToHtml(tok.children)}</strong>`;
      const href = tok.href;
      const isExternal = /^https?:\/\//.test(href);
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(href)}"${attrs}>${tokensToHtml(tok.children)}</a>`;
    })
    .join('');
}
const inlineToHtml = (text: string) => tokensToHtml(tokenizeInline(text));

function slugifyAscii(_text: string, index: number): string {
  return `section-${index}`;
}

function markdownToHtml(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  let i = 0;
  let h2Index = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '') { i++; continue; }

    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      out.push(`<h2 id="${slugifyAscii(text, h2Index++)}" class="content-h2">${inlineToHtml(text)}</h2>`);
      i++; continue;
    }
    if (trimmed.startsWith('### ')) {
      out.push(`<h3 class="content-h3">${inlineToHtml(trimmed.slice(4))}</h3>`);
      i++; continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const rows = tableLines.map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
        const isSep = (r: string[]) => r.every((c) => /^[-:]+$/.test(c));
        const header = rows[0];
        const data = rows.slice(1).filter((r) => !isSep(r));
        const headerHtml = header.map((c) => `<th>${inlineToHtml(c)}</th>`).join('');
        const bodyHtml = data.map((row) => `<tr>${row.map((c) => `<td>${inlineToHtml(c)}</td>`).join('')}</tr>`).join('');
        out.push(`<div class="content-table-wrap"><table class="content-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`);
      }
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      out.push(`<ol class="content-ol">${items.map((it) => `<li>${inlineToHtml(it)}</li>`).join('')}</ol>`);
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(`<ul class="content-ul">${items.map((it) => `<li>${inlineToHtml(it)}</li>`).join('')}</ul>`);
      continue;
    }

    if (trimmed.startsWith('💡 ')) { out.push(`<p class="callout callout-tip">${inlineToHtml(trimmed.slice(2).trim())}</p>`); i++; continue; }
    if (trimmed.startsWith('⚠️ ')) { out.push(`<p class="callout callout-warning">${inlineToHtml(trimmed.slice(2).trim())}</p>`); i++; continue; }
    if (trimmed.startsWith('📖 ')) { out.push(`<p class="callout callout-info">${inlineToHtml(trimmed.slice(2).trim())}</p>`); i++; continue; }

    const figMatch = trimmed.match(/^\{\{figure:([a-z0-9-]+)\}\}$/);
    if (figMatch) {
      const html = figureHtml(figMatch[1]);
      if (html) out.push(html);
      i++; continue;
    }

    out.push(`<p class="content-p">${inlineToHtml(trimmed)}</p>`);
    i++;
  }
  return out.join('\n');
}

function buildTocHtml(toc: string[]): string {
  if (!toc.length) return '';
  const items = toc.map((it, idx) => `<li><a href="#${slugifyAscii(it, idx)}">${escapeHtml(it)}</a></li>`).join('');
  return `<nav class="toc"><div class="toc-title">目次</div><ol class="toc-list">${items}</ol></nav>`;
}

function formatDateJa(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

// ── ホーム＝マケドニアを貫く縦断年表（静的フォールバック） ──
const NAV_GROUPS: { label: string; ids: string[] }[] = [
  { label: '古代マケドニア王国', ids: ['argead', 'philip', 'alexander', 'successors'] },
  { label: '遺跡と実像', ids: ['archaeology'] },
  { label: '名の変遷と現代', ids: ['medieval', 'modern'] },
  { label: '疑問', ids: ['faq'] },
];

const ERA_DOT: Record<string, string> = {
  archaic: GOLD, ancient: PORPHYRY, medieval: '#8a7a52', modern: DEEP,
};

function buildHomeTimeline(): string {
  const items = TIMELINE.map((e) => {
    const titleHtml = e.link
      ? `<a href="/macedonia-info/${e.link}/" style="color:${DEEP};text-decoration:none;font-weight:700">${escapeHtml(e.title)}</a>`
      : `<span style="color:${DEEP};font-weight:700">${escapeHtml(e.title)}</span>`;
    return `<li style="position:relative;padding:0 0 18px 30px">
      <span style="position:absolute;left:0;top:4px;width:16px;height:16px;border-radius:50%;background:${ERA_DOT[e.era] || GOLD};border:3px solid #fffdf8;box-shadow:0 0 0 1px #e2d9c8"></span>
      <div style="font-size:0.78rem;font-weight:700;color:${GOLD}">${escapeHtml(e.when)}</div>
      <div style="font-family:'Yu Mincho','Hiragino Mincho ProN',serif;font-size:1.05rem;margin-top:1px">${titleHtml}</div>
      <p style="font-size:0.86rem;color:#6a5f54;margin:3px 0 0;line-height:1.7">${escapeHtml(e.note)}</p>
    </li>`;
  }).join('');

  const navHtml = NAV_GROUPS.map((g) => {
    const links = g.ids.map((id) => {
      const a = articles.find((x) => x.id === id);
      if (!a) return '';
      return `<li style="margin-bottom:8px"><a href="/macedonia-info/${a.id}/" style="color:${PORPHYRY};font-weight:600;text-decoration:none">${ico(a.icon, 15)} ${escapeHtml(a.shortTitle)}</a><br><span style="color:#6a5f54;font-size:0.85rem">${escapeHtml(a.description)}</span></li>`;
    }).join('');
    return `<div style="margin:0 0 16px"><div style="font-size:0.95rem;font-weight:700;color:${DEEP};border-left:4px solid ${GOLD};padding-left:10px;margin-bottom:8px">${escapeHtml(g.label)}</div><ul style="list-style:none;padding:0 0 0 14px;margin:0">${links}</ul></div>`;
  }).join('');

  return `<article id="static-fallback" style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif;line-height:1.85;max-width:880px;margin:0 auto;padding:24px 16px;color:#2b2622">
  <section style="background:#fffdf8;border:1px solid #e2d9c8;border-top:5px solid ${PORPHYRY};border-radius:16px;padding:24px 26px 20px;margin-bottom:24px">
    <h1 style="font-family:'Yu Mincho','Hiragino Mincho ProN',serif;font-size:1.7rem;margin:0 0 8px;letter-spacing:0.04em;color:${DEEP}">マケドニアを貫く一本の年表</h1>
    <p style="font-size:0.95rem;color:#6a5f54;margin:0 0 18px">古代の王国から現代の北マケドニア共和国まで。「マケドニア」という名がたどった道すじを、一本の年表で一望します。</p>
    <ol style="list-style:none;margin:0;padding:0;border-left:2px solid #e2d9c8;margin-left:7px;padding-left:0">${items}</ol>
    <p style="font-size:0.76rem;color:#6a5f54;margin:16px 0 0;padding-top:12px;border-top:1px solid #e2d9c8">年代や考古学的な比定には諸説があり、この年表は目安です。詳しい経緯と出典は各記事にあります。</p>
  </section>
  <p style="color:#6a5f54;font-size:0.96rem;margin:0 0 24px">古代マケドニア王国を中心に、フィリッポス2世の軍制改革、アレクサンドロス大王の東征とヘレニズム、ディアドコイの争い、ヴェルギナとペラの考古学、そして中世から現代の北マケドニア共和国と国名問題までを、信頼できる史料で確かめながらまとめています。</p>
  ${navHtml}
  <nav style="margin-top:20px;border-top:1px solid #e2d9c8;padding-top:16px;display:flex;gap:16px;flex-wrap:wrap">
    <a href="/macedonia-info/about/" style="color:${PORPHYRY}">サイトについて</a>
    <a href="/macedonia-info/privacy/" style="color:${PORPHYRY}">プライバシーポリシー</a>
  </nav>
</article>`;
}

const homeWebSiteJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: `${BASE_URL}/`,
  description: '古代マケドニア王国を中心に、フィリッポス2世、アレクサンドロス大王、ディアドコイの争い、ヴェルギナの考古学、そして現代の北マケドニア共和国と国名問題までを、信頼できる史料で確かめながら紹介する情報サイト。',
  inLanguage: 'ja',
  publisher: { '@type': 'Organization', name: 'study-apps.com', url: 'https://study-apps.com/' },
});

const homeItemListJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${SITE_NAME}：記事一覧`,
  itemListElement: articles.map((a, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: a.shortTitle,
    description: a.description,
    url: `${BASE_URL}/${a.id}/`,
  })),
});

let rootIndexHtml = templateHtml.replace('<div id="root"></div>', `<div id="root">${buildHomeTimeline()}</div>`);
rootIndexHtml = rootIndexHtml.replace(
  '</head>',
  `<script type="application/ld+json">${homeWebSiteJsonLd}</script>\n  <script type="application/ld+json">${homeItemListJsonLd}</script>\n  </head>`
);
fs.writeFileSync(INDEX_HTML_PATH, rootIndexHtml);

const subDirTemplateHtml = templateHtml
  .replace(/href="\.\/assets\//g, 'href="../assets/')
  .replace(/src="\.\/assets\//g, 'src="../assets/')
  .replace(/href="\.\/favicon.svg"/g, 'href="../favicon.svg"');

let generatedCount = 0;

function buildChapterNav(currentId: string): string {
  const idx = articles.findIndex((a) => a.id === currentId);
  if (idx === -1) return '';
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx < articles.length - 1 ? articles[idx + 1] : null;
  if (!prev && !next) return '';
  const prevHtml = prev
    ? `<a href="/macedonia-info/${prev.id}/" style="display:block;flex:1;padding:14px 16px;background:#fffdf8;border:1px solid #e2d9c8;border-radius:10px;text-decoration:none;color:#2b2622"><div style="font-size:0.76rem;color:${GOLD};margin-bottom:4px">← 前の記事</div><div style="font-size:0.92rem;font-weight:700;color:${PORPHYRY}">${ico(prev.icon, 15)} ${escapeHtml(prev.shortTitle)}</div></a>`
    : `<span style="flex:1"></span>`;
  const nextHtml = next
    ? `<a href="/macedonia-info/${next.id}/" style="display:block;flex:1;padding:14px 16px;background:#fffdf8;border:1px solid #e2d9c8;border-radius:10px;text-decoration:none;color:#2b2622;text-align:right"><div style="font-size:0.76rem;color:${GOLD};margin-bottom:4px">次の記事 →</div><div style="font-size:0.92rem;font-weight:700;color:${PORPHYRY}">${ico(next.icon, 15)} ${escapeHtml(next.shortTitle)}</div></a>`
    : `<span style="flex:1"></span>`;
  return `<nav style="display:flex;gap:10px;margin:32px 0">${prevHtml}${nextHtml}</nav>`;
}

function buildArticleFallback(a: Article): string {
  const tocHtml = buildTocHtml(a.toc);
  const contentHtml = markdownToHtml(a.content);
  const chapterNavHtml = buildChapterNav(a.id);
  const leadHtml = a.lead ? `<p class="lead" style="color:#6a5f54;font-size:1.04rem;margin:16px 0 24px">${inlineToHtml(a.lead)}</p>` : '';
  return `<article style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif;line-height:1.85;max-width:880px;margin:0 auto;padding:24px 16px;color:#2b2622">
  <nav style="font-size:0.85rem;color:#6a5f54;margin:0 0 16px"><a href="/macedonia-info/" style="color:${PORPHYRY};text-decoration:none">${SITE_NAME}</a> <span style="color:#9ca3af">›</span> <span style="color:#4b5563;font-weight:600">${escapeHtml(a.shortTitle)}</span></nav>
  <header style="margin-bottom:20px">
    <div style="line-height:1;margin-bottom:8px">${ico(a.icon, 30)}</div>
    <h1 style="font-size:1.5rem;color:${DEEP};border-bottom:2px solid ${PORPHYRY};padding-bottom:10px;margin:0 0 8px">${escapeHtml(a.title)}</h1>
    <div style="font-size:0.85rem;color:#6a5f54;margin-top:10px">最終更新: ${formatDateJa(a.updatedAt)}</div>
  </header>
  ${leadHtml}
  ${tocHtml}
  <div class="section-content">
${contentHtml}
  </div>
  ${referencesHtml(a.references)}
  ${chapterNavHtml}
  <p style="margin-top:32px"><a href="/macedonia-info/" style="color:${PORPHYRY}">← トップへ戻る</a></p>
</article>`;
}

function applyMeta(html: string, title: string, description: string, urlPath: string, ogType: string): string {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${title} | ${SITE_NAME}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(description)}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(description)}"`)
    .replace(/<meta property="og:type" content="[^"]*"/, `<meta property="og:type" content="${ogType}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${BASE_URL}${urlPath}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${BASE_URL}${urlPath}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeHtml(title)}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeHtml(description)}"`);
}

function writeArticlePage(a: Article) {
  const dir = path.join(DIST_DIR, a.id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let html = applyMeta(subDirTemplateHtml, a.title, a.description, `/${a.id}/`, 'article')
    .replace('<div id="root"></div>', `<div id="root">${buildArticleFallback(a)}</div>`);

  const articleJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    url: `${BASE_URL}/${a.id}/`,
    inLanguage: 'ja',
    datePublished: a.updatedAt,
    dateModified: a.updatedAt,
    author: { '@type': 'Organization', name: 'study-apps.com' },
    publisher: { '@type': 'Organization', name: 'study-apps.com', url: 'https://study-apps.com/' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/${a.id}/` },
  });

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: a.shortTitle, item: `${BASE_URL}/${a.id}/` },
    ],
  });

  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${articleJsonLd}</script>\n  <script type="application/ld+json">${breadcrumbJsonLd}</script>\n  </head>`
  );

  fs.writeFileSync(path.join(dir, 'index.html'), html);
  generatedCount++;
}

for (const a of articles) writeArticlePage(a);

function writeStaticPage(id: string, title: string, description: string, bodyHtml: string) {
  const dir = path.join(DIST_DIR, id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fallback = `<article style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic',Meiryo,sans-serif;line-height:1.85;max-width:880px;margin:0 auto;padding:24px 16px;color:#2b2622">
  <nav style="font-size:0.85rem;color:#6a5f54;margin:0 0 16px"><a href="/macedonia-info/" style="color:${PORPHYRY};text-decoration:none">${SITE_NAME}</a> <span style="color:#9ca3af">›</span> <span style="color:#4b5563;font-weight:600">${escapeHtml(title)}</span></nav>
  <h1 style="font-size:1.5rem;color:${DEEP};border-bottom:2px solid ${PORPHYRY};padding-bottom:10px">${escapeHtml(title)}</h1>
  ${bodyHtml}
  <p style="margin-top:32px"><a href="/macedonia-info/" style="color:${PORPHYRY}">← トップへ戻る</a></p>
</article>`;

  const pageJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${BASE_URL}/${id}/`,
    inLanguage: 'ja',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${BASE_URL}/` },
  });
  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: title, item: `${BASE_URL}/${id}/` },
    ],
  });

  let html = applyMeta(subDirTemplateHtml, title, description, `/${id}/`, 'website')
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${pageJsonLd}</script>\n  <script type="application/ld+json">${breadcrumbJsonLd}</script>\n  </head>`
  );
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  generatedCount++;
}

const sectionH2 = (t: string) => `<h2 style="font-size:1.3rem;color:${DEEP};border-left:4px solid ${GOLD};padding-left:12px;margin:32px 0 12px">${t}</h2>`;

writeStaticPage(
  'about',
  'サイトについて',
  `${SITE_NAME}について。本サイトの目的と情報源、編集方針、諸説の扱いを説明します。`,
  `<p>本サイト「${SITE_NAME}」は、古代マケドニア王国を中心に、その興亡と、「マケドニア」という名が現代までたどった道すじを、一望できるようにまとめたものです。トップでは古代から現代までを結ぶ年表を示し、各ページでアルゲアス朝、フィリッポス2世、アレクサンドロス大王、ディアドコイの争い、ヴェルギナとペラの考古学、中世から現代の北マケドニア共和国と国名問題までを扱います。</p>
  ${sectionH2('編集と制作の方針')}
  <p>本サイトの内容は、World History Encyclopedia や Livius.org、NATO などの公開情報を参照し、事実を確認したうえで、運営者が自分の言葉で書いています。出典の文章をそのまま転載することはありません。</p>
  ${sectionH2('諸説の扱い')}
  <p>古代の年代や人物には諸説があります。ヴェルギナ第二号墓が誰のものかといった考古学的な比定にも、専門家のあいだで異論のあるものがあります。本サイトは、こうした事項を断定せず、有力な見方と異論をあわせて示すことを心がけています。確認できなかった数値や逸話は書いていません。</p>
  ${sectionH2('お問い合わせ')}
  <p>ご質問や誤りのご指摘は<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer" style="color:${PORPHYRY}">こちらのGoogleフォーム</a>からお願いします。</p>`
);

writeStaticPage(
  'privacy',
  'プライバシーポリシー',
  `${SITE_NAME}のプライバシーポリシー。Cookie・アクセス解析・広告の使用について。`,
  `${sectionH2('アクセス解析')}
  <p>本サイトでは、サイトの利用状況を把握するために Google Analytics を使用しています。Cookie を利用して匿名のトラフィックデータを収集します。収集される情報は匿名で、個人を特定するものではありません。</p>
  ${sectionH2('広告について')}
  <p>本サイトでは Google AdSense などの第三者配信の広告サービスを利用することがあります。広告配信事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。Cookie を無効にする設定や、Google の広告設定により、パーソナライズ広告を無効にできます。</p>
  ${sectionH2('免責事項')}
  <p>本サイトの情報は可能な限り正確を期していますが、その完全性や正確性を保証するものではありません。古代の年代や比定には諸説があり、現代の統計は調査の年や資料によって変わります。本サイトの情報を利用したことにより生じた損害について、運営者は一切の責任を負いません。</p>`
);

const today = new Date().toISOString().split('T')[0];
type SitemapEntry = { path: string; lastmod: string; changefreq: string; priority: string };
const sitemapEntries: SitemapEntry[] = [
  { path: '/', lastmod: today, changefreq: 'monthly', priority: '1.0' },
  ...articles.map((a) => ({ path: `/${a.id}/`, lastmod: a.updatedAt, changefreq: 'monthly', priority: '0.9' })),
  { path: '/about/', lastmod: today, changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy/', lastmod: today, changefreq: 'yearly', priority: '0.3' },
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map((e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`)
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✓ Generated sitemap.xml (${sitemapEntries.length} URLs)`);
console.log(`✓ Generated ${generatedCount} static pages`);
console.log('--- Done ---');
