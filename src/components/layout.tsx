import type { PropsWithChildren } from "react";

const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className=" container mx-auto flex justify-center">
      <div className="flex min-h-screen w-full flex-col border-x border-slate-200">
        {props.children}
      </div>
    </main>
  );
};

export default PageLayout;
