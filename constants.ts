import { FillingType, Upgrade } from './types';

export const COOK_SPEED_BASE = 0.5; // Progress per tick
export const PATIENCE_DECAY_BASE = 0.1; // Patience lost per tick
export const SPAWN_RATE_BASE = 200; // Ticks between spawns

export const PRICES: Record<FillingType, number> = {
  [FillingType.None]: 0,
  [FillingType.RedBean]: 500,
  [FillingType.Custard]: 700,
  [FillingType.Nutella]: 1000,
};

export const FILLING_COLORS: Record<FillingType, string> = {
  [FillingType.None]: 'bg-transparent',
  [FillingType.RedBean]: 'bg-red-900',
  [FillingType.Custard]: 'bg-yellow-300',
  [FillingType.Nutella]: 'bg-amber-950',
};

// Values are now translation keys
export const FILLING_NAMES: Record<FillingType, string> = {
  [FillingType.None]: 'filling_none',
  [FillingType.RedBean]: 'filling_redbean',
  [FillingType.Custard]: 'filling_custard',
  [FillingType.Nutella]: 'filling_nutella',
};

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'mold_count',
    name: 'upgrade_mold_name',
    description: 'upgrade_mold_desc',
    cost: 2000,
    level: 1,
    maxLevel: 3, // Adds 1 slot per level. Base is 3.
  },
  {
    id: 'cook_speed',
    name: 'upgrade_speed_name',
    description: 'upgrade_speed_desc',
    cost: 1500,
    level: 1,
    maxLevel: 5,
  },
  {
    id: 'marketing',
    name: 'upgrade_marketing_name',
    description: 'upgrade_marketing_desc',
    cost: 3000,
    level: 1,
    maxLevel: 3,
  }
];

export const GAME_TICK_MS = 50;
export const DAY_LENGTH_SECONDS = 60;

export const TRANSLATIONS = {
  en: {
    click_to_pour: "Click to\nPour Dough",
    add_filling: "Add Filling",
    raw: "Raw",
    perfect: "PERFECT!",
    burnt: "BURNT",
    serve: "SERVE!",
    waiting_customers: "Waiting for customers...",
    cook_to_stock: "Cook buns to stock up!",
    queue: "Queue",
    select_filling: "Select Filling",
    start_day: "Start Day",
    ready_msg: "Ready to bake some fish?",
    open_shop: "OPEN SHOP",
    day_complete: "Day {day} Complete!",
    stat_served: "Served",
    stat_burnt: "Burnt",
    stat_earnings: "Total Earnings",
    customer_review: "CUSTOMER REVIEW",
    reading_reviews: "Reading reviews...",
    next_day: "Go to Shop (Next Day)",
    upgrade_mold_name: "Extra Mold Slot",
    upgrade_mold_desc: "Cook more Bungeoppang at once.",
    upgrade_speed_name: "Better Burner",
    upgrade_speed_desc: "Cooks Bungeoppang faster.",
    upgrade_marketing_name: "Cute Signboard",
    upgrade_marketing_desc: "Attracts richer customers and increases patience.",
    filling_none: "None",
    filling_redbean: "Red Bean",
    filling_custard: "Custard",
    filling_nutella: "Nutella",
    event_rush: "RUSH",
    event_slow: "SLOW",
    event_rich: "RICH",
    event_normal: "NORMAL",
    default_event_title: "Sunny Day",
    default_event_desc: "Perfect weather for snacks!",
    default_review: "Great hustle today! The fish buns smelled delicious.",
    fallback_event_title: "A Quiet Day",
    fallback_event_desc: "Just another regular day at the stall.",
    day_label: "DAY",
    reputation: "Rep",
    max_level: "MAX",
    start_day_title: "Start Day {day}"
  },
  ko: {
    click_to_pour: "클릭하여\n반죽 붓기",
    add_filling: "속 넣기",
    raw: "익지 않음",
    perfect: "완벽해!",
    burnt: "탔음!",
    serve: "서빙!",
    waiting_customers: "손님을 기다리는 중...",
    cook_to_stock: "붕어빵을 미리 구워두세요!",
    queue: "대기열",
    select_filling: "속 재료 선택",
    start_day: "영업 시작",
    ready_msg: "붕어빵 구울 준비 되셨나요?",
    open_shop: "가게 오픈",
    day_complete: "{day}일차 영업 종료!",
    stat_served: "판매량",
    stat_burnt: "태운 것",
    stat_earnings: "총 수익",
    customer_review: "손님 리뷰",
    reading_reviews: "리뷰 읽는 중...",
    next_day: "상점으로 (다음 날)",
    upgrade_mold_name: "추가 붕어빵 틀",
    upgrade_mold_desc: "한 번에 더 많은 붕어빵을 구울 수 있습니다.",
    upgrade_speed_name: "고화력 버너",
    upgrade_speed_desc: "붕어빵이 더 빨리 익습니다.",
    upgrade_marketing_name: "귀여운 간판",
    upgrade_marketing_desc: "손님들의 인내심이 늘어나고 팁을 줄 확률이 높습니다.",
    filling_none: "없음",
    filling_redbean: "팥",
    filling_custard: "슈크림",
    filling_nutella: "누텔라",
    event_rush: "손님 폭주",
    event_slow: "한산함",
    event_rich: "부자 손님",
    event_normal: "평범함",
    default_event_title: "맑은 날",
    default_event_desc: "간식 먹기 딱 좋은 날씨네요!",
    default_review: "오늘 정말 고생 많았어요! 붕어빵 냄새가 정말 좋네요.",
    fallback_event_title: "조용한 하루",
    fallback_event_desc: "평범한 하루입니다.",
    day_label: "일차",
    reputation: "평판",
    max_level: "최대",
    start_day_title: "{day}일차 영업 시작"
  }
};
