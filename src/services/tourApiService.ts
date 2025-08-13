import { LocationObjectCoords } from 'expo-location';

export interface TourAttraction {
  contentid: string;
  title: string;
  addr1: string;
  addr2?: string;
  mapx: string; // longitude
  mapy: string; // latitude
  firstimage?: string;
  firstimage2?: string;
  readcount: string;
  tel?: string;
  dist?: string; // 거리 (미터)
  contentTypeId: string;
}

export interface TourApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: { item: TourAttraction[] };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface PhotoGalleryItem {
  galContentId: string;
  galContentTypeId: string;
  galTitle: string;
  galWebImageUrl: string;
  galCreatedtime: string;
  galModifiedtime: string;
  galPhotographyMonth: string;
  galPhotographyLocation: string;
  galPhotographer: string;
}

export interface PhotoGalleryApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: { item: PhotoGalleryItem[] };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export class TourApiService {
  private static API_KEY = decodeURIComponent(process.env.EXPO_PUBLIC_TOUR_API_KEY || '');
  private static BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';
  private static debug = typeof __DEV__ !== 'undefined' ? __DEV__ : true;
  // 허브 API의 마지막 성공 월 캐시 (지역/시군구별)
  private static hubLastGoodYm: Record<string, string> = {};
  private static HUB_BASE_YM_DEFAULT = '202503';

  // 주요 권역 및 중심 시군구 코드 매핑 (PSB 참고 로직 기반)
  private static REGION_CODE_MAP: Record<string, { areaCode: number; signguCode: number; lat: number; lng: number }> = {
    '서울': { areaCode: 11, signguCode: 11530, lat: 37.5665, lng: 126.9780 },
    '부산': { areaCode: 26, signguCode: 26110, lat: 35.1796, lng: 129.0756 },
    '대구': { areaCode: 27, signguCode: 27110, lat: 35.8714, lng: 128.6014 },
    '인천': { areaCode: 28, signguCode: 28110, lat: 37.4563, lng: 126.7052 },
    '광주': { areaCode: 29, signguCode: 29110, lat: 35.1595, lng: 126.8526 },
    '대전': { areaCode: 30, signguCode: 30110, lat: 36.3504, lng: 127.3845 },
    '울산': { areaCode: 31, signguCode: 31110, lat: 35.5384, lng: 129.3114 },
    '세종': { areaCode: 36, signguCode: 36110, lat: 36.4800, lng: 127.2890 },
    '경기': { areaCode: 41, signguCode: 41110, lat: 37.4138, lng: 127.5183 },
    '강원': { areaCode: 42, signguCode: 42110, lat: 37.8228, lng: 128.1555 },
    '충북': { areaCode: 43, signguCode: 43110, lat: 36.8000, lng: 127.7000 },
    '충남': { areaCode: 44, signguCode: 44110, lat: 36.5184, lng: 126.8000 },
    '전북': { areaCode: 45, signguCode: 45110, lat: 35.7175, lng: 127.1530 },
    '전남': { areaCode: 46, signguCode: 46110, lat: 34.8679, lng: 126.9910 },
    '경북': { areaCode: 47, signguCode: 47110, lat: 36.4919, lng: 128.8889 },
    '경남': { areaCode: 48, signguCode: 48110, lat: 35.4606, lng: 128.2132 },
    '제주': { areaCode: 50, signguCode: 50110, lat: 33.4996, lng: 126.5312 },
    // 경북 주요 도시 보강
    '경주': { areaCode: 47, signguCode: 47111, lat: 35.8562, lng: 129.2247 },
    '안동': { areaCode: 47, signguCode: 47170, lat: 36.5684, lng: 128.7295 },
    '포항': { areaCode: 47, signguCode: 47111, lat: 36.0320, lng: 129.3650 },
    '구미': { areaCode: 47, signguCode: 47190, lat: 36.1195, lng: 128.3445 },
    '영주': { areaCode: 47, signguCode: 47210, lat: 36.8056, lng: 128.6241 },
    '김천': { areaCode: 47, signguCode: 47150, lat: 36.1398, lng: 128.1136 },
  };

  private static getEncodedServiceKey(): string {
    const raw = (process.env.EXPO_PUBLIC_TOUR_API_KEY || '').trim();
    const looksEncoded = /%[0-9a-fA-F]{2}/.test(raw);
    return looksEncoded ? raw : encodeURIComponent(raw);
  }

  // LocgoHubTarService1 원시 응답 형태
  private static mapHubItemToAttraction(hubItem: any): TourAttraction {
    return {
      contentid: hubItem.hubTatsCd || `${hubItem.areaCd}-${hubItem.signguCd}-${hubItem.hubTatsNm}`,
      title: hubItem.hubTatsNm,
      addr1: `${hubItem.areaNm || ''} ${hubItem.signguNm || ''}`.trim(),
      mapx: String(hubItem.mapX || ''),
      mapy: String(hubItem.mapY || ''),
      firstimage: undefined,
      firstimage2: undefined,
      readcount: '0',
      tel: undefined,
      dist: undefined,
      contentTypeId: '12',
    };
  }

  /**
   * 지역 코드 기반 관광지(허브) 조회 - LocgoHubTarService1/areaBasedList1
   * 참고: [LocgoHubTarService1 areaBasedList1](https://apis.data.go.kr/B551011/LocgoHubTarService1/areaBasedList1)
   */
  static async getHubAttractionsByArea(
    areaCd: number,
    signguCd?: number,
    baseYm?: string,
    numOfRows: number = 10
  ): Promise<TourAttraction[]> {
    const SERVICE_URL = 'https://apis.data.go.kr/B551011/LocgoHubTarService1/areaBasedList1';
    try {
      if (!this.API_KEY) {
        console.error('❌ TourAPI 키가 설정되지 않았습니다');
        return [];
      }

      // 기본 YYYYMM (없으면 현재월)
      const now = new Date();
      const ym = baseYm || `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      const params = new URLSearchParams({
        pageNo: '1',
        numOfRows: String(numOfRows),
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        baseYm: ym,
        areaCd: String(areaCd),
        _type: 'json',
      });
      if (signguCd) params.set('signguCd', String(signguCd));

      const serviceKey = this.getEncodedServiceKey();
      const url = `${SERVICE_URL}?serviceKey=${serviceKey}&${params.toString()}`;
      // 인증키 적용 방식 문제 회피: 쿼리스트링에 serviceKey가 붙어야 하며, _type=json 포함
      if (!/serviceKey=/.test(url) || !/_type=json/.test(url)) {
        console.error('❌ Hub 요청 URL 구성 오류');
        return [];
      }
      this.log('🌍 Hub 지역기반 요청:', url.replace(serviceKey, '***masked***'));

      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        console.error('❌ Hub 지역기반 HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ Hub XML 에러 응답 감지.');
        const msgMatch = responseText.match(/<errMsg>(.*?)<\/errMsg>/i);
        if (msgMatch) console.error('❌ Hub 지역기반 오류:', msgMatch[1]);
        return [];
      }

      const data = JSON.parse(responseText);
      if (data.response?.header?.resultCode === '0000') {
        const items = data.response.body?.items?.item || [];
        const mapped: TourAttraction[] = items.map((it: any) => this.mapHubItemToAttraction(it));
        this.log(`✅ Hub 관광지 ${mapped.length}개`);
        return mapped;
      }

      // 헤더가 없거나 코드가 없으면, 비정상 JSON이거나 JSON 구조가 다름 → 전체 응답 일부를 기록하고 KorService1로 폴백
      const resultMsg = data.response?.header?.resultMsg;
      const resultCode = data.response?.header?.resultCode;
      this.log('⚠️ Hub 비정상 응답:', (responseText || '').slice(0, 400));
      console.error('❌ Hub 지역기반 오류:', resultMsg || 'Unknown error', resultCode ? `(code: ${resultCode})` : '');

      // 폴백: KorService1/areaBasedList1 (표준 관광지 API)
      try {
        const korFallback = await this.getAttractionsByArea(areaCd, signguCd);
        if (Array.isArray(korFallback) && korFallback.length > 0) {
          this.log(`✅ KorService1 폴백 성공: ${korFallback.length}개`);
          return korFallback as unknown as TourAttraction[];
        }
      } catch (e) {
        this.log('⚠️ KorService1 폴백 실패:', e);
      }
      return [];
    } catch (error) {
      console.error('❌ Hub 지역기반 네트워크 오류:', error);
      return [];
    }
  }

  /**
   * 기초지자체 중심 관광지 정보(Strict) - 사용자가 제공한 스펙만 따른 최소 호출
   * - baseYm 미지정 시 현재 YYYYMM 사용
   * - MobileOS=ETC, MobileApp=templebuk, _type=json 고정
   * - 결과 매핑 이외의 보강/폴백 없음
   */
  static async getHubAttractionsStrict(
    areaCd: number,
    signguCd?: number,
    baseYm?: string,
    numOfRows: number = 20,
    pageNo: number = 1,
  ): Promise<TourAttraction[]> {
    const SERVICE_URL = 'https://apis.data.go.kr/B551011/LocgoHubTarService1/areaBasedList1';
    try {
      if (!this.API_KEY) return [];
      const now = new Date();
      const ym = baseYm || `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      const params = new URLSearchParams({
        pageNo: String(pageNo),
        numOfRows: String(numOfRows),
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        baseYm: ym,
        areaCd: String(areaCd),
        _type: 'json',
      });
      if (signguCd) params.set('signguCd', String(signguCd));
      const serviceKey = this.getEncodedServiceKey();
      const url = `${SERVICE_URL}?serviceKey=${serviceKey}&${params.toString()}`;
      this.log('🌍 Hub STRICT 요청:', url.replace(serviceKey, '***masked***'));

      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        console.error('❌ Hub STRICT HTTP 오류:', response.status, response.statusText);
        return [];
      }
      const text = await response.text();
      if (this.isXml(text)) {
        this.log('⚠️ Hub STRICT XML 응답 감지. JSON 아님.', text.slice(0, 300));
        return [];
      }
      const data = JSON.parse(text);
      const items = data?.response?.body?.items?.item || [];
      this.log(`✅ Hub STRICT 결과 ${items.length}개 (areaCd=${areaCd}${signguCd ? `, signguCd=${signguCd}` : ''}, baseYm=${baseYm || 'auto-current'})`);
      return items.map((it: any) => this.mapHubItemToAttraction(it));
    } catch (e) {
      console.error('❌ Hub STRICT 예외:', e);
      return [];
    }
  }

  /** KorService1/areaCode2를 사용해 시군구 코드 조회 */
  static async getSigunguCodeByName(areaCd: number, name?: string): Promise<number | undefined> {
    try {
      if (!name) return undefined;
      const params = new URLSearchParams({
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        areaCode: String(areaCd),
        _type: 'json'
      });
      const url = this.buildUrl('areaCode2', params);
      this.log('🌍 areaCode2 요청:', url.replace(this.getEncodedServiceKey(), '***masked***'));
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) return undefined;
      const text = await resp.text();
      if (this.isXml(text)) return undefined;
      const data = JSON.parse(text);
      const items = data?.response?.body?.items?.item || [];
      const target = items.find((it: any) => {
        const n: string = (it.name || '').toString();
        // 부분일치: '강남', '강남구' 등
        return n.includes(name) || name.includes(n) || n.replace(/구|군|시/g, '') === name.replace(/구|군|시/g, '');
      });
      return target ? Number(target.code) : undefined;
    } catch {
      return undefined;
    }
  }

  /** KorService1/areaCode2 리스트 반환 */
  static async getSigunguList(areaCd: number): Promise<{ code: number; name: string }[]> {
    try {
      const params = new URLSearchParams({
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        areaCode: String(areaCd),
        _type: 'json'
      });
      const url = this.buildUrl('areaCode2', params);
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) return [];
      const text = await resp.text();
      if (this.isXml(text)) return [];
      const data = JSON.parse(text);
      const items = data?.response?.body?.items?.item || [];
      return items.map((it: any) => ({ code: Number(it.code), name: String(it.name) }));
    } catch {
      return [];
    }
  }

  // 좌표 간 거리(km)
  private static calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // 현재 좌표에서 가까운 권역을 거리순으로 정렬(PSB 패턴)
  private static findNearestRegions(lat: number, lng: number, exclude: string[] = []): Array<{ key: string; areaCd: number; signguCd: number; distance: number }>{
    const list = Object.entries(this.REGION_CODE_MAP)
      .filter(([k]) => !exclude.includes(k))
      .map(([k, v]) => ({ key: k, areaCd: v.areaCode, signguCd: v.signguCode, distance: this.calcDistance(lat, lng, v.lat, v.lng) }))
      .sort((a,b) => a.distance - b.distance);
    return list;
  }

  // 특정 지역에서 Hub STRICT 조회 (PSB 패턴, 고정 baseYm 우선)
  private static async searchHubInRegionStrict(areaCd: number, signguCd: number, baseYm?: string, numOfRows: number = 20) {
    const ym = baseYm || this.HUB_BASE_YM_DEFAULT;
    return this.getHubAttractionsStrict(areaCd, signguCd, ym, numOfRows, 1);
  }

  /**
   * 좌표 기준 PSB식 Hub 검색
   * 1) 기본 baseYm(202503)으로 가장 가까운 권역부터 시도
   * 2) 0건이면 다음 가까운 권역(최대 3곳) 시도
   * 3) 모두 0이면 최근 3개월 롤백으로 재시도(가까운 권역부터)
   */
  static async searchHubNearbyByCoordsStrict(lat: number, lng: number, maxRegions: number = 3, numOfRows: number = 20): Promise<TourAttraction[]> {
    const nearest = this.findNearestRegions(lat, lng);
    // 1차: 고정 baseYm으로 인접 권역 시도
    for (const r of nearest.slice(0, maxRegions)) {
      try {
        this.log(`🔎 Hub STRICT 1차 시도: ${r.key} areaCd=${r.areaCd} signguCd=${r.signguCd}`);
        const res = await this.searchHubInRegionStrict(r.areaCd, r.signguCd, this.HUB_BASE_YM_DEFAULT, numOfRows);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {}
    }

    // 2차: 최근 3개월 롤백
    for (const r of nearest.slice(0, maxRegions)) {
      try {
        this.log(`🔁 Hub STRICT 2차(월 롤백) 시도: ${r.key}`);
        const res = await this.getHubAttractionsStrictWithMonthFallback(r.areaCd, r.signguCd, 3, numOfRows);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {}
    }
    return [];
  }

  /** STRICT + 월 롤백 */
  static async getHubAttractionsStrictWithMonthFallback(
    areaCd: number,
    signguCd?: number,
    monthsBack: number = 12,
    numOfRows: number = 20
  ): Promise<TourAttraction[]> {
    const now = new Date();
    for (let i = 0; i <= monthsBack; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      const res = await this.getHubAttractionsStrict(areaCd, signguCd, ym, numOfRows, 1);
      if (Array.isArray(res) && res.length > 0) {
        this.log(`✅ Hub STRICT 월 롤백 성공 baseYm=${ym} (count=${res.length})`);
        return res;
      }
    }
    return [];
  }

  /**
   * 허브 지역기반 조회(최근 n개월 롤백 시도)
   */
  static async getHubAttractionsByAreaWithFallback(
    areaCd: number,
    signguCd?: number,
    monthsBack: number = 6,
    numOfRows: number = 10
  ): Promise<TourAttraction[]> {
    const ymList: string[] = [];
    const now = new Date();
    for (let i = 0; i <= monthsBack; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      ymList.push(ym);
    }

    for (const ym of ymList) {
      try {
        const res = await this.getHubAttractionsByArea(areaCd, signguCd, ym, numOfRows);
        if (Array.isArray(res) && res.length > 0) {
          this.log(`✅ Hub 결과 획득(baseYm=${ym}): ${res.length}개`);
          return res;
        }
      } catch (e) {
        this.log(`⚠️ Hub 조회 실패(baseYm=${ym}):`, e);
      }
    }
    return [];
  }

  /**
   * 허브 API 자동 월 탐색 + 캐시
   * 1) 이전에 성공한 baseYm이 있으면 우선 사용
   * 2) 없거나 결과가 비면 최근 maxMonths개월을 순차 탐색해 첫 유효 월을 사용
   */
  static async getHubAttractionsAuto(
    areaCd: number,
    signguCd?: number,
    maxMonths: number = 12,
    numOfRows: number = 20
  ): Promise<TourAttraction[]> {
    const cacheKey = `${areaCd}-${signguCd || 'NA'}`;
    const tryYm = async (ym: string) => {
      const res = await this.getHubAttractionsByArea(areaCd, signguCd, ym, numOfRows);
      if (Array.isArray(res) && res.length > 0) {
        this.hubLastGoodYm[cacheKey] = ym;
        this.log(`✅ Hub auto: ${cacheKey} baseYm=${ym} 성공(${res.length}개)`);
        return res;
      }
      return [] as TourAttraction[];
    };

    // 1) 캐시된 baseYm 우선 시도
    const cachedYm = this.hubLastGoodYm[cacheKey];
    if (cachedYm) {
      try {
        const res = await tryYm(cachedYm);
        if (res.length > 0) return res;
      } catch {}
    }

    // 2) 최근 maxMonths개월 역순 탐색
    const now = new Date();
    for (let i = 0; i <= maxMonths; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      try {
        const res = await tryYm(ym);
        if (res.length > 0) return res;
      } catch (e) {
        this.log(`⚠️ Hub auto 실패(baseYm=${ym}):`, e);
      }
    }
    return [];
  }
  private static buildUrl(path: string, params: URLSearchParams): string {
    const serviceKey = this.getEncodedServiceKey();
    const other = params.toString();
    return `${this.BASE_URL}/${path}?serviceKey=${serviceKey}${other ? `&${other}` : ''}`;
  }

  private static isXml(text: string): boolean {
    const t = text.trim();
    return t.startsWith('<') && t.includes('<?xml') || /<OpenAPI_ServiceResponse/i.test(t);
  }

  private static log(...args: any[]) {
    if (this.debug) console.log(...args);
  }

  // 지역 코드 기반 관광지 조회 (KorService1/areaBasedList1)
  static async getAttractionsByArea(areaCd: number, sigunguCd?: number): Promise<TourAttraction[]> {
    try {
      if (!this.API_KEY) {
        console.error('❌ TourAPI 키가 설정되지 않았습니다');
        return [];
      }

      const params = new URLSearchParams({
        numOfRows: '20',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        listYN: 'Y',
        arrange: 'B', // 조회순
        contentTypeId: '12', // 관광지
        areaCode: areaCd.toString(),
        _type: 'json',
      });
      if (sigunguCd) params.set('sigunguCode', sigunguCd.toString());

      const url = this.buildUrl('areaBasedList1', params);
      this.log('🌍 TourAPI 지역기반 관광지 요청:', url.replace(this.getEncodedServiceKey(), '***masked***'));

      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!response.ok) {
        console.error('❌ 지역기반 API HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ 지역기반 XML 에러 응답 감지. 안전 종료.');
        const msgMatch = responseText.match(/<errMsg>(.*?)<\/errMsg>/i);
        if (msgMatch) console.error('❌ 지역기반 API 오류:', msgMatch[1]);
        return [];
      }

      const data = JSON.parse(responseText);

      if (data.response?.header?.resultCode === '0000') {
        const items = data.response.body?.items?.item || [];
        this.log(`✅ 지역기반 관광지 ${items.length}개 발견`);
        return items;
      }

      const resultMsg = data.response?.header?.resultMsg;
      const resultCode = data.response?.header?.resultCode;
      console.error('❌ 지역기반 API 오류:', resultMsg || 'Unknown error', resultCode ? `(code: ${resultCode})` : '');
      return [];
    } catch (error) {
      console.error('❌ 지역기반 API 네트워크 오류:', error);
      return [];
    }
  }

  // [RENAMED] GPS 기반 관광지 조회 (현재는 사용되지 않음)
  static async getNearbyAttractionsByGPS(
    lat: number, 
    lng: number, 
    radius: number = 10000, // 10km 반경
    contentTypeId: string = '12'
  ): Promise<TourAttraction[]> {
    try {
      if (!this.API_KEY) {
        console.error('❌ TourAPI 키가 설정되지 않았습니다');
        return [];
      }

      const params = new URLSearchParams({
        numOfRows: '10',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        arrange: 'E',
        mapX: lng.toString(),
        mapY: lat.toString(),
        radius: Math.min(radius, 20000).toString(),
        contentTypeId,
        listYN: 'Y',
        _type: 'json'
      });

      const url = this.buildUrl('locationBasedList1', params);
      this.log('🌍 TourAPI GPS기반 요청:', url.replace(this.getEncodedServiceKey(), '***masked***'));
      
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      
      if (!response.ok) {
        console.error('❌ TourAPI GPS기반 HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        const msgMatch = responseText.match(/<errMsg>(.*?)<\/errMsg>/i);
        console.error('❌ TourAPI GPS기반 오류:', msgMatch?.[1] || 'SERVICE ERROR');
        return [];
      }
      
      const data: TourApiResponse = JSON.parse(responseText);
      
      if (data.response?.header?.resultCode === '0000') {
        const itemsNode: any = data.response.body?.items;
        const attractions: any[] = Array.isArray(itemsNode?.item) ? itemsNode.item : [];
        return attractions;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ TourAPI GPS기반 네트워크 오류:', error);
      return [];
    }
  }

  // 사찰 전용 검색 (문화시설 카테고리)
  static async getNearbyTemples(lat: number, lng: number, radius: number = 20000) {
    return this.getNearbyAttractionsByGPS(lat, lng, radius, '14'); // 문화시설
  }

  // 관광지 상세 정보
  static async getAttractionDetail(contentId: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        contentId,
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        defaultYN: 'Y',
        firstImageYN: 'Y',
        areacodeYN: 'Y',
        catcodeYN: 'Y',
        addrinfoYN: 'Y',
        mapinfoYN: 'Y',
        overviewYN: 'Y',
        _type: 'json'
      });

      const url = this.buildUrl('detailCommon1', params);
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      
      if (!response.ok) {
        console.error('❌ TourAPI 상세정보 HTTP 오류:', response.status, response.statusText);
        return null;
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ 상세정보 XML 에러 응답 감지. 안전 종료.');
        return null;
      }
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ TourAPI 상세정보 JSON 파싱 오류:', parseError);
        return null;
      }
      
      if (data.response?.header?.resultCode === '0000') {
        const itemsNode: any = data.response.body?.items;
        const itemsArr: any[] = Array.isArray(itemsNode?.item)
          ? itemsNode.item
          : [];
        return itemsArr[0] || null;
      }
      return null;
    } catch (error) {
      console.error('상세 정보 조회 오류:', error);
      return null;
    }
  }

  // 관광지 이미지 목록
  static async getAttractionImages(contentId: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        contentId,
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        imageYN: 'Y',
        subImageYN: 'Y',
        numOfRows: '10',
        _type: 'json'
      });

      const url = this.buildUrl('detailImage1', params);
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      
      if (!response.ok) {
        console.error('❌ TourAPI 이미지 HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ 이미지 XML 에러 응답 감지. 안전 종료.');
        return [];
      }
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ TourAPI 이미지 JSON 파싱 오류:', parseError);
        return [];
      }
      
      if (data.response?.header?.resultCode === '0000') {
        const itemsNode: any = data.response.body?.items;
        const imagesArr: any[] = Array.isArray(itemsNode?.item)
          ? itemsNode.item
          : [];
        return imagesArr.map((img: any) => img.originimgurl).filter(Boolean);
      }
      return [];
    } catch (error) {
      console.error('이미지 조회 오류:', error);
      return [];
    }
  }

  // 키워드 검색 (사찰명, 관광지명 검색)
  static async searchAttractions(keyword: string, lat?: number, lng?: number): Promise<TourAttraction[]> {
    try {
      const params = new URLSearchParams({
        numOfRows: '20',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        keyword,
        listYN: 'Y',
        arrange: 'A', // 제목순
        _type: 'json'
      });

      // 위치 정보가 있으면 거리순 정렬
      if (lat && lng) {
        params.set('arrange', 'E');
        params.set('mapX', lng.toString());
        params.set('mapY', lat.toString());
        params.set('radius', '50000'); // 50km
      }

      const url = this.buildUrl('searchKeyword1', params);
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      
      if (!response.ok) {
        console.error('❌ TourAPI 검색 HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ 검색 XML 에러 응답 감지. 안전 종료.');
        return [];
      }
      let data: TourApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ TourAPI 검색 JSON 파싱 오류:', parseError);
        console.error('검색 응답 내용:', responseText.substring(0, 500));
        return [];
      }
      
      if (data.response?.header?.resultCode === '0000') {
        const itemsNode: any = data.response.body?.items;
        const attractions: any[] = Array.isArray(itemsNode?.item)
          ? itemsNode.item
          : [];
        return attractions;
      }
      return [];
    } catch (error) {
      console.error('검색 오류:', error);
      return [];
    }
  }

  // 관광사진갤러리 목록 조회
  static async getGalleryPhotos(pageNo: number = 1, numOfRows: number = 10): Promise<PhotoGalleryItem[]> {
    const GALLERY_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
    try {
      if (!this.API_KEY) {
        console.error('❌ TourAPI 키가 설정되지 않았습니다');
        return [];
      }

      const params = new URLSearchParams({
        numOfRows: numOfRows.toString(),
        pageNo: pageNo.toString(),
        MobileOS: 'ETC',
        MobileApp: 'templebuk', // Using the app name user provided
        arrange: 'A', // A=촬영일, B=제목, C=수정일
        _type: 'json'
      });

      const serviceKey = this.getEncodedServiceKey();
      const url = `${GALLERY_BASE_URL}/galleryList1?serviceKey=${serviceKey}&${params.toString()}`;
      
      this.log('📸 TourAPI 사진갤러리 요청:', url.replace(serviceKey, '***masked***'));

      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!response.ok) {
        console.error('❌ 사진갤러리 API HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ 사진갤러리 XML 에러 응답 감지. 안전 종료.');
        const msgMatch = responseText.match(/<errMsg>(.*?)<\/errMsg>/i);
        if (msgMatch) console.error('❌ 사진갤러리 API 오류:', msgMatch[1]);
        return [];
      }

      let data: PhotoGalleryApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ 사진갤러리 JSON 파싱 오류:', parseError);
        return [];
      }

      if (data.response?.header?.resultCode === '0000') {
        const items = data.response.body?.items?.item || [];
        this.log(`✅ 사진 ${items.length}개 발견`);
        return items;
      } else {
        console.error('❌ 사진갤러리 API 오류:', data.response?.header?.resultMsg || 'Unknown error');
        return [];
      }
    } catch (error) {
      console.error('❌ 사진갤러리 API 네트워크 오류:', error);
      return [];
    }
  }

  // 관광사진갤러리 키워드 검색 (주변 관광지 사진 등 키워드 기반)
  static async searchGalleryPhotos(keyword: string, pageNo: number = 1, numOfRows: number = 10): Promise<PhotoGalleryItem[]> {
    const GALLERY_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
    try {
      if (!this.API_KEY) {
        console.error('❌ TourAPI 키가 설정되지 않았습니다');
        return [];
      }

      const params = new URLSearchParams({
        numOfRows: numOfRows.toString(),
        pageNo: pageNo.toString(),
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        keyword,
        _type: 'json'
      });

      const serviceKey = this.getEncodedServiceKey();
      const url = `${GALLERY_BASE_URL}/gallerySearchList1?serviceKey=${serviceKey}&${params.toString()}`;

      this.log('📸 TourAPI 사진갤러리 검색 요청:', url.replace(serviceKey, '***masked***'));

      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        console.error('❌ 사진갤러리 검색 HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      if (this.isXml(responseText)) {
        this.log('⚠️ 사진갤러리 검색 XML 에러 응답 감지. 안전 종료.');
        const msgMatch = responseText.match(/<errMsg>(.*?)<\/errMsg>/i);
        if (msgMatch) console.error('❌ 사진갤러리 검색 오류:', msgMatch[1]);
        return [];
      }

      let data: PhotoGalleryApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ 사진갤러리 검색 JSON 파싱 오류:', parseError);
        return [];
      }

      if (data.response?.header?.resultCode === '0000') {
        const items = data.response.body?.items?.item || [];
        this.log(`✅ 사진 검색 결과 ${items.length}개`);
        return items;
      }

      console.error('❌ 사진갤러리 검색 API 오류:', data.response?.header?.resultMsg || 'Unknown error');
      return [];
    } catch (error) {
      console.error('❌ 사진갤러리 검색 네트워크 오류:', error);
      return [];
    }
  }

  /**
   * 관광사진갤러리 상세 리스트(제목 기반) - PhotoGalleryService1/galleryDetailList1
   * 참고: [galleryDetailList1](https://apis.data.go.kr/B551011/PhotoGalleryService1/galleryDetailList1)
   */
  static async getGalleryDetailByTitle(title: string, pageNo: number = 1, numOfRows: number = 10): Promise<PhotoGalleryItem[]> {
    const GALLERY_BASE_URL = 'https://apis.data.go.kr/B551011/PhotoGalleryService1';
    try {
      if (!this.API_KEY) {
        console.error('❌ TourAPI 키가 설정되지 않았습니다');
        return [];
      }

      const params = new URLSearchParams({
        numOfRows: String(numOfRows),
        pageNo: String(pageNo),
        MobileOS: 'ETC',
        MobileApp: 'templebuk',
        title,
        _type: 'json',
      });

      const serviceKey = this.getEncodedServiceKey();
      const url = `${GALLERY_BASE_URL}/galleryDetailList1?serviceKey=${serviceKey}&${params.toString()}`;
      this.log('📸 사진갤러리 상세 요청:', url.replace(serviceKey, '***masked***'));

      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        console.error('❌ 사진갤러리 상세 HTTP 오류:', response.status, response.statusText);
        return [];
      }

      const responseText = await response.text();
      // 일부 상황에서 TourAPI가 XML을 반환하므로 JSON 강제 요청 파라미터 보정
      if (this.isXml(responseText)) {
        this.log('⚠️ 사진갤러리 상세 XML 에러 응답 감지. 안전 종료.');
        return [];
      }

      let data: PhotoGalleryApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ 사진갤러리 상세 JSON 파싱 오류:', e);
        return [];
      }

      if (data.response?.header?.resultCode === '0000') {
        const items = data.response.body?.items?.item || [];
        return items as unknown as PhotoGalleryItem[];
      }
      console.error('❌ 사진갤러리 상세 API 오류:', data.response?.header?.resultMsg || 'Unknown error');
      return [];
    } catch (error) {
      console.error('❌ 사진갤러리 상세 네트워크 오류:', error);
      return [];
    }
  }
}

// 거리 계산 헬퍼 함수 (기존 로직 재사용)
export const calculateDistanceFromApi = (lat1: number, lon1: number, lat2: string, lon2: string): number => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (parseFloat(lat2) - lat1) * (Math.PI / 180);
  const dLon = (parseFloat(lon2) - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(parseFloat(lat2) * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km 단위
};

// 포맷된 거리 표시
export const formatApiDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${Math.round(distanceKm * 10) / 10}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};
