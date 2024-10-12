import { TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";
import { ormify } from "@app/lib/knex";

export type TUserSecretDALFactory = ReturnType<typeof userSecretDALFactory>;

export const userSecretDALFactory = (db: TDbClient) => {
  const userSecretOrm = ormify(db, TableName.UserSecret);

  const countAllUserSecrets = async ({ orgId }: { orgId: string }) => {
    try {
      interface CountResult {
        count: string;
      }

      const count = await db
        .replicaNode()(TableName.UserSecret)
        .where(`${TableName.UserSecret}.orgId`, orgId)
        .count("*")
        .first();

      return parseInt((count as unknown as CountResult).count || "0", 10);
    } catch (error) {
      throw new DatabaseError({ error, name: "Count all org user secrets" });
    }
  };
  return {
    ...userSecretOrm,
    countAllUserSecrets
  };
};
