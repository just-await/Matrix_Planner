// lib/themes.ts

export interface Theme {
  id: string;
  name: string;
  levelRequired: number;
  rankRequired: string;
  primaryHex: string;
  cssVars: {
    bg: string;
    primary: string;
    darkPrimary: string;
    border: string;
    glow: string;
    primaryRgb: string;
    borderRgb: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "classic-matrix",
    name: "CLASSIC MATRIX",
    levelRequired: 1,
    rankRequired: "NEOPHYTE",
    primaryHex: "#00FF66",
    cssVars: {
      bg: "#030703",
      primary: "#00FF66",
      darkPrimary: "#051A0B",
      border: "#004D1F",
      glow: "rgba(0, 255, 102, 0.4)",
      primaryRgb: "0, 255, 102",
      borderRgb: "0, 77, 31",
    },
  },
  {
    id: "cyberpunk-2077",
    name: "CYBERPUNK 2077",
    levelRequired: 5,
    rankRequired: "OPERATIVE",
    primaryHex: "#FFB800",
    cssVars: {
      bg: "#0A0800",
      primary: "#FFB800",
      darkPrimary: "#261C00",
      border: "#805C00",
      glow: "rgba(255, 184, 0, 0.4)",
      primaryRgb: "255, 184, 0",
      borderRgb: "128, 92, 0",
    },
  },
  {
    id: "synthwave-sunset",
    name: "SYNTHWAVE",
    levelRequired: 10,
    rankRequired: "CYPHER PUNK",
    primaryHex: "#FF007F",
    cssVars: {
      bg: "#0A0005",
      primary: "#FF007F",
      darkPrimary: "#260014",
      border: "#800040",
      glow: "rgba(255, 0, 127, 0.4)",
      primaryRgb: "255, 0, 127",
      borderRgb: "128, 0, 64",
    },
  },
  {
    id: "rogue-ai",
    name: "ROGUE AI",
    levelRequired: 15,
    rankRequired: "NET RUNNER",
    primaryHex: "#FF3333",
    cssVars: {
      bg: "#0A0000",
      primary: "#FF3333",
      darkPrimary: "#260808",
      border: "#801A1A",
      glow: "rgba(255, 51, 51, 0.4)",
      primaryRgb: "255, 51, 51",
      borderRgb: "128, 26, 26",
    },
  },
  {
    id: "quantum-ice",
    name: "QUANTUM ICE",
    levelRequired: 20,
    rankRequired: "SYSTEM ARCHITECT",
    primaryHex: "#00F0FF",
    cssVars: {
      bg: "#000A0D",
      primary: "#00F0FF",
      darkPrimary: "#00222B",
      border: "#007788",
      glow: "rgba(0, 240, 255, 0.4)",
      primaryRgb: "0, 240, 255",
      borderRgb: "0, 119, 136",
    },
  },
  {
    id: "monarch-gold",
    name: "MONARCH GOLD",
    levelRequired: 30,
    rankRequired: "THE ONE / NEO",
    primaryHex: "#FFD700",
    cssVars: {
      bg: "#0A0900",
      primary: "#FFD700",
      darkPrimary: "#262200",
      border: "#807100",
      glow: "rgba(255, 215, 0, 0.4)",
      primaryRgb: "255, 215, 0",
      borderRgb: "128, 113, 0",
    },
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}