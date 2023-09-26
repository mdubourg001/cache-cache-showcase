import { useEffect, useState } from "react";

import { StoriesList } from "./StoriesList";
import type { Story } from "../types";

type Props = {
  endpoint: "topstories" | "newstories" | "askstories" | "showstories";
};

export function StoriesListContainer({ endpoint }: Props) {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(function fetchStories() {
    fetch(`https://hacker-news.firebaseio.com/v0/${endpoint}.json`)
      .then((response) => response.json())
      .then((storyIds: number[]) => {
        const stories = storyIds.slice(0, 30);

        return Promise.all(
          stories.map((storyId: number) =>
            fetch(
              `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
            ).then((response) => response.json())
          )
        );
      })
      .then(setStories);
  }, []);

  return <StoriesList stories={stories} />;
}
