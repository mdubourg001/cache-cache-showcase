export type Story = {
  id: number;
  title: string;
  url: string;
  by: string;
  time: number;
  score: number;
  descendants: number;
  kids: number[];
  text?: string;
};
