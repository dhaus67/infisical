import { z } from "zod";

import { TUserSecrets, TUserSecretsInsert } from "../../db/schemas/user-secrets";
import {
  SanitizedUserSecretSchema,
  TCreateUserSecretDTO,
  UserSecretCreditCard,
  UserSecretSecureNote,
  UserSecretType,
  UserSecretTypeUnion,
  UserSecretWeb
} from "./user-secret-types";

export const insertDocFromCreateDTO = ({
  name,
  data,
  actorOrgId,
  actorId
}: TCreateUserSecretDTO): TUserSecretsInsert => {
  const { type } = data;
  const insertDoc: TUserSecretsInsert = {
    name,
    type,
    // TODO: Needs permission validation.
    orgId: actorOrgId,
    userId: actorId,
    data: JSON.stringify(data)
  };
  return insertDoc;
};

export const isWebSecret = (data: Partial<UserSecretTypeUnion>): data is UserSecretWeb => {
  return data.type === UserSecretType.WebSecret;
};

export const isCreditCardSecret = (data: Partial<UserSecretTypeUnion>): data is UserSecretCreditCard => {
  return data.type === UserSecretType.CreditCardSecret;
};

export const isSecureNoteSecret = (data: Partial<UserSecretTypeUnion>): data is UserSecretSecureNote => {
  return data.type === UserSecretType.SecureNoteSecret;
};

export const dbResultToUserSecret = (dbResult: TUserSecrets): z.infer<typeof SanitizedUserSecretSchema> => {
  const parsedData = JSON.parse(dbResult.data) as Partial<UserSecretTypeUnion>;
  const baseSecret = {
    id: dbResult.id,
    name: dbResult.name,
    type: dbResult.type as UserSecretType,
    orgId: dbResult.orgId,
    userId: dbResult.userId
  };

  switch (true) {
    case isWebSecret(parsedData):
      return {
        ...baseSecret,
        data: {
          type: UserSecretType.WebSecret,
          url: parsedData.url,
          username: parsedData.username,
          password: parsedData.password
        }
      };
    case isCreditCardSecret(parsedData):
      return {
        ...baseSecret,
        data: {
          type: UserSecretType.CreditCardSecret,
          cardNumber: parsedData.cardNumber,
          expirationDate: parsedData.expirationDate,
          cvv: parsedData.cvv
        }
      };
    case isSecureNoteSecret(parsedData):
      return {
        ...baseSecret,
        data: {
          type: UserSecretType.SecureNoteSecret,
          content: parsedData.content
        }
      };
    default:
      throw new Error(`Unsupported secret type: ${dbResult.type}`);
  }
};
