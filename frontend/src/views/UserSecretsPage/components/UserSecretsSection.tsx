import Head from "next/head";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button, DeleteActionModal } from "@app/components/v2";
import { usePopUp } from "@app/hooks";
import { useDeleteUserSecret } from "@app/hooks/api/userSecrets";

import { AddUserSecretModal } from "./AddUserSecretModal";
import { UpdateUserSecretModal } from "./EditUserSecretModal";
import { UserSecretsTable } from "./UserSecretsTable";
import { ViewUserSecretModal } from "./ViewUserSecretModal";

type DeleteModalData = { name: string; id: string };
export const UserSecretsSection = () => {
  const deleteUserSecret = useDeleteUserSecret();

  const { popUp, handlePopUpToggle, handlePopUpClose, handlePopUpOpen } = usePopUp([
    "createUserSecret",
    "deleteUserSecretConfirmation",
    "viewUserSecret",
    "updateUserSecret"
  ] as const);

  const onDeleteApproved = async () => {
    try {
      await deleteUserSecret.mutateAsync({
        id: (popUp?.deleteUserSecretConfirmation?.data as DeleteModalData)?.id
      });

      createNotification({
        text: "Successfully deleted user secret",
        type: "success"
      });

      handlePopUpClose("deleteUserSecretConfirmation");
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete user secret",
        type: "error"
      });
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <Head>
        <title>User secrets</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Head>
      <div className="mb-4 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">User secrets</p>
        <Button
          colorSchema="primary"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => {
            handlePopUpOpen("createUserSecret");
          }}
        >
          Add user secret
        </Button>
      </div>
      <UserSecretsTable handlePopUpOpen={handlePopUpOpen} />
      <AddUserSecretModal
        popUp={popUp}
        handlePopUpToggle={handlePopUpToggle}
        handlePopUpClose={handlePopUpClose}
      />
      <DeleteActionModal
        isOpen={popUp.deleteUserSecretConfirmation.isOpen}
        title={`Delete user secret "${
          (popUp?.deleteUserSecretConfirmation?.data as DeleteModalData)?.name || "  "
        }"?`}
        onChange={(isOpen) => handlePopUpToggle("deleteUserSecretConfirmation", isOpen)}
        deleteKey={(popUp?.deleteUserSecretConfirmation?.data as DeleteModalData)?.name || "delete"}
        onClose={() => handlePopUpClose("deleteUserSecretConfirmation")}
        onDeleteApproved={onDeleteApproved}
      />
      <ViewUserSecretModal
        popUp={popUp}
        handlePopUpToggle={handlePopUpToggle}
        handlePopUpClose={handlePopUpClose}
      />
      <UpdateUserSecretModal
        popUp={popUp}
        handlePopUpToggle={handlePopUpToggle}
        handlePopUpClose={handlePopUpClose}
      />
    </div>
  );
};
