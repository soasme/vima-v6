import "./index.css";
import { Composition } from "remotion";
import { FingerFamily, fingerFamilySchema, calculateMetadata } from "./FingerFamily";
import { FingerPageComposition, fingerPageSchema } from "./FingerFamily/FingerPageComposition";
import { ObjectPageComposition, objectPageSchema } from "./FingerFamily/ObjectPageComposition";
import { MysteriousObjectPageComposition, mysteriousObjectPageSchema } from "./FingerFamily/MysteriousObjectPageComposition";
import { MysteriousRevealComposition, mysteriousRevealSchema } from "./FingerFamily/MysteriousRevealComposition";
import { BurstStarEffect, burstStarSchema } from "./Effects/BurstStar";
import { EntroPage, entroSchema } from "./Common/Entro";
import { JigsawPageComposition, jigsawPageSchema } from "./JigsawPage/JigsawPageComposition";
import { TiktokCaptionComposition, tiktokCaptionSchema } from "./TiktokCaption";
import { FingerFamilyTiktokCaptionComposition, fingerFamilyTiktokCaptionSchema } from "./FingerFamily/FingerFamilyTiktokCaptionComposition";
import { TiktokCaption2Composition, tiktokCaption2Schema } from "./TiktokCaption2";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>


      <Composition
        id="FingerFamily"
        component={FingerFamily}
        calculateMetadata={calculateMetadata}
        fps={30}
        width={1920}
        height={1080}
        schema={fingerFamilySchema}
        defaultProps={{
          objects: [
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2.04, revealDuration: 2.50, fingerDuration: 1.46 }, // Object 1 - thumb (2.040s + 2.500s + 1.460s = 6s)
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 2 - index
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 3 - middle
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 4 - ring
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 5 - pinky
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 6 - thumb
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 7 - index
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 8 - middle
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }, // Object 9 - ring
            { objectImage: "cat.png", backgroundImage: "demoBg.png", mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }  // Object 10 - pinky
          ],
          bgm: "https://cdn1.suno.ai/31d5ebf2-2686-4ecc-9cd6-458067461c9e.mp3",
          lyrics: `[Verse 1 – Happy Pumpkin]
Happy pumpkin, happy pumpkin, where are you?
Here I am, here I am, smiling bright and true!
Ha-ha-ha, I'm feeling happy too!

[Verse 2 – Sad Pumpkin]
Sad pumpkin, sad pumpkin, where are you?
Here I am, here I am, feeling kind of blue!
Boo-hoo-hoo, I'm feeling sad, it's true!`
        }}
      />

      <Composition
        id="FingerPage"
        component={FingerPageComposition}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        schema={fingerPageSchema}
        defaultProps={{
          finger: "index",
          objects: ["cat.png"],
          text: "",
          background: "demoBg.png"
        }}
      />


      <Composition
        id="MysteriousObjectPage"
        component={MysteriousObjectPageComposition}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        schema={mysteriousObjectPageSchema}
        defaultProps={{
          objects: ["cat.png"],
          text: "",
          background: "demoBg.png"
        }}
      />

      <Composition
        id="MysteriousRevealPage"
        component={MysteriousRevealComposition}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        schema={mysteriousRevealSchema}
        defaultProps={{
          objects: ["cat.png"],
          text: "",
          background: "demoBg.png"
        }}
      />

      <Composition
        id="BurstStarEffect"
        component={BurstStarEffect}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
        schema={burstStarSchema}
        defaultProps={{
          x: 960,
          y: 540
        }}
      />

      <Composition
        id="EntroPage"
        component={EntroPage}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={entroSchema}
        defaultProps={{
          duration: 5
        }}
      />

      <Composition
        id="JigsawPage"
        component={JigsawPageComposition}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={jigsawPageSchema}
        defaultProps={{
          backgroundImage: "demoBg.png",
          text: "Complete the puzzle!",
          pieceRevealDuration: 30,
          pieceFadeDuration: 15,
          randomOrder: true
        }}
      />

      <Composition
        id="TiktokCaption"
        component={TiktokCaptionComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={tiktokCaptionSchema}
        defaultProps={{
          captions: [
            { text: "Tiger,", startMs: 430, endMs: 840 },
            { text: " tiger,", startMs: 840, endMs: 1660 },
            { text: " where", startMs: 1660, endMs: 2260 },
            { text: " are", startMs: 2260, endMs: 2500 },
            { text: " you?", startMs: 2500, endMs: 3380 },
            { text: " Here", startMs: 3380, endMs: 3680 },
            { text: " I", startMs: 3680, endMs: 3800 },
            { text: " am,", startMs: 3800, endMs: 4040 },
            { text: " here", startMs: 4040, endMs: 4280 },
            { text: " I", startMs: 4280, endMs: 4400 },
            { text: " am.", startMs: 4400, endMs: 4720 }
          ]
        }}
      />

      <Composition
        id="FingerFamilyTiktokCaption"
        component={FingerFamilyTiktokCaptionComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={fingerFamilyTiktokCaptionSchema}
        defaultProps={{
          lyrics: `[Verse 1 – Happy Pumpkin]
Happy pumpkin, happy pumpkin, where are you?
Here I am, here I am, smiling bright and true!
Ha-ha-ha, I'm feeling happy too!

[Verse 2 – Sad Pumpkin]
Sad pumpkin, sad pumpkin, where are you?
Here I am, here I am, feeling kind of blue!
Boo-hoo-hoo, I'm feeling sad, it's true!`,
          objects: [
            { mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 },
            { mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 },
            { mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 },
            { mysteriousDuration: 2, revealDuration: 2, fingerDuration: 2 }
          ]
        }}
      />

      <Composition
        id="TiktokCaption2"
        component={TiktokCaption2Composition}
        durationInFrames={3300}
        fps={30}
        width={1920}
        height={1080}
        schema={tiktokCaption2Schema}
        defaultProps={{
          outputJsonPath: "halloween-finger-family/output.json",
          combineTokensWithinMilliseconds: 1200
        }}
      />

    </>
  );
};
