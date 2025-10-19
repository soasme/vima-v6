import { useVideoConfig, Audio, Sequence } from "remotion";
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
  const { fps } = useVideoConfig();

  // Generate 10 objects: thumb -> pinky, thumb -> pinky
  const fingers = ["thumb", "index", "middle", "ring", "pinky", "thumb", "index", "middle", "ring", "pinky"] as const;
  
  // Calculate sequence timings for each object
  let currentStartFrame = 0;
  const sequences: Array<{
    startFrame: number;
    mysteriousFrames: number;
    revealFrames: number;
    fingerFrames: number;
    objectIndex: number;
    object: typeof objects[0];
    finger: typeof fingers[0];
  }> = [];
  
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    const finger = fingers[i];
    
    const mysteriousEndsAtSeconds = parseTimingToSeconds(obj.mysteriousEndsAt);
    const revealEndsAtSeconds = parseTimingToSeconds(obj.revealEndsAt);
    const fingerEndsAtSeconds = parseTimingToSeconds(obj.fingerEndsAt);
    
    const mysteriousFrames = mysteriousEndsAtSeconds * fps;
    const revealFrames = (revealEndsAtSeconds - mysteriousEndsAtSeconds) * fps;
    const fingerFrames = (fingerEndsAtSeconds - revealEndsAtSeconds) * fps;
    
    sequences.push({
      startFrame: currentStartFrame,
      mysteriousFrames,
      revealFrames,
      fingerFrames,
      objectIndex: i,
      object: obj,
      finger
    });
    
    currentStartFrame += fingerEndsAtSeconds * fps;
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
      
      {sequences.map((seq) => (
        <div key={seq.objectIndex}>
          {/* MysteriousObjectPage */}
          <Sequence
            from={seq.startFrame}
            durationInFrames={seq.mysteriousFrames}
          >
            <MysteriousObjectPage
              background={seq.object.backgroundImage}
              objects={[seq.object.objectImage]}
              text=""
            />
          </Sequence>
          
          {/* MysteriousReveal */}
          <Sequence
            from={seq.startFrame + seq.mysteriousFrames}
            durationInFrames={seq.revealFrames}
          >
            <MysteriousReveal
              background={seq.object.backgroundImage}
              objects={[seq.object.objectImage]}
              text=""
            />
          </Sequence>
          
          {/* FingerPage */}
          <Sequence
            from={seq.startFrame + seq.mysteriousFrames + seq.revealFrames}
            durationInFrames={seq.fingerFrames}
          >
            <FingerPage
              background={seq.object.backgroundImage}
              finger={seq.finger}
              objects={[seq.object.objectImage]}
              text=""
            />
          </Sequence>
        </div>
      ))}
    </>
  );
};