'use client';

import { GAME_WIN_SCORE } from '@/constants/game';
import {
  BALL_DIAMETER,
  clampPaddleCenterX,
} from '@/lib/game/physics';
import {
  courtYForViewer,
  rivalPaddleWorldY,
} from '@/lib/game/courtView';
import type { GamePlayerRole, GameRoomState } from '@/types/game';

function paddleStyle(x: number, width: number, top: number, isLocal: boolean) {
  return {
    width: `${width * 100}%`,
    left: `${x * 100}%`,
    top: `${top * 100}%`,
    transform: 'translateX(-50%)',
    opacity: isLocal ? 1 : 0.85,
  } as const;
}

type GameArenaProps = {
  room: GameRoomState;
  role: GamePlayerRole;
  onPointerMove: (clientX: number, clientY: number, rect: DOMRect) => void;
};

export function GameArena({ room, role, onPointerMove }: GameArenaProps) {
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onPointerMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    onPointerMove(touch.clientX, touch.clientY, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-center font-semibold text-[#273143]">
        {room.score.shared} / {GAME_WIN_SCORE}
      </p>
      <div
        role="presentation"
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        className="relative w-full aspect-square max-w-md mx-auto bg-[#E6F19A] rounded-[18px] border-2 border-[#273143] cursor-crosshair touch-none"
      >
        <div
          className={`absolute h-3 -mt-1.5 rounded-full ${
            role === 'child' ? 'bg-[#00E7A2] ring-2 ring-[#273143]' : 'bg-[#1f2937]'
          }`}
          style={paddleStyle(
            clampPaddleCenterX(room.paddles.childX, room.paddles.width),
            room.paddles.width,
            courtYForViewer(rivalPaddleWorldY('parent'), role),
            role === 'child'
          )}
        />
        <div
          className={`absolute h-3 -mt-1.5 rounded-full ${
            role === 'parent' ? 'bg-[#00E7A2] ring-2 ring-[#273143]' : 'bg-[#1f2937]'
          }`}
          style={paddleStyle(
            clampPaddleCenterX(room.paddles.parentX, room.paddles.width),
            room.paddles.width,
            courtYForViewer(rivalPaddleWorldY('child'), role),
            role === 'parent'
          )}
        />
        <div
          className="absolute rounded-full bg-[#273143] border-2 border-white shadow-md transition-[left,top] duration-75 ease-linear"
          style={{
            width: `${BALL_DIAMETER * 100}%`,
            height: `${BALL_DIAMETER * 100}%`,
            marginLeft: `-${(BALL_DIAMETER * 100) / 2}%`,
            marginTop: `-${(BALL_DIAMETER * 100) / 2}%`,
            left: `${room.ball.x * 100}%`,
            top: `${courtYForViewer(room.ball.y, role) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
