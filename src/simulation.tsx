import React, {
  useEffect,
  useRef,
  useState,
  MutableRefObject,
  useMemo,
} from "react";
import { Car } from "./car";
import { D_GRAVITY, makeStepHandler } from "./stepHandler";

import { makeRenderHandler } from "./renderHandler";
import { Body, Vec2, World } from "planck-js";
import { TerrainPreset } from "./terrain";
export type SimulationProperties = {

  simSpeedValueRef: MutableRefObject<number>;
  autoFastValueRef: MutableRefObject<boolean>;
  setScore: (v: number) => void;
  setLeaderboard: (v: { score: number; ticks: number; car: Car }[]) => void;
  terrain: TerrainPreset;
  handleImportCarRef:MutableRefObject<(s:string)=>void>;
};
export type HandlerInfos = {
  simSpeedValueRef: MutableRefObject<number>;
  autoFastValueRef: MutableRefObject<boolean>;
  cameraRef: MutableRefObject<Vec2>;
  world: World;
  ground: Body;
  boxCarRef: MutableRefObject<Body>;
  genXRef: MutableRefObject<number>;
  scaleRef: MutableRefObject<number>;
  GRAVITY: number;
  setScore: (v: number) => void;
  setLeaderboard: (v: { score: number; ticks: number; car: Car }[]) => void;
  terrain: TerrainPreset;
  currentTicksRef :MutableRefObject<number>;
  distTicksRef :MutableRefObject<number>;
  restartTicksRef:MutableRefObject<number>;
  restartCurrentRef:MutableRefObject<number>;
  carScoreRef:MutableRefObject<number>;
  terrainXSRef:MutableRefObject<Vec2[]>;
  handleImportCarRef: MutableRefObject<(s: string) => void>;
  removeOldCarRef: MutableRefObject<() => void>;
};
export const Simulation = ({
  setScore,
  setLeaderboard,
  handleImportCarRef,
  terrain,
  simSpeedValueRef,
  autoFastValueRef
}: SimulationProperties) => {
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const cameraRef = useRef(Vec2(0, 0));
  const [GRAVITY, setGRAVITY] = useState(D_GRAVITY);
  const world = useMemo(
    () =>
      World({
        gravity: Vec2(0, -GRAVITY),
      }),
    [GRAVITY]
  );
  
  const terrainXSRef = useRef<number[]>([]);
  const ground = useMemo(() => world.createBody(), [world]);
  const genXRef = useRef(-200);
  const scaleRef = useRef(Math.min(window.innerWidth / 40, window.innerHeight / 40));
  const boxCarRef = useRef<Body>(null);
  const currentTicksRef = useRef(0);
  const distTicksRef = useRef(0);
  const restartTicksRef = useRef(400);
  const restartCurrentRef = useRef(0);
  const carScoreRef = useRef(0);
  const removeOldCarRef = useRef(() => { });
  useEffect(() => {
    if (canvasNode) {
      const ops = {
        cameraRef,
        world,
        ground,
        setScore,
        setLeaderboard,
        terrain,
        genXRef,
        GRAVITY,
        currentTicksRef ,
  distTicksRef ,
  restartTicksRef,
  restartCurrentRef,
  carScoreRef,
        boxCarRef,
        scaleRef,
        terrainXSRef,
        handleImportCarRef,
        removeOldCarRef,
        simSpeedValueRef,
        autoFastValueRef
      };
      console.log("REGO");
      const stepHandle = setInterval(
        makeStepHandler(canvasNode, ops),
        1000 / 75
      );
      const renderHandle = setInterval(
        makeRenderHandler(canvasNode, ops),
        1000 / 75
      );
      return () => {
        clearInterval(renderHandle);
        clearInterval(stepHandle);
        removeOldCarRef.current();
      };
    }
  }, [canvasNode,terrain]);
  return <canvas ref={(node) => setCanvasNode(node)} />;
};
