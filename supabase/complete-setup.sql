-- 완전한 Supabase 설정 스크립트 (스키마 + 기존 데이터)

-- 1. 스키마 생성
-- 사용자 테이블 확장 (auth.users와 연결)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사찰 테이블
CREATE TABLE IF NOT EXISTS public.temples (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url TEXT,
    price INTEGER NOT NULL,
    description TEXT,
    precautions TEXT,
    available_times TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 템플스테이 프로그램 테이블
CREATE TABLE IF NOT EXISTS public.temple_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    temple_id TEXT REFERENCES public.temples(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    times TEXT[] DEFAULT '{}',
    type TEXT NOT NULL CHECK (type IN ('체험형', '휴식형')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예약 테이블
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    temple_id TEXT REFERENCES public.temples(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.temple_programs(id) ON DELETE SET NULL,
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    user_email TEXT NOT NULL,
    has_allergies BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_temples_region ON public.temples(region);
CREATE INDEX IF NOT EXISTS idx_temples_location ON public.temples(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_temple_id ON public.reservations(temple_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_temple_programs_temple_id ON public.temple_programs(temple_id);

-- RLS (Row Level Security) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 사용자 정책
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 사찰 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view temples" ON public.temples
    FOR SELECT USING (true);

-- 템플스테이 프로그램 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view temple programs" ON public.temple_programs
    FOR SELECT USING (true);

-- 예약 정책
CREATE POLICY "Users can view their own reservations" ON public.reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations" ON public.reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" ON public.reservations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" ON public.reservations
    FOR DELETE USING (auth.uid() = user_id);

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_temples_updated_at
    BEFORE UPDATE ON public.temples
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_temple_programs_updated_at
    BEFORE UPDATE ON public.temple_programs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 사용자 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, phone_number)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 시 자동으로 프로필 테이블에 추가
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 2. 기존 하드코딩된 데이터 입력
-- 기존 데이터 삭제 (재실행 시 중복 방지)
DELETE FROM public.temple_programs;
DELETE FROM public.temples;

-- 사찰 데이터 입력 (기존 데이터 그대로)
INSERT INTO public.temples (id, name, region, address, latitude, longitude, image_url, price, description, precautions, available_times) VALUES
(
    '1',
    '불국사',
    '경북',
    '경상북도 경주시 불국로 385',
    35.7897,
    129.3316,
    'https://images.unsplash.com/photo-1596792349887-2c1f3d8e5793?q=80&w=2070&auto=format&fit=crop',
    80000,
    '신라 시대 불교 예술의 정수를 보여주는 불국사는 다보탑, 석가탑 등 수많은 국보와 함께 찬란했던 불교 문화를 생생하게 느낄 수 있는 곳입니다.',
    '유네스코 세계문화유산으로 지정된 곳이므로, 문화재 훼손에 각별히 유의해야 합니다.',
    ARRAY['09:00 - 10:30', '11:00 - 12:30', '14:00 - 15:30', '16:00 - 17:30']
),
(
    '2',
    '골굴사',
    '경북',
    '경상북도 경주시 문무대왕면 기림로 101-5',
    35.7234,
    129.3456,
    'https://images.unsplash.com/photo-1543783300-302647a75223?q=80&w=2070&auto=format&fit=crop',
    60000,
    '골굴사는 천년의 세월을 간직한 석굴과 자연이 어우러진, 명상과 수행의 고요함이 흐르는 산사입니다.',
    '사진 촬영은 지정된 장소에서만 가능합니다.',
    ARRAY['10:00 - 11:30', '13:00 - 14:30']
),
(
    '3',
    '직지사',
    '경북',
    '경상북도 김천시 대항면 직지사길 95',
    36.1234,
    128.1234,
    'https://images.unsplash.com/photo-1627891244975-7b64694931f7?q=80&w=1964&auto=format&fit=crop',
    70000,
    '직지사는 깊은 산속 울창한 숲과 함께, 오랜 전통과 불심이 살아 숨 쉬는 경북의 대표 사찰입니다.',
    '바닷가에 위치하여 파도와 바람에 주의해야 합니다.',
    ARRAY['09:30 - 11:00', '14:30 - 16:00']
);

-- 템플스테이 프로그램 데이터 입력 (기존 데이터 그대로)
INSERT INTO public.temple_programs (temple_id, title, description, price, times, type) VALUES
-- 불국사 프로그램
(
    '1',
    '25년 불국사 천년의 향기',
    '불국사 천년의 향기를 느껴볼 수 있는 프로그램입니다.',
    120000,
    ARRAY['09:00~12:00', '14:00~17:00'],
    '체험형'
),
(
    '1',
    '25년 석굴암 천년의 숨결',
    '석굴암에서 새벽예불을 보고 토함산 일출도 볼 수있는 한시적으로 운영하는 특별템플스테이',
    150000,
    ARRAY['13:00~16:00'],
    '휴식형'
),
(
    '1',
    '25년 불국사 천년의 향기 국악문화공연 특별템플스테이',
    '한국전통국악무용인 승무, 한량무, 작법무인 나비춤, 관음무등을 관람할 수 있는 특별 템플스테이',
    130000,
    ARRAY['10:00~12:00'],
    '체험형'
),
-- 골굴사 프로그램
(
    '2',
    '움직이는 선의 숨결! (1박2일)',
    '마음을 닦는 몸의공부, 선무도! 참된 나를 만나다.',
    100000,
    ARRAY['09:00~11:00'],
    '체험형'
),
(
    '2',
    '움직이는 선의 숨결! (2박3일)',
    '마음을 닦는 몸의공부, 선무도! 참된 나를 만나다.',
    200000,
    ARRAY['10:00~13:00'],
    '체험형'
),
(
    '2',
    '주말_템플스테이 ( 1박2일-선무도 야외수련 및 야외명상)',
    '일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다.',
    100000,
    ARRAY['13:30~16:30'],
    '체험형'
),
(
    '2',
    '주말_템플스테이 ( 2박3일-선무도 야외수련 및 야외명상)',
    '일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다.',
    200000,
    ARRAY['15:00~18:00'],
    '휴식형'
),
(
    '2',
    '휴식형 템플스테이! 나에게 주는 선물!',
    '천년고찰 골굴사의 마애여래 부처님의 미소 아래 힐링과 재충전의 시간을 가져보세요.',
    100000,
    ARRAY['11:30~13:00'],
    '휴식형'
),
(
    '2',
    '나를 위한 하루동안의 행복여행!',
    '신라 화랑의 기상을 계승한 체험형 프로그램인 국궁과 승마등의 다양한 프로그램을 즐기실 수 있습니다.',
    70000,
    ARRAY['17:00~19:00'],
    '체험형'
),
-- 직지사 프로그램
(
    '3',
    '내 마음 깊이 살펴보기 [선(禪)-명상체험형] [육화당.안심료]',
    '명상을 통해 진정한 나를 찾아가는 시간',
    90000,
    ARRAY['09:30~12:00'],
    '체험형'
),
(
    '3',
    '내 마음 깊이 살펴보기 [선(禪)-명상체험형] [수향당]',
    '명상을 통해 진정한 나를 찾아가는 시간',
    80000,
    ARRAY['14:30~17:00'],
    '체험형'
),
(
    '3',
    '내 마음의 작은 쉼표 [휴식형] [육화당.안심료]',
    '사찰의 자연과 문화 환경을 활용하여 마음의 휴식을 얻는 프로그램',
    70000,
    ARRAY['10:00~12:00'],
    '휴식형'
),
(
    '3',
    '내 마음의 작은 쉼표 [휴식형] [수향당]',
    '사찰의 자연과 문화 환경을 활용하여 마음의 휴식을 얻는 프로그램',
    60000,
    ARRAY['13:00~15:00'],
    '휴식형'
);