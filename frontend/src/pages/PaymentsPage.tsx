import { ArrowLeftRight } from 'lucide-react';

import { PagePlaceholder } from '../components/PagePlaceholder';

export function PaymentsPage() {
  return (
    <PagePlaceholder
      title="Payments"
      description="Your payment activity workspace will appear here."
      icon={ArrowLeftRight}
    />
  );
}
