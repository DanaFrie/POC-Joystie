import { ConsultantPayFailedView } from '@/components/consultant/ConsultantPayFailedView';
import type { ConsultantOfferId } from '@/constants/consultant-marketing';

type PageProps = { params: { offer: string } };

function parseOffer(raw: string): ConsultantOfferId | null {
  return raw === 'private' || raw === 'group' ? raw : null;
}

/** CardCom failure redirect. Retry matches the offer in the path. */
export default function ConsultantPayFailedOfferPage({ params }: PageProps) {
  return <ConsultantPayFailedView offer={parseOffer(params.offer)} />;
}
