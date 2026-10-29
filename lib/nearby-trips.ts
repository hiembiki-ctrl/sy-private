import type { NearbyTrip, RecommendedDays } from "@/lib/cities";

/** 도시별 추천 일수. 도시 정보 줄에 "추천 N~M일"로 보인다. */
export const RECOMMENDED_DAYS: Record<string, RecommendedDays> = {
  tokyo: { min: 4, max: 5 },
  paris: { min: 3, max: 4 },
  "new-york": { min: 4, max: 5 },
  bangkok: { min: 3, max: 4 },
  lisbon: { min: 3, max: 4 },
  istanbul: { min: 3, max: 4 },
  marrakech: { min: 3, max: 4 },
  cusco: { min: 4, max: 5 },
  hanoi: { min: 3, max: 4 },
  "cape-town": { min: 4, max: 5 },
};

/** 도시마다 근교 당일치기 4곳. 앞에서부터 4·5·6·7일차에 쓴다. */
export const NEARBY_TRIPS: Record<string, NearbyTrip[]> = {
  tokyo: [
    {
      destination: "가마쿠라",
      items: [
        { name: "가마쿠라 대불", summary: "고토쿠인 경내에 앉아 있는 13세기 청동 불상입니다.", kind: "명소" },
        { name: "에노덴 열차", summary: "바다와 주택가 사이를 느리게 달리는 작은 전차입니다.", kind: "액티비티" },
        { name: "쓰루가오카 하치만구", summary: "가마쿠라 막부의 중심이던 신사로 바다까지 곧은 참배길이 이어집니다.", kind: "명소" },
      ],
    },
    {
      destination: "닛코",
      items: [
        { name: "닛코 도쇼구", summary: "금박과 조각으로 화려하게 꾸민 에도 시대 쇼군의 사당입니다.", kind: "명소" },
        { name: "게곤 폭포", summary: "97미터 높이에서 떨어지는 폭포를 전망대에서 봅니다.", kind: "명소" },
        { name: "주젠지 호수 산책", summary: "산으로 둘러싸인 호숫가를 걷는 한적한 코스입니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "하코네",
      items: [
        { name: "하코네 로프웨이", summary: "화산 지대 위를 지나며 맑은 날엔 후지산이 보입니다.", kind: "액티비티" },
        { name: "아시노 호수 유람선", summary: "해적선 모양 배를 타고 호수를 건넙니다.", kind: "액티비티" },
        { name: "온천 료칸 당일 입욕", summary: "산속 온천에서 몸을 풀며 하루를 마무리합니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "요코하마",
      items: [
        { name: "미나토미라이 지구", summary: "대관람차와 쇼핑몰이 이어지는 항구 신도시입니다.", kind: "명소" },
        { name: "요코하마 차이나타운", summary: "일본에서 가장 큰 차이나타운에서 만두와 간식을 먹습니다.", kind: "액티비티" },
      ],
    },
  ],
  paris: [
    {
      destination: "베르사유",
      items: [
        { name: "베르사유 궁전", summary: "루이 14세가 지은 궁전으로 거울의 방이 가장 유명합니다.", kind: "명소" },
        { name: "베르사유 정원", summary: "대칭으로 다듬은 정원과 분수, 운하가 끝없이 이어집니다.", kind: "명소" },
        { name: "왕비의 촌락", summary: "마리 앙투아네트가 쉬던 시골 마을 모양 별궁입니다.", kind: "명소" },
      ],
    },
    {
      destination: "지베르니",
      items: [
        { name: "모네의 집과 정원", summary: "모네가 살며 그림을 그린 집과 꽃밭입니다.", kind: "명소" },
        { name: "수련 연못", summary: "연작 「수련」의 배경이 된 일본식 다리와 연못을 거닙니다.", kind: "명소" },
        { name: "인상파 미술관", summary: "지베르니에 머문 화가들의 작품을 전시합니다.", kind: "명소" },
      ],
    },
    {
      destination: "퐁텐블로",
      items: [
        { name: "퐁텐블로 궁전", summary: "프랑스 왕들이 사냥철마다 머물던 궁전입니다.", kind: "명소" },
        { name: "퐁텐블로 숲 산책", summary: "기암과 오솔길이 이어지는 숲을 걷거나 자전거로 돕니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "샹티이",
      items: [
        { name: "샹티이 성", summary: "물 위에 떠 있는 듯한 성에 큰 회화 컬렉션이 있습니다.", kind: "명소" },
        { name: "대마구간 승마 공연", summary: "궁전 같은 마구간에서 열리는 승마 공연과 말 박물관입니다.", kind: "액티비티" },
        { name: "샹티이 크림 맛보기", summary: "이 마을 이름이 붙은 생크림을 얹은 디저트를 맛봅니다.", kind: "액티비티" },
      ],
    },
  ],
  "new-york": [
    {
      destination: "비콘",
      items: [
        { name: "디아 비콘 미술관", summary: "옛 인쇄 공장을 개조한 대형 현대미술관입니다.", kind: "명소" },
        { name: "비콘 메인 스트리트", summary: "작은 갤러리와 카페가 이어지는 강변 마을 거리입니다.", kind: "액티비티" },
        { name: "마운트 비콘 전망", summary: "허드슨강과 계곡이 내려다보이는 산책로입니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "슬리피 할로",
      items: [
        { name: "슬리피 할로 묘지", summary: "소설 「슬리피 할로우의 전설」의 무대가 된 오래된 묘지입니다.", kind: "명소" },
        { name: "킹스 하이웨이 마을 산책", summary: "허드슨 강변에 자리한 작은 옛 마을을 걷습니다.", kind: "액티비티" },
        { name: "필립스버그 저택", summary: "18세기 네덜란드계 농장 저택을 복원한 야외 박물관입니다.", kind: "명소" },
      ],
    },
    {
      destination: "하이드 파크",
      items: [
        { name: "루스벨트 저택", summary: "프랭클린 루스벨트 대통령이 자란 집과 도서관입니다.", kind: "명소" },
        { name: "밴더빌트 저택", summary: "19세기 금융 가문이 지은 화려한 대저택입니다.", kind: "명소" },
        { name: "미국 요리 학교", summary: "유명 요리 학교의 레스토랑에서 점심을 먹습니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "필라델피아",
      items: [
        { name: "독립기념관", summary: "미국 독립 선언과 헌법이 논의된 건물입니다.", kind: "명소" },
        { name: "리버티 벨", summary: "독립의 상징이 된 금 간 종을 가까이서 봅니다.", kind: "명소" },
        { name: "리딩 터미널 마켓", summary: "치즈 스테이크 같은 필라델피아 음식을 맛보는 시장입니다.", kind: "액티비티" },
      ],
    },
  ],
  bangkok: [
    {
      destination: "아유타야",
      items: [
        { name: "왓 마하탓", summary: "나무뿌리가 감싼 불상 머리로 유명한 옛 왕조의 사원 터입니다.", kind: "명소" },
        { name: "왓 차이왓타나람", summary: "강가에 높은 탑이 서 있는 크메르 양식 사원입니다.", kind: "명소" },
        { name: "유적지 자전거 투어", summary: "넓은 유적 공원을 자전거로 돌며 폐허를 둘러봅니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "담넌 사두악 수상시장",
      items: [
        { name: "수상시장 보트 투어", summary: "좁은 운하를 노 젓는 배로 지나며 상인들을 만납니다.", kind: "액티비티" },
        { name: "코코넛 설탕 공장", summary: "코코넛 즙을 졸여 설탕을 만드는 과정을 봅니다.", kind: "액티비티" },
        { name: "매끌렁 기차 시장", summary: "기차가 지나갈 때마다 가판이 걷히는 시장입니다.", kind: "명소" },
      ],
    },
    {
      destination: "칸차나부리",
      items: [
        { name: "콰이강의 다리", summary: "제2차 세계대전 때 놓인 철교를 직접 걸어서 건넙니다.", kind: "명소" },
        { name: "죽음의 철도 기차 타기", summary: "절벽을 따라 이어진 옛 철길을 달리는 열차입니다.", kind: "액티비티" },
        { name: "에라완 폭포", summary: "에메랄드빛 물이 층층이 떨어지는 국립공원 폭포입니다.", kind: "명소" },
      ],
    },
    {
      destination: "파타야",
      items: [
        { name: "산호섬 라안", summary: "배를 타고 가 맑은 바다에서 해수욕과 스노클링을 합니다.", kind: "액티비티" },
        { name: "진리의 성전", summary: "못 없이 나무만으로 조각해 지은 거대한 해변 사원입니다.", kind: "명소" },
      ],
    },
  ],
  lisbon: [
    {
      destination: "신트라",
      items: [
        { name: "페나 궁전", summary: "알록달록한 색으로 칠한 언덕 위의 궁전입니다.", kind: "명소" },
        { name: "무어인의 성", summary: "숲 능선을 따라 성벽이 이어지는 중세 요새입니다.", kind: "명소" },
        { name: "헤갈레이라 별궁 정원", summary: "나선형 지하 계단 우물이 있는 신비로운 정원입니다.", kind: "명소" },
      ],
    },
    {
      destination: "카스카이스",
      items: [
        { name: "카스카이스 구시가지", summary: "어촌 항구와 하얀 골목이 어우러진 해변 마을입니다.", kind: "명소" },
        { name: "호카 곶", summary: "유럽 대륙의 서쪽 끝 절벽에서 대서양을 봅니다.", kind: "명소" },
        { name: "지옥의 입 절벽", summary: "파도가 바위 동굴로 치고 들어가는 해안 절벽입니다.", kind: "명소" },
      ],
    },
    {
      destination: "오비두스",
      items: [
        { name: "오비두스 성벽 걷기", summary: "중세 성벽 위를 한 바퀴 돌며 마을을 내려다봅니다.", kind: "액티비티" },
        { name: "진지냐 초콜릿 잔", summary: "체리 술 진지냐를 초콜릿 잔에 담아 마십니다.", kind: "액티비티" },
        { name: "서점 마을 산책", summary: "교회와 마구간이 서점으로 바뀐 골목을 구경합니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "세투발",
      items: [
        { name: "트로이아 반도 해변", summary: "페리로 건너가 모래 해변에서 쉬어 가는 곳입니다.", kind: "액티비티" },
        { name: "아라비다 자연공원", summary: "절벽과 바다가 어우러진 산책로가 있는 국립공원입니다.", kind: "명소" },
        { name: "해산물 시장 식사", summary: "구운 정어리와 오징어를 현지 시장 식당에서 먹습니다.", kind: "액티비티" },
      ],
    },
  ],
  istanbul: [
    {
      destination: "프린스 제도",
      items: [
        { name: "뷔위카다 섬 마차 투어", summary: "자동차가 없는 섬을 마차로 돌며 목조 저택을 봅니다.", kind: "액티비티" },
        { name: "섬 해변 식당", summary: "바다 앞 식당에서 생선 요리로 점심을 먹습니다.", kind: "액티비티" },
        { name: "페리 갑판 유람", summary: "마르마라해 위로 떠 있는 페리에서 도시 전경을 봅니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "부르사",
      items: [
        { name: "울루 자미", summary: "스무 개의 돔이 이어진 오스만 초기의 대사원입니다.", kind: "명소" },
        { name: "부르사 케이블카", summary: "울루다 산 쪽으로 올라가며 도시와 평야를 내려다봅니다.", kind: "액티비티" },
        { name: "이스켄데르 케밥", summary: "이 도시에서 시작된 요구르트와 토마토 소스 케밥을 맛봅니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "샤일레",
      items: [
        { name: "샤일레 등대", summary: "흑해 절벽 위에 선 오래된 등대와 해안 풍경입니다.", kind: "명소" },
        { name: "흑해 해변 산책", summary: "모래 해변과 숲길이 이어지는 한적한 바닷가입니다.", kind: "액티비티" },
        { name: "샤일레 천 공예품", summary: "이 마을 특산인 무명천 수공예품을 구경합니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "이즈니크",
      items: [
        { name: "이즈니크 호수", summary: "튀르키예에서 큰 호수에 맞닿은 고대 도시 이즈니크 둘레길입니다.", kind: "명소" },
        { name: "이즈니크 고대 성벽", summary: "로마와 비잔틴 시대의 성벽과 성문이 남아 있습니다.", kind: "명소" },
        { name: "이즈니크 타일 공방", summary: "푸른 도자 타일을 만드는 공방을 견학합니다.", kind: "액티비티" },
      ],
    },
  ],
  marrakech: [
    {
      destination: "우리카 계곡",
      items: [
        { name: "우리카 계곡 트레킹", summary: "아틀라스 산자락 계곡을 따라 걷는 가벼운 산책입니다.", kind: "액티비티" },
        { name: "베르베르 마을 방문", summary: "붉은 흙집 마을에서 민트 차를 마십니다.", kind: "액티비티" },
        { name: "세티 파트마 폭포", summary: "물길 사이 바위를 건너 폭포까지 올라가 봅니다.", kind: "명소" },
      ],
    },
    {
      destination: "에사우이라",
      items: [
        { name: "에사우이라 메디나", summary: "푸른 문과 하얀 벽이 이어지는 바닷가의 성곽 도시입니다.", kind: "명소" },
        { name: "항구 생선 시장", summary: "어선이 들어오는 항구에서 갓 잡은 생선을 구워 먹습니다.", kind: "액티비티" },
        { name: "스카라 성벽 전망", summary: "대포가 놓인 성벽 위에서 대서양을 바라봅니다.", kind: "명소" },
      ],
    },
    {
      destination: "아이트 벤하두",
      items: [
        { name: "아이트 벤하두 크사르", summary: "흙벽돌로 지은 요새 마을로 영화 촬영지로도 알려져 있습니다.", kind: "명소" },
        { name: "티지 은 티슈카 고갯길", summary: "아틀라스 산맥을 넘는 구불구불한 산길 드라이브입니다.", kind: "액티비티" },
        { name: "와르자자트 영화 스튜디오", summary: "대작 영화를 찍은 세트장을 둘러봅니다.", kind: "명소" },
      ],
    },
    {
      destination: "아가파이 사막",
      items: [
        { name: "낙타 트레킹", summary: "모래와 바위가 섞인 사막 지대를 낙타를 타고 돕니다.", kind: "액티비티" },
        { name: "사막 일몰", summary: "도심에서 가까운 사막 언덕에서 붉은 해넘이를 봅니다.", kind: "명소" },
        { name: "베르베르식 저녁 식사", summary: "천막에서 타진 요리와 전통 음악을 즐깁니다.", kind: "액티비티" },
      ],
    },
  ],
  cusco: [
    {
      destination: "성스러운 계곡",
      items: [
        { name: "피삭 유적과 시장", summary: "산비탈 계단밭 위의 유적과 일요 시장이 있는 마을입니다.", kind: "명소" },
        { name: "오얀타이탐보 요새", summary: "돌계단이 가파르게 오르는 잉카 요새와 마을입니다.", kind: "명소" },
        { name: "친체로 직물 마을", summary: "전통 염색과 직조를 시연하는 마을 공방입니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "마추픽추",
      items: [
        { name: "마추픽추 기차 여행", summary: "창이 넓은 열차를 타고 우루밤바강 협곡을 따라 갑니다.", kind: "액티비티" },
        { name: "마추픽추 유적 탐방", summary: "구름 속 산봉우리에 자리한 잉카 도시를 가이드와 둘러봅니다.", kind: "명소" },
        { name: "아구아스 칼리엔테스 마을", summary: "유적 아래 온천 마을에서 점심을 먹고 쉽니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "마라스와 모라이",
      items: [
        { name: "모라이 원형 계단밭", summary: "움푹 파인 원형 계단밭이 이어진 잉카의 농업 실험장입니다.", kind: "명소" },
        { name: "마라스 소금 계단밭", summary: "수백 년 된 소금 연못이 계단처럼 이어집니다.", kind: "명소" },
        { name: "마라스 소금 시장", summary: "분홍빛 소금과 소금 공예품을 구경하는 작은 시장입니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "무지개산",
      items: [
        { name: "비니쿤카 트레킹", summary: "새벽에 출발해 줄무늬 광물 산봉우리까지 걸어 오릅니다.", kind: "액티비티" },
        { name: "알파카 방목지", summary: "고원에서 풀을 뜯는 알파카와 라마를 만납니다.", kind: "액티비티" },
        { name: "고원 마을 점심", summary: "트레킹 뒤 현지 마을에서 따뜻한 수프를 먹습니다.", kind: "액티비티" },
      ],
    },
  ],
  hanoi: [
    {
      destination: "하롱베이",
      items: [
        { name: "하롱베이 유람선", summary: "석회암 바위섬 사이를 지나는 크루즈로 점심을 겸합니다.", kind: "액티비티" },
        { name: "티엔꿍 동굴", summary: "석순과 종유석이 조명으로 빛나는 큰 동굴입니다.", kind: "명소" },
        { name: "카약 타기", summary: "작은 카약으로 바위섬 안쪽 석호까지 들어가 봅니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "닌빈",
      items: [
        { name: "짱안 배 투어", summary: "동굴 사이를 지나는 작은 배를 타고 석회암 산을 돕니다.", kind: "액티비티" },
        { name: "항무아 전망대", summary: "500여 개 계단을 올라 논과 강이 어우러진 풍경을 봅니다.", kind: "명소" },
        { name: "호아르 옛 수도", summary: "10세기 베트남 왕조의 수도였던 사원 유적입니다.", kind: "명소" },
      ],
    },
    {
      destination: "바트짱",
      items: [
        { name: "바트짱 도자기 마을", summary: "수백 년째 도자기를 굽는 마을의 공방과 가마입니다.", kind: "명소" },
        { name: "도자기 만들기 체험", summary: "물레를 돌려 작은 그릇을 직접 빚어 봅니다.", kind: "액티비티" },
        { name: "홍강 제방 자전거", summary: "강을 따라 난 둑길을 자전거로 달립니다.", kind: "액티비티" },
      ],
    },
    {
      destination: "흐엉 사원",
      items: [
        { name: "흐엉 강 배 타기", summary: "연꽃이 핀 강을 따라 사원 입구까지 배로 이동합니다.", kind: "액티비티" },
        { name: "흐엉 사원 동굴", summary: "산속 동굴 법당으로 오르는 순례길입니다.", kind: "명소" },
        { name: "산 위 케이블카", summary: "케이블카를 타고 산 위에서 주변 숲과 강을 내려다봅니다.", kind: "액티비티" },
      ],
    },
  ],
  "cape-town": [
    {
      destination: "스텔렌보쉬",
      items: [
        { name: "스텔렌보쉬 와이너리", summary: "대학 도시 근처 포도밭에서 시음과 점심을 즐깁니다.", kind: "액티비티" },
        { name: "도르프 스트리트 산책", summary: "케이프 더치 양식 건물이 늘어선 옛 거리를 걷습니다.", kind: "명소" },
        { name: "베르가르텐 정원", summary: "네덜란드 식민지 시절 이후의 정원을 둘러봅니다.", kind: "명소" },
      ],
    },
    {
      destination: "프란슈훅",
      items: [
        { name: "프란슈훅 와인 트램", summary: "포도밭 사이를 순환하는 버스와 트램으로 와이너리를 오갑니다.", kind: "액티비티" },
        { name: "위그노 기념관", summary: "프랑스계 이주민의 역사를 소개하는 기념관입니다.", kind: "명소" },
        { name: "산악 도로 전망", summary: "고갯길에서 계곡과 포도밭을 내려다봅니다.", kind: "명소" },
      ],
    },
    {
      destination: "하마너스",
      items: [
        { name: "고래 관찰 보트", summary: "겨울부터 봄에 바다 가까이 오는 고래를 만납니다.", kind: "액티비티" },
        { name: "클리프 패스 산책", summary: "절벽 위 길을 따라 바다를 보며 걷습니다.", kind: "액티비티" },
        { name: "하마너스 구시가지", summary: "작은 갤러리와 식당이 모인 해안 마을을 거닙니다.", kind: "명소" },
      ],
    },
    {
      destination: "웨스트 코스트 국립공원",
      items: [
        { name: "랑가반 석호", summary: "푸른 석호와 흰 모래 해변이 펼쳐진 국립공원입니다.", kind: "명소" },
        { name: "봄철 야생화 구경", summary: "8~9월 사이 들판을 뒤덮는 야생화를 봅니다.", kind: "명소" },
        { name: "야생동물 탐방", summary: "영양과 타조, 철새를 길가에서 쉽게 볼 수 있습니다.", kind: "액티비티" },
      ],
    },
  ],
};
