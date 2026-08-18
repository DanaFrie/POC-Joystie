import * as functions from 'firebase-functions/v2';
import { getServiceAccount } from '../serviceAccount';
import {
  handleGetChildShareCardAccess,
  type GetChildShareCardAccessRequest,
  type GetChildShareCardAccessResponse,
} from './shareCardAccess';

export type { GetChildShareCardAccessRequest, GetChildShareCardAccessResponse };

/**
 * Dedicated callable (may lack public Cloud Run invoker on some projects).
 * Prefer client calling saveChildShareCard with op:'getAccess' until IAM is set.
 */
export const getChildShareCardAccess = functions.https.onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
    memory: '256MiB',
    invoker: 'public',
    serviceAccount: getServiceAccount(),
  },
  async (request): Promise<GetChildShareCardAccessResponse> => {
    return handleGetChildShareCardAccess(
      request.auth?.uid,
      request.data as GetChildShareCardAccessRequest
    );
  }
);
