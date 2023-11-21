import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { input, z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const userNameValidator = z.object({ username: z.string() });

export const profileRouter = createTRPCRouter({
  getUserByUserName: publicProcedure
    .input(userNameValidator)
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "user not found",
        });
      }
      return filterUserForClient(user);
    }),
});
