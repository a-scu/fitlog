import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";

export const SWIPER_CONFIG = {
  // "fast" obliga al sistema a detenerse rápidamente en el siguiente "snap"
  decelerationRate: "fast",
  disableIntervalMomentum: true,
  snapToAlignment: "start" as const,
  showsHorizontalScrollIndicator: false,
  scrollEventThrottle: 16,
  pagingEnabled: false,
  snapToInterval: SCREEN_WIDTH,
};
