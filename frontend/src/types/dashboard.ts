export interface DashboardSummary {
  totalLent: number;
  totalBorrowed: number;
  outstandingToReceive: number;
  outstandingToPay: number;
  interestEarned: number;
  interestPaid: number;
  netInterest: number;
  netAssets: number;
  netWorth: number;
  activeLoans: number;
  closedLoans: number;
}

export interface DashboardSummaryQuery {
  dashboardSummary: DashboardSummary;
}
