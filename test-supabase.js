// Supabase 연결 테스트 스크립트
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Key loaded' : 'Key not loaded');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 테스트 함수
async function testSupabaseConnection() {
  try {
    console.log('🔄 Supabase 연결 테스트 중...');
    const { data, error } = await supabase
      .from('temples')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 데이터베이스 연결 실패:', error.message);
      return;
    }

    console.log('✅ Supabase 연결 성공!');
    console.log('📊 조회된 데이터:', data);
  } catch (error) {
    console.error('❌ 연결 테스트 실패:', error);
  }
}

testSupabaseConnection();