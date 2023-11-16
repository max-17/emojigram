import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return { id: user.id, imageUrl: user.imageUrl, username: user.username };
};

const emojiInput = z.object({ content: z.string().emoji().min(1).max(255) });

export const postsRouter = createTRPCRouter({
  create: privateProcedure
    .input(emojiInput)
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.userId;

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),

  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //   });
  // }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    const users = await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    });

    users.map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (!author || author === undefined)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for posts not found",
        });
      return {
        post,
        author,
      };
    });
  }),
});
