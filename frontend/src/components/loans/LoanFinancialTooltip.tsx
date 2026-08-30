import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface LoanFinancialTooltipProps {
  term: string;
  children: React.ReactNode;
}

const tooltips: Record<string, string> = {
  'Outstanding to Receive': 'Total amount (principal + interest) still expected from this loan',
  'Outstanding to Pay': 'Total amount (principal + interest) still owed for this loan',
  'Interest Earned': 'Interest received from LEND loans only',
  'Interest Paid': 'Interest paid to BORROW loans only',
  'Interest Accrued': 'Interest earned/owed according to the loan terms',
  'Outstanding Interest': 'Accrued interest not yet paid',
  'Principal Outstanding': 'Original loan amount not yet repaid',
  'Principal Received': 'Amount received from this LEND loan',
  'Principal Paid': 'Amount paid towards this BORROW loan',
  'Next Due Date': 'When the next payment is due',
  'Total Outstanding': 'Principal + Interest still owed/to be received',
};

export function LoanFinancialTooltip({
  term,
  children,
}: LoanFinancialTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltip = tooltips[term];

  if (!tooltip) return <>{children}</>;

  return (
    <div className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        aria-label={`Learn more about ${term}`}
      >
        <HelpCircle className="size-3.5" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-lg dark:border-white/10 dark:bg-[#111815] dark:text-slate-300">
          {tooltip}
          <div className="absolute -top-1 left-4 size-2 rotate-45 border-t border-l border-slate-200 bg-white dark:border-white/10 dark:bg-[#111815]" />
        </div>
      )}
    </div>
  );
}
