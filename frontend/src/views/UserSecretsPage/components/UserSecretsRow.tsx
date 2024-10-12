import {
  faCreditCard,
  faEdit,
  faGlobe,
  faNoteSticky,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconButton, Td, Tr } from "@app/components/v2";
import { TUserSecret, UserSecretType } from "@app/hooks/api/userSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

type Props = {
  row: TUserSecret;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<
      ["deleteUserSecretConfirmation" | "viewUserSecret" | "updateUserSecret"]
    >,
    data: { name: string; id: string } | TUserSecret
  ) => void;
};

export const UserSecretsRow = ({ row, handlePopUpOpen }: Props) => {
  const typeIcon = (type: UserSecretType) => {
    switch (type) {
      case UserSecretType.WebSecret:
        return faGlobe;
      case UserSecretType.CreditCardSecret:
        return faCreditCard;
      default:
        return faNoteSticky;
    }
  };

  const typeName = (type: UserSecretType) => {
    switch (type) {
      case UserSecretType.WebSecret:
        return "Web login";
      case UserSecretType.CreditCardSecret:
        return "Credit card";
      default:
        return "Secure note";
    }
  };

  return (
    <Tr
      key={row.id}
      isHoverable
      isSelectable
      onClick={() => {
        handlePopUpOpen("viewUserSecret", row);
      }}
    >
      <Td>{row.name}</Td>
      <Td>
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={typeIcon(row.type)} />
          <p>- {typeName(row.type)}</p>
        </div>
      </Td>
      <Td>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handlePopUpOpen("updateUserSecret", row);
          }}
          variant="plain"
          ariaLabel="update"
        >
          <FontAwesomeIcon icon={faEdit} />
        </IconButton>
      </Td>
      <Td>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handlePopUpOpen("deleteUserSecretConfirmation", {
              name: row.name,
              id: row.id
            });
          }}
          variant="plain"
          ariaLabel="delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </IconButton>
      </Td>
    </Tr>
  );
};
