import Image from "next/image";

import { RouterOutputs, api } from "~/utils/api";

import { SignInButton, useUser } from "@clerk/nextjs";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { string } from "zod";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const utils = api.useUtils();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void utils.post.getAll.invalidate();
    },

    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.length && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Plase try aain later.");
      }
    },
  });

  const { user } = useUser();
  const [input, setInput] = useState("");

  // console.log(user);

  if (!user) return null;

  return (
    <div className="flex gap-4 p-4">
      <Image
        className=" rounded-full"
        src={user.imageUrl}
        width={50}
        height={50}
        alt="user image"
      />
      <input
        className=" grow bg-transparent outline-none"
        placeholder={isPosting ? "Posting..." : "Type some emojis!"}
        type="text"
        value={input}
        disabled={isPosting}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {isPosting ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      ) : (
        <button
          disabled={isPosting || input == ""}
          onClick={() => mutate({ content: input })}
        >
          Post
        </button>
      )}
    </div>
  );
};

type PostWithAuthor = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border border-slate-200 p-4" key={post.id}>
      <div>
        <Image
          className=" rounded-full"
          height={44}
          width={44}
          src={author.imageUrl}
          alt="author image"
        />
      </div>
      <div className="flex flex-col">
        <p>
          <Link href={`@${author.username} `}> {`@${author.username} `}</Link>
          <span className=" font-extralight">
            {" · "}

            <Link href={`/post/${post.id}`}>{`${dayjs(
              post.createdAt,
            ).fromNow()}`}</Link>
          </span>
        </p>
        <div className="text-4xl">{post.content}</div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      {data.map((post) => (
        <PostView key={post.post.id} {...post} />
      ))}
    </>
  );
};

export default function Home() {
  // start loading posts
  api.post.getAll.useQuery();

  const { isSignedIn: userSignedIn } = useUser();

  return (
    <>
      {userSignedIn && <CreatePostWizard />}
      <Feed />

      {!userSignedIn && (
        <button className=" rounded-full bg-green-400 px-3 text-slate-700">
          <SignInButton />
        </button>
      )}
    </>
  );
}
