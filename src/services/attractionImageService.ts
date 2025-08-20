// 주변 관광지 이미지 매핑 서비스
import { Image } from 'react-native';

// 새로 추가된 관광지 이미지 매핑 (모든 이미지 파일 매핑)
const ATTRACTION_IMAGE_MAP: Record<string, any> = {
  // 포항 관련
  '포항역': require('../../니어 어트랙션 사진모음/pohangStation.jpg'),
  '포항시외버스터미널': require('../../니어 어트랙션 사진모음/pohangIntercityBusTerminal.jpg'),
  '포항경주공항': require('../../니어 어트랙션 사진모음/pohangGyeongjuAirport.jpg'),
  '구룡포시장': require('../../니어 어트랙션 사진모음/guryongpoMarket.jpg'),
  '구룡포 일본인가옥거리': require('../../니어 어트랙션 사진모음/kuryongpoJapan.jpg'),
  '해나드 컨트리클럽': require('../../니어 어트랙션 사진모음/haenaedaCc.jpg'),
  
  // 김천 관련  
  '김천역': require('../../니어 어트랙션 사진모음/gimcheonStation.jpg'),
  '김천구미역': require('../../니어 어트랙션 사진모음/gimcheonGumiStation.jpg'),
  '김천포 컨트리클럽': require('../../니어 어트랙션 사진모음/gimcheonpoCc.jpg'),
  
  // 경산 관련
  '경산역': require('../../니어 어트랙션 사진모음/gyeongsanStation.jpg'),
  '경산 중앙시장': require('../../니어 어트랙션 사진모음/gyeongsanPublicMarket.jpg'),
  
  // 문경 관련
  '문경 에코랄라': require('../../니어 어트랙션 사진모음/mungyeongEcoWorld.jpg'),
  '문경 오미자터널': require('../../니어 어트랙션 사진모음/mungyeongOmizaTunnel.jpg'),
  'STX 리조트 문경': require('../../니어 어트랙션 사진모음/STXMungyeongResort.jpg'),
  
  // 기타 관광지
  '봉명산': require('../../니어 어트랙션 사진모음/bongmyeongMountain.jpg'),
  '부항댐 출렁다리': require('../../니어 어트랙션 사진모음/buhangDamRockBridge.jpg'),
  '치어파크 스페이스워크': require('../../니어 어트랙션 사진모음/cheerparkSpacewalk.jpg'),
  '브리프리': require('../../니어 어트랙션 사진모음/briefly.jpg'),
  
  // 파일명 기반 직접 매핑 (fallback)
  'STXMungyeongResort': require('../../니어 어트랙션 사진모음/STXMungyeongResort.jpg'),
  'bongmyeongMountain': require('../../니어 어트랙션 사진모음/bongmyeongMountain.jpg'),
  'briefly': require('../../니어 어트랙션 사진모음/briefly.jpg'),
  'buhangDamRockBridge': require('../../니어 어트랙션 사진모음/buhangDamRockBridge.jpg'),
  'cheerparkSpacewalk': require('../../니어 어트랙션 사진모음/cheerparkSpacewalk.jpg'),
  'gimcheonGumiStation': require('../../니어 어트랙션 사진모음/gimcheonGumiStation.jpg'),
  'gimcheonStation': require('../../니어 어트랙션 사진모음/gimcheonStation.jpg'),
  'gimcheonpoCc': require('../../니어 어트랙션 사진모음/gimcheonpoCc.jpg'),
  'guryongpoMarket': require('../../니어 어트랙션 사진모음/guryongpoMarket.jpg'),
  'gyeongsanPublicMarket': require('../../니어 어트랙션 사진모음/gyeongsanPublicMarket.jpg'),
  'gyeongsanStation': require('../../니어 어트랙션 사진모음/gyeongsanStation.jpg'),
  'haenaedaCc': require('../../니어 어트랙션 사진모음/haenaedaCc.jpg'),
  'kuryongpoJapan': require('../../니어 어트랙션 사진모음/kuryongpoJapan.jpg'),
  'mungyeongEcoWorld': require('../../니어 어트랙션 사진모음/mungyeongEcoWorld.jpg'),
  'mungyeongOmizaTunnel': require('../../니어 어트랙션 사진모음/mungyeongOmizaTunnel.jpg'),
  'pohangGyeongjuAirport': require('../../니어 어트랙션 사진모음/pohangGyeongjuAirport.jpg'),
  'pohangIntercityBusTerminal': require('../../니어 어트랙션 사진모음/pohangIntercityBusTerminal.jpg'),
  'pohangStation': require('../../니어 어트랙션 사진모음/pohangStation.jpg'),
};

// 키워드 기반 매칭을 위한 키워드 맵 (확장된 키워드)
const KEYWORD_TO_IMAGE: Record<string, string> = {
  // 포항 관련 키워드
  '포항역': '포항역',
  '포항': '포항역',
  'pohang': '포항역',
  'station': '포항역',
  '포항터미널': '포항시외버스터미널', 
  '포항공항': '포항경주공항',
  'airport': '포항경주공항',
  '구룡포': '구룡포시장',
  'guryongpo': '구룡포시장',
  'market': '구룡포시장',
  '일본인가옥': '구룡포 일본인가옥거리',
  'japan': '구룡포 일본인가옥거리',
  '해나드': '해나드 컨트리클럽',
  'haenaeda': '해나드 컨트리클럽',
  'country': '해나드 컨트리클럽',
  'club': '해나드 컨트리클럽',
  
  // 김천 관련 키워드
  '김천역': '김천역',
  '김천': '김천역',
  'gimcheon': '김천역',
  '김천구미': '김천구미역',
  'gumi': '김천구미역',
  '김천포': '김천포 컨트리클럽',
  
  // 경산 관련 키워드
  '경산역': '경산역',
  '경산': '경산역',
  'gyeongsan': '경산역',
  '경산시장': '경산 중앙시장',
  '중앙시장': '경산 중앙시장',
  'public': '경산 중앙시장',
  
  // 문경 관련 키워드
  '에코랄라': '문경 에코랄라',
  'ecoworld': '문경 에코랄라',
  'eco': '문경 에코랄라',
  'mungyeong': '문경 에코랄라',
  'mungyeongecoworld': '문경 에코랄라',
  '문경': '문경 에코랄라',
  '오미자': '문경 오미자터널',
  'omiza': '문경 오미자터널',
  'tunnel': '문경 오미자터널',
  'STX': 'STX 리조트 문경',
  '문경리조트': 'STX 리조트 문경',
  'resort': 'STX 리조트 문경',
  
  // 기타 키워드
  '봉명산': '봉명산',
  'bongmyeong': '봉명산',
  'mountain': '봉명산',
  '부항댐': '부항댐 출렁다리',
  'buhang': '부항댐 출렁다리',
  'dam': '부항댐 출렁다리',
  '출렁다리': '부항댐 출렁다리',
  'bridge': '부항댐 출렁다리',
  '치어파크': '치어파크 스페이스워크',
  'cheerpark': '치어파크 스페이스워크',
  'cheer': '치어파크 스페이스워크',
  'park': '치어파크 스페이스워크',
  '스페이스워크': '치어파크 스페이스워크',
  'spacework': '치어파크 스페이스워크',
  'space': '치어파크 스페이스워크',
  '브리프리': '브리프리',
  'briefly': '브리프리',
  
  // songdo beach 관련 (일반적인 해변 이미지로 fallback)
  'songdo': '구룡포시장', // 임시로 구룡포시장 이미지 사용
  'beach': '구룡포시장',
  '송도': '구룡포시장',
  '해변': '구룡포시장',
};

/**
 * 관광지 이름을 기반으로 로컬 이미지를 찾는 함수
 */
export function getAttractionImageByName(attractionName: string): any | null {
  if (!attractionName) return null;
  
  // 1. 직접 매칭 시도
  if (ATTRACTION_IMAGE_MAP[attractionName]) {
    return ATTRACTION_IMAGE_MAP[attractionName];
  }
  
  // 2. 키워드 기반 매칭
  const keywords = Object.keys(KEYWORD_TO_IMAGE);
  for (const keyword of keywords) {
    if (attractionName.includes(keyword)) {
      const mappedName = KEYWORD_TO_IMAGE[keyword];
      if (ATTRACTION_IMAGE_MAP[mappedName]) {
        return ATTRACTION_IMAGE_MAP[mappedName];
      }
    }
  }
  
  // 3. 부분 문자열 매칭 (유사한 이름 찾기)
  const imageKeys = Object.keys(ATTRACTION_IMAGE_MAP);
  for (const key of imageKeys) {
    if (key.includes(attractionName) || attractionName.includes(key)) {
      return ATTRACTION_IMAGE_MAP[key];
    }
  }
  
  return null;
}

/**
 * Image.resolveAssetSource를 사용하여 이미지 URI를 얻는 함수
 */
export function getAttractionImageUri(attractionName: string): string | null {
  const imageSource = getAttractionImageByName(attractionName);
  if (!imageSource) return null;
  
  try {
    const resolvedSource = Image.resolveAssetSource(imageSource);
    return resolvedSource?.uri || null;
  } catch (error) {
    console.warn('Failed to resolve attraction image:', attractionName, error);
    return null;
  }
}

/**
 * 관광지 객체에 이미지를 보강하는 함수
 */
export function enrichAttractionWithImage<T extends { title: string; firstimage?: string }>(
  attraction: T
): T & { imageUrl?: string } {
  // 이미 firstimage가 있으면 그것을 사용
  if (attraction.firstimage) {
    return { 
      ...attraction, 
      imageUrl: attraction.firstimage 
    };
  }
  
  // 로컬 이미지 찾기
  const localImageUri = getAttractionImageUri(attraction.title);
  if (localImageUri) {
    return { 
      ...attraction, 
      imageUrl: localImageUri,
      firstimage: localImageUri // 기존 필드도 업데이트
    };
  }
  
  return attraction;
}

/**
 * 관광지 배열에 이미지를 보강하는 함수
 */
export function enrichAttractionsWithImages<T extends { title: string; firstimage?: string }>(
  attractions: T[]
): Array<T & { imageUrl?: string }> {
  return attractions.map(attraction => enrichAttractionWithImage(attraction));
}

export default {
  getAttractionImageByName,
  getAttractionImageUri,
  enrichAttractionWithImage,
  enrichAttractionsWithImages,
  ATTRACTION_IMAGE_MAP,
  KEYWORD_TO_IMAGE,
};