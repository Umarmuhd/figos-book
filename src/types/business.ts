export interface Business {
  id: string;
  name: string;
  currency: string;
  country: string;
  chartOfAccounts: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  createdAt: string;
  updatedAt: string;
  accounts: object[];
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

export interface Account {
  id: string;
  name: string;
  accountType: string | null;
  rootType: string | null;
  isGroup: boolean;
  parentAccountId: string | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}
