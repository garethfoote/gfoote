import "./index.css"
// import { drawSquiggle } from './ts/squiggle.ts'
import { drawContours } from './ts/contours.ts'
import { Tabs } from './ts/tabs.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;

window.addEventListener("load", () => {
  canvasContainer.classList.remove("squiggle--hidden");
  // drawSquiggle(canvas, 800, 600, 600);
  drawContours(canvas, 112, 112);
})

const tabsEl: HTMLElement | null = document.querySelector(
  "[data-module=tabs]"
);
if(tabsEl){
  const tabs: Tabs = new Tabs(tabsEl);
  tabs.initialise();
}

/*
 * If first paragraph in content contains an image we
 * assume this is a hero type image and remove the 
 * max-width constraint from the <p>
 */
const firstP = document.querySelector(".content p");
if(firstP?.firstElementChild?.tagName == "IMG"){
  firstP.classList.add("hero");
}


/*
* If in markdown text immediately follows an image then they both get
* put into a <p>. Using js to find those <p>s and adding class so that
* the image floats left.
*/
const markdownPs: NodeListOf<HTMLParagraphElement> = document.querySelectorAll('.content p')
Array.from(markdownPs).forEach(p => {
  const hasImg:boolean = Array.from(p.childNodes).filter(node => node.nodeName === "IMG").length >= 1
  const hasText:boolean = Array.from(p.childNodes).filter(node => node.nodeName === "#text").length >= 1
  const isFigcaption:boolean = Array.from(p.childNodes).filter(node => {
    if(node.nodeName === "#text") return false;
    return (node as HTMLElement).classList.contains("figcaption")
  }).length >= 1
  
  if(hasImg && hasText && !isFigcaption){
    p.classList.add("float-img-child")
    p.classList.add("clearfix")
  }  
});
