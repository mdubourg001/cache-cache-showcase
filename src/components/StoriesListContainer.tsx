import { useEffect, useState } from "react";

import { StoriesList } from "./StoriesList";
import type { Story } from "../types";
import type { HN_ENDPOINTS } from "../constants";

type Props = {
  endpoint: (typeof HN_ENDPOINTS)[keyof typeof HN_ENDPOINTS];
  placeholders?: number;
};

export function StoriesListContainer({ endpoint, placeholders = 30 }: Props) {
  const [stories, setStories] = useState<Story[]>(
    new Array(placeholders).fill(null)
  );

  useEffect(function fetchStories() {
    fetch(endpoint)
      .then((response) => response.json())
      .then((storyIds: number[]) => {
        if (!storyIds) {
          return;
        }

        if (endpoint === "/submissions.json") {
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
