import { z } from "zod";

import { UserSecretsSchema } from "@app/db/schemas/user-secrets";
import { TOrgPermission } from "@app/lib/types";

export enum UserSecretType {
  WebSecret = "web",
  CreditCardSecret = "credit_card",
  SecureNoteSecret = "secure_note"
}

export type TCreateUserSecretDTO = {
  name: string;
  data: UserSecretTypeUnion;
} & TOrgPermission;

export type UserSecretWeb = {
  type: UserSecretType.WebSecret;
  url: string;
  username: string;
  password: string;
};

export type UserSecretCreditCard = {
  type: UserSecretType.CreditCardSecret;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
};

export type UserSecretSecureNote = {
  type: UserSecretType.SecureNoteSecret;
  content: string;
};

export type UserSecretTypeUnion = UserSecretWeb | UserSecretCreditCard | UserSecretSecureNote;

export type TListUserSecretDTO = {
  offset: number;
  limit: number;
} & TOrgPermission;

export type TUpdateUserSecretDTO = {
  id: string;
  name?: string;
  data?: UserSecretTypeUnion;
} & TOrgPermission;

export type TDeleteUserSecretDTO = {
  id: string;
};

const webSecretSchema = z.object({
  type: z.literal(UserSecretType.WebSecret),
  url: z.string().url("Invalid URL"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

const creditCardSecretSchema = z.object({
  type: z.literal(UserSecretType.CreditCardSecret),
  cardNumber: z.string().regex(/^\d{13,19}$/, "Invalid card number"),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiration date (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV")
});

const secureNoteSecretSchema = z.object({
  type: z.literal(UserSecretType.SecureNoteSecret),
  content: z.string().min(1, "Content is required")
});

export const CreateUserSecretSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required")
  })
  .extend({
    data: z.discriminatedUnion("type", [webSecretSchema, creditCardSecretSchema, secureNoteSecretSchema])
  });

export const UpdateUserSecretSchema = z
  .object({
    name: z.string().trim().optional()
  })
  .extend({
    data: z.discriminatedUnion("type", [webSecretSchema, creditCardSecretSchema, secureNoteSecretSchema]).optional()
  });

export const SanitizedUserSecretSchema = UserSecretsSchema.pick({
  id: true,
  name: true,
  type: true
}).extend({
  data: z.discriminatedUnion("type", [webSecretSchema, creditCardSecretSchema, secureNoteSecretSchema])
});
