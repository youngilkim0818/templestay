import { Temple } from '../types';
import { TempleImageService, enrichTempleWithImages } from '../services/templeImageService';

export const TEMPLES_DATA: Temple[] = [
  {
    id: '1',
    name: '불국사',
    region: '경주',
    address: '경상북도 경주시 불국로 385',
    latitude: 35.7895,
    longitude: 129.3321,
    areaCd: 35,
    sigunguCd: 2,
    imageUrl: require('../../assets/불국사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop'
    basePrice: 80000,
    precautions: '유네스코 세계문화유산으로 지정된 곳이므로, 문화재 훼손에 각별히 유의해야 합니다.',
    description: '신라 시대 불교 예술의 정수를 보여주는 불국사는 다보탑, 석가탑 등 수많은 국보와 함께 찬란했던 불교 문화를 생생하게 느낄 수 있는 곳입니다.',
    availableTimes: ['09:00 - 10:30', '11:00 - 12:30', '14:00 - 15:30', '16:00 - 17:30'],
    programs: [],
    templestay: [
      {
        title: '25년 불국사 천년의 향기',
        description: '불국사 천년의 향기를 느껴볼 수 있는 프로그램입니다.',
        price: 120000,
        times: ['09:00~12:00', '14:00~17:00'],
        type: '체험형',
      },
      {
        title: '25년 석굴암 천년의 숨결',
        description: '석굴암에서 새벽예불을 보고 토함산 일출도 볼 수있는 한시적으로 운영하는 특별템플스테이',
        price: 150000,
        times: ['13:00~16:00'],
        type: '휴식형',
      },
      {
        title: '25년 불국사 천년의 향기 국악문화공연 특별템플스테이',
        description: '한국전통국악무용인 승무, 한량무, 작법무인 나비춤, 관음무등을 관람할 수 있는 특별 템플스테이',
        price: 130000,
        times: ['10:00~12:00'],
        type: '체험형',
      },
    ],
    facilities: ['주차장', '화장실', '매점', '휴게실'],
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransportAccessible: true,
    },
    operatingHours: {
      '월요일': '09:00-18:00',
      '화요일': '09:00-18:00',
      '수요일': '09:00-18:00',
      '목요일': '09:00-18:00',
      '금요일': '09:00-18:00',
      '토요일': '09:00-18:00',
      '일요일': '09:00-18:00',
    },
    holidays: ['설날', '부처님 오신 날'],
  },
  {
    id: '2',
    name: '골굴사',
    region: '경주',
    address: '경상북도 경주시 문무대왕면 기림로 101-5',
    latitude: 35.7542,
    longitude: 129.4265,
    areaCd: 35,
    sigunguCd: 2,
    imageUrl: require('../../assets/굴국사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop'
    basePrice: 60000,
    precautions: '사진 촬영은 지정된 장소에서만 가능합니다.',
    description: '골굴사는 천년의 세월을 간직한 석굴과 자연이 어우러진, 명상과 수행의 고요함이 흐르는 산사입니다.',
    availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
    programs: [],
    templestay: [
      { title: '움직이는 선의 숨결! (1박2일)', description: '마음을 닦는 몸의공부, 선무도! 참된 나를 만나다.', price: 100000, times: ['09:00~11:00'], type: '체험형' },
      { title: '움직이는 선의 숨결! (2박3일)', description: '마음을 닦는 몸의공부, 선무도! 참된 나를 만나다.', price: 200000, times: ['10:00~13:00'], type: '체험형' },
      { title: '주말_템플스테이 ( 1박2일-선무도 야외수련 및 야외명상)', description: '일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다.', price: 100000, times: ['13:30~16:30'], type: '체험형' },
      { title: '주말_템플스테이 ( 2박3일-선무도 야외수련 및 야외명상)', description: '일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다.', price: 200000, times: ['15:00~18:00'], type: '휴식형' },
      { title: '휴식형 템플스테이! 나에게 주는 선물!', description: '천년고찰 골굴사의 마애여래 부처님의 미소 아래 힐링과 재충전의 시간을 가져보세요.', price: 100000, times: ['11:30~13:00'], type: '휴식형' },
      { title: '나를 위한 하루동안의 행복여행!', description: '신라 화랑의 기상을 계승한 체험형 프로그램인 국궁과 승마등의 다양한 프로그램을 즐기실 수 있습니다.', price: 70000, times: ['17:00~19:00'], type: '체험형' },
    ],
  },
  {
    id: '3',
    name: '직지사',
    region: '김천',
    address: '경상북도 김천시 대항면 직지사길 95',
    latitude: 36.1047,
    longitude: 128.0817,
    areaCd: 35,
    sigunguCd: 3,
    imageUrl: require('../../assets/직지사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop'
    basePrice: 70000,
    precautions: '바닷가에 위치하여 파도와 바람에 주의해야 합니다.',
    description: '직지사는 깊은 산속 울창한 숲과 함께, 오랜 전통과 불심이 살아 숨 쉬는 경북의 대표 사찰입니다.',
    availableTimes: ['09:30 - 11:00', '14:30 - 16:00'],
    programs: [],
    templestay: [
      { title: '내 마음 깊이 살펴보기 [선(禪)-명상체험형] [육화당.안심료]', description: '명상을 통해 진정한 나를 찾아가는 시간', price: 90000, times: ['09:30~12:00'], type: '체험형' },
      { title: '내 마음 깊이 살펴보기 [선(禪)-명상체험형] [수향당]', description: '명상을 통해 진정한 나를 찾아가는 시간', price: 80000, times: ['14:30~17:00'], type: '체험형' },
      { title: '내 마음의 작은 쉼표 [휴식형] [육화당.안심료]', description: '사찰의 자연과 문화 환경을 활용하여 마음의 휴식을 얻는 프로그램', price: 70000, times: ['10:00~12:00'], type: '휴식형' },
      { title: '내 마음의 작은 쉼표 [휴식형] [수향당]', description: '사찰의 자연과 문화 환경을 활용하여 마음의 휴식을 얻는 프로그램', price: 60000, times: ['13:00~15:00'], type: '휴식형' },
    ],
  },
  {
    id: '4',
    name: '감산사',
    region: '경주',
    address: '경북 경주시 외동읍 앞등길 117-20',
    latitude: 35.7664052,
    longitude: 129.3370795,
    areaCd: 35,
    sigunguCd: 2,
    imageUrl: require('../../assets/감산사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop'
    basePrice: 65000,
    precautions: '절에서는 필요 없는 말을 하지 않으며(묵언), 단순하고 느리게, 겸손과 배려의 마음으로 조화롭게 생활합니다.',
    description: '통일신라 성덕왕이 아버지와 어머디의 명복을 빌고, 국왕과 그 가문의 안녕을 기원하기 위해 창건된 사찰입니다',
    availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
    programs: [],
    templestay: [
      { title: '내려놓고, 쉼 -휴식형 (1인 1실-1박2일만가능)', description: '스님과 함께 명상의 시간을 가져보시기 바랍니다.', price: 120000, times: ['09:00~12:00'], type: '휴식형' },
      { title: '내려놓고, 쉼-휴식형 (2인 이상-1박2일만가능)', description: '스님과 함께 명상의 시간을 가져보시기 바랍니다.', price: 80000, times: ['14:00~17:00'], type: '휴식형' },
      { title: '내마음 봄 (1인 1실)', description: '맨발걷기, 탑돌이, 108배하기, 호미길(맨발) 걷기명상, 괘릉 명상순례, 스님과 차담 등 프로그램', price: 120000, times: ['14:00~17:00'], type: '체험형' },
      { title: '내마음 봄 (2인 이상)', description: '맨발걷기, 탑돌이, 108배하기, 호미길(맨발) 걷기명상, 괘릉 명상순례, 스님과 차담 등 프로그램', price: 80000, times: ['14:00~17:00'], type: '체험형' },
      { title: '2025- 자연 속 쉼, 가족과 함께하는 여름 특별 템플스테이!', description: '가족 모두가 전통 사찰 문화와 지연 속 힐링을 함께 체험 할 수 있도록 마련된 프로그램', price: 80000, times: ['14:00~17:00'], type: '체험형' },
    ],
  },
  {
    id: '5',
    name: '대승사',
    region: '문경',
    address: '경상북도 문경시 산북면 대승사길 283',
    latitude: 36.7498799,
    longitude: 128.2720622,
    areaCd: 35,
    sigunguCd: 7,
    imageUrl: require('../../assets/대승사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop'
    basePrice: 70000,
    precautions: '사찰은 수행의 공간입니다. 사찰에서의 기본 예절을 잘 지켜주십시오.',
    description: '대승사는 깊은 산자락에 자리한 천년고찰로, 고즈넉한 산세와 불심이 깃든 전통이 어우러진 수행 도량입니다.',
    availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
    programs: [],
    templestay: [
      { title: '당일형 체험', description: ' ', price: 30000, times: ['13:00~16:00'], type: '당일형' },
      { title: '참선으로 배우는 마음공부법(선원스님들의 실제 참선법을 따라서...) - 5명이상 신청시 가능', description: '스님들의 발자취가 서린 대승사 선원의 프로그램을 그대로 따라 진행하는 참선 배우기 프로그램', price: 80000, times: ['10:00~13:00'], type: '체험형' },
      { title: '사불산(四佛山)... 옛길을 걷다', description: '스님과의 차담, 예불, 윤필암, 묘적암,사면석불 포행과 쉼이 있는 프로그램', price: 60000, times: ['13:00~16:00'], type: '휴식형' }
    ],
  },
  {
    id: '6',
    name: '보경사',
    region: '포항',
    address: '경상북도 포항시 북구 송라면 보경로 523',
    latitude: 36.252279,
    longitude: 129.317949,
    areaCd: 35,
    sigunguCd: 4,
    imageUrl: require('../../assets/보경사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop'
    basePrice: 65000,
    precautions: '동해바다를 바라보는 위치에 있어 바람이 강할 수 있습니다.',
    description: '기암과 폭포가 어우러진 내연산 자락에 자리한, 천년의 불심과 자연의 아름다움을 간직한 고찰입니다.',
    availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
    programs: [],
    templestay: [
      { title: '[2025 당일형] 당일 템플스테이', description: '내연산 12폭포와 함께 보경사를 둘러보다', price: 70000, times: ['14:00~17:00'], type: '당일형' },
      { title: '[2025 체험형] With you, with me', description: '우리의 시절인연을 되돌아보고 감사하게 될 보경사 체험형 템플스테이에 모시게 되어 참으로 기쁩니다.', price: 70000, times: ['14:00~17:00'], type: '체험형' },
      { title: '[2025 휴식형] 나에게로 돌아오는 순간', description: '당신의 영혼을 맑게하는 이곳은 보경사 휴식형 템플스테이 입니다.', price: 70000, times: ['14:00~17:00'], type: '휴식형' }
    ],
  },
  {
    id: '7',
    name: '선본사',
    region: '경산',
    address: '경상북도 경산시 와촌면 대한리 587',
    latitude: 35.9874776,
    longitude: 128.7387497,
    areaCd: 35,
    sigunguCd: 5,
    imageUrl: require('../../assets/선본사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop'
    basePrice: 60000,
    precautions: '전통사찰로 문화재 보호에 각별히 유의해야 합니다.',
    description: '팔공산 기슭에 자리한 유서 깊은 도량으로, 장엄한 자연 속에서 선과 정진의 전통을 이어가는 사찰입니다.',
    availableTimes: ['09:30 - 11:00', '13:30 - 15:00'],
    programs: [],
    templestay: [
      { title: '갓바위 부처님 품에서 잠시 쉬어가기 - 체험권 가능', description: '전국 일등 기도도량 팔공산 선본사 (갓바위) 템플스테이 입니다. ', price: 50000, times: ['09:30~12:30'], type: '휴식형' },
      { title: '선명상 템플스테이(소모임 , 단체) - 당일형', description: '108 소원염주만들기, 에코백 만들기 , 연꽃등 만들기,소원 팔찌만들기 중 1개 프로그램 선택', price: 30000, times: ['13:30~16:30'], type: '당일형' },
      { title: '공익 - 지역 대학생을 위한 선명상 템플스테이 - 대구, 경북 대학생 대상 금.토.일요일 - 1만원 할인', description: '지역대학생을 위한 선명상 템플스테이를 시작합니다. ', price: 50000, times: ['09:30~12:30'], type: '체험형' },
      { title: '선명상과 금강경 3독 독송 - 스님과 차담', description: '팔공산 선본사 갓바위에서 진행하는 당일형 템플스테이입니다.', price: 25000, times: ['09:30~12:30'], type: '당일형' },
      { title: '갓바위 부처님 소원을 들어주셔서 감사해요^^ - 주중체험형', description: '소중한 내 꿈을 다시 알아차리고, 꿈을 이루기 위해 열심히 노력할 수 있는 에너지를 충전하는 프로그램', price: 60000, times: ['09:30~12:30'], type: '체험형' },
      { title: '선 명상 템플스테이 - 갓바위 부처님 소원을 들어 주셔서 감사해요^^ - 금,토,일 힐링 (체험권 사용 가능)', description: '소중한 내 꿈을 다시 알아차리고, 꿈을 이루기 위해 열심히 노 할 수 있는 에너지를 충전하는 프로그램', price: 60000, times: ['09:30~12:30'], type: '체험형' },
      { title: '우리의 소원은 (당일형)', description: '사찰안내와 갓바위 부처님 참배와 그 외 1개 프로그램 선택', price: 30000, times: ['09:30~12:30'], type: '당일형' },
    ],
  },
  {
    id: '8',
    name: '심원사',
    region: '성주',
    address: '경상북도 성주군 수륜면 가야산식물원길 17-56',
    latitude: 35.8004858,
    longitude: 128.135791,
    areaCd: 35,
    sigunguCd: 6,
    imageUrl: require('../../assets/심원사.jpg'),
    // 기존 이미지 URL: 'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop'
    basePrice: 60000,
    precautions: '전통사찰로 문화재 보호에 각별히 유의해야 합니다.',
    description: '가야산 자락 깊숙이 자리한 고즈넉한 산사로, 맑은 계곡과 울창한 숲이 어우러진 명상의 도량입니다',
    availableTimes: ['09:30 - 11:00', '13:30 - 15:00'],
    programs: [],
    templestay: [
      { title: '365 거북이충전소(상시 휴식형)', description: '지친 일상, 힘들었던 어제를 뒤로 하고 대자연 속 심원사에서 하룻밤!!', price: 60000, times: ['09:30~12:30'], type: '휴식형' },
      { title: '여름특별템플스테이(하하호호 1박2일)', description: '가야산 푸른 숲의 새소리와 계곡물 소리, 여름 밤 옷깃을스치는 바람에 더위는잊고 마음엔 행복 가득~~', price: 80000, times: ['13:30~16:30'], type: '체험형' },
      { title: '<지역연계프로그램> 아이들의 예술놀이터, 가야산역사신화테마관 연계 템플스테이(당일형)', description: '사찰음식을 맛보고 차를 마시며 심원사의 역사와 궁금증을 템플스테이 스님께 듣는 시간', price: 10000, times: ['09:30~12:30'], type: '당일형' },
      { title: '선명상 템플스테이[쉬어가는 마음오름]', description: '사흘 닦은 마음은 천년의 보배요 백년동안 탐한 재물은 하루 아침의 티끼이다', price: 80000, times: ['09:30~12:30'], type: '체험형' },
      { title: '푹 쉬다 가이소(단풍에 물드는 心心 1박2일)', description: '심원사 템플스테이에서나를 위한 여행길에 위로의 씨앗을 뿌려봅니다.', price: 80000, times: ['09:30~12:30'], type: '체험형' },
    ],
  },
];

export const getTempleById = (id: number): Temple | undefined => {
  return TEMPLES_DATA.find((temple) => temple.id === id.toString());
};

/**
 * 이미지가 포함된 사찰 데이터 가져오기
 */
export const getTempleByIdWithImages = async (id: number): Promise<Temple | undefined> => {
  const temple = getTempleById(id);
  if (!temple) return undefined;
  
  return await enrichTempleWithImages(temple);
};

/**
 * 모든 사찰에 이미지 데이터 추가
 */
export const getAllTemplesWithImages = async (): Promise<Temple[]> => {
  console.log('🖼️ 모든 사찰 이미지 데이터 로딩 시작...');
  
  const promises = TEMPLES_DATA.map(async (temple) => {
    try {
      return await enrichTempleWithImages(temple);
    } catch (error) {
      console.error(`❌ ${temple.name} 이미지 로딩 실패:`, error);
      return temple; // 실패 시 원본 데이터 반환
    }
  });

  const enrichedTemples = await Promise.allSettled(promises);
  const results = enrichedTemples
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<Temple>).value);
  
  console.log(`✅ 사찰 이미지 로딩 완료: ${results.length}/${TEMPLES_DATA.length}`);
  return results;
};

/**
 * 사찰명으로 이미지 포함 데이터 검색
 */
export const searchTempleByName = async (name: string): Promise<Temple | undefined> => {
  const temple = TEMPLES_DATA.find(t => t.name === name || t.name.includes(name));
  if (!temple) return undefined;
  
  return await enrichTempleWithImages(temple);
};

/**
 * 지역별 사찰 데이터 가져오기
 */
export const getTemplesByRegion = (region: string): Temple[] => {
  return TEMPLES_DATA.filter(temple => temple.region === region);
};

/**
 * 모든 사찰 데이터 가져오기
 */
export const getAllTemples = (): Temple[] => {
  return TEMPLES_DATA;
};

/**
 * 당일형 프로그램을 가진 사찰들만 가져오기
 */
export const getTemplesWithOneDayPrograms = (): Temple[] => {
  return TEMPLES_DATA.filter(temple => 
    temple.templestay?.some(program => program.type === '당일형')
  );
};

/**
 * 특정 지역의 당일형 프로그램을 가진 사찰들만 가져오기
 */
export const getTemplesWithOneDayProgramsByRegion = (region: string): Temple[] => {
  return TEMPLES_DATA.filter(temple => 
    temple.region === region && 
    temple.templestay?.some(program => program.type === '당일형')
  );
}; 