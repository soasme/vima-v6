import { AbsoluteFill, interpolate, useVideoConfig, Img, staticFile, useCurrentFrame } from "remotion";
import { ObjectPageProps } from "./types";

export const MysteriousObjectPage: React.FC<Omit<ObjectPageProps, 'frame' | 'duration'>> = ({
  background = "white",
  objects,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const duration = durationInFrames; // Use the sequence duration

  // Slide-in from bottom (0.5 seconds)
  const slideInDuration = fps * 0.5; // 0.5 seconds
  const slideProgress = interpolate(
    frame,
    [0, slideInDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t: number) => 1 - (1 - t) * (1 - t), // ease out
    }
  );

  // Scale animation (starts immediately)
  const scaleProgress = interpolate(
    frame,
    [0, duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t: number) => 1 - (1 - t) * (1 - t), // ease out
    }
  );
  
  // Scale from 0.7 to 1.2 over the duration
  const currentScale = interpolate(scaleProgress, [0, 1], [0.7, 1.2]);

  // Beat animation (starts after slide-in)
  const beatStartFrame = slideInDuration;
  const bpm = 120;
  const beatsPerSecond = bpm / 60;
  const framesPerBeat = fps / beatsPerSecond;
  const beatDistance = 20;
  
  let beatOffsetY = 0;
  if (frame >= beatStartFrame) {
    const beatFrame = frame - beatStartFrame;
    const currentBeatProgress = (beatFrame % framesPerBeat) / framesPerBeat;
    
    if (currentBeatProgress <= 0.3) {
      beatOffsetY = interpolate(
        currentBeatProgress,
        [0, 0.3],
        [0, -beatDistance],
        { 
          extrapolateLeft: 'clamp', 
          extrapolateRight: 'clamp', 
          easing: (t: number) => 1 - (1 - t) * (1 - t)
        }
      );
    } else if (currentBeatProgress <= 0.5) {
      beatOffsetY = -beatDistance;
    } else {
      beatOffsetY = interpolate(
        currentBeatProgress,
        [0.5, 1],
        [-beatDistance, 0],
        { 
          extrapolateLeft: 'clamp', 
          extrapolateRight: 'clamp', 
          easing: (t: number) => t * t
        }
      );
    }
  }

  // Initial slide-in position (from bottom)
  const slideInY = interpolate(slideProgress, [0, 1], [200, 0]);

  const isBackgroundImage = background?.endsWith('.png') || background?.endsWith('.jpg') || background?.endsWith('.jpeg');

  return (
    <AbsoluteFill style={{ backgroundColor: isBackgroundImage ? "transparent" : background }}>
      {/* Background Image */}
      {isBackgroundImage && (
        <Img
          src={staticFile(`/${background}`)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
      )}

      {/* Background slide-in effect - from bottom */}
      <div
        style={{
          position: "absolute",
          top: `${(1 - slideProgress) * 100}%`,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: isBackgroundImage ? "transparent" : background,
        }}
      />

      {/* Objects with black silhouette and white question mark */}
      {objects.map((object, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${slideInY + beatOffsetY}px) scale(${currentScale})`,
          }}
        >
          {object.endsWith('.png') || object.endsWith('.jpg') || object.endsWith('.jpeg') ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Black silhouette of the image */}
              <Img
                src={staticFile(`/${object}`)}
                style={{
                  width: "auto",
                  height: "auto",
                  transform: "scale(0.7)",
                  objectFit: "contain",
                  filter: "brightness(0)",
                }}
              />
              {/* White question mark overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "120px",
                  color: "white",
                  fontWeight: "bold",
                  fontFamily: "Arial, sans-serif",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                ?
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "200px" }}>{object}</div>
          )}
        </div>
      ))}

      {/* Text overlay */}
      {text && (
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "48px",
            fontWeight: "bold",
            color: "black",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(255,255,255,0.8)",
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};