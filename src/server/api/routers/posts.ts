import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return { id: user.id, imageUrl: user.imageUrl, username: user.username };
};

export const postsRouter = createTRPCRouter({
  // create: publicProcedure
  //   .input(z.object({ content: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.create({
  //       data: {
  //         content: input.content,
  //       },
  //     });
  //   }),

  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //   });
  // }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
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
