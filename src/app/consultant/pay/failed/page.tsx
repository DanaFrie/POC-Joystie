import { ConsultantPayFailedView } from '@/components/consultant/ConsultantPayFailedView';

/**
 * Bare failure URL. Retry lives on /consultant/pay/failed/private and /group
 * so a missing offer never opens the ₪260 checkout.
 */
export default function ConsultantPayFailedPage() {
  return <ConsultantPayFailedView offer={null} />;
}
