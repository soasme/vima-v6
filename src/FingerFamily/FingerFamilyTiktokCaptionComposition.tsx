import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const fingerFamilyTiktokCaptionSchema = z.object({
  lyrics: z.string(),
  durationPerLineMs: z.number().default(2000),
});

const parseLyrics = (lyrics: string, durationPerLineMs: number) => {
  const lines = lyrics.split('\n');
  const captions: Array<{ text: string; startMs: number; endMs: number }> = [];
  let currentTimeMs = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }
    
    // Skip lines that match [.*] pattern (stage directions, etc.)
    if (trimmedLine.match(/^\[.*\]$/)) {
      continue;
    }
    
    // Add the line as a caption
    captions.push({
      text: trimmedLine,
      startMs: currentTimeMs,
      endMs: currentTimeMs + durationPerLineMs,
    });
    
    currentTimeMs += durationPerLineMs;
  }
  
  return captions;
};

export const FingerFamilyTiktokCaptionComposition: React.FC<{
  lyrics: string;
  durationPerLineMs: number;
}> = ({ lyrics, durationPerLineMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const captions = parseLyrics(lyrics, durationPerLineMs);
  
  const currentCaption = captions.find(
    (caption) => timeMs >= caption.startMs && timeMs < caption.endMs
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
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
          padding: "0 40px",
        }}
      >
        {currentCaption?.text || ""}
      </div>
    </AbsoluteFill>
  );
};