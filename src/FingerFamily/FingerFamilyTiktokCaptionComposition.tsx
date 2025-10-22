import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const fingerFamilyTiktokCaptionSchema = z.object({
  lyrics: z.string(),
  objects: z.array(z.object({
    mysteriousDuration: z.number(),
    revealDuration: z.number(),
    fingerDuration: z.number(),
  })),
});

// Parse time where decimal part represents milliseconds (e.g., 4.04 = 4 seconds + 40 milliseconds = 4.040 seconds)
const parseTime = (time: number): number => {
  const timeStr = time.toString();
  const parts = timeStr.split('.');
  
  if (parts.length === 1) {
    return time;
  }
  
  if (parts.length === 2) {
    const seconds = parseInt(parts[0]);
    const decimalPart = parts[1];
    const millisecondsPart = decimalPart.padEnd(3, '0').substring(0, 3);
    const milliseconds = parseInt(millisecondsPart);
    return seconds + milliseconds / 1000;
  }
  
  return time;
};

const parseLyrics = (lyrics: string, objects: Array<{ mysteriousDuration: number; revealDuration: number; fingerDuration: number; }>) => {
  const lines = lyrics.split('\n');
  const captions: Array<{ text: string; startMs: number; endMs: number }> = [];
  
  // Filter out empty lines and [.*] patterns to get actual lyric lines
  const lyricLines = lines.filter(line => {
    const trimmedLine = line.trim();
    return trimmedLine && !trimmedLine.match(/^\[.*\]$/);
  });
  
  // Each object corresponds to one verse with 3 lines
  // The 3 lines are distributed across the object's total duration
  
  let currentTimeMs = 0;
  let lineIndex = 0;
  
  // Process each object (which represents one verse with 3 lines)
  for (let objectIndex = 0; objectIndex < objects.length && lineIndex < lyricLines.length; objectIndex++) {
    const obj = objects[objectIndex];
    
    // Calculate total duration for this object in milliseconds
    const totalDurationMs = (
      parseTime(obj.mysteriousDuration) + 
      parseTime(obj.revealDuration) + 
      parseTime(obj.fingerDuration)
    ) * 1000;
    
    // Distribute 3 lines evenly across this object's duration
    const lineDurationMs = totalDurationMs / 3;
    
    // Add 3 lines for this object
    for (let i = 0; i < 3 && lineIndex < lyricLines.length; i++) {
      captions.push({
        text: lyricLines[lineIndex],
        startMs: currentTimeMs,
        endMs: currentTimeMs + lineDurationMs,
      });
      
      currentTimeMs += lineDurationMs;
      lineIndex++;
    }
  }
  
  return captions;
};

export const FingerFamilyTiktokCaptionComposition: React.FC<{
  lyrics: string;
  objects: Array<{ mysteriousDuration: number; revealDuration: number; fingerDuration: number; }>;
}> = ({ lyrics, objects }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const captions = parseLyrics(lyrics, objects);
  
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