import Image from "next/image";
import { type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
type PostWithAuthor = RouterOutputs["post"]["getAll"][number];

dayjs.extend(relativeTime);

export const PostView = (props: PostWithAuthor) => {
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
          <Link href={`/@${author.username} `}> {`@${author.username} `}</Link>
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
