import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { z } from "zod";

export const fingerFamilyTiktokCaptionSchema = z.object({
  lyrics: z.string(),
  objects: z.array(z.object({
    mysteriousDuration: z.number(),
    revealDuration: z.number(),
    fingerDuration: z.number(),
  })),
  lyricsStartAt: z.number().optional().default(0),
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

const parseLyrics = (lyrics: string, objects: Array<{ mysteriousDuration: number; revealDuration: number; fingerDuration: number; }>, lyricsStartAt: number = 0) => {
  const captions: Array<{ text: string; startMs: number; endMs: number }> = [];
  
  // Parse lyrics into groups based on [...] patterns
  const groups: Array<string[]> = [];
  const lines = lyrics.split('\n');
  let currentGroup: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^\[.*\]$/)) {
      // Found a group marker - start new group if current group has content
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else if (trimmedLine) {
      // Add non-empty line to current group
      currentGroup.push(trimmedLine);
    }
  }
  
  // Add the last group if it has content
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  // Validate that number of groups matches number of objects
  if (groups.length !== objects.length) {
    console.warn(`Number of lyric groups (${groups.length}) does not match number of objects (${objects.length})`);
  }
  
  let currentTimeMs = lyricsStartAt * 1000; // Convert lyricsStartAt to milliseconds
  
  // Process each group with its corresponding object
  for (let groupIndex = 0; groupIndex < Math.min(groups.length, objects.length); groupIndex++) {
    const group = groups[groupIndex];
    const obj = objects[groupIndex];
    
    // Process lines in the group with specific duration mapping
    for (let lineIndex = 0; lineIndex < group.length; lineIndex++) {
      const line = group[lineIndex];
      let lineDurationMs: number;
      
      if (lineIndex === 0) {
        // First line uses mysteriousDuration, but adjust for lyricsStartAt if this is the first group
        let baseDuration = parseTime(obj.mysteriousDuration) * 1000;
        if (groupIndex === 0) {
          // For the first group's first line, reduce duration by lyricsStartAt
          baseDuration = Math.max(0, baseDuration - (lyricsStartAt * 1000));
        }
        lineDurationMs = baseDuration;
      } else if (lineIndex === 1) {
        // Second line uses revealDuration
        lineDurationMs = parseTime(obj.revealDuration) * 1000;
      } else if (lineIndex === 2) {
        // Third line uses fingerDuration
        lineDurationMs = parseTime(obj.fingerDuration) * 1000;
      } else {
        // Additional lines beyond 3rd use fingerDuration
        lineDurationMs = parseTime(obj.fingerDuration) * 1000;
      }
      
      captions.push({
        text: line,
        startMs: currentTimeMs,
        endMs: currentTimeMs + lineDurationMs,
      });
      
      currentTimeMs += lineDurationMs;
    }
  }
  
  return captions;
};

export const FingerFamilyTiktokCaptionComposition: React.FC<{
  lyrics: string;
  objects: Array<{ mysteriousDuration: number; revealDuration: number; fingerDuration: number; }>;
  lyricsStartAt?: number;
}> = ({ lyrics, objects, lyricsStartAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const captions = parseLyrics(lyrics, objects, lyricsStartAt);
  
  const currentCaption = captions.find(
    (caption) => timeMs >= caption.startMs && timeMs < caption.endMs
  );

  // High contrast colors for words
  const getWordColor = (wordIndex: number) => {
    const highContrastColors = ['#FF0000', '#0000FF', '#FF6600', '#8B00FF', '#00CC00', '#FF1493', '#0080FF', '#FF8000'];
    return highContrastColors[wordIndex % highContrastColors.length];
  };

  // Calculate which words to display within the current caption
  const getDisplayedWords = (caption: { text: string; startMs: number; endMs: number }) => {
    const words = caption.text.split(' ');
    const captionDurationMs = 2000; // 2 seconds for word-by-word display
    const timeIntoCaption = timeMs - caption.startMs;
    const wordDurationMs = captionDurationMs / words.length;
    const wordsToShow = Math.min(words.length, Math.floor(timeIntoCaption / wordDurationMs) + 1);
    
    return words.slice(0, Math.max(0, wordsToShow)).map((word, index) => (
      <span key={index} style={{ color: getWordColor(index) }}>
        {word}{index < wordsToShow - 1 ? ' ' : ''}
      </span>
    ));
  };

  const displayedWords = currentCaption ? getDisplayedWords(currentCaption) : null;
  const hasText = displayedWords && displayedWords.length > 0;

  // Calculate spring animation for scale when text first appears
  const getSpringScale = () => {
    if (!currentCaption) return 0;
    
    const framesIntoCaption = (timeMs - currentCaption.startMs) / 1000 * fps;
    const springScale = spring({
      frame: framesIntoCaption,
      fps,
      config: {
        damping: 10,
        stiffness: 100,
        mass: 0.5,
      },
    });
    
    return springScale;
  };

  // Get current text content
  const getCurrentText = () => {
    if (!currentCaption) return '';
    
    const words = currentCaption.text.split(' ');
    const timeIntoCaption = timeMs - currentCaption.startMs;
    const wordDurationMs = 2000 / words.length;
    const wordsToShow = Math.min(words.length, Math.floor(timeIntoCaption / wordDurationMs) + 1);
    return words.slice(0, Math.max(0, wordsToShow)).join(' ');
  };

  // Calculate font size to fit within screen width
  const calculateFontSize = (text: string) => {
    if (!text) return 80;
    
    const baseFontSize = 80;
    const maxScreenWidth = typeof window !== 'undefined' ? window.innerWidth * 0.98 : 1600;
    const padding = 40; // Total horizontal padding
    const availableWidth = maxScreenWidth - padding;
    
    // Estimate text width at base font size
    const estimatedTextWidth = text.length * baseFontSize * 0.6;
    
    if (estimatedTextWidth > availableWidth) {
      // Scale down font to fit
      return Math.max(30, (availableWidth / estimatedTextWidth) * baseFontSize);
    }
    
    return baseFontSize;
  };

  // Calculate width based on text content and font size
  const getTextBasedWidth = () => {
    const currentText = getCurrentText();
    if (!currentText) return 'auto';
    
    const fontSize = calculateFontSize(currentText);
    const estimatedWidth = Math.max(150, currentText.length * fontSize * 0.6 + 40);
    const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.98 : 1600;
    
    return Math.min(estimatedWidth, maxWidth) + 'px';
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {hasText && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: `translateX(-50%) scale(${getSpringScale()})`,
            textAlign: "center",
            fontSize: calculateFontSize(getCurrentText()),
            fontWeight: "bold",
            padding: "8px 10px",
            backgroundColor: "white",
            border: "4px solid black",
            borderRadius: "20px",
            display: "inline-block",
            whiteSpace: "nowrap",
            width: getTextBasedWidth(),
            overflow: "hidden",
          }}
        >
          {displayedWords}
        </div>
      )}
    </AbsoluteFill>
  );
};