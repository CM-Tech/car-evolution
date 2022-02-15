import chroma from "chroma-js";

export const PALETTE = {
  WHITE: "#EBE8E7",
  WHITISH:"#E2E0D8",
  WHITER: "#FFFEFD",
  BLACK: "#393538",
  HUES: ["#68BAC8", "#E35362", "#E5CC5C"],
};

export const COLOR_MUL = PALETTE.HUES.map((x) => {
  let a = chroma(x).rgb(false);
  let b = chroma(PALETTE.WHITE).rgb(false);
  return chroma
    .rgb(
      Math.min(a[0] / b[0], 1) * 255,
      Math.min(a[1] / b[1], 1) * 255,
      Math.min(a[2] / b[2], 1) * 255
    )
    .hex();
});