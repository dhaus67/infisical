import { Modal, ModalContent } from "@app/components/v2";
import { TUserSecret } from "@app/hooks/api/userSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { FormMode, UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["viewUserSecret"]>;
  handlePopUpToggle: (popUpName: keyof UsePopUpState<["viewUserSecret"]>, state?: boolean) => void;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["createUserSecret" | "updateUserSecret"]>
  ) => void;
};

export const ViewUserSecretModal = ({ popUp, handlePopUpToggle, handlePopUpClose }: Props) => {
  const userSecret = popUp?.viewUserSecret?.data as TUserSecret;
  return (
    <Modal
      isOpen={popUp?.viewUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("viewUserSecret", isOpen);
      }}
    >
      {userSecret && (
        <ModalContent title={`User secret "${userSecret.name}"`}>
          <UserSecretForm
            mode={FormMode.View}
            handlePopUpClose={handlePopUpClose}
            initialData={userSecret}
          />
        </ModalContent>
      )}
    </Modal>
  );
};
