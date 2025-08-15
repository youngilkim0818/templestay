import { Temple } from '../types';
import { TempleImageService, enrichTempleWithImages } from '../services/templeImageService';

export const TEMPLES_DATA: Temple[] = [
  {
    id: '1',
    name: 'Bulguksa Temple', // 불국사
    region: 'Gyeongju', // 경주
    address: '385 Bulguk-ro, Gyeongju-si, Gyeongsangbuk-do', // 경상북도 경주시 불국로 385
    latitude: 35.7895,
    longitude: 129.3321,
    areaCd: 35,
    sigunguCd: 2,
    imageUrl: require('../../assets/불국사.jpg'),
    basePrice: 80000,
    precautions: 'As a UNESCO World Heritage Site, please be especially careful not to damage cultural properties.', // 유네스코 세계문화유산으로 지정된 곳이므로, 문화재 훼손에 각별히 유의해야 합니다
    description: 'Bulguksa Temple showcases the essence of Buddhist art from the Silla Dynasty, where you can vividly experience the brilliant Buddhist culture alongside numerous national treasures such as Dabotap and Seokgatap.', // 신라 시대 불교 예술의 정수를 보여주는 불국사는 다보탑, 석가탑 등 수많은 국보와 함께 찬란했던 불교 문화를 생생하게 느낄 수 있는 곳입니다
    availableTimes: ['09:00 - 10:30', '11:00 - 12:30', '14:00 - 15:30', '16:00 - 17:30'],
    programs: [],
    templestay: [
      {
        title: '2025 Bulguksa: Scent of a Thousand Years', // 25년 불국사 천년의 향기
        description: 'Experience the thousand-year-old fragrance of Bulguksa Temple.', // 불국사 천년의 향기를 느껴볼 수 있는 프로그램입니다
        price: 120000,
        times: ['09:00~12:00', '14:00~17:00'],
        type: 'Experience Type', // 체험형
      },
      {
        title: '2025 Seokguram: Breath of a Thousand Years', // 25년 석굴암 천년의 숨결
        description: 'A special limited-time temple stay where you can attend morning prayer at Seokguram and watch the sunrise from Mt. Toham.', // 석굴암에서 새벽예불을 보고 토함산 일출도 볼 수있는 한시적으로 운영하는 특별템플스테이
        price: 150000,
        times: ['13:00~16:00'],
        type: 'Relaxation Type', // 휴식형
      },
      {
        title: '2025 Bulguksa: Traditional Korean Music Performance Special Temple Stay', // 25년 불국사 천년의 향기 국악문화공연 특별템플스테이
        description: 'A special temple stay where you can watch traditional Korean music and dance performances including Seungmu, Hallyangmu, and butterfly dance.', // 한국전통국악무용인 승무, 한량무, 작법무인 나비춤, 관음무등을 관람할 수 있는 특별 템플스테이
        price: 130000,
        times: ['10:00~12:00'],
        type: 'Experience Type', // 체험형
      },
    ],
    facilities: ['Parking Lot', 'Restroom', 'Convenience Store', 'Rest Area'], // ['주차장', '화장실', '매점', '휴게실']
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      publicTransportAccessible: true,
    },
    operatingHours: {
      'Monday': '09:00-18:00', // 월요일
      'Tuesday': '09:00-18:00', // 화요일
      'Wednesday': '09:00-18:00', // 수요일
      'Thursday': '09:00-18:00', // 목요일
      'Friday': '09:00-18:00', // 금요일
      'Saturday': '09:00-18:00', // 토요일
      'Sunday': '09:00-18:00', // 일요일
    },
    holidays: ['Lunar New Year', 'Buddha\'s Birthday'], // ['설날', '부처님 오신 날']
    // 템플스테이 상세 정보
    programDetails: {
      '2025 Bulguksa: Scent of a Thousand Years': { // 25년 불국사 천년의 향기
        pricing: {
          adult: 120000,
          teenager: 110000,
          child: 100000,
          preschool: 90000
        },
        description: 'Learn about numerous national treasures at Bulguksa, a World Heritage Site, and experience the thousand-year-old fragrance of Bulguksa while feeling the beautiful scenery of Seokgatap and Dabotap in front of Daeungjeon Hall under the moonlight and starlight.', // 세계문화유산인 불국사에서 많은 국보문화재를 알아보고 고즈녁한 야간에 달빛과 별빛을 벗삼아 대웅전앞 석가탑과 다보탑의 아름다운 경관을 느끼며 불국사 천년의 향기를 느낄 수 있 수 있는 프로그램입니다
        additionalInfo: [
          'Reservations may be cancelled if payment is not made within 7 days.', // 예약후 7일 이내에 미입금시 취소될 수 있습니다
          'Group programs require prior consultation and may be subject to change based on temple circumstances.', // 단체는 프로그램 사전협의 가능하며 사찰사정에 따라 프로그램이 일부 변동될 수 있습니다
          'Please note that the temple stay facility is not located within Bulguksa grounds but is a 25-minute walk away.' // 또한 불국사 템플관은 불국사 경내에 위치하고 있지 않고 도보로 25분 거리에 있음을 인지하시기 바랍니다
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      '2025 Seokguram: Breath of a Thousand Years': { // 25년 석굴암 천년의 숨결
        pricing: {
          adult: 150000,
          teenager: 140000,
          child: 130000,
          preschool: 120000
        },
        description: 'A special limited-time temple stay at the proud World Heritage Site Seokguram where you can attend morning prayer and watch the sunrise from Mt. Toham. This special program is for those who want to participate in Seokguram morning prayer, and experience vouchers cannot be used.', // 자랑스런 세계문화유산 석굴암에서 새벽예불을 보고 토함산 일출도 볼 수 도 있는 한시적으로 운영하는 특별템플스테이입니다. 석굴암 새벽예불을 참가하고 싶은분들을 위한 특별프로그램으로 체험권은 사용할 수 없습니다
        additionalInfo: [
          'Please complete payment within 7 days of reservation. Reservations may be cancelled if payment is not made.', // 예약후 7일 이내에 입금부탁드립니다. 미입금시 예약취소되실수 있습니다
          'Group programs require prior consultation.', // 단체는 프로그램 사전협의 가능
          'Programs may be subject to change based on temple circumstances.', // 사찰사정에 따라 프로그램이 일부 변동될 수 있습니다
          'Please note that the temple stay facility is not located within Bulguksa grounds but is 25 minutes away by foot, or 5 minutes by car.' // 또한 템플관은 불국사경내가 아닌 차량으로 5분 도보로는 25분거리에 불국사경내와 떨어져 위치하고 있음을 미리 인지하시가 바랍니다
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      '2025 Bulguksa: Traditional Korean Music Performance Special Temple Stay': { // 25년 불국사 천년의 향기 국악문화공연 특별템플스테이
        pricing: {
          adult: 130000,
          teenager: 120000,
          child: 110000,
          preschool: 100000
        },
        description: 'A special temple stay at Bulguksa, a World Heritage Site, where you can watch traditional Korean music and dance performances including Seungmu, Hallyangmu, and butterfly dance on the fourth Saturday of every month for Culture Day. You can also feel the beautiful scenery of Seokgatap and Dabotap in front of Daeungjeon Hall during the temple tour and experience the thousand-year-old fragrance of Bulguksa. Experience vouchers cannot be used for this program.', // 매달 네째주 토요일 문화의 날을 위하여 세계문화유산인 불국사에서 한국전통국악무용인 승무, 한량무, 작법무인 나비춤, 관음무등을 관람할 수 있는 특별 템플스테이 입니다. 또한 불국사 사찰투어 와 더불어 대웅전앞 석가탑과 다보탑의 아름다운 풍경을 느끼며 불국사 천년의 향기를 느껴볼 수 있 수 있습니다. 이프로그램은 체험권사용할 수 없습니다
        additionalInfo: [
          'Reservations may be cancelled if payment is not made within 7 days.', // 예약후 7일 이내에 미입금시 취소될 수 있습니다
          'Group programs require prior consultation and may be subject to change based on temple circumstances.', // 단체는 프로그램 사전협의 가능하며 사찰사정에 따라 프로그램이 일부 변동될 수 있습니다
          'Please note that the temple stay facility is not located within Bulguksa grounds but is a 25-minute walk away.' // 또한 불국사 템플관은 불국사 경내에 위치하고 있지 않고 도보로 25분 거리에 있음을 인지하시기 바랍니다
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Personal toiletries, towel, spare clothes (outerwear), sneakers (comfortable shoes), socks, personal (insulated) water bottle. For winter participation: winter gear and ice cleats.', // 개인 세면도구, 수건, 여벌옷(외투), 운동화(편한 신발), 양말, 개인(보온) 물통 겨울 참가시, 방한용품 및 아이젠 등
      refundPolicy: [
        '100% refund 3 days before scheduled participation', // 참가 예정일 3일 전 100% 환불
        '50% refund 2 days before scheduled participation', // 참가 예정일 2일 전 50% 환불
        'No refund for same-day cancellation', // 참가 당일 취소 환불 없음
        'Bank transfer fees deducted', // 계좌 이체시 수수료 차감
        'No refund during travel week events' // 여행주간 이벤트 행사시 참가비 환불없음
      ],
      templeRules: [
        'Please refrain from drinking and smoking within the temple grounds.', // 사찰 내에선 음주, 흡연은 삼가해 주세요
        'Please refrain from loud behavior and noise.' // 고성방가를 삼가해 주세요
      ]
    }
  },
  {
    id: '2',
    name: 'Golgulsa Temple', // 골굴사
    region: 'Gyeongju', // 경주
    address: '101-5 Girim-ro, Munmu-daewang-myeon, Gyeongju-si, Gyeongsangbuk-do', // 경상북도 경주시 문무대왕면 기림로 101-5
    latitude: 35.7542,
    longitude: 129.4265,
    areaCd: 35,
    sigunguCd: 2,
    imageUrl: require('../../assets/굴국사.jpg'),
    basePrice: 60000,
    precautions: 'Photography is only allowed in designated areas.', // 사진 촬영은 지정된 장소에서만 가능합니다
    description: 'Golgulsa Temple is a mountain temple where the tranquility of meditation and practice flows, combining stone caves that have preserved a thousand years of history with nature.', // 골굴사는 천년의 세월을 간직한 석굴과 자연이 어우러진, 명상과 수행의 고요함이 흐르는 산사입니다
    availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
    programs: [],
    templestay: [
      { title: 'Breath of Moving Zen! (1 Night 2 Days)', description: 'Body training for mind cultivation, Seonmudo! Meet your true self.', price: 100000, times: ['09:00~11:00'], type: 'Experience Type' }, // { title: '움직이는 선의 숨결! (1박2일)', description: '마음을 닦는 몸의공부, 선무도! 참된 나를 만나다.', price: 100000, times: ['09:00~11:00'], type: 'Experience Type' },
      { title: 'Breath of Moving Zen! (2 Nights 3 Days)', description: 'Body training for mind cultivation, Seonmudo! Meet your true self.', price: 200000, times: ['10:00~13:00'], type: 'Experience Type' }, // { title: '움직이는 선의 숨결! (2박3일)', description: '마음을 닦는 몸의공부, 선무도! 참된 나를 만나다.', price: 200000, times: ['10:00~13:00'], type: 'Experience Type' },
      { title: 'Weekend Temple Stay (1 Night 2 Days - Seonmudo Outdoor Training and Meditation)', description: 'A weekend program to gather your tired body and mind from daily life and gain new energy.', price: 100000, times: ['13:30~16:30'], type: 'Experience Type' }, // { title: '주말_템플스테이 ( 1박2일-선무도 야외수련 및 야외명상)', description: '일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다.', price: 100000, times: ['13:30~16:30'], type: 'Experience Type' },
      { title: 'Weekend Temple Stay (2 Nights 3 Days - Seonmudo Outdoor Training and Meditation)', description: 'A weekend program to gather your tired body and mind from daily life and gain new energy.', price: 200000, times: ['15:00~18:00'], type: 'Relaxation Type' }, // { title: '주말_템플스테이 ( 2박3일-선무도 야외수련 및 야외명상)', description: '일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다.', price: 200000, times: ['15:00~18:00'], type: 'Relaxation Type' },
      { title: 'Relaxation Temple Stay! A Gift to Myself!', description: 'Take time for healing and recharging under the smile of the Rock-carved Buddha at the thousand-year-old Golgulsa Temple.', price: 100000, times: ['11:30~13:00'], type: 'Relaxation Type' }, // { title: '휴식형 템플스테이! 나에게 주는 선물!', description: '천년고찰 골굴사의 마애여래 부처님의 미소 아래 힐링과 재충전의 시간을 가져보세요.', price: 100000, times: ['11:30~13:00'], type: 'Relaxation Type' },
      { title: 'A Day of Happiness Travel for Myself!', description: 'You can enjoy various programs including traditional archery and horseback riding, experiential programs that inherit the spirit of Silla Hwarang.', price: 70000, times: ['17:00~19:00'], type: 'Experience Type' } // { title: '나를 위한 하루동안의 행복여행!', description: '신라 화랑의 기상을 계승한 체험형 프로그램인 국궁과 승마등의 다양한 프로그램을 즐기실 수 있습니다.', price: 70000, times: ['17:00~19:00'], type: 'Experience Type' }
    ],
    // 템플스테이 상세 정보
    programDetails: {
      'Breath of Moving Zen! (1 Night 2 Days)': { // 움직이는 선의 숨결! (1박2일)
        pricing: {
          adult: 100000,
          teenager: 100000,
          child: 100000,
          preschool: 50000
        },
        description: 'Body training for mind cultivation, Seonmudo! Meet your true self. Seonmudo is a traditional Buddhist practice method. Through Seonmudo training including meditation, Seon yoga, Seon qigong, Seon martial arts, and Seon exercise, gain harmony of body, mind, and breath to restore the energy for a happy life.', // 마음을 닦는 몸의공부, 선무도! 참된 나를 만나다. 선무도는 불교의 전통수행법입니다. 명상, 선요가, 선기공, 선무술, 선체조 등을 포함하는 선무도 수련을 통해 몸과 마음과 호흡의 조화로움을 얻어 행복한 삶의 에너지를 되찾으세요
        additionalInfo: [
          'High school students and below must be accompanied by a guardian.', // 고등학생까지, 보호자 동반하여야 합니다
          'At the temple, men and women use separate rooms as a principle.' // 사찰에서는 남녀 각 방 사용을 원칙으로 합니다
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Breath of Moving Zen! (2 Nights 3 Days)': { // 움직이는 선의 숨결! (2박3일)
        pricing: {
          adult: 200000,
          teenager: 200000,
          child: 200000,
          preschool: 100000
        },
        description: 'Body training for mind cultivation, Seonmudo! Meet your true self. Seonmudo is a traditional Buddhist practice method. Through Seonmudo training including meditation, Seon yoga, Seon qigong, Seon martial arts, and Seon exercise, gain harmony of body, mind, and breath to restore the energy for a happy life.', // 마음을 닦는 몸의공부, 선무도! 참된 나를 만나다. 선무도는 불교의 전통수행법입니다. 명상, 선요가, 선기공, 선무술, 선체조 등을 포함하는 선무도 수련을 통해 몸과 마음과 호흡의 조화로움을 얻어 행복한 삶의 에너지를 되찾으세요
        additionalInfo: [
          'High school students and below must be accompanied by a guardian.', // 고등학생까지, 보호자 동반하여야 합니다
          'At the temple, men and women use separate rooms as a principle.' // 사찰에서는 남녀 각 방 사용을 원칙으로 합니다
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Weekend Temple Stay (1 Night 2 Days - Seonmudo Outdoor Training and Meditation)': { // 주말_템플스테이 ( 1박2일-선무도 야외수련 및 야외명상)
        pricing: {
          adult: 100000,
          teenager: 100000,
          child: 100000,
          preschool: 50000
        },
        description: 'A weekend program to gather your tired body and mind from daily life and gain new energy. Morning Seonmudo training is divided into indoor training and outdoor training.', // 일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다. 오전 선무도 수련은 경내 수련과 야외수련 두가지로 나뉘어 진행합니다
        additionalInfo: [
          'Those going to the beach for outdoor training will incur an additional cost of 10,000 won per person per session.', // 이 야외수련 바닷가를 나가시는 분은 1인 1회 1만원의 추가 비용이 발생합니다
          'High school students and below must be accompanied by parents to participate.', // 고등학생까지는 부모님과 동반하셔야 참여가 가능합니다
          'At the temple, men and women use separate rooms as a principle.' // 사찰에서는 남녀 각 방 사용을 원칙으로 합니다
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Weekend Temple Stay (2 Nights 3 Days - Seonmudo Outdoor Training and Meditation)': { // 주말_템플스테이 ( 2박3일-선무도 야외수련 및 야외명상)
        pricing: {
          adult: 200000,
          teenager: 200000,
          child: 200000,
          preschool: 100000
        },
        description: 'A weekend program to gather your tired body and mind from daily life and gain new energy. Morning Seonmudo training is divided into indoor training and outdoor training.', // 일상에서 지친 몸과 마음을 추스리고 새로운 에너지를 얻는 주말 프로그램입니다. 오전 선무도 수련은 경내 수련과 야외수련 두가지로 나뉘어 진행합니다
        additionalInfo: [
          'Those going to the beach for outdoor training will incur an additional cost of 10,000 won per person per session.', // 이 야외수련 바닷가를 나가시는 분은 1인 1회 1만원의 추가 비용이 발생합니다
          'High school students and below must be accompanied by parents to participate.', // 고등학생까지는 부모님과 동반하셔야 참여가 가능합니다
          'At the temple, men and women use separate rooms as a principle.' // 사찰에서는 남녀 각 방 사용을 원칙으로 합니다
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Relaxation Temple Stay! A Gift to Myself!': { // 휴식형 템플스테이! 나에게 주는 선물!
        pricing: {
          adult: 100000,
          teenager: 100000,
          child: 100000,
          preschool: 50000
        },
        description: 'Take time for healing and recharging under the smile of the Rock-carved Buddha at the thousand-year-old Golgulsa Temple. Even if you choose the relaxation type, you can freely select and participate in various experiential temple stay programs.', // 천년고찰 골굴사의 마애여래 부처님의 미소 아래 힐링과 재충전의 시간을 가져보세요. 휴식형으로 선택하셔도, 다양한 체험형 템플스테이 전 일정을 자유롭게 선택하여 참여 하실 수 있습니다
        additionalInfo: [
          'High school students and below must be accompanied by parents to participate.', // 고등학생까지는 부모님과 동반하셔야 참여가 가능합니다
          'At the temple, men and women use separate rooms as a principle.' // 사찰에서는 남녀 각 방 사용을 원칙으로 합니다
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'A Day of Happiness Travel for Myself!': { // 나를 위한 하루동안의 행복여행!
        pricing: {
          adult: 70000,
          teenager: 70000,
          child: 70000,
          preschool: 70000
        },
        description: 'You can enjoy various programs including Golgulsa\'s signature Seonmudo training experience, free Seonmudo performance viewing, and experiential programs that inherit the spirit of Silla Hwarang such as traditional archery and horseback riding.', // 골굴사의 트레이드 마크인 선무도 수련 체험과 선무도 공연 관람(무료) 신라 화랑의 기상을 계승한 체험형 프로그램인 국궁과 승마 등의 다양한 프로그램을 즐기실 수 있습니다
        additionalInfo: [
          'Middle school students, lower grade students, and children must be accompanied by a guardian.' // 중학생 포함 저학년 학생들과 어린이들의 경우 보호자 동반하여야 합니다
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Required items: 1) Essential: toiletries, towel (not available for rent due to hygiene), basic clothing for the season, comfortable walking shoes, water bottle, winter and summer gear (winter underwear preparation required) 2) Provided: Seonmudo training clothes (vest, pants), toothpaste and soap available', // 준비물 1) 필수 : 세면도구. 수건(위생상 대여 안함), 계절에 따른 기본 복장, 걷기 편한 신발, 물통 계절에 따른 방한 및 방염 용품 등 (겨울에는 하의 내복 준비) 2) 제공 : 선무도 수련복 (조끼.바지), 치약.세숫비누 비치
      refundPolicy: [
        '100% refund 3 days before scheduled participation', // 참가 예정일 3일 전 100% 환불
        '50% refund 2 days before scheduled participation', // 참가 예정일 2일 전 50% 환불
        'No refund for same-day cancellation', // 참가 당일 취소 환불 없음
        'Bank transfer fees deducted' // 계좌 이체시 수수료 차감
      ],
      templeRules: [
        'Please refrain from drinking, smoking, and loud behavior within the temple grounds.', // 사찰 내에선 음주, 흡연, 고성방가를 삼가해 주십시오
        'As the temple is a practice community, please speak and act quietly.', // 사찰은 수행 공동처이므로 조용히 말하고 행동하도록 합니다
        'Please avoid overly flashy clothing or revealing clothes.', // 지나치게 화려한 복장이나 노출이 심한 옷은 피해주시기 바랍니다
        'As this is a shared living space, please put used items back in their place for others.', // 공동 생활공간이므로 다른이를 위해 사용한 물건은 제자리에 놓아주세요
        'During your stay at the temple, going out with other participants is prohibited.' // 사찰내 머무는 동안 다른 참가자와 외출을 금합니다
      ]
    }
  },
  {
    id: '3',
    name: 'Jikjisa Temple', // 직지사
    region: 'Gimcheon', // 김천
    address: '95 Jikjisa-gil, Daehang-myeon, Gimcheon-si, Gyeongsangbuk-do', // 경상북도 김천시 대항면 직지사길 95
    latitude: 36.1047,
    longitude: 128.0817,
    areaCd: 35,
    sigunguCd: 3,
    imageUrl: require('../../assets/직지사.jpg'),
    basePrice: 70000,
    precautions: 'Located by the sea, please be careful of waves and wind.', // 바닷가에 위치하여 파도와 바람에 주의해야 합니다.
    description: 'Jikjisa Temple is a representative temple of Gyeongbuk, where ancient traditions and Buddhist faith live and breathe together with the deep mountains and lush forests.', // 직지사는 깊은 산속 울창한 숲과 함께, 오랜 전통과 불심이 살아 숨 쉬는 경북의 대표 사찰입니다.
    availableTimes: ['09:30 - 11:00', '14:30 - 16:00'],
    programs: [],
    templestay: [
      { title: 'Looking Deep into My Heart [Zen-Meditation Experience] [Yukhwa-dang.Ansim-ryo]', description: 'Time to find the true self through meditation', price: 90000, times: ['09:30~12:00'], type: 'Experience Type' },
      { title: 'Looking Deep into My Heart [Zen-Meditation Experience] [Suhyang-dang]', description: 'Time to find the true self through meditation', price: 80000, times: ['14:30~17:00'], type: 'Experience Type' },
      { title: 'A Small Pause in My Heart [Relaxation Type] [Yukhwa-dang.Ansim-ryo]', description: 'Program to find mental rest utilizing the temple\'s natural and cultural environment', price: 70000, times: ['10:00~12:00'], type: 'Relaxation Type' },
      { title: 'A Small Pause in My Heart [Relaxation Type] [Suhyang-dang]', description: 'Program to find mental rest utilizing the temple\'s natural and cultural environment', price: 60000, times: ['13:00~15:00'], type: 'Relaxation Type' },
    ],
    // 템플스테이 상세 정보
    programDetails: {
      'Looking Deep into My Heart [Zen-Meditation Experience] [Yukhwa-dang.Ansim-ryo]': { // 내 마음 깊이 살펴보기 [선(禪)-명상체험형] [육화당.안심료]
        pricing: {
          adult: 90000,
          teenager: 70000,
          child: 70000,
          preschool: 50000
        },
        description: 'Take a moment to put down your daily routine and give yourself the gift of true rest in your heart, discovering what true happiness is. Through breathing meditation and walking meditation, learn how to be awake and aware in this moment, and take time to reflect on yourself.', // 잠시 일상을 내려놓고 진정한 행복이 무엇인지, 내 마음에 진정한 휴식을 선물해주세요. 호흡명상, 걷기명상을 통해 지금 이 순간 깨어있음과 알아차림 하는 법을 익히고 나를 되돌아보는 시간을 갖습니다.
        additionalInfo: [
          '[Yukhwa-dang.Ansim-ryo] has individual bathrooms and shower facilities installed in each room.', // [육화당.안심료]에는 방사안에 개별 화장실과 샤워부쓰가 설치되어 있습니다.
          'As this is a temple, men and women are assigned to separate rooms by default.', // 사찰이기 때문에 기본적으로 남녀는 각방에 배정됩니다.
          'Reservation is only confirmed after payment is completed. If payment is not made within 3 days after reservation, it will be automatically cancelled and the spot will be given to the next person. Please note this.', // 예약 후 입금까지 완료되어야 최종 확정됩니다. 만약 입금이 예약 후 3일 내에 이루어지지 않을 시 자동 취소되고 참가 자격은 다음 사람에게 넘어갑니다. 이 점을 양지하시기 바랍니다.
          'However, families with 3 or more people will be assigned to the same room.' // 단, 3인 이상 가족의 경우에는 한 방에 배정해드립니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'Looking Deep into My Heart [Zen-Meditation Experience] [Suhyang-dang]': { // 내 마음 깊이 살펴보기 [선(禪)-명상체험형] [수향당]
        pricing: {
          adult: 80000,
          teenager: 60000,
          child: 60000,
          preschool: 40000
        },
        description: 'Take a moment to put down your daily routine and give yourself the gift of true rest in your heart, discovering what true happiness is. Through breathing meditation and walking meditation, learn how to be awake and aware in this moment, and take time to reflect on yourself.', // 잠시 일상을 내려놓고 진정한 행복이 무엇인지, 내 마음에 진정한 휴식을 선물해주세요. 호흡명상, 걷기명상을 통해 지금 이 순간 깨어있음과 알아차림 하는 법을 익히고 나를 되돌아보는 시간을 갖습니다.
        additionalInfo: [
          '[Suhyang-dang] uses shared men\'s and women\'s bathrooms and shower facilities.', // [수향당]은 남자 공동 화장실·샤워실 / 여자 공동 화장실·샤워실 사용입니다.
          'As this is a temple, men and women are assigned to separate rooms by default.', // 사찰이기 때문에 기본적으로 남녀는 각방에 배정됩니다.
          'Reservation is only confirmed after payment is completed. If payment is not made within 3 days after reservation, it will be automatically cancelled and the spot will be given to the next person. Please note this.', // 예약 후 입금까지 완료되어야 최종 확정됩니다. 만약 입금이 예약 후 3일 내에 이루어지지 않을 시 자동 취소되고 참가 자격은 다음 사람에게 넘어갑니다. 이 점을 양지하시기 바랍니다.
          'However, families with 3 or more people will be assigned to the same room.' // 단, 3인 이상 가족의 경우에는 한 방에 배정해드립니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'A Small Pause in My Heart [Relaxation Type] [Yukhwa-dang.Ansim-ryo]': { // 내 마음의 작은 쉼표 [휴식형] [육화당.안심료]
        pricing: {
          adult: 70000,
          teenager: 60000,
          child: 60000,
          preschool: 40000
        },
        description: 'This is a program to find mental rest by utilizing the temple\'s natural and cultural environment.', // 사찰의 자연과 문화 환경을 활용하여 마음의 휴식을 얻는 프로그램입니다.
        additionalInfo: [
          '[Yukhwa-dang.Ansim-ryo] has individual bathrooms and shower facilities installed in each room.', // [육화당.안심료]에는 방사안에 개별 화장실과 샤워부쓰가 설치되어 있습니다.
          'As this is a temple, men and women are assigned to separate rooms by default.', // 사찰이기 때문에 기본적으로 남녀는 각방에 배정됩니다.
          'Reservation is only confirmed after payment is completed. If payment is not made within 3 days after reservation, it will be automatically cancelled and the spot will be given to the next person. Please note this.', // 예약 후 입금까지 완료되어야 최종 확정됩니다. 만약 입금이 예약 후 3일 내에 이루어지지 않을 시 자동 취소되고 참가 자격은 다음 사람에게 넘어갑니다. 이 점을 양지하시기 바랍니다.
          'However, families with 3 or more people will be assigned to the same room.' // 단, 3인 이상 가족의 경우에는 한 방에 배정해드립니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'A Small Pause in My Heart [Relaxation Type] [Suhyang-dang]': {
        pricing: {
          adult: 80000,
          teenager: 60000,
          child: 60000,
          preschool: 40000
        },
        description: 'This is a program to find mental rest by utilizing the temple\'s natural and cultural environment.', // 사찰의 자연과 문화 환경을 활용하여 마음의 휴식을 얻는 프로그램입니다.
        additionalInfo: [
          '[Suhyang-dang] uses shared men\'s and women\'s bathrooms and shower facilities.', // [수향당]은 남자 공동 화장실·샤워실 / 여자 공동 화장실·샤워실 사용입니다.
          'As this is a temple, men and women are assigned to separate rooms by default.', // 사찰이기 때문에 기본적으로 남녀는 각방에 배정됩니다.
          'Reservation is only confirmed after payment is completed. If payment is not made within 3 days after reservation, it will be automatically cancelled and the spot will be given to the next person. Please note this.', // 예약 후 입금까지 완료되어야 최종 확정됩니다. 만약 입금이 예약 후 3일 내에 이루어지지 않을 시 자동 취소되고 참가 자격은 다음 사람에게 넘어갑니다. 이 점을 양지하시기 바랍니다.
          'However, families with 3 or more people will be assigned to the same room.' // 단, 3인 이상 가족의 경우에는 한 방에 배정해드립니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'All toiletries, towel, sneakers, personal (insulated) water bottle, phone charger must be brought. Uniform (training clothes) provided (vest, pants). Please prepare personal winter gear for winter season. Hair dryer not provided. Please note.', // 세면도구 일체, 수건, 운동화, 개인(보온)물통, 핸드폰 충전기 가져오셔야 합니다. 유니폼(수련복) 제공해드립니다(조끼,바지). 동절기에는 개인 방한용품을 준비해 와 주세요. ^^ . 헤어드라이기는 제공하지 않습니다. 참고 부탁드립니다
      refundPolicy: [
        '100% refund 7 days before scheduled participation', // 참가 예정일 7일 전 100% 환불
        '60% refund 4 days before scheduled participation', // 참가 예정일 4일 전 60% 환불
        '30% refund 2 days before scheduled participation', // 참가 예정일 2일 전 30% 환불
        'No refund for 1 day before or same-day cancellation', // 참가 예정일 1일 전 또는 당일 환불 불가
        '100% refund for cancellations due to climate change, natural disasters, or temple\'s fault', // 기후 변화 및 천재지변, 사찰의 귀책사유로 인한 취소 시에는 100%환불
        'When applying for refund after bank transfer, please send the refund account number via text message.' // 계좌입금후 환불 신청 시, 문자로 환불 계좌번호를 알려주시길 바랍니다.
      ],

      templeRules: [
        'When passing in front of the main hall or meeting monks, please put your hands together and bow.', // 법당 앞을 지나거나 스님을 만날 때는 합장하고 인사합니다.
        'All times such as morning service and meals must be strictly observed, and actively participate when there is temple work.', // 예불, 공양 등 모든 시간을 엄수해야 하며, 사중 운력이 있을 때는 적극 참여합니다.
        'When entering and exiting the main hall, do not use the central door, and avoid revealing clothes or bare feet.', // 법당 출입 시에는 중앙문을 사용하지 않으며, 노출이 심한 옷이나 맨발 출입을 삼갑니다.
        'Absolutely no drinking or smoking.', // 술, 담배 절대 금합니다.
        'Use items as if they were your own, put them back in their place after use, and clean the rooms, bathrooms, and washrooms for others.' // 사용한 물건은 내 것처럼 아끼고 사용한 후 제자리에 두고, 방사, 화장실, 세면장은 다른 사람을 위해 깨끗하게 청소합니다.
      ],

    }
  },
  {
    id: '4',
    name: 'Gamsansa Temple', // 감산사
    region: 'Gyeongju', // 경주
    address: '117-20 Apdeung-gil, Oedong-eup, Gyeongju-si, Gyeongbuk', // 경북 경주시 외동읍 앞등길 117-20
    latitude: 35.7664052,
    longitude: 129.3370795,
    areaCd: 35,
    sigunguCd: 2,
    imageUrl: require('../../assets/감산사.jpg'),
    basePrice: 65000,
    precautions: 'At the temple, refrain from unnecessary speech (silence), live simply and slowly with a humble and caring heart in harmony.', // 절에서는 필요 없는 말을 하지 않으며(묵언), 단순하고 느리게, 겸손과 배려의 마음으로 조화롭게 생활합니다.
    description: 'This temple was founded by King Seongdeok of Unified Silla to pray for the repose of his father and mother\'s souls, and to wish for the well-being of the king and his family.', // 통일신라 성덕왕이 아버지와 어머디의 명복을 빌고, 국왕과 그 가문의 안녕을 기원하기 위해 창건된 사찰입니다
    availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
    programs: [],
    templestay: [
      { title: 'Let Go and Rest - Relaxation Type (Single Room - 1 Night 2 Days Only)', description: 'Please take time for meditation with the monk.', price: 120000, times: ['09:00~12:00'], type: 'Relaxation Type' },
      { title: 'Let Go and Rest - Relaxation Type (2 or More People - 1 Night 2 Days Only)', description: 'Please take time for meditation with the monk.', price: 80000, times: ['14:00~17:00'], type: 'Relaxation Type' },
      { title: 'Spring in My Heart (Single Room)', description: 'Programs including barefoot walking, pagoda circumambulation, 108 bows, barefoot walking meditation on Hoe-mi path, meditation pilgrimage to Gwaereung, tea conversation with monk, etc.', price: 120000, times: ['14:00~17:00'], type: 'Experience Type' },
      { title: 'Spring in My Heart (2 or More People)', description: 'Programs including barefoot walking, pagoda circumambulation, 108 bows, barefoot walking meditation on Hoe-mi path, meditation pilgrimage to Gwaereung, tea conversation with monk, etc.', price: 80000, times: ['14:00~17:00'], type: 'Experience Type' },
      { title: '2025 - Summer Special Temple Stay in Nature, Healing with Family!', description: 'Program prepared so that the whole family can experience traditional temple culture and healing in nature together', price: 80000, times: ['14:00~17:00'], type: 'Experience Type' },
    ],
    // 템플스테이 상세 정보
    programDetails: {
      'Let Go and Rest - Relaxation Type (Single Room - 1 Night 2 Days Only)': { // 내려놓고, 쉼 -휴식형 (1인 1실-1박2일만가능)
        pricing: {
          adult: 120000,
          teenager: 120000,
          child: 120000,
          preschool: 120000
        },
        description: 'Gamsansa Temple Stay program is held in the serene Gamsansa temple grounds where you must observe temple etiquette such as morning service, meals, and temple work, while taking time for meditation with the monk through barefoot walking meditation, pagoda circumambulation meditation, and drinking various teas.', // 감산사 템플스테이 프로그램은 고즈넉한 감산사 도량에서 예불, 공양, 운력 등 사찰에서 예절은 반드시 지키면서 맨발로 걷기명상, 탑돌이 명상, 다양한 차를 마시면서 스님과 함께 명상의 시간을 가져보시기 바랍니다.
        additionalInfo: [
          'Reservation is only completed after payment (settlement) is completed, and a confirmation text message will be sent.', // 예약 신청 후 입금(결제)까지 완료하셔야 예약이 완료되며, 예약완료 문자를 발송해 드립니다.
          'Date change: After reservation completion, date change is possible once, and no refund is available after date change.', // 날짜 변경: 예약완료 이후, 날짜 변경은 1회 가능하며, 날짜 변경 후 취소 시 환불 불가합니다
          'Program schedule may change depending on temple circumstances.' // 프로그램 일정은 사찰의 사정에 따라 변경될 수 있습니다.
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      },
      'Let Go and Rest - Relaxation Type (2 or More People - 1 Night 2 Days Only)': { // 내려놓고, 쉼-휴식형 (2인 이상-1박2일만가능)
        pricing: {
          adult: 80000,
          teenager: 80000,
          child: 70000,
          preschool: 50000
        },
        description: 'Gamsansa Temple Stay program is held in the serene Gamsansa temple grounds where you must observe temple etiquette such as morning service, meals, and temple work, while taking time for meditation with the monk through barefoot walking meditation, pagoda circumambulation meditation, and drinking various teas.', // 감산사 템플스테이 프로그램은 고즈넉한 감산사 도량에서 예불, 공양, 운력 등 사찰에서 예절은 반드시 지키면서 맨발로 걷기명상, 탑돌이 명상, 다양한 차를 마시면서 스님과 함께 명상의 시간을 가져보시기 바랍니다.
        additionalInfo: [
          'Reservation is only completed after payment (settlement) is completed, and a confirmation text message will be sent.', // 예약 신청 후 입금(결제)까지 완료하셔야 예약이 완료되며, 예약완료 문자를 발송해 드립니다.
          'Date change: After reservation completion, date change is possible once, and no refund is available after date change.', // 날짜 변경: 예약완료 이후, 날짜 변경은 1회 가능하며, 날짜 변경 후 취소 시 환불 불가합니다
          'Program schedule may change depending on temple circumstances.' // 프로그램 일정은 사찰의 사정에 따라 변경될 수 있습니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'Spring in My Heart (Single Room)': { // 내마음 봄 (1인 1실)
        pricing: {
          adult: 120000,
          teenager: 120000,
          child: 120000,
          preschool: 120000
        },
        description: 'Gamsansa experiential temple stay program includes barefoot walking in the main hall and three-story stone pagoda courtyard, pagoda circumambulation, 108 bows, barefoot walking meditation on Hoe-mi path, meditation pilgrimage to Gwaereung, tea conversation with monk, and other programs while strictly observing basic temple etiquette such as morning service, meals, and temple work.', // 감산사 체험형 템플스테이 프로그램은 예불, 공양, 운력 등 사찰에서 지켜야 하는 기본예절은 반드시 지키면서 법당과 삼층석탑 마당 맨발걷기, 탑돌이, 108배하기, 호미길(맨발) 걷기명상, 괘릉 명상순례, 스님과 차담 등 프로그램이 준비되어 있습니다.
        additionalInfo: [
          'Reservation is only completed after payment (settlement) is completed, and a confirmation text message will be sent.', // 예약 신청 후 입금(결제)까지 완료하셔야 예약이 완료되며, 예약완료 문자를 발송해 드립니다.
          'Date change: After reservation completion, date change is possible once, and no refund is available after date change.', // 날짜 변경: 예약완료 이후, 날짜 변경은 1회 가능하며, 날짜 변경 후 취소 시 환불 불가합니다
          'Program schedule may change depending on temple circumstances.' // 프로그램 일정은 사찰의 사정에 따라 변경될 수 있습니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'Spring in My Heart (2 or More People)': { // 내마음 봄 (2인 이상)
        pricing: {
          adult: 80000,
          teenager: 80000,
          child: 70000,
          preschool: 50000
        },
        description: 'Gamsansa experiential temple stay program includes barefoot walking in the main hall and three-story stone pagoda courtyard, pagoda circumambulation, 108 bows, barefoot walking meditation on Hoe-mi path, meditation pilgrimage to Gwaereung, tea conversation with monk, and other programs while strictly observing basic temple etiquette such as morning service, meals, and temple work.', // 감산사 체험형 템플스테이 프로그램은 예불, 공양, 운력 등 사찰에서 지켜야 하는 기본예절은 반드시 지키면서 법당과 삼층석탑 마당 맨발걷기, 탑돌이, 108배하기, 호미길(맨발) 걷기명상, 괘릉 명상순례, 스님과 차담 등 프로그램이 준비되어 있습니다.
        additionalInfo: [
          'Reservation is only completed after payment (settlement) is completed, and a confirmation text message will be sent.', // 예약 신청 후 입금(결제)까지 완료하셔야 예약이 완료되며, 예약완료 문자를 발송해 드립니다.
          'Date change: After reservation completion, date change is possible once, and no refund is available after date change.', // 날짜 변경: 예약완료 이후, 날짜 변경은 1회 가능하며, 날짜 변경 후 취소 시 환불 불가합니다
          'Program schedule may change depending on temple circumstances.' // 프로그램 일정은 사찰의 사정에 따라 변경될 수 있습니다.
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      },
      '2025 - Summer Special Temple Stay in Nature, Healing with Family!': { // 2025- 자연 속 쉼, 가족과 함께하는 여름 특별 템플스테이!
        pricing: {
          adult: 80000,
          teenager: 80000,
          child: 70000,
          preschool: 50000
        },
        description: 'Gamsansa Summer Family Special Temple Stay program is prepared so that the whole family can experience traditional temple culture and healing in nature together. Escape from the city and feel true rest in the fresh air and mountain temple, spending time fostering family emotions and sharing hearts.', // 감산사 여름 가족 특별 템플스테이 프로그램은 가족 모두가 전통 사찰 문화와 지연 속 힐링을 함께 체험 할 수 있도록 마련된 프로그램입니다. 도시에서 벗어나 맑은 공기와 산사에서 진정한 쉼을 느끼며 가족 간 정서 도모와 마음을 나누는 시간을 갖습니다.
        additionalInfo: [
          'Reservation is only completed after payment (settlement) is completed, and a confirmation text message will be sent.', // 예약 신청 후 입금(결제)까지 완료하셔야 예약이 완료되며, 예약완료 문자를 발송해 드립니다.
          'Date change: After reservation completion, date change is possible once, and no refund is available after date change.', // 날짜 변경: 예약완료 이후, 날짜 변경은 1회 가능하며, 날짜 변경 후 취소 시 환불 불가합니다
          'Program schedule may change depending on temple circumstances.' // 프로그램 일정은 사찰의 사정에 따라 변경될 수 있습니다.
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Personal toiletries: soap, shampoo, body wash, toothpaste, toothbrush, towel, hair brush (hair dryer personal preparation) Personal clothing: comfortable top clothes that go with training vest (t-shirt), spare clothes, sneakers (comfortable shoes), socks, personal water bottle, umbrella, hat, parasol Others: personal medicine, mosquito repellent', // 개인 세면도구 : 비누,샴푸, 바디워시, 치약, 칫솔, 수건, 머리빗 (헤어드라이기 개인 준비)개인 복장 : 수련복 조끼와 어울리는 편안한 윗옷 준비(티셔츠)여벌옷, 운동화(편한 신발), 양말, 개인 물병,우산, 모자, 양산기타 : 개인 상비약, 모기 기피제
      refundPolicy: [
        '100% refund 7 days before scheduled participation', // 참가 예정일 7일 전 100% 환불
        '70% refund 3 days before scheduled participation', // 참가 예정일 3일 전 70% 환불
        '50% refund 2 days before scheduled participation', // 참가 에정일 2일 전 : 50% 환불
        'No refund for 1 day before or same-day cancellation' // 참가 예정일 1일 전 또는 당일 환불 불가
      ],
      templeRules: [
        'When passing in front of the main hall or meeting monks, please put your hands together and bow.', // 법당 앞을 지나거나 스님을 만날 때는 합장하고 인사합니다.
        'At the temple, refrain from unnecessary speech (silence), live simply and slowly with a humble and caring heart in harmony.', // 절에서는 필요 없는 말을 하지 않으며(묵언), 단순하고 느리게, 겸손과 배려의 마음으로 조화롭게 생활합니다.
        'All times such as morning service and meals must be strictly observed, and actively participate when there is temple work.', // 예불, 공양 등 모든 시간을 엄수해야 하며, 운력이 있을 때는 적극 참여합니다.
        'Absolutely no external snacks, alcohol, smoking, TV or video viewing.' // 외부간식, 술, 담배, TV나 동영상 시청을 절대 금합니다.
      ]
    }
  },
  {
    id: '5',
    name: 'Daeseungsa Temple', // 대승사
    region: 'Mungyeong', // 문경
    address: '283 Daeseungsa-gil, Sanbuk-myeon, Mungyeong-si, Gyeongsangbuk-do', // 경상북도 문경시 산북면 대승사길 283
    latitude: 36.7498799,
    longitude: 128.2720622,
    areaCd: 35,
    sigunguCd: 7,
    imageUrl: require('../../assets/대승사.jpg'),
    basePrice: 70000,
    precautions: 'The temple is a space for practice. Please observe basic etiquette at the temple.', // 사찰은 수행의 공간입니다. 사찰에서의 기본 예절을 잘 지켜주십시오.
    description: 'Daeseungsa Temple is a thousand-year-old temple located in the deep mountain valley, a practice ground where the serene mountain landscape and Buddhist faith blend with tradition.', // 대승사는 깊은 산자락에 자리한 천년고찰로, 고즈넉한 산세와 불심이 깃든 전통이 어우러진 수행 도량입니다.
    availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
    programs: [],
    templestay: [
      { title: 'One-Day Experience', description: ' ', price: 30000, times: ['13:00~16:00'], type: 'One-Day Type' },
      { title: 'Learning Mind Practice Method through Meditation (Following the actual meditation method of Seonwon monks...) - Available for 5 or more people', description: 'A meditation learning program that follows the exact program of Daeseungsa Seonwon where monks\' footsteps remain', price: 80000, times: ['10:00~13:00'], type: 'Experience Type' },
      { title: 'Walking the Old Path of Sabul Mountain (四佛山)...', description: 'Program with tea conversation with monk, morning service, Yunpil-am, Myojeok-am, four-faced stone Buddha procession and rest', price: 60000, times: ['13:00~16:00'], type: 'Relaxation Type' }
    ],
    // 템플스테이 상세 정보
    programDetails: {
      'One-Day Experience': { // 당일형 체험
        pricing: {
          adult: 30000,
          teenager: 20000,
          child: 10000,
          preschool: 10000
        },
        description: 'This is Daeseungsa\'s one-day experience program where you can experience the temple\'s atmosphere and culture simply.', // 대승사의 당일형 체험 프로그램으로, 사찰의 분위기와 문화를 간단하게 체험할 수 있습니다.
        additionalInfo: [
          'For one-day programs, no special preparation is required. Just bring a personal water bottle.' // 당일형 프로그램의 경우 별도의 준비물이 필요 없습니다. 개인 물병 정도 준비하시면 됩니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'Learning Mind Practice Method through Meditation (Following the actual meditation method of Seonwon monks...) - Available for 5 or more people': { // 참선으로 배우는 마음공부법(선원스님들의 실제 참선법을 따라서...) - 5명이상 신청시 가능
        pricing: {
          adult: 80000,
          teenager: 30000,
          child: 20000,
          preschool: 20000
        },
        description: 'Daeseungsa Temple Stay [Learning Mind Practice Method through Meditation] program is a meditation learning program that follows the exact program of Daeseungsa Seonwon where such monks\' footsteps remain, and I hope you will awaken to your own existence.', // 대승사 템플스테이 [참선으로 배우는 마음공부법] 프로그램은 이런 스님들의 발자취가 서린 대승사 선원의 프로그램을 그대로 따라 진행하는 참선 배우기 프로그램으로, 나의 존재를 깨쳐 보시기 바랍니다.
        additionalInfo: [
          
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'Walking the Old Path of Sabul Mountain (四佛山)...': { // 사불산(四佛山)... 옛길을 걷다
        pricing: {
          adult: 60000,
          teenager: 50000,
          child: 40000,
          preschool: 30000
        },
        description: 'At Daeseungsa Temple, which embraces the great nature at 600m above sea level, you will experience the daily life of monks together, and this is a program where participants can take voluntary rest for body and mind through tea conversation with monks, morning service, Yunpil-am, Myojeok-am, four-faced stone Buddha procession and rest.', // 해발 600고지의 대자연을 품고 있는 대승사에서 스님들의 일상을 같이 체험하며, 스님과의 차담, 예불, 윤필암, 묘적암,사면석불 포행과 쉼이 있는 프로그램으로 참가자들이 자율적으로 몸과 마음의 휴식을 취하는 프로그램입니다.
        additionalInfo: [
          'Maximum period is 4 nights 5 days, and additional extension is possible.', // 최대 기간은 4박 5일이며, 추가 연장도 가능합니다.
          'Due to reservation guidance and room preparation, reservations are accepted 3 days before participation.', // 예약안내 방사 준비등의 이유로 예약은 참가 3일전에 예약을 받습니다.
          'Program guidance: Temple guidance, morning service, and tea conversation with monks can be participated in voluntarily, and program schedule may change or be cancelled due to temple schedule.' // 프로그램안내 프로그램은 사찰안내 예불 스님 차담은 자율적으로 참여 할 수 있으며, 사찰 내 일정으로 프로그램 일정 변경 취소될수 있습니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Personal toiletries (towel, toothbrush), spare clothes (outerwear), sneakers (comfortable shoes), socks, personal (insulated) water bottle *For winter participation: winter gear and ice cleats, etc.', // 개인 세면도구(수건, 칫솔), 여벌 옷(외투), 운동화(편한 신발), 양말, 개인(보온) 물병 *겨울 참가시 : 방한용품 및 아이젠 등
      refundPolicy: [
        '90% refund 3 days before scheduled participation', // 참가 예정일 3일 전 90% 환불
        '70% refund 2-1 days before scheduled participation', // 참가 예정일 2 ~1일 전 70% 환불
        '50% refund for same-day cancellation', // 참가 당일 취소 50% 환불합니다.
        'However, 100% refund for cancellations due to climate change and natural disasters making travel and use impossible' // 단, 기후변화 및 천재지변으로 이동 및 이용이 불가한 경우 100% 환불
      ],
      templeRules: [
        'Please refrain from alcohol and smoking within the temple, and speak quietly.', // 사찰 내에선 술 담배를 삼가하여 주시고, 말은 조용히 합니다.
        'Do not be late for meal times and do not leave food (silence)', // 공양시간에는 늦지 않으며 음식을 남기지 않습니다 (묵언)
        'After meals, wash dishes directly and clean up', // 공양 후 그릇은 직접 씻어서 정리합니다
        'Actively participate when there is temple work' // 사중에 울력이 있을 때는 적극 참여합니다
      ]
    }
  },
  {
    id: '6',
    name: 'Bogyeongsa Temple', // 보경사
    region: 'Pohang', // 포항
    address: '523 Bogyeong-ro, Songra-myeon, Buk-gu, Pohang-si, Gyeongsangbuk-do', // 경상북도 포항시 북구 송라면 보경로 523
    latitude: 36.252279,
    longitude: 129.317949,
    areaCd: 35,
    sigunguCd: 4,
    imageUrl: require('../../assets/보경사.jpg'),
    basePrice: 65000,
    precautions: 'Located overlooking the East Sea, the wind can be strong.', // 동해바다를 바라보는 위치에 있어 바람이 강할 수 있습니다.
    description: 'This is an ancient temple with a thousand years of Buddhist faith and natural beauty, located on the slopes of Naeyeonsan Mountain where strange rocks and waterfalls come together.', // 기암과 폭포가 어우러진 내연산 자락에 자리한, 천년의 불심과 자연의 아름다움을 간직한 고찰입니다.
    availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
    programs: [],
    templestay: [
      { title: '[2025 One-Day] One-Day Temple Stay', description: 'Explore Bogyeongsa Temple together with Naeyeonsan\'s 12 waterfalls', price: 70000, times: ['14:00~17:00'], type: 'One-Day Type' },
      { title: '[2025 Experience] With you, with me', description: 'I am truly happy to welcome you to Bogyeongsa experiential temple stay where you will look back on our seasonal connections and become grateful.', price: 70000, times: ['14:00~17:00'], type: 'Experience Type' },
      { title: '[2025 Relaxation] The Moment I Return to Myself', description: 'This place that purifies your soul is Bogyeongsa relaxation temple stay.', price: 70000, times: ['14:00~17:00'], type: 'Relaxation Type' }
    ],
    // 템플스테이 상세 정보
    programDetails: {
      '[2025 One-Day] One-Day Temple Stay': { // [2025 당일형] 당일 템플스테이
        pricing: {
          adult: 20000,
          teenager: 10000,
          child: 5000,
          preschool: 5000
        },
        description: 'Explore Bogyeongsa Temple together with Naeyeonsan\'s 12 waterfalls. As a one-day program, you can experience the beauty of Bogyeongsa in a short time.', // 내연산 12폭포와 함께 보경사를 둘러보다. 당일형 프로그램으로 짧은 시간 동안 보경사의 아름다움을 체험할 수 있습니다.
        additionalInfo: [
          'One-day programs have no special preparation requirements.' // 당일형은 특별한 준비물이 없습니다.
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      '[2025 Experience] With you, with me': { // [2025 체험형] With you, with me
        pricing: {
          adult: 70000,
          teenager: 60000,
          child: 50000,
          preschool: 50000
        },
        description: 'I am truly happy to welcome you to Bogyeongsa experiential temple stay where you will look back on our seasonal connections and become grateful. Please spend precious time together.', // 우리의 시절인연을 되돌아보고 감사하게 될 보경사 체험형 템플스테이에 모시게 되어 참으로 기쁩니다. 함께하는 소중한 시간을 가져보세요.
        additionalInfo: [
          'Room assignment: Men and women are separate.' // 방사배정 : 남녀 따로 입니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      '[2025 Relaxation] The Moment I Return to Myself': { // [2025 휴식형] 나에게로 돌아오는 순간
        pricing: {
          adult: 70000,
          teenager: 60000,
          child: 50000,
          preschool: 40000
        },
        description: 'You don\'t have to read about this place\'s history and important cultural properties. Just come in. Within the scope of following temple rules, feel that your true self is the truth. This place that purifies your soul is Bogyeongsa relaxation temple stay.', // 당신은 이곳의 역사와 중요문화재를 읽지 않아도 됩니다. 그냥 들어오세요.사찰의 청규를 지키는 범위안에서 당신의 그대로가 진리인것을 느껴보세요. 당신의 영혼을 맑게하는 이곳은 보경사 휴식형 템플스테이 입니다.
        additionalInfo: [
          'Room assignment: Men and women are separate.' // 방사배정 : 남녀 따로 입니다.
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Personal toiletries (towel, toothbrush, toothpaste, etc.), comfortable shoes (sneakers), personal water bottle (tumbler)', // 개인 세면도구(수건, 치솔,치약등), 편한신발(운동화), 개인물병(템블러)
      refundPolicy: [
        '100% 5 days before', // 5일 전 100%
        '50% 2 days before', // 2일 전 50%
        'No refund on the day' // 당일 환불 불가
      ],
      templeRules: [
        'The temple is a space for monks\' practice. When meeting monks within the temple grounds, please do \'hands together and bow\'.', // 사찰은　스님들의　수행공간입니다．경내에서　스님을　만날때에는 ＇합장　반배＇를　합니다．
        'Drinking, smoking, and bringing in food are prohibited.', // 음주，흡연　및　음식물　반입을　금지　합니다．
        'Use items as if they were your own, put them back in their place after use, and use rooms and bathrooms cleanly for others.' // 사용한　물건은　내　것처럼　아끼고，사용한　후　제자리에　두고， 방사와　화장실은　다른　사람을　위해　깨끗히　사용합니다．
      ]
    }
  },
  {
    id: '7',
    name: 'Seonbonsa Temple', // 선본사
    region: 'Gyeongsan', // 경산
    address: '587 Daehan-ri, Wachon-myeon, Gyeongsan-si, Gyeongsangbuk-do', // 경상북도 경산시 와촌면 대한리 587
    latitude: 35.9874776,
    longitude: 128.7387497,
    areaCd: 35,
    sigunguCd: 5,
    imageUrl: require('../../assets/선본사.jpg'),
    basePrice: 60000,
    precautions: 'As this is a traditional temple, special attention must be paid to cultural property protection.', // 전통사찰로 문화재 보호에 각별히 유의해야 합니다.
    description: 'This is a historic temple located on the slopes of Palgongsan Mountain, continuing the tradition of meditation and practice in the majestic nature.', // 팔공산 기슭에 자리한 유서 깊은 도량으로, 장엄한 자연 속에서 선과 정진의 전통을 이어가는 사찰입니다.
    availableTimes: ['09:30 - 11:00', '13:30 - 15:00'],
    programs: [],
    templestay: [
      { title: 'Taking a Moment to Rest in Gatbawi Buddha\'s Embrace - Experience Voucher Available', description: 'This is Seonbonsa Temple (Gatbawi) temple stay, the number one prayer temple in Palgongsan Mountain.', price: 50000, times: ['09:30~12:30'], type: 'Relaxation Type' },
      { title: 'Seon Meditation Temple Stay (Small Groups, Groups) - One-Day Type', description: 'Choose 1 program from: 108 wish prayer bead making, eco-bag making, lotus lantern making, wish bracelet making', price: 30000, times: ['13:30~16:30'], type: 'One-Day Type' },
      { title: 'Seon Meditation and Diamond Sutra 3 Times Recitation - Tea Conversation with Monk', description: 'This is a one-day temple stay held at Gatbawi in Palgongsan Seonbonsa Temple.', price: 25000, times: ['09:30~12:30'], type: 'One-Day Type' },
      { title: 'Thank you for listening to Gatbawi Buddha\'s wishes^^ - Weekday Experience Type', description: 'A program to recharge energy to rediscover my precious dreams that I had forgotten in daily life and work hard to achieve them', price: 60000, times: ['09:30~12:30'], type: 'Experience Type' },
      { title: 'Seon Meditation Temple Stay - Thank you for listening to Gatbawi Buddha\'s wishes^^ - Fri, Sat, Sun Healing (Experience Voucher Available)', description: 'A program to recharge energy to rediscover my precious dreams and work hard to achieve them. Experience vouchers can be used.', price: 60000, times: ['09:30~12:30'], type: 'Experience Type' },
      { title: 'Our Wishes (One-Day Type)', description: 'Temple guidance and Gatbawi Buddha worship plus 1 other program selection', price: 30000, times: ['09:30~12:30'], type: 'One-Day Type' },
    ],
    // 템플스테이 상세 정보
    programDetails: {
      'Taking a Moment to Rest in Gatbawi Buddha\'s Embrace - Experience Voucher Available': { // 갓바위 부처님 품에서 잠시 쉬어가기 - 체험권 가능
        pricing: {
          adult: 50000,
          teenager: 50000,
          child: 50000,
          preschool: 30000
        },
        description: 'This is Seonbonsa Temple (Gatbawi) temple stay, the number one prayer temple in Palgongsan Mountain. It\'s a healing program where you escape from busy and tired daily life and take a moment to rest in Gatbawi Buddha\'s embrace, emptying your mind.', // 전국 일등 기도도량 팔공산 선본사 (갓바위) 템플스테이 입니다. 바쁘고 지친 일상을 벗어나 갓바위 부처님 품 속에서 잠시 쉬며 마음을 비우는 힐링 프로그램입니다.
        additionalInfo: [
          'From Seonbonsa Temple Stay Center to Gatbawi Buddha, you need to walk for about 30-40 minutes, so people with leg problems should prepare hiking sticks which will be helpful.', // 선본사 템플스테이관에서 갓바위 부처님께 가시려면 30-40분 정도 걸으셔야 하오니 다리가 불편하신 분들은 등산용 스틱을 준비해 오시면 도움이 됩니다.
          'Additional programs (108 wish prayer bead making, lotus lantern making, etc.) are operated, so please apply in the special requests when making reservations.', // 추가프로그램(108 소원 염주꿰기, 연꽃등 만들기 등)을 운영하오니 예약시 전달 사항에 신청 해주세요.
          'Maximum reservation is 2 nights 3 days, and whether to extend the period is decided after phone consultation.', // 예약은 최대 2박 3일이며 기간 연장여부는 전화상담 후 결정됩니다.
          'Men and women are assigned to separate rooms, and when there are many participants, you may share a room with others. Please understand.', // 남 녀 방사 구분하며 참가자가 많을시 다른분과 같은방 사용하실 수 있음에 양해 부탁드립니다.
          'As this is a traditional temple, please pay special attention to cultural property protection.' // 전통사찰로 문화재 보호에 각별히 유의해 주세요.
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Seon Meditation Temple Stay (Small Groups, Groups) - One-Day Type': { // 선명상 템플스테이(소모임 , 단체) - 당일형
        pricing: {
          adult: 30000,
          teenager: 30000,
          child: 30000,
          preschool: 30000
        },
        description: 'Among the programs below, temple guidance and Gatbawi Buddha worship are basic, and you can choose 1 other program. Programs: Choose 1 from 108 wish prayer bead making, eco-bag making, lotus lantern making, wish bracelet making, then proceed with tea conversation and meditation.', // 아래 프로그램중 사찰안내와 갓바위 부처님 참배는 기본이며 그외 1개 프로그램 선택가능 합니다 . 프로그램 :108 소원염주만들기, 에코백 만들기 , 연꽃등 만들기,소원 팔찌만들기 중 1개 프로그램 선택 후 차담과 명상을 진행 합니다.
        additionalInfo: [
          'One-day programs require 5 or more people to operate, so if there are not enough people, it may be cancelled. Please understand.', // 당일형은 5명 이상 되어야 운영되오니 인원이 모자랄시 취소 될수 있음에 양해 부탁드립니다.
          'Small groups or group applications are possible, and programs and times can be customized according to the nature of the group.', // 소모임 또는 단체 신청 가능하며, 프로그램, 시간은 모임 성격에따라 맞춤진행 가능합니다.
          'People using personal vehicles, please leave a text message with the vehicle number (example: 00 ga 1234) along with the participant\'s name and participation date.' // 개인차량을 이용하시는 분들은 차량번호 (예시: 00 가 1234 )를 참가자 성함과 참여날짜도 함께 문자 남겨주세요.
        ],
        reservationNotice: 'Reservations available until 5 days before program start date' // 프로그램 시작일 5일 전까지 예약가능
      },
      'Seon Meditation and Diamond Sutra 3 Times Recitation - Tea Conversation with Monk': { // 선명상과 금강경 3독 독송 - 스님과 차담
        pricing: {
          adult: 25000,
          teenager: 25000,
          child: 25000,
          preschool: 25000
        },
        description: 'This is a one-day temple stay held at Gatbawi in Palgongsan Seonbonsa Temple. The experience fee for 1 session is 25,000 won, and it is held for 4 consecutive weeks, so I guide you to make 4 reservations and attend.', // 팔공산 선본사 갓바위에서 진행하는 당일형 템플스테이입니다. 1회 체험비는 25,000원이며 4주 연속으로 진행하오니 4회 예약 참석 하시기를 안내드립니다.
        additionalInfo: [
          'Individual or small group applications are possible, and program timing can be adjusted.' // 개인 또는소모임신청 가능하며, 프로그램 진행 시간은 조정 가능합니다.
        ],
        reservationNotice: 'Reservations available until 5 days before program start date' // 프로그램 시작일 5일 전까지 예약가능
      },
      'Thank you for listening to Gatbawi Buddha\'s wishes^^ - Weekday Experience Type': { // 갓바위 부처님 소원을 들어주셔서 감사해요^^ - 주중체험형
        pricing: {
          adult: 60000,
          teenager: 60000,
          child: 40000,
          preschool: 30000
        },
        description: 'This is a program to recharge energy to rediscover my precious dreams that I had forgotten in daily life and work hard to achieve them through Buddhist cultural experience, tea conversation with monks, meditation, 108 prayer bead making, and other programs.', // 불교문화체험, 스님과의 차담, 명상, 108 염주꿰기 등의 프로그램으로 일상 에서 잊고 살았던 소중한 내 꿈을 다시 알아차리고, 꿈을 이루기 위해 열심히 노 력할 수 있는 에너지를 충전하는 프로그램입니다.
        additionalInfo: [
          'From Seonbonsa Temple Stay Center to Gatbawi Buddha, you need to walk for about 30-40 minutes, so people with leg problems should prepare hiking sticks which will be helpful.', // 선본사 템플스테이관에서 갓바위 부처님께 가시려면 30-40분 정도 걸으셔야 하오니 다리가 불편하신 분들은 등산용 스틱을 준비해 오시면 도움이 됩니다.
          'Additional programs (108 wish prayer bead making, lotus lantern making, etc.) are operated, so please apply in the special requests when making reservations.', // 추가프로그램(108 소원 염주꿰기, 연꽃등 만들기 등)을 운영하오니 예약시 전달 사항에 신청 해주세요.
          'Maximum reservation is 2 nights 3 days, and whether to extend the period is decided after phone consultation.', // 예약은 최대 2박 3일이며 기간 연장여부는 전화상담 후 결정됩니다.
          'Men and women are assigned to separate rooms, and when there are many participants, you may share a room with others. Please understand.', // 남 녀 방사 구분하며 참가자가 많을시 다른분과 같은방 사용하실 수 있음에 양해 부탁드립니다.
          'As this is a traditional temple, please pay special attention to cultural property protection.' // 전통사찰로 문화재 보호에 각별히 유의해 주세요.
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Seon Meditation Temple Stay - Thank you for listening to Gatbawi Buddha\'s wishes^^ - Fri, Sat, Sun Healing (Experience Voucher Available)': { // 선 명상 템플스테이 - 갓바위 부처님 소원을 들어 주셔서 감사해요^^ - 금,토,일 힐링 (체험권 사용 가능)
        pricing: {
          adult: 60000,
          teenager: 60000,
          child: 40000,
          preschool: 30000
        },
        description: 'This is a program to recharge energy to rediscover my precious dreams and work hard to achieve them. Experience vouchers can be used.', // 소중한 내 꿈을 다시 알아차리고, 꿈을 이루기 위해 열심히 노력할 수 있는 에너지를 충전하는 프로그램입니다. 체험권 사용이 가능합니다.
        additionalInfo: [
          'From Seonbonsa Temple Stay Center to Gatbawi Buddha, you need to walk for about 30-40 minutes, so people with leg problems should prepare hiking sticks which will be helpful.', // 선본사 템플스테이관에서 갓바위 부처님께 가시려면 30-40분 정도 걸으셔야 하오니 다리가 불편하신 분들은 등산용 스틱을 준비해 오시면 도움이 됩니다.
          'Additional programs (108 wish prayer bead making, lotus lantern making, etc.) are operated, so please apply in the special requests when making reservations.', // 추가프로그램(108 소원 염주꿰기, 연꽃등 만들기 등)을 운영하오니 예약시 전달 사항에 신청 해주세요.
          'Maximum reservation is 2 nights 3 days, and whether to extend the period is decided after phone consultation.', // 예약은 최대 2박 3일이며 기간 연장여부는 전화상담 후 결정됩니다.
          'Men and women are assigned to separate rooms, and when there are many participants, you may share a room with others. Please understand.', // 남 녀 방사 구분하며 참가자가 많을시 다른분과 같은방 사용하실 수 있음에 양해 부탁드립니다.
          'As this is a traditional temple, please pay special attention to cultural property protection.' // 전통사찰로 문화재 보호에 각별히 유의해 주세요.
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Our Wishes (One-Day Type)': { // 우리의 소원은 (당일형)
        pricing: {
          adult: 30000,
          teenager: 30000,
          child: 30000,
          preschool: 30000
        },
        description: 'We operate one-day temple stay at Gatbawi in Palgongsan Seonbonsa Temple. Among the programs below, you can choose temple guidance and Gatbawi Buddha worship plus 1 other program.', // 팔공산 선본사 갓바위에서 당일형 템플스테이를 운영합니다. 아래 프로그램중 사찰안내와 갓바위 부처님 참배와 그 외 1개 프로그램 선택 가능하십니다.
        additionalInfo: [
          'One-day programs require 5 or more people to operate, so if there are not enough people, it may be cancelled. Please understand.', // 당일형은 5명 이상 되어야 운영되오니 인원이 모자랄시 취소 될수 있음에 양해 부탁드립니다.
          'Small groups or group applications are possible, and programs and times can be customized according to the nature of the group.', // 소모임 또는 단체 신청 가능하며, 프로그램, 시간은 모임 성격에따라 맞춤진행 가능합니다.
          'People using personal vehicles, please leave a text message with the vehicle number (example: 00 ga 1234) along with the participant\'s name and participation date.' // 개인차량을 이용하시는 분들은 차량번호 (예시: 00 가 1234 )를 참가자 성함과 참여날짜도 함께 문자 남겨주세요.
        ],
        reservationNotice: 'Reservations available until 7 days before program start date' // 프로그램 시작일 7일 전까지 예약가능
      }
    },
    facilities: ['주차장', '화장실', '휴게실', '템플스테이관', '갓바위'],
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
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Sneakers or hiking shoes, bottled water, hiking stick, umbrella or raincoat in case of rain',
      refundPolicy: [
        '100% refund or 1-time postponement available 7 days before scheduled participation',
        '50% refund or 1-time postponement available 3 days before scheduled participation',
        'Same-day refunds are not available. Please understand.',
        'However, in case of natural disasters, participation date postponement or refund will be provided.'
      ],
      templeRules: [
        'When meeting monks, greet them with hands together and bow.',
        'No drinking or smoking within the temple grounds.',
        'Refrain from unnecessary speech within the temple.',
        'When walking within the temple, the basic posture is hands clasped together.'
      ]
    },
  },
  {
    id: '8',
    name: 'Simwonsa Temple', // 심원사
    region: 'Seongju', // 성주
    address: '17-56 Gayasan Botanical Garden-gil, Suryun-myeon, Seongju-gun, Gyeongsangbuk-do', // 경상북도 성주군 수륜면 가야산식물원길 17-56
    latitude: 35.8004858,
    longitude: 128.135791,
    areaCd: 35,
    sigunguCd: 6,
    imageUrl: require('../../assets/심원사.jpg'),
    basePrice: 60000,
    precautions: 'As this is a traditional temple, special attention must be paid to cultural property protection.', // 전통사찰로 문화재 보호에 각별히 유의해야 합니다.
    description: 'This is a serene mountain temple located deep in the Gayasan foothills, a meditation ground where clear valleys and lush forests come together', // 가야산 자락 깊숙이 자리한 고즈넉한 산사로, 맑은 계곡과 울창한 숲이 어우러진 명상의 도량입니다
    availableTimes: ['09:30 - 11:00', '13:30 - 15:00'],
    programs: [],
    templestay: [
      { title: '365 Turtle Recharging Station (Always Available Relaxation Type)', description: 'Leave behind tired daily life and difficult yesterday, and spend one night at Simwonsa Temple in great nature!!', price: 60000, times: ['09:30~12:30'], type: 'Relaxation Type' },
      { title: 'Summer Special Temple Stay (Haha Hoho 1 Night 2 Days)', description: 'Forget the heat in the sound of birds in Gayasan\'s green forest and valley water, and the wind brushing your clothes on summer nights, and fill your heart with happiness~~', price: 80000, times: ['13:30~16:30'], type: 'Experience Type' },
      { title: '<Regional Linkage Program> Children\'s Art Playground, Gayasan History and Mythology Theme Museum Linked Temple Stay (One-Day Type)', description: 'Time to taste temple food, drink tea, and hear about Simwonsa\'s history and curiosities from the temple stay monk', price: 10000, times: ['09:30~12:30'], type: 'One-Day Type' },
      { title: 'Seon Meditation Temple Stay [Resting Mind Hill]', description: 'A mind cultivated for three days is a treasure of a thousand years, and wealth coveted for a hundred years is dust of one morning', price: 80000, times: ['09:30~12:30'], type: 'Experience Type' },
      { title: 'Rest Well and Go (Autumn Colors Dyeing the Heart Heart 1 Night 2 Days)', description: 'At Simwonsa Temple Stay, I sow seeds of comfort on the journey for myself.', price: 80000, times: ['09:30~12:30'], type: 'Experience Type' },
    ],
    // 템플스테이 상세 정보
    programDetails: {
      '365 Turtle Recharging Station (Always Available Relaxation Type)': { // 365 거북이충전소(상시 휴식형)
        pricing: {
          adult: 60000,
          teenager: 50000,
          child: 40000,
          preschool: 30000
        },
        description: 'Leave behind tired daily life and difficult yesterday, and spend one night at Simwonsa Temple in great nature!! This is a self-directed temple stay where you gain strength to return to daily life while watching the morning sunrise.', // 지친 일상, 힘들었던 어제를 뒤로 하고 대자연 속 심원사에서 하룻밤!! 아침 일출을 보며 다시 일상으로 돌아갈 수 있는 힘을 얻어가는 자율형 템플스테이입니다.
        additionalInfo: [
          'Bathroom in each room', // 각 방 욕실
          'Teapot and tea set', // 티포트와 다구 세트
          'Mini bookshelf in the room', // 방사 안 미니 서가
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      },
      'Summer Special Temple Stay (Haha Hoho 1 Night 2 Days)': { // 여름특별템플스테이(하하호호 1박2일)
        pricing: {
          adult: 80000,
          teenager: 65000,
          child: 50000,
          preschool: 40000
        },
        description: 'Forget the heat in the sound of birds in Gayasan\'s green forest and valley water, and the wind brushing your clothes on summer nights, and fill your heart with happiness~~ This is a summer special program.', // 가야산 푸른 숲의 새소리와 계곡물 소리, 여름 밤 옷깃을 스치는 바람에 더위는 잊고 마음엔 행복 가득~~ 여름 특별 프로그램입니다.
                additionalInfo: [
            
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      },
      '<Regional Linkage Program> Children\'s Art Playground, Gayasan History and Mythology Theme Museum Linked Temple Stay (One-Day Type)': { // <지역연계프로그램> 아이들의 예술놀이터, 가야산역사신화테마관 연계 템플스테이(당일형)
        pricing: {
          adult: 10000,
          teenager: 10000,
          child: 10000,
          preschool: 10000
        },
        description: 'Time to taste temple food, drink tea, and hear about Simwonsa\'s history and curiosities from the temple stay monk. This is an educational program to do with children.', // 사찰음식을 맛보고 차를 마시며 심원사의 역사와 궁금증을 템플스테이 스님께 듣는 시간. 아이들과 함께하는 교육적인 프로그램입니다.
        additionalInfo: [
                  'One-day programs require no preparation. Just bring a personal water bottle.' // 당일형 프로그램은 준비물이 필요하지 않습니다. 개인물병 정도 준비하시면 됩니다.
        ],
        reservationNotice: 'Reservations available until 1 day before program start date' // 프로그램 시작일 1일 전까지 예약가능
      },
      'Seon Meditation Temple Stay [Resting Mind Hill]': { // 선명상 템플스테이[쉬어가는 마음오름]
        pricing: {
          adult: 80000,
          teenager: 65000,
          child: 50000,
          preschool: 40000
        },
        description: 'A mind cultivated for three days is a treasure of a thousand years, and wealth coveted for a hundred years is dust of one morning. Put aside daily worries and concerns for a while, and spend precious time creating treasures of the mind together with Gayasan\'s nature!! Simwonsa Seon Meditation Temple Stay', // 사흘 닦은 마음은 천년의 보배요 백년동안 탐한 재물은 하루 아침의 티끼이다. 일상의 근심, 걱정은 잠시 내려놓고 가야산의 자연과 더불어 마음의 보배를 만들어 가는 소중한 시간!! 심원사 선명상 템플스테이
                additionalInfo: [
  
        ],
        reservationNotice: 'Reservations available until 3 days before program start date' // 프로그램 시작일 3일 전까지 예약가능
      },
      'Rest Well and Go (Autumn Colors Dyeing the Heart Heart 1 Night 2 Days)': { // 푹 쉬다 가이소(단풍에 물드는 心心 1박2일)
        pricing: {
          adult: 80000,
          teenager: 65000,
          child: 50000,
          preschool: 40000
        },
        description: 'At Simwonsa Temple Stay, I sow seeds of comfort on the journey for myself. Please enjoy healing time while appreciating the beautiful scenery of Gayasan Mountain with autumn colors.', // 심원사 템플스테이에서 나를 위한 여행길에 위로의 씨앗을 뿌려봅니다. 단풍이 물드는 가야산의 아름다운 풍경을 감상하며 힐링 시간을 가져보세요.
        additionalInfo: [
          
        ],
        reservationNotice: 'Reservations available until 2 days before program start date' // 프로그램 시작일 2일 전까지 예약가능
      }
    },
    // 공통 상세 정보
    commonDetails: {
      preparationItems: 'Soap and toothpaste are prepared in the accommodation. Please prepare personal toiletries and towels. Vests and pants are provided. Please prepare comfortable clothes for activities. Personal water bottle or tumbler, comfortable shoes, hat, spare clothes',
      refundPolicy: [
        'Cancellation 5 days before participation - 100% refund',
        'Cancellation 3 days before participation - 70% refund',
        'Cancellation 2-1 days before participation - participation postponement',
        'Same-day cancellation not allowed'
      ],
      templeRules: [
        'Drinking, smoking, and loud behavior are prohibited within the temple.',
        'Please observe the temple community\'s schedule and time for morning service, meals, etc.',
        'When meeting monks within the temple, please greet them with hands together and bow.',
        'The soundproofing in the accommodation is not good. Please lower your voice with a caring heart.'
      ]
    }
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
 * 당일형 프로그램을 가진 사찰들만 가져오기 (골굴사 제외)
 */
export const getTemplesWithOneDayPrograms = (): Temple[] => {
  return TEMPLES_DATA.filter(temple => 
    temple.id !== '2' && // 골굴사 제외
    temple.templestay?.some(program => program.type === 'One-Day Type')
  );
};

/**
 * 특정 지역의 당일형 프로그램을 가진 사찰들만 가져오기 (골굴사 제외)
 */
export const getTemplesWithOneDayProgramsByRegion = (region: string): Temple[] => {
  return TEMPLES_DATA.filter(temple => 
    temple.id !== '2' && // 골굴사 제외
    temple.region === region && 
    temple.templestay?.some(program => program.type === 'One-Day Type')
  );
}; 