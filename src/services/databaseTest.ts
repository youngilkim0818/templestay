import { supabase } from '../lib/supabase';
import { TEMPLES_DATA } from '../data/temple-data';

export class DatabaseTest {
  // 데이터베이스 연결 테스트
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('temples')
        .select('count')
        .limit(1);
      
      if (error) {
        if (__DEV__) {
          console.log('❌ 데이터베이스 연결 실패:', error.message);
        }
        return false;
      }
      
      if (__DEV__) {
        console.log('✅ 데이터베이스 연결 성공');
      }
      return true;
    } catch (error) {
      if (__DEV__) {
        console.log('❌ 데이터베이스 연결 에러:', error);
      }
      return false;
    }
  }

  // 사찰 데이터 존재 여부 확인
  static async checkTemplesData() {
    try {
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .limit(10);
      
      if (error) {
        if (__DEV__) {
          console.log('❌ 사찰 데이터 조회 실패:', error.message);
        }
        return { exists: false, count: 0, data: null };
      }
      
      if (__DEV__) {
        console.log(`✅ 사찰 데이터 확인 - 총 ${data?.length || 0}개`);
      }
      return { exists: true, count: data?.length || 0, data };
    } catch (error) {
      if (__DEV__) {
        console.log('❌ 사찰 데이터 조회 에러:', error);
      }
      return { exists: false, count: 0, data: null };
    }
  }

  // 로컬 데이터를 데이터베이스에 삽입
  static async insertLocalData() {
    try {
      if (__DEV__) {
        console.log('📥 로컬 사찰 데이터를 데이터베이스에 삽입 중...');
      }
      
      for (const temple of TEMPLES_DATA) {
        const { data, error } = await supabase
          .from('temples')
          .upsert({
            id: temple.id,
            name: temple.name,
            region: temple.region,
            address: temple.address,
            latitude: 35.7749 + Math.random() * 0.5, // 경북 지역 임시 좌표
            longitude: 128.8086 + Math.random() * 0.5,
            image_url: temple.imageUrl,
            base_price: temple.basePrice || 50000,
            description: temple.description,
            precautions: temple.precautions,
            available_times: temple.availableTimes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          if (__DEV__) {
            console.log(`❌ ${temple.name} 삽입 실패:`, error.message);
          }
        } else {
          if (__DEV__) {
            console.log(`✅ ${temple.name} 삽입 성공`);
          }
        }

        // 템플스테이 프로그램도 삽입
        if (temple.programs) {
          for (const program of temple.programs) {
            const { error: programError } = await supabase
              .from('temple_programs')
              .upsert({
                temple_id: temple.id,
                title: program.title,
                description: program.description,
                price: program.price,
                available_times: program.availableTimes,
                type: program.type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (programError) {
              if (__DEV__) {
                console.log(`❌ ${program.title} 프로그램 삽입 실패:`, programError.message);
              }
            }
          }
        }
      }
      
      if (__DEV__) {
        console.log('✅ 로컬 데이터 삽입 완료');
      }
      return true;
    } catch (error) {
      if (__DEV__) {
        console.log('❌ 로컬 데이터 삽입 에러:', error);
      }
      return false;
    }
  }

  // 전체 테스트 실행
  static async runAllTests() {
    if (__DEV__) {
      console.log('🔍 데이터베이스 테스트 시작...');
    }
    
    // 1. 연결 테스트
    const connected = await this.testConnection();
    if (!connected) {
      return { success: false, message: '데이터베이스 연결 실패' };
    }

    // 2. 데이터 존재 여부 확인
    const { exists, count } = await this.checkTemplesData();
    
    if (!exists || count === 0) {
      if (__DEV__) {
        console.log('📋 사찰 데이터가 없습니다. 로컬 데이터를 삽입합니다...');
      }
      const inserted = await this.insertLocalData();
      
      if (!inserted) {
        return { success: false, message: '데이터 삽입 실패' };
      }
      
      // 다시 확인
      const { count: newCount } = await this.checkTemplesData();
      return { 
        success: true, 
        message: `데이터베이스 설정 완료! ${newCount}개의 사찰 데이터가 준비되었습니다.` 
      };
    }

    return { 
      success: true, 
      message: `데이터베이스가 이미 준비되어 있습니다! ${count}개의 사찰 데이터가 있습니다.` 
    };
  }
} 