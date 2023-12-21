type ElevationMap = number[][];
type ColorValue = number & { kind: "ColorValue"; value: number };

let maxElevation : number = 1000;
let rez : number = 2.5;
let field : ElevationMap = [];
let cols : number;
let rows : number;
let ctx : CanvasRenderingContext2D | null;

function isColorValue(value: number): value is ColorValue {
  return value >= 0 && value <= 255;
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, strokeWidth: number = 0): void {
	if (strokeWidth > 0) {
			ctx.strokeRect(x, y, width, height);
	}
	ctx.fillRect(x, y, width, height);
}

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function ctxStroke(ctx: CanvasRenderingContext2D, clr: string): void {
  ctx.strokeStyle = clr;
}

function ctxFill(ctx: CanvasRenderingContext2D, clr: string): void {
  ctx.fillStyle = clr;
}

function lerp(start: number, end: number, amount: number): number {
  return start + amount * (end - start);
}

function map(value: number, fromStart: number, fromStop: number, toStart: number, toStop: number): number {
  return toStart + (toStop - toStart) * ((value - fromStart) / (fromStop - fromStart));
}

function createElevationCircle(
  elevationMap: ElevationMap,
  initialDropStrength: number = 300,
  fractionFactor: number = 0.95
): ElevationMap {
  const numRows: number = elevationMap.length;
  const numCols: number = elevationMap[0].length;
  const centerX: number = Math.floor(numCols / 2);
  const centerY: number = Math.floor(numRows / 2);

  // Radius of the circle
  const radius: number = Math.min(centerX, centerY);

  for (let i: number = 0; i < numRows; i++) {
    for (let j: number = 0; j < numCols; j++) {
      // Calculate distance from the center
      const distance: number = Math.sqrt(Math.pow(centerX - j, 2) + Math.pow(centerY - i, 2));
      
      // Calculate the fraction of the distance from the center
      const distanceFraction: number = distance / radius;

      // If the point is within the circle and not too close to the center, decrease the elevation
      if (distanceFraction <= fractionFactor) {
        // Map effectiveDropStrength between initialDropStrength and 0 based on the diminishing difference
        const mappedDropStrength: number = initialDropStrength * (1 - distanceFraction / fractionFactor);

        // Reduce the elevation based on the mapped drop strength
        elevationMap[i][j] += mappedDropStrength;
      }
    }
  }

  return elevationMap;
}

function drawElevationMap(elevationMap: ElevationMap, canvas : HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  let w: number = canvas.width / cols;
  let h: number = canvas.height / rows;

  ctxStroke(ctx, "#000");

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let elevation: number = elevationMap[i][j];
      let colourValue: number = Math.round(map(elevation, -1, 1, 0, 255));
      ctxFill(ctx, valueToHexColour(colourValue as ColorValue));
      drawRect(ctx, i * w, j * h, w, h);
    }
  }
}

function valueToHexColour(value: ColorValue): string {
  // Ensure the input value is within the valid range
  if (!isColorValue(value)) {
    throw new Error("Invalid color value. Must be between 0 and 255.");
  }

  // Convert the decimal value to hexadecimal
  const hexValue: string = value.toString(16).padStart(2, '0');

  // Construct the hex color string
  const hexColor: string = `#${hexValue}${hexValue}${hexValue}`;

  return hexColor;
}

function initializeElevationMap(cols: number, rows: number, maxElevation: number): number[][] {
  let field: ElevationMap = [];

  for (let i = 0; i < cols; i++) {
    field[i] = [];
    for (let j = 0; j < rows; j++) {
      field[i][j] = Math.random() * maxElevation;
    }
  }

  return field;
}

function generateSteepKeyPointElevations(
  field: number[][],
  maxElevation: number,
  numPeaks: number,
  initPeakSize: number = 6
): ElevationMap {
  const cols: number = field[0].length;
  const rows: number = field.length;
  const padding: number = Math.round(cols * 0.3);

  for (let i = 0; i < numPeaks; i++) {
    const peakSizeX: number = Math.ceil(Math.random() * initPeakSize);
    const peakSizeY: number = Math.ceil(Math.random() * initPeakSize);
    let x: number = Math.floor(Math.random() * (cols - padding * 2)) + padding;
    let y: number = Math.floor(Math.random() * (rows - padding * 2)) + padding;
    let peakElevation: number = (Math.random() * 0.2 * maxElevation) + (0.8 * maxElevation); // Increase peak elevation

    // Set the peak elevation for the entire peak area
    for (let dx = -peakSizeX; dx <= peakSizeX; dx++) {
      for (let dy = -peakSizeY; dy <= peakSizeY; dy++) {
        let nx: number = x + dx;
        let ny: number = y + dy;

        // Check if the neighbor is within the bounds of the elevation map
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          field[nx][ny] = peakElevation;
        }
      }
    }

    // Adjust surrounding points for steeper slopes
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        let nx: number = x + dx;
        let ny: number = y + dy;

        // Check if the neighbor is within the bounds of the elevation map
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          let distance: number = Math.sqrt(Math.pow(x - nx, 2) + Math.pow(y - ny, 2));
          let influence: number = map(distance, 0, 2, 1, 0.2); // Adjust the influence based on distance
          field[nx][ny] = lerp(field[nx][ny], peakElevation, influence);
        }
      }
    }
  }
  return field;
}

function smoothTerrain(field: number[][], numIterations: number = 5): void {
  const cols: number = field[0].length;
  const rows: number = field.length;

  for (let iteration = 0; iteration < numIterations; iteration++) {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let average: number = calculateAverage(field, i, j);
        field[i][j] = (field[i][j] + average) / 2;
      }
    }
  }
}

function calculateAverage(field: number[][], x: number, y: number): number {
  const cols: number = field[0].length;
  const rows: number = field.length;

  let sum: number = 0;
  let count: number = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let neighborX: number = x + i;
      let neighborY: number = y + j;

      // Check if the neighbor is within the bounds of the elevation map
      if (neighborX >= 0 && neighborX < cols && neighborY >= 0 && neighborY < rows) {
        sum += field[neighborX][neighborY];
        count++;
      }
    }
  }

  // Calculate the average elevation only if there are valid neighbors
  return count > 0 ? sum / count : field[x][y];
}

function canvasSetup(canvas: HTMLCanvasElement, width:number, height:number): void {
  // Adjust canvas size based on pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;
  rez *= pixelRatio;

  const canvasWidth = width * pixelRatio;
  const canvasHeight = height * pixelRatio;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.lineWidth = pixelRatio > 1 ? 2 : 1;
    ctxStroke(ctx, "#2E2C2C");
  }
}

function normaliseField(field: ElevationMap):ElevationMap {

    // Find the global minimum and maximum values
    const flattenField: number[] = ([] as number[]).concat(...field);
    const fieldMax: number = Math.max(...flattenField);
    const fieldMin: number = Math.min(...flattenField);

    const normalise = (value: number, fieldMin: number, fieldMax: number): number => {
      return (value - fieldMin) / (fieldMax - fieldMin) * 2 - 1;
    };
    const normaliseRow = (row:number[]) => row.map(value => normalise(value, fieldMin, fieldMax));
    field = field.map(normaliseRow);

  return field;
}

function getState(a: number, b: number, c: number, d: number): number {
  return (a > 0 ? 8 : 0) + (b > 0 ? 4 : 0) + (c > 0 ? 2 : 0) + (d > 0 ? 1 : 0);
}

function draw(ctx: CanvasRenderingContext2D, interval: number = 0.25): void {
  let isThick = true;
  console.log(window.devicePixelRatio)
  for (let h = -1; h < 1; h += interval) {  
    if(isThick == true) ctx.lineWidth = (window.devicePixelRatio > 2) ? 3 : 1.5;
    else ctx.lineWidth = (window.devicePixelRatio > 2) ? 2 : 1;
    isThick = !isThick;
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        let f0 = field[i][j] - h;
        let f1 = field[i + 1][j] - h;
        let f2 = field[i + 1][j + 1] - h;
        let f3 = field[i][j + 1] - h;

        let x = i * rez;
        let y = j * rez;
        let a = [x + rez * f0 / (f0 - f1), y];
        let b = [x + rez, y + rez * f1 / (f1 - f2)];
        let c = [x + rez * (1 - f2 / (f2 - f3)), y + rez];
        let d = [x, y + rez * (1 - f3 / (f3 - f0))];

        let state = getState(f0, f1, f2, f3);
        switch (state) {
          case 1:
            drawLine(ctx, c[0], c[1], d[0], d[1]);
            break;
          case 2:
            drawLine(ctx, b[0], b[1], c[0], c[1]);
            break;
          case 3:
            drawLine(ctx, b[0], b[1], d[0], d[1]);
            break;
          case 4:
            drawLine(ctx, a[0], a[1], b[0], b[1]);
            break;
          case 5:
            drawLine(ctx, a[0], a[1], d[0], d[1]);
            drawLine(ctx, b[0], b[1], c[0], c[1]);
            break;
          case 6:
            drawLine(ctx, a[0], a[1], c[0], c[1]);
            break;
          case 7:
            drawLine(ctx, a[0], a[1], d[0], d[1]);
            break;
          case 8:
            drawLine(ctx, a[0], a[1], d[0], d[1]);
            break;
          case 9:
            drawLine(ctx, a[0], a[1], c[0], c[1]);
            break;
          case 10:
            drawLine(ctx, a[0], a[1], b[0], b[1]);
            drawLine(ctx, c[0], c[1], d[0], d[1]);
            break;
          case 11:
            drawLine(ctx, a[0], a[1], b[0], b[1]);
            break;
          case 12:
            drawLine(ctx, b[0], b[1], d[0], d[1]);
            break;
          case 13:
            drawLine(ctx, b[0], b[1], c[0], c[1]);
            break;
          case 14:
            drawLine(ctx, c[0], c[1], d[0], d[1]);
            break;
        }
      }
    }
  }
}


export function drawContours(canvas: HTMLCanvasElement, width:number, height:number): void{
	
  canvasSetup(canvas, width, height);
  const ctx : CanvasRenderingContext2D | null = canvas.getContext("2d");

  if(canvas && ctx){
    cols = 1 + canvas.width / rez;
    rows = 1 + canvas.height / rez;

    field = initializeElevationMap(cols, rows, maxElevation*0.25);
    createElevationCircle(field, 800, 0.9);
    generateSteepKeyPointElevations(field, maxElevation*1.25, 3, 5);
    smoothTerrain(field, 10);

    field = normaliseField(field);

    drawElevationMap(field, canvas, ctx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx, 0.24);
  }
}
 