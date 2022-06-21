import { z } from "zod";

export const GameTicketSchema = z.object({
  isValidTicket: z.boolean(),
  ticketHolderUsername: z.string(),
  ticketSecret: z.string(),
});

export type GameTicket = z.infer<typeof GameTicketSchema>;

export const SocketEventMessageSchema = z.object({
  EventIdentifier: z.string(),
  Payload: z.string(),
  AuthHeader: z.string(),
});

export type SocketEventMessage = z.infer<typeof SocketEventMessageSchema>;