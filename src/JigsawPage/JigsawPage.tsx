import React from 'react';
import { AbsoluteFill, interpolate, staticFile, spring, useVideoConfig, Img, Sequence, useCurrentFrame } from 'remotion';
import { JigsawPageCompositionProps } from './JigsawPageComposition';

interface JigsawPageProps extends JigsawPageCompositionProps {
  frame: number;
  duration: number;
}

interface PuzzlePiece {
  id: string;
  x: number;
  y: number;
  revealFrame: number;
  scale: number;
  startX: number;
  startY: number;
}

export const JigsawPage: React.FC<JigsawPageProps> = ({
  frame,
  duration,
  backgroundImage,
  text,
  pieceRevealDuration = 30,
  pieceFadeDuration = 15,
  randomOrder = true,
  kickInDuration = 2,
  thinkDuration = 2,
  solveDuration = 2,
}) => {
  const { width, height, fps } = useVideoConfig();

  // Read piece data from JSON
  const [pieceData, setPieceData] = React.useState<Record<string, [number, number]>>({});
  
  React.useEffect(() => {
    fetch(staticFile('jigsaw/piece_data.json'))
      .then(res => res.json())
      .then(data => setPieceData(data));
  }, []);

  // Actual dimensions from the outline and piece files
  const outlineWidth = 1456;
  const outlineHeight = 816;
  const puzzleAspectRatio = outlineWidth / outlineHeight;
  
  const puzzleWidth = Math.min(width * 0.7, height * 0.7 * puzzleAspectRatio);
  const puzzleHeight = puzzleWidth / puzzleAspectRatio;
  
  // Center the actual assembled puzzle content
  const puzzleX = (width - puzzleWidth) / 2;
  const puzzleY = (height - puzzleHeight) / 2;

  const totalPieces = Object.keys(pieceData).length;
  // Calculate total duration per piece based on adjustable parameters
  const pieceSequenceDuration = fps * (kickInDuration + thinkDuration + solveDuration);
  const totalRevealTime = totalPieces * pieceSequenceDuration;

  const createPuzzlePieces = (): PuzzlePiece[] => {
    if (Object.keys(pieceData).length === 0) return [];
    
    // Scale to fit the target puzzle size
    const scale = puzzleWidth / outlineWidth;
    
    // Center the outline/puzzle area on screen
    const puzzleOffsetX = (width - puzzleWidth) / 2;
    const puzzleOffsetY = (height - puzzleHeight) / 2;
    
    const pieces: PuzzlePiece[] = Object.entries(pieceData).map(([id, [x, y]]) => {
      // Generate random off-screen starting position
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let startX, startY;
      
      switch (side) {
        case 0: // top
          startX = Math.random() * width;
          startY = -200;
          break;
        case 1: // right
          startX = width + 200;
          startY = Math.random() * height;
          break;
        case 2: // bottom
          startX = Math.random() * width;
          startY = height + 200;
          break;
        case 3: // left
          startX = -200;
          startY = Math.random() * height;
          break;
        default:
          startX = -200;
          startY = -200;
      }

      return {
        id,
        x: puzzleOffsetX + (x * scale),
        y: puzzleOffsetY + (y * scale),
        startX,
        startY,
        revealFrame: 0,
        scale,
      };
    });

    if (randomOrder) {
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
    }

    pieces.forEach((piece, index) => {
      piece.revealFrame = index * pieceSequenceDuration;
    });

    return pieces;
  };

  const puzzlePieces = React.useMemo(createPuzzlePieces, [pieceRevealDuration, randomOrder, pieceData, puzzleX, puzzleY, puzzleWidth]);

  const PuzzlePieceAnimation: React.FC<{ piece: PuzzlePiece }> = ({ piece }) => {
    const { fps, width, height } = useVideoConfig();
    
    // Use adjustable durations from props
    const toCenterDuration = fps * kickInDuration;
    const pauseDuration = fps * thinkDuration;
    const springDuration = fps * solveDuration;
    
    // Center of screen - using simple screen center without piece dimension estimates
    const centerX = width / 2;
    const centerY = height / 2;
    
    return (
      <>
        {/* Phase 1: Move to center */}
        <Sequence from={0} durationInFrames={toCenterDuration}>
          <AnimatedPiece
            piece={piece}
            startX={piece.startX}
            startY={piece.startY}
            endX={centerX}
            endY={centerY}
            startRotation={180}
            endRotation={0}
            startScaleX={-1}
            endScaleX={1}
            animationType="toCenter"
            toCenterDuration={toCenterDuration}
          />
        </Sequence>
        
        {/* Phase 2: Pause at center */}
        <Sequence from={toCenterDuration} durationInFrames={pauseDuration}>
          <StaticPiece
            piece={piece}
            x={centerX}
            y={centerY}
            rotation={0}
            scaleX={1}
          />
        </Sequence>
        
        {/* Phase 3: Spring to final position */}
        <Sequence from={toCenterDuration + pauseDuration} durationInFrames={springDuration}>
          <AnimatedPiece
            piece={piece}
            startX={centerX}
            startY={centerY}
            endX={piece.x}
            endY={piece.y}
            startRotation={0}
            endRotation={0}
            startScaleX={1}
            endScaleX={1}
            animationType="spring"
          />
        </Sequence>
      </>
    );
  };

  const AnimatedPiece: React.FC<{
    piece: PuzzlePiece;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startRotation: number;
    endRotation: number;
    startScaleX: number;
    endScaleX: number;
    animationType: 'toCenter' | 'spring';
    toCenterDuration?: number;
  }> = ({ piece, startX, startY, endX, endY, startRotation, endRotation, startScaleX, endScaleX, animationType, toCenterDuration }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    
    let progress;
    if (animationType === 'spring') {
      progress = spring({
        frame,
        fps,
        config: {
          damping: 10,
          stiffness: 100,
          mass: 0.5,
        },
      });
    } else {
      progress = frame / (toCenterDuration || fps * 2); // Linear for kickInDuration
    }
    
    const currentX = interpolate(
      progress,
      [0, 1],
      [startX, endX],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    const currentY = interpolate(
      progress,
      [0, 1],
      [startY, endY],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    const rotation = interpolate(
      progress,
      [0, 1],
      [startRotation, endRotation],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    const scaleX = interpolate(
      progress,
      [0, 1],
      [startScaleX, endScaleX],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    return (
      <Img
        src={staticFile(`jigsaw/${piece.id}.png`)}
        style={{
          position: 'absolute',
          left: currentX,
          top: currentY,
          transform: `scale(${piece.scale * scaleX}, ${piece.scale}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      />
    );
  };

  const StaticPiece: React.FC<{
    piece: PuzzlePiece;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
  }> = ({ piece, x, y, rotation, scaleX }) => {
    return (
      <Img
        src={staticFile(`jigsaw/${piece.id}.png`)}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: `scale(${piece.scale * scaleX}, ${piece.scale}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      />
    );
  };

  const textOpacity = interpolate(
    frame,
    [totalRevealTime + 30, totalRevealTime + 60],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );


  return (
    <AbsoluteFill>
      <Img
        src={staticFile(backgroundImage)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      <Img
        src={staticFile('jigsaw/piece_outline.png')}
        style={{
          position: 'absolute',
          left: puzzleX,
          top: puzzleY,
          width: puzzleWidth,
          height: puzzleHeight,
        }}
      />
      
      {puzzlePieces.map((piece, index) => (
        <Sequence
          key={piece.id}
          from={piece.revealFrame}
          durationInFrames={pieceSequenceDuration}
        >
          <PuzzlePieceAnimation piece={piece} />
        </Sequence>
      ))}

      {text && (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            opacity: textOpacity,
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '15px',
            maxWidth: '80%',
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};