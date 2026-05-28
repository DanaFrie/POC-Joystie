/**
 * Ball game room API (Firebase callables).
 */
import { getFunctionsInstance } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('GameAPI');

export interface CreateGameRoomInput {
  childId?: string;
  challengeId?: string;
  bondingInviteId?: string;
}

export interface CreateGameRoomResult {
  roomId: string;
  joinCode: string;
}

export interface JoinGameRoomInput {
  roomId: string;
  joinCode: string;
}

export interface JoinGameRoomResult {
  roomId: string;
  phase: string;
}

export async function createGameRoom(
  input: CreateGameRoomInput = {}
): Promise<CreateGameRoomResult> {
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
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<JoinGameRoomInput, JoinGameRoomResult>(functions, 'joinGameRoom');
  logger.log('joinGameRoom', { roomId: input.roomId });
  const { data } = await fn(input);
  return data;
}
