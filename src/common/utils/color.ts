import type { Okhsv } from 'culori/fn';

function adjustHue(val: number) {
  if (val < 0) val += Math.ceil(-val / 360) * 360;

  return val % 360;
}

function createScientificPalettes(baseColor: Okhsv, factor: number = 0.5) {
  const targetHueSteps = {
    analogous: [30, 0, 60].map((step) => step * factor),
    complementary: [0, 180].map((step) => step * factor),
    splitComplementary: [150, 0, 210].map((step) => step * factor),
    tetradic: [90, 270, 0, 180].map((step) => step * factor),
    triadic: [120, 0, 240].map((step) => step * factor),
  };

  const monochromeSteps = [-50, -25, 0, 25, 50];

  const palettes: Record<string, Array<Okhsv>> = {};

  for (const type of Object.keys(targetHueSteps)) {
    palettes[type] = targetHueSteps[type as keyof typeof targetHueSteps].map(
      (step) => ({
        h: adjustHue(baseColor.h! + step),
        mode: 'okhsv',
        s: baseColor.s,
        v: baseColor.v,
      })
    );
  }

  palettes.monochrome = monochromeSteps.map((step) => ({
    h: baseColor.h!,
    mode: 'okhsv',
    s: baseColor.s,
    v: Math.max(baseColor.v + step / 100, 0),
  }));

  return palettes;
}

export const createPalettes = (baseColor: Okhsv) =>
  createScientificPalettes(baseColor);
