import { Modal, ModalContent } from "@app/components/v2";
import { TUserSecret } from "@app/hooks/api/userSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { FormMode, UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["updateUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["updateUserSecret"]>,
    state?: boolean
  ) => void;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["createUserSecret" | "updateUserSecret"]>
  ) => void;
};

export const UpdateUserSecretModal = ({ popUp, handlePopUpToggle, handlePopUpClose }: Props) => {
  const userSecret = popUp?.updateUserSecret?.data as TUserSecret;

  return (
    <Modal
      isOpen={popUp?.updateUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("updateUserSecret", isOpen);
      }}
    >
      {userSecret && (
        <ModalContent title={`Update user secret "${userSecret.name}"`}>
          <UserSecretForm
            mode={FormMode.Update}
            handlePopUpClose={handlePopUpClose}
            initialData={userSecret}
          />
        </ModalContent>
      )}
    </Modal>
  );
};
