import { ConsultantPaySuccessStatus } from '@/components/consultant/ConsultantPaySuccessStatus';

type PageProps = { params: { orderId: string } };

/** CardCom success redirect. Celebrates only after the order is paid. */
export default function ConsultantPaySuccessOrderPage({ params }: PageProps) {
  return <ConsultantPaySuccessStatus orderId={params.orderId} />;
}
