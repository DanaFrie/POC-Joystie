/**
 * Ball game room API (Firebase callables).
 */
import type { GameOnboardingContext } from '@/constants/game';
import { getFunctionsInstance } from '@/lib/firebase';
import {
  completeGameOnboardingLocal,
  createGameRoomLocal,
  endOnboardingGameRoomLocal,
  joinGameRoomLocal,
} from '@/lib/game/localRooms';
import { httpsCallable } from 'firebase/functions';
import { isLocalDevHost } from '@/utils/is-local-dev-host';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('GameAPI');

export interface CreateGameRoomInput extends GameOnboardingContext {}

export interface CreateGameRoomResult {
  roomId: string;
  joinCode: string;
  winScore: number;
}

export interface JoinGameRoomInput {
  roomId: string;
  joinCode: string;
}

export interface JoinGameRoomResult {
  roomId: string;
  phase: string;
  winScore: number;
}

export interface GetGameOnboardingStatusInput {
  roomId: string;
}

export interface GetGameOnboardingStatusResult {
  roomId: string;
  phase: string;
  score: number;
  winScore: number;
  gameOutcome: 'won' | 'missed' | null;
  onboardingAdvanced: boolean;
  canAdvanceOnboarding: boolean;
  role: 'parent' | 'child';
}

export interface CompleteGameOnboardingInput {
  roomId: string;
}

export interface CompleteGameOnboardingResult {
  roomId: string;
  onboardingAdvanced: boolean;
  winScore: number;
  score: number;
}

export interface EndOnboardingGameRoomInput {
  roomId: string;
}

export interface EndOnboardingGameRoomResult {
  roomId: string;
  removed: boolean;
  alreadyGone?: boolean;
  winScore?: number;
  score?: number;
}

export async function createGameRoom(
  input: CreateGameRoomInput = {}
): Promise<CreateGameRoomResult> {
  if (isLocalDevHost()) {
    logger.log('createGameRoom (local RTDB)', input);
    return createGameRoomLocal(input);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<CreateGameRoomInput, CreateGameRoomResult>(
    functions,
    'createGameRoom'
  );
  logger.log('createGameRoom', input);
  const { data } = await fn(input);
  return data;
}

export async function joinGameRoom(input: JoinGameRoomInput): Promise<JoinGameRoomResult> {
  if (isLocalDevHost()) {
    logger.log('joinGameRoom (local RTDB)', { roomId: input.roomId });
    return joinGameRoomLocal(input.roomId, input.joinCode);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<JoinGameRoomInput, JoinGameRoomResult>(functions, 'joinGameRoom');
  logger.log('joinGameRoom', { roomId: input.roomId });
  const { data } = await fn(input);
  return data;
}

export async function getGameOnboardingStatus(
  input: GetGameOnboardingStatusInput
): Promise<GetGameOnboardingStatusResult> {
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<GetGameOnboardingStatusInput, GetGameOnboardingStatusResult>(
    functions,
    'getGameOnboardingStatus'
  );
  logger.log('getGameOnboardingStatus', input);
  const { data } = await fn(input);
  return data;
}

export async function completeGameOnboarding(
  input: CompleteGameOnboardingInput
): Promise<CompleteGameOnboardingResult> {
  if (isLocalDevHost()) {
    logger.log('completeGameOnboarding (local RTDB)', input);
    return completeGameOnboardingLocal(input.roomId);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<CompleteGameOnboardingInput, CompleteGameOnboardingResult>(
    functions,
    'completeGameOnboarding'
  );
  logger.log('completeGameOnboarding', input);
  const { data } = await fn(input);
  return data;
}

export async function endOnboardingGameRoom(
  input: EndOnboardingGameRoomInput
): Promise<EndOnboardingGameRoomResult> {
  if (isLocalDevHost()) {
    logger.log('endOnboardingGameRoom (local RTDB)', input);
    return endOnboardingGameRoomLocal(input.roomId);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<EndOnboardingGameRoomInput, EndOnboardingGameRoomResult>(
    functions,
    'endOnboardingGameRoom'
  );
  logger.log('endOnboardingGameRoom', input);
  const { data } = await fn(input);
  return data;
}
