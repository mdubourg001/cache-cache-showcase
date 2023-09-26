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
        <li key={story.id} className="flex gap-x-3 py-px">
          <p className="text-slate-500 text-right w-5">{index + 1}.</p>
          <div>
            <div className="flex items-center gap-x-1">
              <a href={story.url ?? `/item?id=${story.id}`}>{story.title}</a>
              {story.url && (
                <p className="text-xs text-slate-500">
                  ({new URL(story.url).hostname})
                </p>
              )}
            </div>
            <div className="flex items-center gap-x-1 text-xs text-slate-500">
              <p>{story.score} points</p>
              <p>by {story.by}</p>
              <p>{dtFormat.current.format(new Date(story.time))}</p>
              <p>{story.descendants} comments</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
