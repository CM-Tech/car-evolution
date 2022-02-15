import { noise } from "./perlin";

var flatLandEndX = 25;

export enum TerrainPreset {
  Sisyphus,
  Hills,
  Crescendo,
  Rocky
}
export function terrainCrescendo(x: number) {
  if (x < flatLandEndX) return 0;
  return (
    noise.perlin2((x - flatLandEndX) / 20, 0) * 10 +
    noise.perlin2((x - flatLandEndX) / 10, (x - flatLandEndX) / 10) * 10 -
    (Math.pow(Math.max(x - flatLandEndX, 0) / 10, 1.2) / 4) * 10
  );
}

export function terrainRocky(x: number) {
  if (x < flatLandEndX) return 0;
  return (
    noise.perlin2((x - flatLandEndX) / 15, 0) *
      (12 - 2 / ((x - flatLandEndX + 10) / 7)) +
    noise.perlin2((x - flatLandEndX) / 7, (x - flatLandEndX) / 7)
  );
}

export function terrainSisyphus(x: number) {
  if (x < flatLandEndX) return 0;
  var r = 250 - 25;
  if (r - Math.sqrt(1 - Math.pow(Math.max(x - flatLandEndX, 0) / r, 2)) * r) {
    return (
      (r - Math.sqrt(1 - Math.pow(Math.max(x - flatLandEndX, 0) / r, 2)) * r) *
      1.75
    );
  } else {
    return (
      noise.perlin2((x - flatLandEndX) / 15, 0) *
        (12 - 2 / ((x - flatLandEndX + 10) / 7)) +
      noise.perlin2((x - flatLandEndX) / 7, (x - flatLandEndX) / 7)
    );
  }

  /*return Math.pow(Math.max(x - flatLandEndX, 0) / 5, 3) / 4 * 8 + (((Math.max(x - flatLandEndX, 0) / 5) % 2) / 2 > 0.5
    ? 0.1
    : 0);*/
}
export function terrainHills(x: number) {
  if (x < flatLandEndX) return 0;
  var m = 1;
  if (x < flatLandEndX + 100) m = Math.max(x - flatLandEndX, 0) / 100;
  return (
    -Math.sin(
      Math.max(x - flatLandEndX, 0) / 20 +
        Math.pow(Math.max(x - flatLandEndX, 0) / 20, 1.75) / 20
    ) *
    10 *
    m
  ); // / (10+40/(Math.pow(Math.max(x - flatLandEndX, 0),0.5)+1)))*10;
}
