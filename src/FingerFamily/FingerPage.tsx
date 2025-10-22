import { AbsoluteFill, interpolate, spring, useVideoConfig, Img, staticFile, useCurrentFrame } from "remotion";
import { FingerPageProps } from "./types";
import { BurstStarEffect } from "../Effects/BurstStar";

export const FingerPage: React.FC<Omit<FingerPageProps, 'frame' | 'duration'>> = ({
  background = "white",
  finger,
  objects = [],
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  // First 0.5s animation setup
  const introAnimationDuration = fps * 0.5; // 0.5 seconds
  const isInIntroAnimation = frame < introAnimationDuration;
  
  // Enlargement animation from 0.5s to 1.5s
  const enlargementStartFrame = fps * 0.5; // 0.5 seconds
  const enlargementEndFrame = fps * 1.5; // 1.5 seconds
  const isInEnlargementAnimation = frame >= enlargementStartFrame && frame < enlargementEndFrame;
  
  // Hand slide-up animation from bottom during first 0.5s
  const handSlideProgress = isInIntroAnimation ? interpolate(
    frame,
    [0, introAnimationDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  ) : 1;
  
  // Object movement from center to finger during first 0.5s
  const objectMoveProgress = isInIntroAnimation ? interpolate(
    frame,
    [0, introAnimationDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  ) : 1;

  // Constant wave speed: complete one wave cycle every 2 seconds (60 frames at 30fps)
  // Only start waving after intro animation
  const waveLength = fps * 2; // 2 seconds per complete wave cycle
  const waveFrame = Math.max(0, frame - introAnimationDuration);
  const wavePhase = (waveFrame % waveLength) / waveLength; // 0 to 1 repeating cycle
  
  const swingProgress = isInIntroAnimation ? 0 : interpolate(
    wavePhase,
    [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    [0, 0.3, 0, -0.3, 0, 0.3, 0, -0.3, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const handRotation = swingProgress * 15; // 15 degrees swing

  // VectorHand.png finger positions from original script
  // Using exact pixel coordinates from moviepy script
  const getFingerPosition = (fingerName?: string) => {
    const positions = {
      thumb: { x: "1234px", y: "591px" },    // (1234,591)
      index: { x: "1028px", y: "215px" },   // (1028,215)
      middle: { x: "805px", y: "169px" },   // (805,169)
      ring: { x: "593px", y: "243px" },     // (593,243)
      pinky: { x: "453px", y: "413px" },    // (453,413)
    };
    return positions[fingerName as keyof typeof positions] || { x: "820px", y: "400px" };
  };

  const fingerPos = getFingerPosition(finger);

  // Enlargement and camera focus animation from 0.5s to 1.5s
  const enlargementProgress = isInEnlargementAnimation ? interpolate(
    frame,
    [enlargementStartFrame, enlargementEndFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  ) : (frame >= enlargementEndFrame ? 1 : 0);

  // Scale factor: grows from 1x to 2x during enlargement period (for foreground)
  const foregroundScale = interpolate(
    enlargementProgress,
    [0, 1],
    [1, 2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Background scale: much less scaling for parallax effect
  const backgroundScale = interpolate(
    enlargementProgress,
    [0, 1],
    [1, 1.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Camera focus: translate to center the selected finger
  const fingerX = parseInt(fingerPos.x);
  const fingerY = parseInt(fingerPos.y);
  const screenCenterX = 960;
  const screenCenterY = 540;
  
  // Calculate translation needed to center the finger
  const targetTranslateX = screenCenterX - fingerX;
  const targetTranslateY = screenCenterY - fingerY;
  
  const cameraTranslateX = interpolate(
    enlargementProgress,
    [0, 1],
    [0, targetTranslateX],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  
  const cameraTranslateY = interpolate(
    enlargementProgress,
    [0, 1],
    [0, targetTranslateY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Calculate hand position with slide-up animation
  const baseHandTop = 108; // Normal hand position
  const handStartTop = 1080; // Start from bottom of screen
  const currentHandTop = interpolate(
    handSlideProgress,
    [0, 1],
    [handStartTop, baseHandTop]
  );

  // Calculate object position during intro animation  
  // Convert finger position from string to number for interpolation (already declared above)
  
  const currentObjectX = interpolate(
    objectMoveProgress,
    [0, 1],
    [screenCenterX, fingerX]
  );
  
  const currentObjectY = interpolate(
    objectMoveProgress,
    [0, 1],
    [screenCenterY, fingerY + currentHandTop - baseHandTop] // Adjust for hand position
  );


  const isBackgroundImage = background?.endsWith('.png') || background?.endsWith('.jpg') || background?.endsWith('.jpeg');

  return (
    <AbsoluteFill style={{ backgroundColor: isBackgroundImage ? "transparent" : background }}>
      {/* Background layer - static, no movement */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
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
            }}
          />
        )}

        {/* Background slide-in effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${(1 - slideProgress) * -100}%`,
            width: "100%",
            height: "100%",
            backgroundColor: isBackgroundImage ? "transparent" : background,
          }}
        />
      </div>

      {/* Foreground scene container with full scale and camera transform */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `scale(${foregroundScale}) translate(${cameraTranslateX}px, ${cameraTranslateY}px)`,
          transformOrigin: "center center",
        }}
      >

      {/* Hand */}
      <div
        style={{
          position: "absolute",
          top: `${currentHandTop}px`,
          left: "55px",
          transform: `rotate(${handRotation}deg)`,
          transformOrigin: "960px 1648px",
        }}
      >
        <Img
          src={staticFile("/VectorHand.png")}
          style={{
            width: "1640px",
            height: "auto",
          }}
        />
      </div>

      {/* Objects positioned on finger or moving from center */}
      {objects.map((object, index) => {
        if (isInIntroAnimation) {
          // During intro: object moves independently from center to finger
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: `${currentObjectY}px`,
                left: `${currentObjectX}px`,
                transform: `translate(-50%, -50%)`,
                zIndex: 10,
              }}
            >
              {object.endsWith('.png') || object.endsWith('.jpg') || object.endsWith('.jpeg') ? (
                <Img
                  src={staticFile(`/${object}`)}
                  style={{
                    width: "500px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ fontSize: "120px" }}>{object}</div>
              )}
            </div>
          );
        } else {
          // After intro: object is attached to hand and moves with it
          // Position object absolutely but calculate position relative to hand transforms
          const handCenterX = 55 + 960; // hand left + transform origin x
          const handCenterY = currentHandTop + 1648; // hand top + transform origin y
          
          // Calculate rotated finger position
          const radians = (handRotation * Math.PI) / 180;
          const relativeFingerX = fingerX - 960; // relative to transform origin
          const relativeFingerY = fingerY - 1648; // relative to transform origin
          
          const rotatedFingerX = relativeFingerX * Math.cos(radians) - relativeFingerY * Math.sin(radians);
          const rotatedFingerY = relativeFingerX * Math.sin(radians) + relativeFingerY * Math.cos(radians);
          
          const finalObjectX = handCenterX + rotatedFingerX;
          const finalObjectY = handCenterY + rotatedFingerY;
          
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: `${finalObjectY}px`,
                left: `${finalObjectX}px`,
                transform: `translate(-50%, -50%)`,
                zIndex: 10,
              }}
            >
              {object.endsWith('.png') || object.endsWith('.jpg') || object.endsWith('.jpeg') ? (
                <Img
                  src={staticFile(`/${object}`)}
                  style={{
                    width: "500px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ fontSize: "120px" }}>{object}</div>
              )}
            </div>
          );
        }
      })}


      {/* Star particle effect at joint point during joint moment */}
      {objects.map((object, index) => {
        // Show burst for 30 frames starting from introAnimationDuration
        if (frame >= introAnimationDuration && frame < introAnimationDuration + 30) {
          // Calculate exact joint position (finger position) when joint happens
          const handCenterX = 55 + 960;
          const handCenterY = currentHandTop + 1648;
          
          const radians = (handRotation * Math.PI) / 180;
          const relativeFingerX = fingerX - 960;
          const relativeFingerY = fingerY - 1648;
          
          const rotatedFingerX = relativeFingerX * Math.cos(radians) - relativeFingerY * Math.sin(radians);
          const rotatedFingerY = relativeFingerX * Math.sin(radians) + relativeFingerY * Math.cos(radians);
          
          // Burst position is exactly at the joint point (finger position)
          const burstX = handCenterX + rotatedFingerX;
          const burstY = handCenterY + rotatedFingerY;

          return <BurstStarEffect key={`particle-${index}`} x={burstX} y={burstY} />;
        }
        return null;
      })}
      </div>

      {/* Text overlay - outside of scaled container */}
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