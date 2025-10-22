import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});

export const tiktokCaptionSchema = z.object({
  captions: z.array(captionSchema),
});

export const TiktokCaptionComposition: React.FC<{
  captions: Array<{ text: string; startMs: number; endMs: number }>;
}> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const currentCaption = captions.find(
    (caption) => timeMs >= caption.startMs && timeMs < caption.endMs
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 80,
          fontWeight: "bold",
          color: "white",
          textShadow: "3px 3px 0px black",
        }}
      >
        {currentCaption?.text || ""}
      </div>
    </AbsoluteFill>
  );
};