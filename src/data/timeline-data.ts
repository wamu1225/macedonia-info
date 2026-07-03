// トップの中心体験「マケドニアを貫く縦断年表」のデータ（単一の真実源）。
// 古代の王国から現代の北マケドニア共和国までを1本の年表で結び、
// 「マケドニア」という名がたどった道すじを一望できるようにする。
// App.tsx（React描画）と prerender（静的フォールバック）が共用する。
// 年代・比定には諸説があり、年表は目安。詳細と出典は各記事に置く。

export type Era = 'ancient' | 'archaic' | 'medieval' | 'modern';

export type TimelineEntry = {
  when: string;      // 表示する年代（目安）
  title: string;     // 見出し
  note: string;      // 一文の説明
  era: Era;          // 時代区分（色分け）
  link?: string;     // 関連記事のID（あれば）
};

export const ERA_LABEL: Record<Era, string> = {
  archaic: '王国の起こり',
  ancient: '古代マケドニア王国',
  medieval: '属州と中世',
  modern: '近代と現代',
};

export const TIMELINE: TimelineEntry[] = [
  { when: '前7世紀ごろ', title: 'アルゲアス朝の起こり', note: 'エーゲ海北岸にアルゲアス朝のマケドニア王国が興る。王家はギリシャ南部に起源を持つと称した。', era: 'archaic', link: 'argead' },
  { when: '前5世紀初め', title: 'アレクサンドロス1世', note: 'ギリシャ世界との結びつきを強め、オリンピックへの参加を認められたと伝えられる。', era: 'archaic', link: 'argead' },
  { when: '前359〜336年', title: 'フィリッポス2世', note: '長槍サリサと密集隊形で軍を一新し、前338年カイロネイアでギリシャ本土の主導権を握る。', era: 'ancient', link: 'philip' },
  { when: '前336〜323年', title: 'アレクサンドロス大王の東征', note: 'アケメネス朝ペルシアを滅ぼしインダス川まで達し、ギリシャ文化を広い世界に広げた。', era: 'ancient', link: 'alexander' },
  { when: '前323〜281年', title: 'ディアドコイの争い', note: '大王の死後、将軍たちが後継を争う。前301年イプソスでアンティゴノス1世が戦死。', era: 'ancient', link: 'successors' },
  { when: '前277年', title: 'アンティゴノス朝の確立', note: 'アンティゴノス2世ゴナタスがガラティア人を退けマケドニア王となり、王朝が安定する。', era: 'ancient', link: 'successors' },
  { when: '前168〜146年', title: 'ローマによる併合', note: '前168年ピュドナでローマに敗れ、前146年にマケドニアはローマの属州となる。', era: 'ancient', link: 'successors' },
  { when: '6〜7世紀', title: 'スラヴ人の定住', note: '東ローマ（ビザンティン）の領域となり、スラヴ人が移り住んで地域の構成が変わる。', era: 'medieval', link: 'medieval' },
  { when: '15〜20世紀初め', title: 'オスマン帝国の統治', note: '約500年にわたるオスマン帝国の統治のもと、多くの民族と宗教が入りまじる地域となる。', era: 'medieval', link: 'medieval' },
  { when: '1945年', title: 'ユーゴスラビアの共和国', note: '第二次世界大戦後、ユーゴスラビア連邦を構成する共和国の一つとなる。', era: 'modern', link: 'modern' },
  { when: '1991年', title: '独立と国名問題', note: '連邦の解体にともない独立を宣言。国名をめぐってギリシャと長く対立する。', era: 'modern', link: 'modern' },
  { when: '2019年', title: '「北マケドニア共和国」へ', note: '2018年のプレスパ合意を経て国名を改称し、ギリシャとの対立が解決へ向かう。', era: 'modern', link: 'modern' },
  { when: '2020年', title: 'NATO加盟', note: '2020年3月、北大西洋条約機構（NATO）の加盟国となる。EU加盟への歩みも続く。', era: 'modern', link: 'modern' },
];
