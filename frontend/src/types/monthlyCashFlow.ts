export interface MonthlyCashFlow {
  year: number;
  month: number;
  totalReceived: number;
  totalPaid: number;
  principalReceived: number;
  interestReceived: number;
  principalPaid: number;
  interestPaid: number;
  netCashFlow: number;
}

export interface MonthlyCashFlowQuery {
  monthlyCashFlow: MonthlyCashFlow;
}

export interface MonthlyCashFlowVariables {
  year: number;
  month: number;
}
