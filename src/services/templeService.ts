import { supabase } from '../lib/supabase';
import { Temple } from '../types';

export class TempleService {
  // 모든 사찰 조회
  static async getAllTemples(): Promise<Temple[]> {
    const { data, error } = await supabase
      .from('temples')
      .select(`
        *,
        temple_programs (*)
      `);

    if (error) {
      console.error('Error fetching temples:', error);
      throw error;
    }

    return data as Temple[];
  }

  // 특정 사찰 조회
  static async getTempleById(id: string): Promise<Temple | null> {
    const { data, error } = await supabase
      .from('temples')
      .select(`
        *,
        temple_programs (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching temple:', error);
      throw error;
    }

    return data as Temple;
  }

  // 특정 사찰의 프로그램만 별도 조회
  static async getTemplePrograms(templeId: string) {
    const { data, error } = await supabase
      .from('temple_programs')
      .select('*')
      .eq('temple_id', templeId)
      .order('price', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // 지역별 사찰 검색
  static async getTemplesByRegion(region: string): Promise<Temple[]> {
    const { data, error } = await supabase
      .from('temples')
      .select(`
        *,
        temple_programs (*)
      `)
      .eq('region', region);

    if (error) {
      console.error('Error fetching temples by region:', error);
      throw error;
    }

    return data as Temple[];
  }

  // 위치 기반 사찰 검색
  static async getNearbyTemples(lat: number, lng: number, radius: number = 10): Promise<Temple[]> {
    // PostGIS 확장을 사용한 위치 기반 검색
    const { data, error } = await supabase
      .from('temples')
      .select(`
        *,
        temple_programs (*)
      `)
      .filter('location', 'dwithin', `POINT(${lng} ${lat}),${radius * 1000}`);

    if (error) {
      console.error('Error fetching nearby temples:', error);
      throw error;
    }

    return data as Temple[];
  }

  // 사찰 검색 (이름, 설명으로)
  static async searchTemples(query: string): Promise<Temple[]> {
    const { data, error } = await supabase
      .from('temples')
      .select(`
        *,
        temple_programs (*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      console.error('Error searching temples:', error);
      throw error;
    }

    return data as Temple[];
  }
}