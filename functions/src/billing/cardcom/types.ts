/** Cardcom LowProfile API v11 — see docs/CARDCOM-SETUP.md */

/** J2 = card validity only; J5 = reserve amount (requires approval to charge later). */
export interface CardcomAdvancedDefinition {
  JValidateType?: 2 | 5;
}

export interface CardcomCreateLowProfileRequest {
  TerminalNumber: number;
  ApiName: string;
  ApiPassword?: string;
  Operation: 'CreateTokenOnly' | 'BillAndCreateToken' | 'ChargeOnly';
  ReturnValue: string;
  Amount: number;
  ProductName?: string;
  SuccessRedirectUrl: string;
  FailedRedirectUrl: string;
  WebHookUrl: string;
  Language?: string;
  ISOCoinId?: number;
  AdvancedDefinition?: CardcomAdvancedDefinition;
}

export interface CardcomCreateLowProfileResponse {
  ResponseCode: number;
  Description?: string;
  LowProfileId?: string;
  Url?: string;
}

export interface CardcomWebhookPayload {
  ResponseCode?: number;
  Description?: string;
  LowProfileId?: string;
  ReturnValue?: string;
  Token?: string;
  [key: string]: unknown;
}

export type SubscriptionPlan = 'annual' | 'monthly';
