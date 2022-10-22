import { z } from "zod";

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
  Payload: z.string(),
});

export type SocketEventMessage = z.infer<typeof SocketEventMessageSchema>;

export const AuthFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type AuthForm = z.infer<typeof AuthFormSchema>;