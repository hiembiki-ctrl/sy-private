export type ItineraryKind = "명소" | "액티비티";

export type ItineraryItem = {
  name: string;
  summary: string;
  kind: ItineraryKind;
};

export type Days = 1 | 2 | 3;

export type City = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  climate: string;
  bestSeason: string;
  /** 하루 단위 일정. N일 일정은 앞에서 N개를 쓴다. */
  days: [ItineraryItem[], ItineraryItem[], ItineraryItem[]];
};

export const DAY_OPTIONS: Days[] = [1, 2, 3];

export const CITIES: City[] = [
  {
    id: "tokyo",
    name: "도쿄",
    country: "일본",
    lat: 35.68,
    lng: 139.69,
    climate: "온대 습윤",
    bestSeason: "봄·가을이 좋음",
    days: [
      [
        { name: "센소지와 아사쿠사", summary: "도쿄에서 가장 오래된 절과 상점가 나카미세 거리를 걷습니다.", kind: "명소" },
        { name: "스미다강 크루즈", summary: "도쿄 스카이트리를 보며 강을 따라 내려가는 수상 버스입니다.", kind: "액티비티" },
        { name: "시부야 스크램블 교차로", summary: "세계에서 가장 붐비는 횡단보도에서 저녁 도시를 구경합니다.", kind: "명소" },
      ],
      [
        { name: "메이지 신궁", summary: "도심 한가운데 숲속으로 이어지는 조용한 신사입니다.", kind: "명소" },
        { name: "하라주쿠 다케시타 거리", summary: "개성 있는 패션과 크레이프 가게가 늘어선 골목입니다.", kind: "액티비티" },
        { name: "도쿄 도청 전망대", summary: "무료로 올라가 도시 전경을 내려다볼 수 있습니다.", kind: "명소" },
      ],
      [
        { name: "츠키지 장외시장", summary: "신선한 초밥과 계란말이로 아침을 먹는 시장입니다.", kind: "액티비티" },
        { name: "팀랩 플래닛", summary: "물과 빛 속을 걸어 다니는 몰입형 디지털 미술관입니다.", kind: "명소" },
        { name: "아키하바라 게임 거리", summary: "게임, 애니메이션, 전자제품 상점이 모인 구역입니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "paris",
    name: "파리",
    country: "프랑스",
    lat: 48.86,
    lng: 2.35,
    climate: "온대 해양성",
    bestSeason: "봄·초가을이 좋음",
    days: [
      [
        { name: "에펠탑", summary: "상층 전망대에서 센강과 파리 시내를 한눈에 봅니다.", kind: "명소" },
        { name: "센강 유람선", summary: "노트르담과 루브르 앞을 지나는 한 시간짜리 크루즈입니다.", kind: "액티비티" },
        { name: "트로카데로 광장", summary: "해 질 무렵 에펠탑이 가장 잘 보이는 자리입니다.", kind: "명소" },
      ],
      [
        { name: "루브르 박물관", summary: "모나리자와 밀로의 비너스를 볼 수 있는 대형 박물관입니다.", kind: "명소" },
        { name: "튈르리 정원 산책", summary: "루브르에서 콩코르드 광장으로 이어지는 정원길입니다.", kind: "액티비티" },
        { name: "오르세 미술관", summary: "옛 기차역을 개조해 인상파 작품을 모아 둔 곳입니다.", kind: "명소" },
      ],
      [
        { name: "몽마르트르 언덕", summary: "사크레쾨르 성당과 화가들의 광장이 있는 언덕 마을입니다.", kind: "명소" },
        { name: "마레 지구 골목 탐방", summary: "작은 갤러리와 팔라펠 가게가 모인 오래된 동네입니다.", kind: "액티비티" },
        { name: "베르사유 궁전", summary: "기차로 가까운 곳에 있는 화려한 궁전과 정원입니다.", kind: "명소" },
      ],
    ],
  },
  {
    id: "new-york",
    name: "뉴욕",
    country: "미국",
    lat: 40.71,
    lng: -74.0,
    climate: "온대 대륙성",
    bestSeason: "가을이 좋음",
    days: [
      [
        { name: "자유의 여신상과 엘리스 섬", summary: "페리를 타고 섬에 들러 이민 박물관을 둘러봅니다.", kind: "명소" },
        { name: "브루클린 브리지 걷기", summary: "다리를 건너며 맨해튼 스카이라인을 봅니다.", kind: "액티비티" },
        { name: "덤보 포토 스폿", summary: "다리 사이로 보이는 유명한 거리 풍경입니다.", kind: "명소" },
      ],
      [
        { name: "센트럴 파크", summary: "도심 한가운데의 호수와 숲을 따라 자전거나 산책을 즐깁니다.", kind: "액티비티" },
        { name: "메트로폴리탄 미술관", summary: "고대 이집트부터 현대까지 폭넓게 모은 대형 미술관입니다.", kind: "명소" },
        { name: "록펠러 센터 전망대", summary: "센트럴 파크와 엠파이어 스테이트가 한 번에 보입니다.", kind: "명소" },
      ],
      [
        { name: "하이라인 산책", summary: "옛 고가 철도를 공원으로 바꾼 길을 따라 걷습니다.", kind: "액티비티" },
        { name: "첼시 마켓", summary: "옛 공장 안에 음식점과 상점이 모여 있습니다.", kind: "명소" },
        { name: "브로드웨이 뮤지컬", summary: "저녁에 극장가에서 뮤지컬 한 편을 봅니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "bangkok",
    name: "방콕",
    country: "태국",
    lat: 13.76,
    lng: 100.5,
    climate: "열대 사바나",
    bestSeason: "11월~2월 건기가 좋음",
    days: [
      [
        { name: "왕궁과 에메랄드 사원", summary: "금빛 지붕이 이어지는 태국 왕실의 옛 궁전입니다.", kind: "명소" },
        { name: "왓 포", summary: "46미터 길이의 와불상이 있는 사원입니다.", kind: "명소" },
        { name: "차오프라야강 수상 버스", summary: "강을 따라 사원과 시장을 오가는 저렴한 교통수단입니다.", kind: "액티비티" },
      ],
      [
        { name: "왓 아룬", summary: "해 질 녘 강 건너에서 보면 특히 아름다운 새벽 사원입니다.", kind: "명소" },
        { name: "차이나타운 야시장", summary: "해산물 구이와 길거리 음식이 가득한 야간 거리입니다.", kind: "액티비티" },
        { name: "짐 톰슨의 집", summary: "태국 전통 목조 가옥에 실크 컬렉션을 전시합니다.", kind: "명소" },
      ],
      [
        { name: "담넌 사두악 수상시장", summary: "배 위에서 음식과 과일을 사고파는 시장입니다.", kind: "액티비티" },
        { name: "룸피니 공원", summary: "도심 속 공원에서 대형 도마뱀과 산책객을 만납니다.", kind: "명소" },
        { name: "태국 전통 마사지", summary: "하루를 마무리하며 받는 전신 마사지입니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "lisbon",
    name: "리스본",
    country: "포르투갈",
    lat: 38.72,
    lng: -9.14,
    climate: "지중해성",
    bestSeason: "봄~초가을이 좋음",
    days: [
      [
        { name: "28번 트램", summary: "언덕 사이 좁은 골목을 지나는 노란 트램을 탑니다.", kind: "액티비티" },
        { name: "알파마 지구", summary: "미로 같은 골목과 파두 음악이 흐르는 오래된 동네입니다.", kind: "명소" },
        { name: "상조르제 성", summary: "언덕 위에서 붉은 지붕과 테주강이 한눈에 보입니다.", kind: "명소" },
      ],
      [
        { name: "벨렝 탑", summary: "대항해시대 배들이 떠났던 강가의 요새입니다.", kind: "명소" },
        { name: "제로니무스 수도원", summary: "화려한 석조 장식으로 유명한 수도원입니다.", kind: "명소" },
        { name: "파스테이스 드 벨렝", summary: "수도원 옆 가게에서 갓 구운 에그타르트를 맛봅니다.", kind: "액티비티" },
      ],
      [
        { name: "신트라 당일 여행", summary: "기차로 가는 동화 같은 궁전과 숲의 마을입니다.", kind: "액티비티" },
        { name: "페나 궁전", summary: "알록달록한 색으로 칠한 언덕 위의 궁전입니다.", kind: "명소" },
        { name: "호카 곶", summary: "유럽 대륙의 서쪽 끝 절벽에서 대서양을 봅니다.", kind: "명소" },
      ],
    ],
  },
  {
    id: "istanbul",
    name: "이스탄불",
    country: "튀르키예",
    lat: 41.01,
    lng: 28.98,
    climate: "지중해성과 온대 대륙성 사이",
    bestSeason: "4~6월, 9~10월이 좋음",
    days: [
      [
        { name: "아야 소피아", summary: "비잔틴 성당에서 이슬람 사원으로 이어진 거대한 돔 건물입니다.", kind: "명소" },
        { name: "블루 모스크", summary: "푸른 타일로 장식한 여섯 개의 첨탑이 있는 사원입니다.", kind: "명소" },
        { name: "지하 저수지(바실리카 시스턴)", summary: "기둥이 숲처럼 서 있는 비잔틴 시대의 지하 물 저장소입니다.", kind: "명소" },
      ],
      [
        { name: "톱카프 궁전", summary: "오스만 제국 술탄들이 살던 궁전과 보물관입니다.", kind: "명소" },
        { name: "그랜드 바자르", summary: "수천 개의 상점이 모인 세계에서 가장 오래된 시장 중 하나입니다.", kind: "액티비티" },
        { name: "보스포루스 해협 크루즈", summary: "유럽과 아시아 사이를 지나는 배 여행입니다.", kind: "액티비티" },
      ],
      [
        { name: "갈라타 탑", summary: "골든혼과 구시가지가 한눈에 보이는 전망대입니다.", kind: "명소" },
        { name: "카라쿄이 카페 골목", summary: "해협 옆에서 튀르키예 커피와 디저트를 즐깁니다.", kind: "액티비티" },
        { name: "터키식 목욕탕(하맘)", summary: "수백 년 된 대리석 욕탕에서 전통 목욕을 체험합니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "marrakech",
    name: "마라케시",
    country: "모로코",
    lat: 31.63,
    lng: -8.0,
    climate: "반건조 지중해성",
    bestSeason: "3~5월, 10~11월이 좋음",
    days: [
      [
        { name: "제마 엘프나 광장", summary: "낮에는 시장, 밤에는 포장마차와 공연으로 가득 찬 광장입니다.", kind: "명소" },
        { name: "쿠투비아 모스크", summary: "광장 근처에서 가장 눈에 띄는 77미터 높이의 첨탑입니다.", kind: "명소" },
        { name: "수크 흥정 산책", summary: "향신료, 가죽, 램프 가게가 모인 골목에서 흥정을 해 봅니다.", kind: "액티비티" },
      ],
      [
        { name: "바히아 궁전", summary: "정교한 타일과 정원이 이어지는 19세기 궁전입니다.", kind: "명소" },
        { name: "마조렐 정원", summary: "코발트색 건물과 선인장이 어우러진 정원입니다.", kind: "명소" },
        { name: "전통 하맘과 모로코 차", summary: "민트 차를 마시고 전통 목욕으로 쉬어 갑니다.", kind: "액티비티" },
      ],
      [
        { name: "아틀라스 산맥 당일 여행", summary: "베르베르 마을과 폭포가 있는 산으로 다녀옵니다.", kind: "액티비티" },
        { name: "아가파이 사막 일몰", summary: "도심 가까이에서 낙타를 타고 일몰을 봅니다.", kind: "액티비티" },
        { name: "타진 요리 교실", summary: "시장에서 재료를 사 직접 타진을 만들어 봅니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "cusco",
    name: "쿠스코",
    country: "페루",
    lat: -13.53,
    lng: -71.97,
    climate: "고산 기후(고도 약 3,400m)",
    bestSeason: "5~9월 건기가 좋음",
    days: [
      [
        { name: "아르마스 광장", summary: "잉카와 스페인 식민지 시대 건물이 어우러진 도시의 중심입니다.", kind: "명소" },
        { name: "코리칸차", summary: "잉카 태양 신전 위에 지은 산토도밍고 수도원입니다.", kind: "명소" },
        { name: "산 블라스 골목", summary: "공예가들의 작은 가게와 카페가 모인 언덕 동네입니다.", kind: "액티비티" },
      ],
      [
        { name: "삭사이와만 유적", summary: "거대한 돌을 맞춰 쌓은 잉카 요새입니다.", kind: "명소" },
        { name: "켄코와 푸카푸카라", summary: "도시 위쪽 언덕에 흩어진 잉카의 의식 유적입니다.", kind: "명소" },
        { name: "코카 차 시음", summary: "고산병을 가라앉히는 현지 전통 차를 마셔 봅니다.", kind: "액티비티" },
      ],
      [
        { name: "성스러운 계곡 투어", summary: "오얀타이탐보와 피삭을 도는 안데스 계곡 일정입니다.", kind: "액티비티" },
        { name: "마라스 소금 계단밭", summary: "수백 년 된 소금 연못이 계단처럼 이어집니다.", kind: "명소" },
        { name: "산 페드로 시장", summary: "과일 주스와 현지 음식을 파는 쿠스코의 대표 재래시장입니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "hanoi",
    name: "하노이",
    country: "베트남",
    lat: 21.03,
    lng: 105.85,
    climate: "아열대 습윤",
    bestSeason: "10~12월이 좋음",
    days: [
      [
        { name: "호안끼엠 호수", summary: "시내 중심의 호수와 옥산사를 걷는 산책 코스입니다.", kind: "명소" },
        { name: "구시가지 36거리", summary: "옛 상인 거리에서 길거리 음식과 기념품을 구경합니다.", kind: "액티비티" },
        { name: "수상 인형극", summary: "베트남 전통 수상 인형극을 보는 저녁 공연입니다.", kind: "액티비티" },
      ],
      [
        { name: "호찌민 묘소와 주석궁", summary: "베트남 근현대사를 보여주는 광장과 유적입니다.", kind: "명소" },
        { name: "문묘", summary: "11세기에 세운 베트남 최초의 대학 유적입니다.", kind: "명소" },
        { name: "쌀국수와 분짜 맛보기", summary: "하노이식 쌀국수와 분짜를 현지 식당에서 맛봅니다.", kind: "액티비티" },
      ],
      [
        { name: "하롱베이 당일 투어", summary: "석회암 바위섬 사이를 지나는 유람선 여행입니다.", kind: "액티비티" },
        { name: "서호 일몰", summary: "하노이에서 가장 큰 호수 옆 사원에서 해 지는 풍경을 봅니다.", kind: "명소" },
        { name: "기차 거리 커피", summary: "기차가 지나가는 골목 옆 카페에서 에그커피를 마십니다.", kind: "액티비티" },
      ],
    ],
  },
  {
    id: "cape-town",
    name: "케이프타운",
    country: "남아프리카공화국",
    lat: -33.92,
    lng: 18.42,
    climate: "지중해성",
    bestSeason: "11월~3월 여름이 좋음",
    days: [
      [
        { name: "테이블 마운틴", summary: "케이블카나 도보로 올라 평평한 정상에서 도시를 내려다봅니다.", kind: "명소" },
        { name: "빅토리아 앤 앨프리드 워터프런트", summary: "항구 주변의 상점과 음식점, 바다 풍경이 모인 곳입니다.", kind: "명소" },
        { name: "로벤 섬 투어", summary: "넬슨 만델라가 수감됐던 섬을 배로 다녀옵니다.", kind: "액티비티" },
      ],
      [
        { name: "희망봉과 케이프 포인트", summary: "아프리카 남서쪽 끝에서 대서양과 인도양을 바라봅니다.", kind: "명소" },
        { name: "볼더스 비치 펭귄", summary: "해변에서 아프리카 펭귄을 가까이서 볼 수 있습니다.", kind: "액티비티" },
        { name: "채프먼스 피크 드라이브", summary: "절벽을 따라 이어지는 해안 도로를 달립니다.", kind: "액티비티" },
      ],
      [
        { name: "컴스턴보쉬 식물원", summary: "산자락에 펼쳐진 남아프리카 고유 식물 정원입니다.", kind: "명소" },
        { name: "스텔렌보쉬 와이너리", summary: "근교의 와인 농장에서 시음을 하고 점심을 먹습니다.", kind: "액티비티" },
        { name: "보카프 지구", summary: "알록달록한 집들이 늘어선 케이프말레이 동네입니다.", kind: "명소" },
      ],
    ],
  },
];

export function getCity(id: string): City | undefined {
  return CITIES.find((city) => city.id === id);
}

export function getItinerary(cityId: string, days: Days): ItineraryItem[][] {
  const city = getCity(cityId);
  if (!city) return [];
  return city.days.slice(0, days);
}

export function formatLatitude(lat: number): string {
  return `${lat >= 0 ? "북위" : "남위"} ${Math.round(Math.abs(lat))}°`;
}
