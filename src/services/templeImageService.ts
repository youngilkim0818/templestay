import { TourApiService } from './tourApiService';

export interface TempleImageData {
  templeId: string;
  templeName: string;
  images: string[];
  mainImage?: string;
  description?: string;
}

// 한국 사찰별 고품질 이미지 매핑 (즉시 사용 가능)
const TEMPLE_IMAGES_MAP: { [key: string]: string[] } = {
  '불국사': [
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  '골굴사': [
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  '직지사': [
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
  ],
  '해인사': [
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  '통도사': [
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
  ],
  '범어사': [
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
  ],
};

// 사찰별 설명
const TEMPLE_DESCRIPTIONS: { [key: string]: string } = {
  '불국사': '유네스코 세계문화유산으로 등재된 불국사는 신라 불교예술의 보고이며, 다보탑과 석가탑 등 국보급 문화재를 간직하고 있습니다.',
  '골굴사': '인도의 석굴사원 양식을 따른 독특한 구조의 사찰로, 천년의 역사를 자랑하는 마애불상과 선무도 수행으로 유명합니다.',
  '직지사': '황악산 자락에 자리한 천년고찰로, 고요한 산사의 정취와 함께 깊은 수행의 전통을 이어가고 있는 조계종 직할교구 본사입니다.',
  '해인사': '팔만대장경을 봉안한 법보종찰로서, 유네스코 세계기록유산으로 지정된 고려대장경의 성지이자 한국 불교문화의 중심지입니다.',
  '통도사': '부처님의 진신사리를 봉안한 불보종찰로, 신라 자장율사가 창건한 이래 1400여 년의 역사를 이어온 한국불교의 성지입니다.',
  '범어사': '부산 금정산에 자리한 영남 제일의 대찰로, 도심과 가까우면서도 깊은 산중의 고요함을 간직한 천년 고찰입니다.',
};

export class TempleImageService {
  private static imageCache: Map<string, TempleImageData> = new Map();

  /**
   * 사찰명으로 이미지 및 정보 조회 (즉시 사용 + TourAPI 백업)
   */
  static async getTempleImages(templeName: string): Promise<TempleImageData> {
    // 캐시 확인
    const cached = this.imageCache.get(templeName);
    if (cached) {
      return cached;
    }

    try {
      console.log(`🖼️ 사찰 이미지 조회: ${templeName}`);
      
      // 1. 우선 매핑된 이미지 사용 (즉시 로딩)
      const mappedImages = TEMPLE_IMAGES_MAP[templeName];
      const mappedDescription = TEMPLE_DESCRIPTIONS[templeName];

      if (mappedImages && mappedImages.length > 0) {
        const templeImageData: TempleImageData = {
          templeId: `mapped_${templeName}`,
          templeName,
          images: mappedImages,
          mainImage: mappedImages[0],
          description: mappedDescription
        };

        // 캐시 저장
        this.imageCache.set(templeName, templeImageData);
        console.log(`✅ ${templeName} 매핑 이미지 사용 (${mappedImages.length}개)`);
        return templeImageData;
      }

      // 2. 사진갤러리에서 상세 이미지 검색 (KorService1 사용 회피)
      console.log(`🔍 ${templeName} 갤러리 상세 검색 시작...`);
      let gallery = await TourApiService.getGalleryDetailByTitle(templeName, 1, 8);
      if (!gallery || gallery.length === 0) {
        console.log(`⚠️ ${templeName} 갤러리 상세 결과 없음 → 키워드 검색 시도`);
        gallery = await TourApiService.searchGalleryPhotos(templeName, 1, 8);
      }
      if (!gallery || gallery.length === 0) {
        console.log(`❌ ${templeName} 갤러리 결과 없음`);
        return this.getDefaultTempleData(templeName);
      }

      // 이미지 URL 정제(http→https)
      const images = gallery
        .map((g: any) => (g.galWebImageUrl || '').replace(/^http:\/\//, 'https://'))
        .filter(Boolean);

      const templeImageData: TempleImageData = {
        templeId: gallery[0].galContentId || `gallery_${templeName}`,
        templeName,
        images: images.slice(0, 5),
        mainImage: images[0],
        description: mappedDescription
      };

      // 캐시 저장
      this.imageCache.set(templeName, templeImageData);
      
      console.log(`🖼️ ${templeName} TourAPI 이미지 ${images.length}개 수집 완료`);
      return templeImageData;

    } catch (error) {
      console.error(`❌ ${templeName} 이미지 조회 오류:`, error);
      return this.getDefaultTempleData(templeName);
    }
  }

  /**
   * 사찰명과 검색 결과의 가장 좋은 매칭 찾기
   */
  private static findBestTempleMatch(templeName: string, results: any[]): any | null {
    if (results.length === 0) return null;

    // 정확한 일치 우선
    let exactMatch = results.find(item => 
      item.title === templeName || 
      item.title.includes(templeName) || 
      templeName.includes(item.title.replace(/\s/g, ''))
    );

    if (exactMatch) return exactMatch;

    // 키워드 기반 스코어링
    let bestScore = 0;
    let bestMatch = null;

    for (const result of results) {
      let score = 0;
      const title = result.title.toLowerCase();
      const searchName = templeName.toLowerCase();

      // 사찰 키워드 포함 여부
      if (title.includes('사') || title.includes('암') || title.includes('절')) score += 3;
      
      // 이름 유사성
      if (title.includes(searchName) || searchName.includes(title)) score += 5;
      
      // 문화시설 카테고리 (사찰 가능성 높음)
      if (result.contentTypeId === '14') score += 2;

      // 첫 번째 이미지 존재 여부
      if (result.firstimage) score += 1;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = result;
      }
    }

    return bestScore > 2 ? bestMatch : null;
  }

  /**
   * 기본 사찰 데이터 (이미지를 찾을 수 없을 때)
   */
  private static getDefaultTempleData(templeName: string): TempleImageData {
    const defaultImages = [
      'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    ];

    return {
      templeId: `default_${templeName}`,
      templeName,
      images: defaultImages,
      mainImage: defaultImages[0],
      description: `${templeName}은(는) 한국의 전통 사찰로, 천년의 역사와 문화를 간직하고 있는 소중한 문화유산입니다.`
    };
  }

  /**
   * 여러 사찰의 이미지를 배치로 조회
   */
  static async getMultipleTempleImages(templeNames: string[]): Promise<Map<string, TempleImageData>> {
    console.log(`🖼️ ${templeNames.length}개 사찰 이미지 배치 조회 시작`);
    
    const results = new Map<string, TempleImageData>();
    
    // 병렬 처리로 성능 향상
    const promises = templeNames.map(async (name) => {
      try {
        const imageData = await this.getTempleImages(name);
        results.set(name, imageData);
      } catch (error) {
        console.error(`❌ ${name} 조회 실패:`, error);
        results.set(name, this.getDefaultTempleData(name));
      }
    });

    await Promise.allSettled(promises);
    
    console.log(`✅ 사찰 이미지 배치 조회 완료: ${results.size}/${templeNames.length}`);
    return results;
  }

  /**
   * 캐시 관리
   */
  static clearCache(): void {
    this.imageCache.clear();
    console.log('🗑️ 사찰 이미지 캐시 초기화 완료');
  }

  static getCacheSize(): number {
    return this.imageCache.size;
  }
}

/**
 * 사찰 데이터와 이미지를 결합하는 헬퍼 함수
 */
export const enrichTempleWithImages = async (temple: any): Promise<any> => {
  const imageData = await TempleImageService.getTempleImages(temple.name);
  
  return {
    ...temple,
    // 기본 Temple 인터페이스 호환성 보장
    availableTimes: temple.available_times || temple.availableTimes || [],
    programs: temple.programs || [],
    facilities: temple.facilities || ['주차장', '화장실', '매점'],
    accessibility: temple.accessibility || {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransportAccessible: true,
    },
    operatingHours: temple.operatingHours || { '월-일': '09:00 - 18:00' },
    holidays: temple.holidays || ['1월 1일'],
    basePrice: temple.price || temple.basePrice || 0,
    // 이미지 관련 필드
    imageUrl: imageData.mainImage || temple.imageUrl,
    images: imageData.images,
    apiImages: imageData.images,
    apiDescription: imageData.description,
    hasApiImages: imageData.mainImage !== temple.imageUrl && imageData.images.length > 1,
  };
};