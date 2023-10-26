import "./index.css"
import { drawSquiggle } from './ts/squiggle.ts'
import { Tabs } from './ts/tabs.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;

window.addEventListener("load", () => {
  canvasContainer.classList.remove("squiggle--hidden");
  drawSquiggle(canvas, 150, 150);
})

const tabsEl: HTMLElement | null = document.querySelector(
  "[data-module=tabs]"
);
if(tabsEl){
  const tabs: Tabs = new Tabs(tabsEl);
  console.log(tabs)
  tabs.initialise();
}
