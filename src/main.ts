import "./index.css"
import { drawSquiggle } from './ts/squiggle.ts'
import { Tabs } from './ts/tabs.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;

window.addEventListener("load", () => {
  canvasContainer.classList.remove("squiggle--hidden");
  drawSquiggle(canvas, 800, 600, 600);
})

const tabsEl: HTMLElement | null = document.querySelector(
  "[data-module=tabs]"
);
if(tabsEl){
  const tabs: Tabs = new Tabs(tabsEl);
  console.log(tabs)
  tabs.initialise();
}

// If first paragraph in content contains an image we
// assume this is a hero type image and remove the 
// max-width constraint from the <p>
const firstP = document.querySelector(".content p");

if(firstP?.firstElementChild?.tagName == "IMG"){
  firstP.classList.add("hero");
  console.log('firstP', firstP)
}
