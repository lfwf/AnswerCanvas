import type { ChatState, ChatTurn } from "./chat-types";
import type { ChatResult } from "@/features/notes/note-schema";
export type ChatAction =
  | { type: "hydrate"; state: ChatState }
  | { type: "submit"; turn: ChatTurn }
  | { type: "retry"; id: string; requestId: number }
  | { type: "success"; id: string; requestId: number; result: ChatResult }
  | { type: "error"; id: string; requestId: number; message: string; retryable: boolean }
  | { type: "select"; id: string }
  | { type: "persistence-warning"; message?: string };
export const initialChatState: ChatState = { turns: [] };
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  if (action.type === "hydrate") return action.state;
  if (action.type === "submit") return { ...state, turns: [...state.turns, action.turn], selectedMessageId: action.turn.id };
  if (action.type === "select") return state.turns.some((turn) => turn.id === action.id) ? { ...state, selectedMessageId: action.id } : state;
  if (action.type === "persistence-warning") return { ...state, persistenceWarning: action.message };
  if (action.type === "retry") return { ...state, turns: state.turns.map((turn) => turn.id === action.id ? { ...turn, requestId: action.requestId, status: "submitting", error: undefined, attempt: turn.attempt + 1 } : turn) };
  if (action.type === "success") return { ...state, turns: state.turns.map((turn) => turn.id === action.id && turn.requestId === action.requestId ? { ...turn, answer: action.result.answer, result: action.result, status: "success", error: undefined } : turn) };
  if (action.type === "error") return { ...state, turns: state.turns.map((turn) => turn.id === action.id && turn.requestId === action.requestId ? { ...turn, status: "error", error: { message: action.message, retryable: action.retryable } } : turn) };
  return state;
}
