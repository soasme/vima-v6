import { useVideoConfig, Audio, Sequence } from "remotion";
import { z } from "zod";
import { ObjectPage } from "./FingerFamily/ObjectPage";
import { FingerPage } from "./FingerFamily/FingerPage";
import { MysteriousObjectPage } from "./FingerFamily/MysteriousObjectPage";
import { MysteriousReveal } from "./FingerFamily/MysteriousReveal";
import { Entro } from "./Common/Entro";

export const fingerFamilySchema = z.object({
  objects: z.array(z.object({
    objectImage: z.string(),
    backgroundImage: z.string(),
    mysteriousDuration: z.number(),
    revealDuration: z.number(),
    fingerDuration: z.number(),
  })).length(10),
  bgm: z.string().optional(),
});

type FingerFamilyProps = z.infer<typeof fingerFamilySchema>;

// Parse time where decimal part represents milliseconds (e.g., 4.04 = 4 seconds + 40 milliseconds = 4.040 seconds)
const parseTime = (time: number): number => {
  // Convert to string to parse the decimal part
  const timeStr = time.toString();
  const parts = timeStr.split('.');
  
  if (parts.length === 1) {
    // No decimal part, just seconds
    return time;
  }
  
  if (parts.length === 2) {
    const seconds = parseInt(parts[0]);
    const decimalPart = parts[1];
    
    // Interpret decimal part as milliseconds (pad to 3 digits)
    const millisecondsPart = decimalPart.padEnd(3, '0').substring(0, 3);
    const milliseconds = parseInt(millisecondsPart);
    
    return seconds + milliseconds / 1000;
  }
  
  // Fallback to original value
  return time;
};


export const calculateMetadata = ({ props }: { props: FingerFamilyProps }) => {
  const fps = 30;

  // Calculate total duration from all objects using simple durations
  let totalSeconds = 0;
  
  for (const obj of props.objects) {
    // Parse each duration and sum them
    const mysteriousDuration = parseTime(obj.mysteriousDuration);
    const revealDuration = parseTime(obj.revealDuration);
    const fingerDuration = parseTime(obj.fingerDuration);
    
    const objectTotalDuration = mysteriousDuration + revealDuration + fingerDuration;
    totalSeconds += objectTotalDuration;
  }

  // Add Entro duration (5 seconds)
  const entroDuration = 5;
  
  const totalDurationSeconds = totalSeconds + entroDuration;
  const durationInFrames = Math.ceil(totalDurationSeconds * fps);
  
  return { durationInFrames, fps };
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
    
    // Parse and convert durations to frames
    const mysteriousFrames = parseTime(obj.mysteriousDuration) * fps;
    const revealFrames = parseTime(obj.revealDuration) * fps;
    const fingerFrames = parseTime(obj.fingerDuration) * fps;
    
    sequences.push({
      startFrame: currentStartFrame,
      mysteriousFrames,
      revealFrames,
      fingerFrames,
      objectIndex: i,
      object: obj,
      finger
    });
    
    // Move to next sequence start frame
    currentStartFrame += mysteriousFrames + revealFrames + fingerFrames;
  }

  // Calculate total duration and add Entro at the end
  const totalFingerFamilyFrames = currentStartFrame;
  const entroFrames = 5 * fps; // 5 seconds for Entro

  return (
    <>
      {bgm && (
        <Audio
          src={bgm}
          volume={0.7}
          startFrom={0}
        />
      )}
      
      {sequences.map((seq, index) => (
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
      
      {/* Entro at the end */}
      <Sequence
        from={totalFingerFamilyFrames}
        durationInFrames={entroFrames}
      >
        <Entro duration={5} />
      </Sequence>
    </>
  );
};