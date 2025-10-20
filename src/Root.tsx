import "./index.css";
import { Composition } from "remotion";
import { FingerFamily, fingerFamilySchema, calculateMetadata } from "./FingerFamily";
import { FingerPageComposition, fingerPageSchema } from "./FingerFamily/FingerPageComposition";
import { ObjectPageComposition, objectPageSchema } from "./FingerFamily/ObjectPageComposition";
import { MysteriousObjectPageComposition, mysteriousObjectPageSchema } from "./FingerFamily/MysteriousObjectPageComposition";
import { MysteriousRevealComposition, mysteriousRevealSchema } from "./FingerFamily/MysteriousRevealComposition";
import { BurstStarEffect, burstStarSchema } from "./Effects/BurstStar";
import { EntroPage, entroSchema } from "./Common/Entro";

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
          bgm: "https://cdn1.suno.ai/31d5ebf2-2686-4ecc-9cd6-458067461c9e.mp3"
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

    </>
  );
};
