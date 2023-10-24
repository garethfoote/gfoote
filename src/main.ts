import "./index.css"
import { drawSquiggle } from './ts/squiggle.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;

window.addEventListener("load", () => {
  canvasContainer.classList.remove("squiggle--hidden");
  drawSquiggle(canvas, 150, 150);
})
