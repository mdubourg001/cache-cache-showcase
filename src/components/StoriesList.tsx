import { useRef } from "react";

import type { Story } from "../types";

type Props = {
  stories: Story[];
};

export function StoriesList({ stories }: Props) {
  const dtFormat = useRef(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );

  return (
    <ol className="flex flex-col bg-[#f6f6ef] py-2">
      {stories.map((story, index) => (
        <li key={story?.id ?? index} className="flex gap-x-3 py-px">
          <p className="text-slate-500 text-right w-5">{index + 1}.</p>

          {!!story ? (
            <div className="overflow-x-hidden">
              <div className="flex items-center gap-x-1">
                <a
                  className="whitespace-nowrap"
                  href={story.url ?? `/item?id=${story.id}`}
                >
                  {!story.by && "(DRAFT) "}
                  {story.title}
                </a>
                {story.url && (
                  <p className="text-xs text-slate-500 whitespace-nowrap">
                    ({new URL(story.url).hostname})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-x-1 text-xs text-slate-500">
                <p>{story.score ?? 0} points</p>
                <p>by {story.by ?? "you"}</p>
                <p>
                  {story.time
                    ? dtFormat.current.format(new Date(story.time))
                    : "- not yet published"}
                </p>
                {story.descendants ? <p>{story.descendants} comments</p> : null}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 h-[40px] animate-bounce">...</p>
          )}
        </li>
      ))}
    </ol>
  );
}
