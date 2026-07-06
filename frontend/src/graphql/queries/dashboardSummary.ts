import { gql } from '@apollo/client';

export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary {
    dashboardSummary {
      totalLent
      totalBorrowed
      outstandingToReceive
      outstandingToPay
      interestEarned
      interestPaid
      netInterest
      netAssets
      netWorth
      activeLoans
      closedLoans
    }
  }
`;
