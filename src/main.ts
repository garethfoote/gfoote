import "./index.css"
import { draw } from './squiggle.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;

window.addEventListener("load", ()=> {
  const w:number = parseInt(window.getComputedStyle(canvas).getPropertyValue('width'));
  const h:number = parseInt(window.getComputedStyle(canvas).getPropertyValue('height'));
  canvasContainer.classList.remove("squiggle--hidden");
  draw(canvas, w, h);
})
