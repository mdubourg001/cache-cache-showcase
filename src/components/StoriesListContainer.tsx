import { useEffect, useState } from "react";

import { StoriesList } from "./StoriesList";
import type { Story } from "../types";

type Props = {
  endpoint:
    | "topstories"
    | "newstories"
    | "askstories"
    | "showstories"
    | "submissions";
  placeholders?: number;
};

export function StoriesListContainer({ endpoint, placeholders = 30 }: Props) {
  const [stories, setStories] = useState<Story[]>(
    new Array(placeholders).fill(null)
  );

  useEffect(function fetchStories() {
    fetch(`https://hacker-news.firebaseio.com/v0/${endpoint}.json`)
      .then((response) => response.json())
      .then((storyIds: number[]) => {
        if (!storyIds) {
          return;
        }

        if (endpoint === "submissions") {
          return setStories((storyIds ?? []) as any[]);
        }

        for (let i = 0; i < Math.min(storyIds.length, 30); i++) {
          fetch(
            `https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`
          ).then((response) =>
            response.json().then((story) =>
              setStories((actual) => {
                const newStories = [...actual];
                newStories[i] = story as Story;

                return newStories;
              })
            )
          );
        }
      });
  }, []);

  return <StoriesList stories={stories} />;
}
