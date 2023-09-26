import { useEffect, useRef, useState } from "react";

import type { Story } from "../types";

type Props = {};

export function StoryDetailsContainer({}: Props) {
  const [story, setStory] = useState<Story>();
  const dtFormat = useRef(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );

  useEffect(function fetchStory() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
      window.location.href = "/";
    }

    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then((response) => response.json())
      .then(setStory);
  }, []);

  if (!story) {
    return null;
  }

  return (
    <article className="p-2 bg-[#f6f6ef]">
      <p>{story.title}</p>
      <div className="flex items-center gap-x-1 text-xs text-slate-500">
        <p>{story.score} points</p>
        <p>by {story.by}</p>
        <p>{dtFormat.current.format(new Date(story.time))}</p>
        <p>{story.descendants} comments</p>
      </div>

      {story.text && (
        <p
          dangerouslySetInnerHTML={{ __html: story.text }}
          className="pt-4 text-slate-500"
        />
      )}
    </article>
  );
}
