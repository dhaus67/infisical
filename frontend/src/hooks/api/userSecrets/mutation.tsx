import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { queryKeys } from "./query";
import { TCreateUserSecretDTO, TDeleteUserSecretDTO, TUpdateUserSecretDTO } from "./types";

export const useCreateUserSecret = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, {}, TCreateUserSecretDTO>({
    mutationFn: async (dto) => {
      const { data } = await apiRequest.post("api/v1/user-secrets", dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.allUserSecrets());
    }
  });
};

export const useUpdateUserSecret = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, {}, TUpdateUserSecretDTO>({
    mutationFn: async (dto) => {
      const { data } = await apiRequest.patch(`/api/v1/user-secrets/${dto.id}`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.allUserSecrets());
    }
  });
};

export const useDeleteUserSecret = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, {}, TDeleteUserSecretDTO>({
    mutationFn: async (dto) => {
      const { data } = await apiRequest.delete(`/api/v1/user-secrets/${dto.id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.allUserSecrets());
    }
  });
};
