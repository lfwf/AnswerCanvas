import type { ChatResult } from "@/features/notes/note-schema";
export type TurnStatus = "submitting" | "success" | "error";
export interface ChatTurn { id: string; requestId: number; question: string; answer?: string; result?: ChatResult; status: TurnStatus; error?: { message: string; retryable: boolean }; attempt: number; createdAt: number; }
export interface ChatState { turns: ChatTurn[]; selectedMessageId?: string; persistenceWarning?: string; }
