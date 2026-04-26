import { animateContours, drawContours } from "./ts/contours.ts";

const LOGO_DRAW_SIZE = 80;
const LOGO_CANVAS_PADDING = 40;

const canvas = document.getElementById("isolated-contour") as HTMLCanvasElement | null;

if (canvas) {
  window.addEventListener("load", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      drawContours(canvas, LOGO_DRAW_SIZE, LOGO_DRAW_SIZE, {
        canvasPadding: LOGO_CANVAS_PADDING,
      });
      return;
    }

    animateContours(canvas, LOGO_DRAW_SIZE, LOGO_DRAW_SIZE, {
      amplitude: 0.16,
      speed: 0.0003,
      scale: 0.13,
      peakDrift: 1.6,
      peakHeightDrift: 0.08,
      peakSpeed: 0.00008,
      canvasPadding: LOGO_CANVAS_PADDING,
    });
  });
}
