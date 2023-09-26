import "./index.css"
// import { setupCounter } from './counter.ts'

import { draw } from './squiggle.ts'

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

const canvas = document.getElementById("squiggle") as HTMLCanvasElement;
draw(canvas, 400, 400);

