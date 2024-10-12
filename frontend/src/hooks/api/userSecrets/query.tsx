import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { TUserSecret } from "./types";

export const queryKeys = {
  allUserSecrets: () => ["userSecrets"] as const,
  specificUserSecrets: ({ offset, limit }: { offset: number; limit: number }) =>
    [...queryKeys.allUserSecrets(), { offset, limit }] as const
};

export const useGetUserSecrets = ({
  offset = 0,
  limit = 25
}: {
  offset: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: queryKeys.specificUserSecrets({ offset, limit }),
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit)
      });
      const { data } = await apiRequest.get<{ secrets: TUserSecret[]; totalCount: number }>(
        "api/v1/user-secrets",
        {
          params
        }
      );
      return data;
    }
  });
};
