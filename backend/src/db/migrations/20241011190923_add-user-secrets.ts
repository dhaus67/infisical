import { Knex } from "knex";

import { TableName } from "../schemas";
import { createOnUpdateTrigger, dropOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TableName.UserSecret))) {
    await knex.schema.createTable(TableName.UserSecret, (tb) => {
      tb.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      tb.string("name").notNullable();
      tb.string("type").notNullable();
      tb.uuid("orgId").notNullable();
      tb.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      tb.uuid("userId").notNullable();
      tb.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      tb.string("data").notNullable();

      tb.timestamps(true, true, true);
    });

    await createOnUpdateTrigger(knex, TableName.UserSecret);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.UserSecret);
  await dropOnUpdateTrigger(knex, TableName.UserSecret);
}
