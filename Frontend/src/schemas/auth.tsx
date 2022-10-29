import { z } from "zod";

/**
 * Internal request out types
 */
export type AuthForm = {
  username: string,
  password: string,
};

/**
 * Reply Schemas
 */
export const LoginReplySchema = z.object({
  success: z.boolean(),
});

export type LoginReply = z.infer<typeof LoginReplySchema>;

export const RegisterReplySchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type RegisterReply = z.infer<typeof RegisterReplySchema>;

export const SocketEventMessageSchema = z.object({
  EventIdentifier: z.string(),
  Payload: z.any(),
});

export type SocketEventMessage = z.infer<typeof SocketEventMessageSchema>;