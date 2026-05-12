import type { Server } from "socket.io";
import { buildAnalytics } from "./service.js";

let io: Server | undefined;

export function setRealtimeServer(server: Server) {
  io = server;
}

export async function emitPollAnalytics(pollId: string) {
  if (!io) {
    return;
  }

  const analytics = await buildAnalytics(pollId);
  io.to(`poll:${pollId}`).emit("poll:analytics", analytics);
}
