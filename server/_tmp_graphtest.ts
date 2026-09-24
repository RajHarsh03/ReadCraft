import { renderContributionSvg } from "./src/github/graphSvg.js";

const days = [
  { date: "2025-06-01", count: 3 },
  { date: "2025-06-02", count: 0 },
  { date: "2025-09-01", count: 5 },
];
const svg = renderContributionSvg(days, "test");
console.log("LENGTH:", svg.length);
console.log("HAS_NAN:", svg.includes("NaN"));
console.log("HEAD:", svg.slice(0, 120));
