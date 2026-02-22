export type CallStatus = "idle" | "connected" | "active" | "error";

export interface AvatarState {
  status: CallStatus;
  stream: MediaStream | null;
  error: string | null;
}
