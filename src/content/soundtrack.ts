export type Soundtrack = {
  src: `/media/${string}.mp3`;
  title?: string;
};

export const soundtrack: Soundtrack | null = {
  src: "/media/gentle-pathways.mp3",
  title: "Gentle Pathways",
};
