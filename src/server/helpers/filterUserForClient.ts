import type { User } from "@clerk/nextjs/server";

export const filterUserForClient = (user: User) => {
  return { id: user.id, imageUrl: user.imageUrl, username: user.username };
};
