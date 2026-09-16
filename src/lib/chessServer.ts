import { io, Socket } from 'socket.io-client';

export const CHESS_SERVER = 'https://sandip-chess-backend.onrender.com';

export type TimeControl = { initial: number; increment: number; label: string };
export type RoomState = { roomCode: string; color: 'w' | 'b'; fen: string; clocks: { w: number; b: number }; turn: 'w' | 'b'; timeControl: TimeControl };

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) socket = io(CHESS_SERVER, { transports: ['websocket'], autoConnect: true });
  return socket;
}

export function disconnectChessServer() {
  socket?.disconnect();
  socket = null;
}

export function createRoom(userId: string, timeControl: TimeControl) {
  return new Promise<RoomState>((resolve, reject) => {
    const s = getSocket();
    s.emit('create-room', { userId, timeControl }, (result: any) => {
      if (!result?.success) return reject(new Error(result?.error || 'Could not create room'));
      resolve({ roomCode: result.roomCode, color: result.color, fen: result.fen, clocks: { w: result.clocks.w, b: result.clocks.b }, turn: result.turn, timeControl: result.timeControl });
    });
  });
}

export function joinRoom(roomCode: string) {
  return new Promise<RoomState>((resolve, reject) => {
    const s = getSocket();
    s.emit('join-room', roomCode, (result: any) => {
      if (!result?.success) return reject(new Error(result?.error || 'Could not join room'));
      resolve({ roomCode: result.roomCode, color: result.color, fen: result.fen, clocks: { w: result.clocks.w, b: result.clocks.b }, turn: result.turn, timeControl: result.timeControl });
    });
  });
}
