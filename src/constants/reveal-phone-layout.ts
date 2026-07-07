import { ONBOARDING_BACK_HEIGHT_PX, ONBOARDING_BACK_TOP_PX } from '@/constants/onboarding-funnel-motion';

/** Shared phone block — good news (step 3) + real data (step 4). */
export const REVEAL_PHONE_BLOCK_TOP_PX =
  ONBOARDING_BACK_TOP_PX + ONBOARDING_BACK_HEIGHT_PX + 17;
export const REVEAL_PHONE_BLOCK_HEIGHT_PX = 237.509;
export const REVEAL_PHONE_CLUSTER_WIDTH_PX = 211.62;

/** Good news — gap below phone block before headline cluster. */
export const REVEAL_GOOD_NEWS_LOWER_TOP_PX =
  REVEAL_PHONE_BLOCK_TOP_PX + REVEAL_PHONE_BLOCK_HEIGHT_PX + 15;
