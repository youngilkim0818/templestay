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
  'Bulguksa Temple': [
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  'Golgulsa Temple': [
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  'Jikjisa Temple': [
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
  ],
  'Gamsansa Temple': [
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  'Daeseungsa Temple': [
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
  ],
  'Bogyeongsa Temple': [
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
  ],
  'Seonbonsa Temple': [
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
  ],
  'Simwonsa Temple': [
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  // 기타 사찰들을 위한 일반 이미지
  'Haeinsa Temple': [
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
  ],
  'Tongdosa Temple': [
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564708074097-c5b8e93d3b64?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
  ],
  'Beomeosa Temple': [
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
  ],
};

// 사찰별 설명
const TEMPLE_DESCRIPTIONS: { [key: string]: string } = {
  'Bulguksa Temple': 'Bulguksa Temple, registered as a UNESCO World Heritage Site, is a treasure trove of Silla Buddhist art, preserving national treasures such as Dabotap and Seokgatap.',
  'Golgulsa Temple': 'Golgulsa Temple is a unique structure following the Indian cave temple style, famous for its thousand-year-old rock-carved Buddha statue and Seonmudo practice.',
  'Jikjisa Temple': 'Jikjisa Temple, located on the slopes of Hwangaksan Mountain, is a thousand-year-old temple that continues the deep practice tradition of the Jogye Order as a direct district headquarters.',
  'Gamsansa Temple': 'Gamsansa Temple is a peaceful mountain temple known for its serene meditation halls and beautiful natural surroundings, offering a perfect retreat for spiritual practice.',
  'Daeseungsa Temple': 'Daeseungsa Temple is a historic temple that has preserved the traditional Buddhist culture and architecture of Korea, providing visitors with an authentic temple experience.',
  'Bogyeongsa Temple': 'Bogyeongsa Temple is renowned for its scenic location and well-preserved Buddhist artifacts, making it a significant cultural and spiritual site in the region.',
  'Seonbonsa Temple': 'Seonbonsa Temple offers a tranquil environment for meditation and spiritual growth, surrounded by pristine natural beauty and ancient Buddhist traditions.',
  'Simwonsa Temple': 'Simwonsa Temple is a hidden gem known for its peaceful atmosphere and traditional temple architecture, providing a perfect setting for contemplation and inner peace.',
  'Haeinsa Temple': 'Haeinsa Temple, which enshrines the Tripitaka Koreana, is a sacred site of the Goryeo Tripitaka designated as a UNESCO World Documentary Heritage and the center of Korean Buddhist culture.',
  'Tongdosa Temple': 'Tongdosa Temple is a Buddhist treasure temple that enshrines the Buddha\'s true body relics, and has been a sacred site of Korean Buddhism for over 1,400 years since its founding by Silla Master Jajang.',
  'Beomeosa Temple': 'Beomeosa Temple, located on Geumjeongsan Mountain in Busan, is the leading temple of Yeongnam and a thousand-year-old temple that maintains the deep tranquility of the mountains while being close to the city center.',
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
      if (__DEV__) {
        console.log(`🖼️ 사찰 이미지 조회: ${templeName}`);
      }
      
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
        if (__DEV__) {
          console.log(`✅ ${templeName} 매핑 이미지 사용 (${mappedImages.length}개)`);
        }
        return templeImageData;
      }

      if (__DEV__) {
        console.log(`⚠️ ${templeName} 매핑 이미지 없음 → API 시도 후 기본 이미지 fallback`);;
      }

      // 2. 사진갤러리에서 상세 이미지 검색 (KorService1 사용 회피)
      if (__DEV__) {
        console.log(`🔍 ${templeName} 갤러리 상세 검색 시작...`);
      }
      let gallery = await TourApiService.getGalleryDetailByTitle(templeName, 1, 8);
      if (!gallery || gallery.length === 0) {
        if (__DEV__) {
          console.log(`⚠️ ${templeName} 갤러리 상세 결과 없음 → 키워드 검색 시도`);
        }
        gallery = await TourApiService.searchGalleryPhotos(templeName, 1, 8);
      }
      if (!gallery || gallery.length === 0) {
        if (__DEV__) {
          console.log(`❌ ${templeName} 갤러리 결과 없음`);
        }
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
      
      if (__DEV__) {
        console.log(`🖼️ ${templeName} TourAPI 이미지 ${images.length}개 수집 완료`);
      }
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
  public static getDefaultTempleData(templeName: string): TempleImageData {
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
      description: `${templeName} is a traditional Korean temple that preserves a thousand years of history and culture, making it a precious cultural heritage.`
    };
  }

  /**
   * 여러 사찰의 이미지를 배치로 조회
   */
  static async getMultipleTempleImages(templeNames: string[]): Promise<Map<string, TempleImageData>> {
    if (__DEV__) {
      console.log(`🖼️ ${templeNames.length}개 사찰 이미지 배치 조회 시작`);
    }
    
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
    
    if (__DEV__) {
      console.log(`✅ 사찰 이미지 배치 조회 완료: ${results.size}/${templeNames.length}`);
    }
    return results;
  }

  /**
   * 캐시 관리
   */
  static clearCache(): void {
    this.imageCache.clear();
    if (__DEV__) {
      console.log('🗑️ 사찰 이미지 캐시 초기화 완료');
    }
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
    facilities: temple.facilities || ['Parking Lot', 'Restroom', 'Convenience Store'],
    accessibility: temple.accessibility || {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransportAccessible: true,
    },
    operatingHours: temple.operatingHours || { 'Monday-Sunday': '09:00 - 18:00' },
    holidays: temple.holidays || ['January 1st'],
    basePrice: temple.price || temple.basePrice || 0,
    // programDetails 보존 (가격 정보 유지)
    programDetails: temple.programDetails || {},
    // 이미지 관련 필드 - 로컬 이미지 우선 사용, 없으면 API 이미지, 그것도 없으면 기본 이미지
    imageUrl: temple.imageUrl || imageData.mainImage || TempleImageService.getDefaultTempleData(temple.name).mainImage,
    images: temple.imageUrl ? [temple.imageUrl, ...imageData.images] : imageData.images,
    apiImages: imageData.images,
    apiDescription: imageData.description,
    hasApiImages: imageData.images.length > 1,
  };
};