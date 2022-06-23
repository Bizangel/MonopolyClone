import { z } from "zod";

export const LoginReplySchema = z.object({
  sucess: z.boolean(),
});

export type LoginReply = z.infer<typeof LoginReplySchema>;

export const SocketEventMessageSchema = z.object({
  EventIdentifier: z.string(),
  Payload: z.string(),
});

export type SocketEventMessage = z.infer<typeof SocketEventMessageSchema>;