import React from 'react';
import { z } from 'zod';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { JigsawPage } from './JigsawPage';

export const jigsawPageSchema = z.object({
  backgroundImage: z.string(),
  text: z.string().optional(),
  pieceRevealDuration: z.number().default(30),
  pieceFadeDuration: z.number().default(15),
  randomOrder: z.boolean().default(true),
  kickInDuration: z.number().default(2), // Duration in seconds for pieces to move to center
  thinkDuration: z.number().default(2),  // Duration in seconds for pieces to pause at center
  solveDuration: z.number().default(2),  // Duration in seconds for pieces to move to final position
});

export type JigsawPageCompositionProps = z.infer<typeof jigsawPageSchema>;

export const JigsawPageComposition: React.FC<JigsawPageCompositionProps> = (props) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <JigsawPage
      frame={frame}
      duration={durationInFrames}
      {...props}
    />
  );
};