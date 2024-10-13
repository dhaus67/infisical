import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import {
  faArrowUpRightFromSquare,
  faCheck,
  faCopy,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import {
  Button,
  FormControl,
  IconButton,
  Input,
  Select,
  SelectItem,
  TextArea
} from "@app/components/v2";
import { useTimedReset, useToggle } from "@app/hooks";
import { useCreateUserSecret, useUpdateUserSecret } from "@app/hooks/api/userSecrets";
import { TUserSecret, UserSecretType } from "@app/hooks/api/userSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

const webSecretSchema = z.object({
  url: z.string().url().min(1, { message: "URL is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

const creditCardSecretSchema = z.object({
  cardNumber: z.string().min(1, { message: "Card number is required" }),
  expirationDate: z.string().min(1, { message: "Expiration date is required" }),
  cvv: z.string().min(1, { message: "CVV is required" })
});

const secureNoteSecretSchema = z.object({
  content: z.string().min(1, { message: "Content is required" })
});

const userSecretSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.nativeEnum(UserSecretType),
  data: z.discriminatedUnion("type", [
    z.object({ type: z.literal(UserSecretType.WebSecret), ...webSecretSchema.shape }),
    z.object({ type: z.literal(UserSecretType.CreditCardSecret), ...creditCardSecretSchema.shape }),
    z.object({ type: z.literal(UserSecretType.SecureNoteSecret), ...secureNoteSecretSchema.shape })
  ])
});

export type FormData = z.infer<typeof userSecretSchema>;

type InputProps = {
  value: string;
  type: string;
  isDisabled: boolean;
  textArea?: boolean;
  textAreaValue?: string;
  webLink?: string;
};

const InputViewMode = ({
  value,
  type,
  isDisabled,
  textArea,
  textAreaValue,
  webLink
}: InputProps) => {
  const [, isCopyingSecret, setCopyTextSecret] = useTimedReset<string>({
    initialState: "Copy to clipboard"
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(textAreaValue || value);
    setCopyTextSecret("copied");
  };

  return (
    <div className="flex items-center">
      {textArea && textArea ? (
        <TextArea
          value={value}
          isDisabled
          className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
        />
      ) : (
        <Input value={value} type={type} isDisabled={isDisabled} />
      )}
      <div className="ml-2 flex">
        <IconButton ariaLabel="copy" onClick={handleCopy} colorSchema="secondary" className="ml-2">
          <FontAwesomeIcon icon={isCopyingSecret ? faCheck : faCopy} />
        </IconButton>
        {webLink && (
          <Link href={webLink} passHref>
            <a target="_blank" rel="noopener noreferrer">
              <IconButton ariaLabel="web-link" colorSchema="secondary" className="ml-2">
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </IconButton>
            </a>
          </Link>
        )}
      </div>
    </div>
  );
};

export enum FormMode {
  Create = "create",
  View = "view",
  Update = "update"
}

type Props = {
  mode: FormMode;
  initialData?: TUserSecret;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["createUserSecret" | "updateUserSecret"]>
  ) => void;
};
export const UserSecretForm = ({ handlePopUpClose, mode, initialData }: Props) => {
  const [secretType, setSecretType] = useState<UserSecretType>(
    initialData?.type || UserSecretType.WebSecret
  );
  const [isRevealed, setIsRevealed] = useToggle();

  const createUserSecret = useCreateUserSecret();
  const updateUserSecret = useUpdateUserSecret();

  const isCreateMode = mode === FormMode.Create;
  const isViewMode = mode === FormMode.View;
  const isUpdateMode = mode === FormMode.Update;

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(userSecretSchema),
    defaultValues: initialData || {
      name: "",
      type: UserSecretType.WebSecret,
      data: {
        type: UserSecretType.WebSecret,
        url: "",
        username: "",
        password: ""
      }
    }
  });

  const onTypeChange = (value: UserSecretType) => {
    setSecretType(value);
    reset((formValues) => {
      const commonFields = {
        name: formValues.name,
        type: value
      };

      switch (value) {
        case UserSecretType.WebSecret:
          return {
            ...commonFields,
            data: { type: value, url: "", username: "", password: "" }
          };
        case UserSecretType.CreditCardSecret:
          return {
            ...commonFields,
            data: { type: value, cardNumber: "", expirationDate: "", cvv: "" }
          };
        case UserSecretType.SecureNoteSecret:
          return {
            ...commonFields,
            data: { type: value, content: "" }
          };
        default:
          return {
            ...commonFields,
            data: { type: UserSecretType.WebSecret, url: "", username: "", password: "" }
          };
      }
    });
  };

  const onFormSubmit = async ({ name, data }: FormData) => {
    try {
      if (isCreateMode) {
        await createUserSecret.mutateAsync({
          name,
          data
        });
        createNotification({
          text: `Successfully created user secret "${name}"`,
          type: "success"
        });
      } else if (isUpdateMode && initialData) {
        await updateUserSecret.mutateAsync({
          id: initialData.id,
          name,
          data
        });
        createNotification({
          text: `Successfully updated user secret "${name}"`,
          type: "success"
        });
      }
      reset();
      handlePopUpClose(mode === FormMode.Create ? "createUserSecret" : "updateUserSecret");
    } catch (error) {
      console.error(error);
      createNotification({
        text: `Failed to ${mode} user secret "${name}"`,
        type: "error"
      });
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit((data) => {
        return onFormSubmit(data);
      })}
    >
      {isViewMode && (
        <div className="flex justify-end">
          <Button
            variant="outline_bg"
            className="p-1"
            leftIcon={<FontAwesomeIcon icon={isRevealed ? faEyeSlash : faEye} />}
            onClick={() => setIsRevealed.toggle()}
          >
            {isRevealed ? "Hide Values" : "Reveal Values"}
          </Button>
        </div>
      )}
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label="Name"
            isError={Boolean(error)}
            errorText={error?.message}
            isRequired={!isViewMode}
          >
            <Input {...field} placeholder="Secret Name" type="text" isDisabled={isViewMode} />
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl
            label="Type"
            isError={Boolean(error)}
            errorText={error?.message}
            isRequired={!isViewMode}
          >
            <Select
              {...field}
              onValueChange={(value) => {
                onChange(value);
                onTypeChange(value as UserSecretType);
              }}
              className="w-full"
              isDisabled={isViewMode}
            >
              <SelectItem value={UserSecretType.WebSecret}>Web Secret</SelectItem>
              <SelectItem value={UserSecretType.CreditCardSecret}>Credit Card Secret</SelectItem>
              <SelectItem value={UserSecretType.SecureNoteSecret}>Secure Note Secret</SelectItem>
            </Select>
          </FormControl>
        )}
      />
      {secretType === UserSecretType.WebSecret && (
        <>
          <Controller
            control={control}
            disabled={isViewMode}
            name="data.url"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="URL"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!isViewMode}
              >
                {isViewMode ? (
                  <InputViewMode value={field.value} type="text" isDisabled webLink={field.value} />
                ) : (
                  <Input {...field} placeholder="https://example.com" type="url" />
                )}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            disabled={isViewMode}
            name="data.username"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Username"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!isViewMode}
              >
                {isViewMode ? (
                  <InputViewMode value={field.value} type="text" isDisabled />
                ) : (
                  <Input {...field} placeholder="Username" type="text" />
                )}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            disabled={isViewMode}
            name="data.password"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Password"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!isViewMode}
              >
                {isViewMode ? (
                  <InputViewMode
                    value={field.value}
                    type={isRevealed ? "text" : "password"}
                    isDisabled
                  />
                ) : (
                  <Input {...field} placeholder="Password" type="password" />
                )}
              </FormControl>
            )}
          />
        </>
      )}
      {secretType === UserSecretType.CreditCardSecret && (
        <>
          <Controller
            control={control}
            disabled={isViewMode}
            name="data.cardNumber"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Card Number"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!isViewMode}
              >
                {isViewMode ? (
                  <InputViewMode
                    value={field.value}
                    type={isRevealed ? "text" : "password"}
                    isDisabled
                  />
                ) : (
                  <Input {...field} placeholder="1234567890123456" type="password" />
                )}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            disabled={isViewMode}
            name="data.expirationDate"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Expiration Date"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!isViewMode}
              >
                {isViewMode ? (
                  <InputViewMode value={field.value} type="text" isDisabled />
                ) : (
                  <Input {...field} placeholder="MM/YY" type="text" />
                )}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            disabled={isViewMode}
            name="data.cvv"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="CVV"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired={!isViewMode}
              >
                {isViewMode ? (
                  <InputViewMode
                    value={field.value}
                    type={isRevealed ? "text" : "password"}
                    isDisabled
                  />
                ) : (
                  <Input {...field} placeholder="123" type="password" />
                )}
              </FormControl>
            )}
          />
        </>
      )}
      {secretType === UserSecretType.SecureNoteSecret && (
        <Controller
          control={control}
          name="data.content"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Content"
              isError={Boolean(error)}
              errorText={error?.message}
              isRequired={!isViewMode}
            >
              {isViewMode ? (
                <InputViewMode
                  type="text"
                  value={!isRevealed ? "********" : field.value}
                  textArea
                  textAreaValue={field.value}
                  isDisabled
                />
              ) : (
                <TextArea
                  placeholder="Enter your secure note content..."
                  {...field}
                  className="h-40 min-h-[70px] w-full rounded-md border border-mineshaft-600 bg-mineshaft-900 py-1.5 px-2 text-bunker-300 outline-none transition-all placeholder:text-mineshaft-400 hover:border-primary-400/30 focus:border-primary-400/50 group-hover:mr-2"
                />
              )}
            </FormControl>
          )}
        />
      )}
      {!isViewMode && (
        <Button
          className="mt-4"
          size="sm"
          type="submit"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {isCreateMode ? "Create" : "Update"} User Secret
        </Button>
      )}
    </form>
  );
};
