import { z } from "zod";

import { readLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";
import {
  CreateUserSecretSchema,
  SanitizedUserSecretSchema,
  UpdateUserSecretSchema
} from "@app/services/user-secret/user-secret-types";

export const registerUserSecretRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      querystring: z.object({
        offset: z.coerce.number().min(0).max(100).default(0),
        limit: z.coerce.number().min(1).max(100).default(25)
      }),
      response: {
        200: z.object({
          secrets: z.array(SanitizedUserSecretSchema),
          totalCount: z.number()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { secrets, totalCount } = await server.services.userSecrets.listUserSecrets({
        actorId: req.permission.id,
        actor: req.permission.type,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        orgId: req.permission.orgId,
        ...req.query
      });

      return { secrets, totalCount };
    }
  });

  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      body: CreateUserSecretSchema,
      response: {
        200: z.object({
          secret: SanitizedUserSecretSchema
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const createDTO = {
        ...req.body,
        actorId: req.permission.id,
        actor: req.permission.type,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        orgId: req.permission.orgId
      };
      const secret = await server.services.userSecrets.createUserSecret(createDTO);
      return { secret };
    }
  });

  server.route({
    method: "PATCH",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    schema: {
      params: z.object({ userSecretId: z.string().trim() }),
      body: UpdateUserSecretSchema,
      response: {
        200: z.object({
          secret: SanitizedUserSecretSchema
        })
      }
    },
    handler: async (req) => {
      const updateDTO = {
        ...req.body,
        id: req.params.userSecretId,
        actorId: req.permission.id,
        actor: req.permission.type,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        orgId: req.permission.orgId
      };
      const secret = await server.services.userSecrets.updateUserSecret(updateDTO);
      return { secret };
    }
  });

  server.route({
    method: "DELETE",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    schema: {
      params: z.object({ userSecretId: z.string().trim() }),
      response: {
        200: z.object({
          message: z.string()
        })
      }
    },
    handler: async (req) => {
      const deleteDTO = {
        id: req.params.userSecretId
      };
      await server.services.userSecrets.deleteUserSecret(deleteDTO);
      return { message: "Successfully deleted user secret" };
    }
  });
  return undefined;
};
