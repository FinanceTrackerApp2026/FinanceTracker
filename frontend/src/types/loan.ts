export interface Loan {
  id: string;
  contactId: number;
  loanReference: string;
  loanType: string;
  interestType: string;
  principalAmount: number;
  outstandingPrincipal: number;
  interestRate: number;
  interestFrequency: string;
  loanDate: string;
  dueDay: number | null;
  loanTenure: number;
  tenureUnit: string;
  hasSecurity: boolean;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoansByContactQuery {
  loansByContact: Loan[];
}

export interface LoansByContactVariables {
  contactId: number;
}

export interface LoansQuery {
  loans: Loan[];
}

export interface LoanQuery {
  loan: Loan | null;
}

export interface LoanQueryVariables {
  id: string;
}

export interface LoanSummaryDetails {
  principalPaid: number;
  interestPaid: number;
  outstanding: number;
  status: string;
}

export interface LoanSummaryQuery {
  loanSummary: LoanSummaryDetails | null;
}

export interface LoanSummaryVariables {
  id: string;
}

export interface LedgerEntry {
  paymentDate: string;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  outstanding: number;
  description: string;
}

export interface LoanLedgerQuery {
  loanLedger: LedgerEntry[];
}

export interface LoanLedgerVariables {
  id: string;
}

export interface LoanFormValues {
  contactId: string;
  loanReference: string;
  loanType: string;
  interestType: string;
  principalAmount: string;
  interestRate: string;
  interestFrequency: string;
  loanDate: string;
  dueDay: string;
  loanTenure: string;
  tenureUnit: string;
  hasSecurity: boolean;
  notes: string;
}

export interface NewLoanInput {
  contactId: number;
  loanReference: string;
  loanType: string;
  interestType: string;
  principalAmount: number;
  interestRate: number;
  interestFrequency: string;
  loanDate: string;
  dueDay?: number;
  loanTenure: number;
  tenureUnit: string;
  hasSecurity: boolean;
  notes?: string;
}

export type UpdateLoanInput = Omit<
  NewLoanInput,
  'contactId' | 'loanReference' | 'loanType'
>;

export interface CreateLoanMutation {
  createLoan: Loan;
}

export interface CreateLoanVariables {
  input: NewLoanInput;
}

export interface UpdateLoanMutation {
  updateLoan: Loan;
}

export interface UpdateLoanVariables {
  id: number;
  input: UpdateLoanInput;
}

export interface Payment {
  id: string;
  loanId: number;
  paymentDate: string;
  paymentAmount: number;
  paymentType: string;
  paymentMethod: string | null;
  transactionReference: string | null;
  notes: string | null;
}

export interface PaymentFormValues {
  paymentDate: string;
  paymentAmount: string;
  paymentType: string;
  paymentMethod: string;
  transactionReference: string;
  notes: string;
}

export interface NewPaymentInput {
  loanId: number;
  paymentDate: string;
  paymentAmount: number;
  paymentType: string;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
}

export interface CreatePaymentMutation {
  createPayment: Payment;
}

export interface CreatePaymentVariables {
  input: NewPaymentInput;
}

export interface UpdatePaymentMutation {
  updatePayment: Payment;
}

export interface UpdatePaymentVariables {
  id: string;
  input: NewPaymentInput;
}

export interface DeletePaymentMutation {
  deletePayment: boolean;
}

export interface DeletePaymentVariables {
  id: string;
}

export interface PaymentsByLoanQuery {
  paymentsByLoan: Payment[];
}

export interface PaymentsByLoanVariables {
  loanId: number;
}
