import {
  generateDynamicEntries,
  generateStaticEntries,
  setOtherSettings,
} from 'dummy/index';
import { Fyo, t } from 'fyo';
import { Doc } from 'fyo/model/doc';
import { range, sample } from 'lodash';
import { DateTime } from 'luxon';
import { ModelNameEnum } from 'models/types';
import setupInstance, { setupInstanceExisting } from 'src/setup/setupInstance';
import { getFiscalYear } from 'utils/misc';

type Notifier = (stage: string, percent: number) => void;

interface BusinessDetails {
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

export async function setupLocalInstance(
  dbPath: string,
  details: BusinessDetails,
  fyo: Fyo,
  years = 1,
  baseCount = 1000,
  notifier?: Notifier
) {
  await fyo.purgeCache();
  notifier?.(fyo.t`Setting Up Instance`, -1);

  const options = {
    id: details.id,
    logo: null,
    companyName: details.name,
    country: details.country,
    fullname: details.contactName,
    email: details.contactEmail,
    bankName: 'Supreme Bank',
    currency: details.currency,
    fiscalYearStart: DateTime.fromISO(details.fiscalYearStart).toISODate(),
    fiscalYearEnd: DateTime.fromISO(details.fiscalYearEnd).toISODate(),
    chartOfAccounts: details.chartOfAccounts,
  };
  console.log('Setting up...');

  await setupInstanceExisting(dbPath, options, fyo);
  fyo.store.skipTelemetryLogging = true;

  console.log('here:');

  years = Math.floor(years);
  notifier?.(fyo.t`Creating Items and Parties`, -1);
  // await generateStaticEntries(fyo);
  // await generateDynamicEntries(fyo, years, baseCount, notifier);
  await setOtherSettings(fyo);

  const instanceId = (await fyo.getValue(
    ModelNameEnum.SystemSettings,
    'instanceId'
  )) as string;
  await fyo.singles.SystemSettings?.setAndSync('hideGetStarted', true);

  fyo.store.skipTelemetryLogging = false;
  return { companyName: options.companyName, instanceId };
}
