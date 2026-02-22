export type CallStatus = "idle" | "connecting" | "active" | "error";

export interface AvatarState {
  status: CallStatus;
  stream: MediaStream | null;
  error: string | null;
}
