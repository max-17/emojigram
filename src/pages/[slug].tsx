import { type NextPage } from "next";
import type { GetStaticPaths, GetStaticProps } from "next/types";

import Head from "next/head";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { db } from "~/server/db";

import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/PostView";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      {data.map((posts) => (
        <PostView key={posts.post.id} {...posts} />
      ))}
    </>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  console.log("username", username);

  const { data } = api.profile.getUserByUserName.useQuery({
    username,
  });

  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>Profile</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative h-48 bg-neutral-800">
        <Image
          className="absolute -bottom-20 left-4 h-40 rounded-full border-4 border-neutral-950"
          src={data.imageUrl}
          height={160}
          width={160}
          alt="user image"
        />
      </div>
      <div className="flex h-44 flex-row justify-between border-b border-slate-400 p-4">
        <div className="self-end">
          <div className="h-24" />
          <h1 className="text-3xl font-bold">User Name</h1>
          <span className="text-slate-400">@{data.username}</span>
        </div>
        <button className="h-fit rounded-full border p-2 px-4">
          Edit profile
        </button>
      </div>

      <ProfileFeed userId={data.id} />
    </>
  );
};

export default ProfilePage;

//prefetch and dehydrate user data on server side
export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no snug");

  const username = slug.replace("@", "");

  // prefetch
  await helpers.profile.getUserByUserName.prefetch({
    username,
  });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
