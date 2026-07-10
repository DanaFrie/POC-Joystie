import type {
  CardcomCreateLowProfileRequest,
  CardcomCreateLowProfileResponse,
} from './types';

const CARDCOM_API_BASE = 'https://secure.cardcom.solutions/api/v11';

export interface CardcomCredentials {
  terminalNumber: number;
  apiName: string;
  apiPassword?: string;
}

/**
 * Create hosted payment page (iframe/redirect) for trial — token capture.
 * Verify result with GetLpResult after webhook (required by Cardcom).
 */
export async function createLowProfileDeal(
  creds: CardcomCredentials,
  body: Omit<CardcomCreateLowProfileRequest, 'TerminalNumber' | 'ApiName' | 'ApiPassword'>
): Promise<CardcomCreateLowProfileResponse> {
  const payload: CardcomCreateLowProfileRequest = {
    TerminalNumber: creds.terminalNumber,
    ApiName: creds.apiName,
    ApiPassword: creds.apiPassword,
    ...body,
  };

  const res = await fetch(`${CARDCOM_API_BASE}/LowProfile/Create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: CardcomCreateLowProfileResponse;
  try {
    data = JSON.parse(text) as CardcomCreateLowProfileResponse;
  } catch {
    throw new Error(`Cardcom invalid JSON: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(`Cardcom HTTP ${res.status}: ${data.Description || text}`);
  }
  if (data.ResponseCode !== 0 || !data.Url) {
    throw new Error(`Cardcom error ${data.ResponseCode}: ${data.Description || 'no Url'}`);
  }
  return data;
}

export async function getLowProfileResult(
  creds: CardcomCredentials,
  lowProfileId: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${CARDCOM_API_BASE}/LowProfile/GetLpResult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      TerminalNumber: creds.terminalNumber,
      ApiName: creds.apiName,
      ApiPassword: creds.apiPassword,
      LowProfileId: lowProfileId,
    }),
  });
  const text = await res.text();
  return JSON.parse(text) as Record<string, unknown>;
}
