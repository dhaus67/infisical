import { TUserSecretsUpdate } from "@app/db/schemas/user-secrets";

import { TKmsServiceFactory } from "../kms/kms-service";
import { KmsDataKey } from "../kms/kms-types";
import { TUserSecretDALFactory } from "./user-secret-dal";
import {
  dbResultToUserSecret,
  insertDocFromCreateDTO,
  isCreditCardSecret,
  isSecureNoteSecret,
  isWebSecret
} from "./user-secret-fns";
import {
  TCreateUserSecretDTO,
  TDeleteUserSecretDTO,
  TListUserSecretDTO,
  TUpdateUserSecretDTO,
  UserSecretTypeUnion
} from "./user-secret-types";

type TUserSecretServiceFactoryDep = {
  userSecretDAL: TUserSecretDALFactory;
  kmsService: Pick<TKmsServiceFactory, "createCipherPairWithDataKey">;
};

export type TUserSecretServiceFactory = ReturnType<typeof userSecretServiceFactory>;

export const userSecretServiceFactory = ({ userSecretDAL, kmsService }: TUserSecretServiceFactoryDep) => {
  const encryptData = async (orgId: string, data: string) => {
    const encryptor = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.Organization,
      orgId
    });
    const { cipherTextBlob } = encryptor.encryptor({ plainText: Buffer.from(data, "utf-8") });
    return cipherTextBlob.toString("base64");
  };

  const decryptData = async (orgId: string, encryptedData: string) => {
    const decryptor = await kmsService.createCipherPairWithDataKey({
      type: KmsDataKey.Organization,
      orgId
    });
    const buffer = decryptor.decryptor({ cipherTextBlob: Buffer.from(encryptedData, "base64") });
    return buffer.toString("utf-8");
  };

  const createUserSecret = async (createDto: TCreateUserSecretDTO) => {
    const insertDoc = insertDocFromCreateDTO(createDto);

    insertDoc.data = await encryptData(insertDoc.orgId, insertDoc.data);
    const userSecret = await userSecretDAL.create(insertDoc);

    userSecret.data = await decryptData(userSecret.orgId, userSecret.data);
    return dbResultToUserSecret(userSecret);
  };

  const listUserSecrets = async ({ orgId, actorId, offset, limit }: TListUserSecretDTO) => {
    const secrets = await userSecretDAL.find(
      {
        orgId,
        userId: actorId
      },
      { offset, limit, sort: [["name", "asc"]] }
    );
    const decryptedSecrets = await Promise.all(
      secrets.map(async (secret) => {
        const decryptedData = await decryptData(secret.orgId, secret.data);
        return dbResultToUserSecret({
          ...secret,
          data: decryptedData
        });
      })
    );

    const totalCount = await userSecretDAL.countAllUserSecrets({
      orgId
    });

    return { secrets: decryptedSecrets, totalCount };
  };

  const updateUserSecret = async ({ id, name, data }: TUpdateUserSecretDTO) => {
    const existingSecret = await userSecretDAL.findById(id);

    if (!existingSecret) {
      throw new Error("User secret not found");
    }

    const updateDoc: TUserSecretsUpdate = {
      ...existingSecret
    };
    if (name) {
      updateDoc.name = name;
    }

    if (data) {
      switch (true) {
        case isWebSecret(data):
          updateDoc.data = JSON.stringify({
            type: data.type,
            url: data.url,
            username: data.username,
            password: data.password
          });
          break;
        case isCreditCardSecret(data):
          updateDoc.data = JSON.stringify({
            type: data.type,
            cardNumber: data.cardNumber,
            expirationDate: data.expirationDate,
            cvv: data.cvv
          });
          break;
        case isSecureNoteSecret(data):
          updateDoc.data = JSON.stringify({
            type: data.type,
            content: data.content
          });
          break;
        default:
          throw new Error(`Unsupported secret type: ${(data as UserSecretTypeUnion).type}`);
      }

      updateDoc.data = await encryptData(existingSecret.orgId, updateDoc.data);
    }

    const updatedUserSecret = await userSecretDAL.updateById(id, updateDoc);

    updatedUserSecret.data = await decryptData(updatedUserSecret.orgId, updatedUserSecret.data);
    return dbResultToUserSecret(updatedUserSecret);
  };

  const deleteUserSecret = async ({ id }: TDeleteUserSecretDTO) => {
    const deletedUserSecret = await userSecretDAL.deleteById(id);
    return deletedUserSecret;
  };

  return {
    createUserSecret,
    listUserSecrets,
    updateUserSecret,
    deleteUserSecret
  };
};
