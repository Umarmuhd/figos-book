export interface Business {
  id: string;
  name: string;
  currency: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
}

export interface CreateBusinessPayload {
  name: string;
  country: string;
  currency: string;
  chartOfAccounts: string;
  industry: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
}
