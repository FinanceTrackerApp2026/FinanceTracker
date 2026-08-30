import { gql } from '@apollo/client';

export const MONTHLY_CASH_FLOW_QUERY = gql`
  query MonthlyCashFlow($year: Int!, $month: Int!) {
    monthlyCashFlow(year: $year, month: $month) {
      year
      month
      totalReceived
      totalPaid
      principalReceived
      interestReceived
      principalPaid
      interestPaid
      netCashFlow
    }
  }
`;
