// 현자별 핵심 가르침·연표·대표 한 줄 — Sage Detail 페이지 보강용 (v0.2)

export interface CoreTeaching {
  glyph: string;
  label: string;
  desc: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  desc?: string;
}

export interface SageTeachings {
  greatQuote: { text: string; original: string };
  coreTeachings: CoreTeaching[];
  timeline: TimelineEvent[];
}

export const SAGE_TEACHINGS: Record<string, SageTeachings> = {
  dasan: {
    greatQuote: {
      text: "백성을 사랑하는 것은 다스리는 것보다 어렵다.",
      original: "愛民 難於牧民",
    },
    coreTeachings: [
      { glyph: "牧", label: "목민", desc: "다스림이 아니라 길러냄. 백성을 자식 기르듯이." },
      { glyph: "誠", label: "성실", desc: "벼슬은 능력보다 정성으로 한다." },
      { glyph: "廉", label: "청렴", desc: "관직의 첫 덕목. 가난해도 흔들리지 않음." },
      { glyph: "實", label: "실학", desc: "공허한 학문이 아닌, 백성에게 닿는 학문." },
    ],
    timeline: [
      { year: "1762", title: "출생", desc: "경기도 광주 마재" },
      { year: "1789", title: "문과 급제", desc: "정조의 총애" },
      { year: "1801", title: "신유박해 — 강진 유배 시작" },
      { year: "1808", title: "다산초당 시작", desc: "본격 저술" },
      { year: "1818", title: "《목민심서》 완성", desc: "유배 18년차" },
      { year: "1836", title: "별세", desc: "고향 마재" },
    ],
  },
  socrates: {
    greatQuote: {
      text: "검토되지 않은 삶은 살 가치가 없다.",
      original: "ὁ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ",
    },
    coreTeachings: [
      { glyph: "γνῶθι", label: "너 자신을 알라", desc: "지혜는 자기 무지를 아는 데서 시작한다." },
      { glyph: "λόγος", label: "로고스", desc: "이치(理)와 말. 묻는 것이 곧 사는 길." },
      { glyph: "ψυχή", label: "프시케", desc: "영혼을 돌보는 것이 최우선." },
      { glyph: "ἀρετή", label: "아레테", desc: "탁월함. 인간이 마땅히 갖춰야 할 덕." },
    ],
    timeline: [
      { year: "BC 470", title: "출생", desc: "아테네" },
      { year: "BC 432", title: "포티다이아 전투 참전" },
      { year: "BC 423", title: "아리스토파네스 〈구름〉에서 풍자됨" },
      { year: "BC 406", title: "아르기누사이 재판 때 유일한 반대표" },
      { year: "BC 399", title: "고발·재판·독배", desc: "《변론》의 무대" },
    ],
  },
  confucius: {
    greatQuote: {
      text: "배우고 때로 익히니, 또한 기쁘지 아니한가.",
      original: "學而時習之 不亦說乎",
    },
    coreTeachings: [
      { glyph: "仁", label: "인", desc: "사람을 사람으로 대하는 마음." },
      { glyph: "禮", label: "예", desc: "마음을 몸으로 옮기는 길." },
      { glyph: "義", label: "의", desc: "마땅함을 좇는 결단." },
      { glyph: "學", label: "학", desc: "매일 익히는 데서 사람이 자란다." },
    ],
    timeline: [
      { year: "BC 551", title: "출생", desc: "노(魯)나라 추읍" },
      { year: "BC 522", title: "처음 벼슬", desc: "위리(委吏)" },
      { year: "BC 497", title: "주유천하 시작", desc: "14년간 천하 유랑" },
      { year: "BC 484", title: "노나라 귀환·교육 전념" },
      { year: "BC 479", title: "별세" },
    ],
  },
  zhuangzi: {
    greatQuote: {
      text: "쓸모없음의 쓸모를 알아야, 비로소 쓸모를 말할 수 있다.",
      original: "無用之用 是爲大用",
    },
    coreTeachings: [
      { glyph: "逍", label: "소요", desc: "구속 없이 노닐다 — 큰 자유." },
      { glyph: "齊", label: "제물", desc: "옳고 그름의 경계를 지운다." },
      { glyph: "無", label: "무위", desc: "억지로 함이 없이 그저 그러함." },
      { glyph: "化", label: "화", desc: "나비의 꿈 — 분별이 사라진 변화." },
    ],
    timeline: [
      { year: "BC 369경", title: "출생", desc: "송(宋)나라 몽(蒙)" },
      { year: "?", title: "칠원리(漆園吏) 잠시 벼슬" },
      { year: "?", title: "초나라 위왕의 재상 청 거절" },
      { year: "BC 286경", title: "별세" },
    ],
  },
  wonhyo: {
    greatQuote: {
      text: "다투는 모든 말은 한 마음(一心)으로 돌아간다.",
      original: "和諍歸一心",
    },
    coreTeachings: [
      { glyph: "一", label: "일심", desc: "온 세계는 한 마음 안에." },
      { glyph: "和", label: "화쟁", desc: "다투는 말을 풀어 회통(會通)함." },
      { glyph: "覺", label: "각", desc: "본래 깨어 있음을 알아차림." },
      { glyph: "無", label: "무애", desc: "걸림 없는 자유 — 무애가(無碍歌)." },
    ],
    timeline: [
      { year: "617", title: "출생", desc: "신라 압량(押梁)" },
      { year: "650", title: "의상과 당 유학 시도, 해골물 깨달음" },
      { year: "660", title: "요석공주와 인연, 설총 출생" },
      { year: "680경", title: "《대승기신론소》 완성" },
      { year: "686", title: "혈사(穴寺)에서 입적" },
    ],
  },
  augustine: {
    greatQuote: {
      text: "당신을 향하지 않고서는 내 마음이 쉴 수 없습니다.",
      original: "inquietum est cor nostrum, donec requiescat in te",
    },
    coreTeachings: [
      { glyph: "Cor", label: "마음", desc: "신을 향한 마음만이 쉼을 얻는다." },
      { glyph: "Tempus", label: "시간", desc: "시간이란 마음의 늘어남(distentio animi)." },
      { glyph: "Gratia", label: "은총", desc: "구원은 인간의 공로가 아닌 은총." },
      { glyph: "Civitas", label: "두 도성", desc: "지상의 도성과 신의 도성." },
    ],
    timeline: [
      { year: "354", title: "출생", desc: "타가스테(현 알제리)" },
      { year: "373", title: "마니교에 빠짐", desc: "9년간" },
      { year: "386", title: "회심", desc: "밀라노 정원의 'Tolle, lege'" },
      { year: "397", title: "《고백록》 집필 시작" },
      { year: "410", title: "로마 함락 — 《신의 도성》 집필" },
      { year: "430", title: "별세", desc: "히포 포위 중" },
    ],
  },
  kierkegaard: {
    greatQuote: {
      text: "신앙은 가장 큰 도약이자, 가장 외로운 결단.",
      original: "Troens spring",
    },
    coreTeachings: [
      { glyph: "Spring", label: "도약", desc: "이성을 넘어 신 앞에 단독자로 선다." },
      { glyph: "Angst", label: "불안", desc: "자유의 가능성 앞에서 느끼는 현기증." },
      { glyph: "Subj", label: "주체성", desc: "진리는 주체적인 것이다." },
      { glyph: "Stadier", label: "세 단계", desc: "미적·윤리적·종교적 실존." },
    ],
    timeline: [
      { year: "1813", title: "출생", desc: "코펜하겐" },
      { year: "1841", title: "레기네 올센과 파혼" },
      { year: "1843", title: "《공포와 전율》·《반복》·《이것이냐 저것이냐》" },
      { year: "1849", title: "《죽음에 이르는 병》" },
      { year: "1855", title: "별세", desc: "코펜하겐" },
    ],
  },
  choejeu: {
    greatQuote: {
      text: "사람이 곧 한울님이다.",
      original: "人乃天",
    },
    coreTeachings: [
      { glyph: "侍", label: "시천주", desc: "모든 사람 안에 한울님이 모셔져 있다." },
      { glyph: "人乃天", label: "인내천", desc: "사람이 곧 한울. 신분·계급·성별을 넘어선 평등." },
      { glyph: "開闢", label: "후천개벽", desc: "낡은 세상은 다하고 새 세상이 열린다." },
      { glyph: "守心", label: "수심정기", desc: "마음을 지키고 기운을 바르게 한다." },
    ],
    timeline: [
      { year: "1824", title: "출생", desc: "경주 가정리" },
      { year: "1860", title: "용담에서 결정적 종교 체험", desc: "동학 창도" },
      { year: "1861", title: "《포덕문》 저술" },
      { year: "1864", title: "대구에서 처형", desc: "좌도난정(左道亂正)의 죄목" },
    ],
  },
  aristotle: {
    greatQuote: {
      text: "인간은 본성상 폴리스의 동물이다.",
      original: "ἄνθρωπος φύσει πολιτικὸν ζῷον",
    },
    coreTeachings: [
      { glyph: "εὐ", label: "에우다이모니아", desc: "행복은 평생에 걸친 덕에 따른 영혼의 활동." },
      { glyph: "μέσον", label: "중용", desc: "과도와 결핍 사이의 적절함. 상황적 중간." },
      { glyph: "φρόν", label: "프로네시스", desc: "구체적 상황에서 옳음을 판단하는 실천적 지혜." },
      { glyph: "πόλις", label: "폴리스적 동물", desc: "공동체 속에서만 완성되는 인간." },
    ],
    timeline: [
      { year: "BC 384", title: "출생", desc: "마케도니아 스타기라" },
      { year: "BC 367", title: "플라톤 아카데미아 입학", desc: "20년 수학" },
      { year: "BC 347", title: "아테네 떠남", desc: "아소스·레스보스 연구" },
      { year: "BC 343", title: "알렉산드로스 가정교사" },
      { year: "BC 335", title: "리케이온 설립", desc: "페리파토스 학파" },
      { year: "BC 323", title: "아테네 반마케도니아 정서", desc: "불경죄 기소" },
      { year: "BC 322", title: "별세", desc: "에우보이아 칼키스" },
    ],
  },
  kant: {
    greatQuote: {
      text: "너의 의지의 준칙이 항상 동시에 보편 법칙이 되도록 행위하라.",
      original: "Handle so, dass die Maxime deines Willens jederzeit zugleich als Prinzip einer allgemeinen Gesetzgebung gelten könne.",
    },
    coreTeachings: [
      { glyph: "Pflicht", label: "의무", desc: "도덕 법칙에 대한 존경에서 비롯된 행위의 필연성. 결과가 아닌 동기." },
      { glyph: "K.I.", label: "정언명령", desc: "조건 없이 따라야 할 도덕 명령. 보편화 가능성·인간성 정식·자율성 정식." },
      { glyph: "Würde", label: "인격·존엄성", desc: "인간을 수단이 아닌 목적으로. 가격 너머의 절대 가치." },
      { glyph: "Autonomie", label: "자율", desc: "스스로 도덕 법칙을 부여하고 따름. 타율은 도덕이 아니다." },
    ],
    timeline: [
      { year: "1724", title: "출생", desc: "프로이센 쾨니히스베르크 — 평생 떠나지 않은 도시" },
      { year: "1755", title: "쾨니히스베르크 대학 사강사", desc: "자연철학·논리학·형이상학" },
      { year: "1770", title: "정교수 임용", desc: "교수 취임 논문" },
      { year: "1781", title: "《순수이성비판》", desc: "코페르니쿠스적 전회" },
      { year: "1784", title: "《계몽이란 무엇인가에 대한 답변》", desc: "사페레 아우데(Sapere aude!)" },
      { year: "1785", title: "《도덕형이상학 정초》", desc: "정언명령 3정식 제시" },
      { year: "1788", title: "《실천이성비판》", desc: "도덕 법칙·자유" },
      { year: "1790", title: "《판단력비판》", desc: "미·숭고·목적론" },
      { year: "1795", title: "《영원한 평화를 위하여》", desc: "공화제·환대권·국제연맹" },
      { year: "1804", title: "별세", desc: "쾨니히스베르크, 향년 79세" },
    ],
  },
  nietzsche: {
    greatQuote: {
      text: "인간은 극복되어야 할 무엇이다.",
      original: "Der Mensch ist etwas, das überwunden werden soll.",
    },
    coreTeachings: [
      { glyph: "Ü", label: "위버멘쉬", desc: "기존 도덕을 초극하고 스스로 가치를 입법하는 자." },
      { glyph: "∞", label: "영원회귀", desc: "이 삶이 무수히 반복되어도 그대로 원할 수 있는가." },
      { glyph: "M", label: "권력에의 의지", desc: "지배가 아니라 저항을 극복하고 자기를 확장하는 충동." },
      { glyph: "G†", label: "가치 재평가", desc: "신은 죽었다. 이제 누가 새 가치를 입법할 것인가." },
    ],
    timeline: [
      { year: "1844", title: "출생", desc: "프로이센 작센 Röcken, 루터교 목사의 아들" },
      { year: "1869", title: "Basel 대학 고전문헌학 정교수", desc: "24세, 역사상 최연소" },
      { year: "1872", title: "《비극의 탄생》", desc: "Wagner에게 헌정" },
      { year: "1879", title: "Basel 사직", desc: "건강 악화, 방랑·집필 시기 시작" },
      { year: "1882", title: "Lou Salomé 청혼 거절", desc: "이후 《차라투스트라》 집필" },
      { year: "1883-85", title: "《차라투스트라는 이렇게 말했다》" },
      { year: "1886", title: "《선악의 저편》" },
      { year: "1887", title: "《도덕의 계보》" },
      { year: "1889", title: "Turin 정신 붕괴", desc: "1월 3일, 채찍 맞는 말을 끌어안고" },
      { year: "1900", title: "별세", desc: "Weimar, 향년 55세" },
    ],
  },
};

export function getSageTeachings(personaId: string): SageTeachings | undefined {
  return SAGE_TEACHINGS[personaId];
}
