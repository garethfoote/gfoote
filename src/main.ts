import "./index.css"
import { draw } from './ts/squiggle.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;

window.addEventListener("load", () => {
  canvasContainer.classList.remove("squiggle--hidden");
  draw(canvas, 150, 150);
})
