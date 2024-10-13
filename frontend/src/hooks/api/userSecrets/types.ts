export enum UserSecretType {
  WebSecret = "web",
  CreditCardSecret = "credit_card",
  SecureNoteSecret = "secure_note"
}

export type TUserSecretWeb = {
  type: UserSecretType.WebSecret;
  url: string;
  username: string;
  password: string;
};

export type TUserSecretCreditCard = {
  type: UserSecretType.CreditCardSecret;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
};

export type TUserSecretSecureNote = {
  type: UserSecretType.SecureNoteSecret;
  content: string;
};

export type UserSecretTypeUnion = TUserSecretWeb | TUserSecretCreditCard | TUserSecretSecureNote;

export type TUserSecret = {
  id: string;
  name: string;
  type: UserSecretType;
  data: UserSecretTypeUnion;
};

export type TCreateUserSecretDTO = {
  name: string;
  data: UserSecretTypeUnion;
};

export type TUpdateUserSecretDTO = {
  id: string;
  name?: string;
  data?: UserSecretTypeUnion;
};

export type TDeleteUserSecretDTO = {
  id: string;
};
