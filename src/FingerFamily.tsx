import { useCurrentFrame, useVideoConfig, Audio } from "remotion";
import { z } from "zod";
import { ObjectPage } from "./FingerFamily/ObjectPage";
import { FingerPage } from "./FingerFamily/FingerPage";
import { MysteriousObjectPage } from "./FingerFamily/MysteriousObjectPage";
import { MysteriousReveal } from "./FingerFamily/MysteriousReveal";

export const fingerFamilySchema = z.object({
  objects: z.array(z.object({
    objectImage: z.string(),
    backgroundImage: z.string(),
    mysteriousEndsAt: z.string(),
    revealEndsAt: z.string(),
    fingerEndsAt: z.string(),
  })).length(10),
  bgm: z.string().optional(),
});

type FingerFamilyProps = z.infer<typeof fingerFamilySchema>;

// Parse timing string (e.g., "00:07.11") to seconds
const parseTimingToSeconds = (timing: string): number => {
  if (!timing) {
    return 0;
  }
  
  // Parse format like "00:07.11" (MM:SS.FF)
  const match = timing.match(/^(\d{2}):(\d{2})\.(\d{2})$/);
  if (match) {
    const [, minutes, seconds, centiseconds] = match;
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds) / 100;
  }
  
  // Parse format like "07.11" (SS.FF)
  const simpleMatch = timing.match(/^(\d+)\.(\d{2})$/);
  if (simpleMatch) {
    const [, seconds, centiseconds] = simpleMatch;
    return parseInt(seconds) + parseInt(centiseconds) / 100;
  }
  
  // Parse simple seconds as string
  const parsed = parseFloat(timing);
  return isNaN(parsed) ? 0 : parsed;
};

export const FingerFamily: React.FC<FingerFamilyProps> = ({ 
  objects, 
  bgm
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate 10 objects: thumb -> pinky, thumb -> pinky
  const fingers = ["thumb", "index", "middle", "ring", "pinky", "thumb", "index", "middle", "ring", "pinky"] as const;
  
  // Calculate total frames based on absolute timing endpoints
  let totalFrames = 0;
  const objectFrameRanges: Array<{start: number, end: number, objectIndex: number}> = [];
  
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    const fingerEndsAtSeconds = parseTimingToSeconds(obj.fingerEndsAt);
    const objectTotalFrames = fingerEndsAtSeconds * fps;
    
    objectFrameRanges.push({
      start: totalFrames,
      end: totalFrames + objectTotalFrames,
      objectIndex: i
    });
    
    totalFrames += objectTotalFrames;
  }
  
  // Find which object we're currently in
  const currentObjectRange = objectFrameRanges.find(range => 
    frame >= range.start && frame < range.end
  );
  
  if (!currentObjectRange) return null;
  
  const objectIndex = currentObjectRange.objectIndex;
  const currentObject = objects[objectIndex];
  const currentFinger = fingers[objectIndex];
  const frameWithinObject = frame - currentObjectRange.start;
  const timeWithinObject = frameWithinObject / fps;
  
  const mysteriousEndsAtSeconds = parseTimingToSeconds(currentObject.mysteriousEndsAt);
  const revealEndsAtSeconds = parseTimingToSeconds(currentObject.revealEndsAt);
  const fingerEndsAtSeconds = parseTimingToSeconds(currentObject.fingerEndsAt);
  
  // Render current page content
  let currentPageContent;
  
  // Determine which page within the current object based on timing endpoints
  if (timeWithinObject < mysteriousEndsAtSeconds) {
    // MysteriousObjectPage
    currentPageContent = (
      <MysteriousObjectPage
        frame={frameWithinObject}
        duration={mysteriousEndsAtSeconds * fps}
        background={currentObject.backgroundImage}
        objects={[currentObject.objectImage]}
        text=""
      />
    );
  } else if (timeWithinObject < revealEndsAtSeconds) {
    // MysteriousReveal
    const mysteriousFrames = mysteriousEndsAtSeconds * fps;
    const revealDuration = (revealEndsAtSeconds - mysteriousEndsAtSeconds) * fps;
    currentPageContent = (
      <MysteriousReveal
        frame={frameWithinObject - mysteriousFrames}
        duration={revealDuration}
        background={currentObject.backgroundImage}
        objects={[currentObject.objectImage]}
        text=""
      />
    );
  } else {
    // FingerPage
    const mysteriousFrames = mysteriousEndsAtSeconds * fps;
    const revealFrames = (revealEndsAtSeconds - mysteriousEndsAtSeconds) * fps;
    const fingerDuration = (fingerEndsAtSeconds - revealEndsAtSeconds) * fps;
    currentPageContent = (
      <FingerPage
        frame={frameWithinObject - mysteriousFrames - revealFrames}
        duration={fingerDuration}
        background={currentObject.backgroundImage}
        finger={currentFinger}
        objects={[currentObject.objectImage]}
        text=""
      />
    );
  }

  return (
    <>
      {bgm && (
        <Audio
          src={bgm}
          volume={0.7}
          startFrom={0}
        />
      )}
      {currentPageContent}
    </>
  );
};