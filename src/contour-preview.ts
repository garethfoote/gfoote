import { animateContours, drawContours } from "./ts/contours.ts";

const GRID_SIZE = 12;
const CANVAS_WIDTH = 96;
const CANVAS_HEIGHT = 96;
const HERO_WIDTH = CANVAS_WIDTH;
const HERO_HEIGHT = CANVAS_HEIGHT;

const gallery = document.querySelector("[data-contour-gallery]") as HTMLElement | null;
const regenButton = document.querySelector("[data-regenerate]") as HTMLButtonElement | null;
const heroCanvas = document.querySelector("[data-contour-hero]") as HTMLCanvasElement | null;

let stopHeroAnimation: (() => void) | null = null;

function renderHero(): void {
  if (!heroCanvas) return;
  stopHeroAnimation?.();
  stopHeroAnimation = animateContours(heroCanvas, HERO_WIDTH, HERO_HEIGHT, {
    amplitude: 0.16,
    speed: 0.0003,
    scale: 0.13,
    peakDrift: 1.6,
    peakHeightDrift: 0.08,
    peakSpeed: 0.00008,
  });
}

function renderGallery(): void {
  if (!gallery) return;

  gallery.innerHTML = "";

  for (let i = 0; i < GRID_SIZE; i++) {
    const figure = document.createElement("figure");
    figure.className = "sample";

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.setAttribute("aria-label", `Contour sample ${i + 1}`);

    drawContours(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);

    figure.appendChild(canvas);
    gallery.appendChild(figure);
  }
}

regenButton?.addEventListener("click", () => {
  renderHero();
  renderGallery();
});

window.addEventListener("load", () => {
  renderHero();
  renderGallery();
});
