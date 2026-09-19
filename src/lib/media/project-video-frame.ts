export const DEFAULT_PROJECT_VIDEO_FRAME = Object.freeze({
  editorName: "Lucky Saroj",
  editorRole: "Video Editor",
  tagline: "Play · Edit · Create",
  bottomLabel: "Cinematic Edit",
});

export type ProjectVideoFrameCopy = Readonly<{
  editorName: string;
  editorRole: string;
  tagline: string;
  bottomLabel: string;
}>;
