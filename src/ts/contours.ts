type ElevationMap = number[][];
type PeakDefinition = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
  elevation: number;
};
type ContourScene = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  seedField: ElevationMap;
  peaks: PeakDefinition[];
  motionMask: ElevationMap;
  animatedField: ElevationMap;
  rez: number;
  cols: number;
  rows: number;
  offsetX: number;
  offsetY: number;
};
type AnimateContoursOptions = {
  amplitude?: number;
  speed?: number;
  scale?: number;
  peakDrift?: number;
  peakHeightDrift?: number;
  peakSpeed?: number;
  canvasPadding?: number;
};

const maxElevation: number = 1000;
const BASE_REZ: number = 2.5;
let field: ElevationMap = [];
let cols: number;
let rows: number;
let ctx: CanvasRenderingContext2D | null;

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function ctxStroke(ctx: CanvasRenderingContext2D, clr: string): void {
  ctx.strokeStyle = clr;
}

function lerp(start: number, end: number, amount: number): number {
  return start + amount * (end - start);
}

function map(value: number, fromStart: number, fromStop: number, toStart: number, toStop: number): number {
  return toStart + (toStop - toStart) * ((value - fromStart) / (fromStop - fromStart));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cloneField(source: ElevationMap): ElevationMap {
  return source.map((row) => [...row]);
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
  const radius: number = Math.min(centerX, centerY);

  for (let i: number = 0; i < numRows; i++) {
    for (let j: number = 0; j < numCols; j++) {
      const distance: number = Math.sqrt(Math.pow(centerX - j, 2) + Math.pow(centerY - i, 2));
      const distanceFraction: number = distance / radius;

      if (distanceFraction <= fractionFactor) {
        const mappedDropStrength: number = initialDropStrength * (1 - distanceFraction / fractionFactor);
        elevationMap[i][j] += mappedDropStrength;
      }
    }
  }

  return elevationMap;
}

function initializeElevationMap(cols: number, rows: number, maxElevation: number): ElevationMap {
  const field: ElevationMap = [];

  for (let i = 0; i < cols; i++) {
    field[i] = [];
    for (let j = 0; j < rows; j++) {
      field[i][j] = Math.random() * maxElevation;
    }
  }

  return field;
}

function createPeakDefinitions(
  cols: number,
  rows: number,
  maxElevation: number,
  numPeaks: number,
  initPeakSize: number = 6
): PeakDefinition[] {
  const peaks: PeakDefinition[] = [];
  const padding: number = Math.round(cols * 0.3);

  for (let i = 0; i < numPeaks; i++) {
    peaks.push({
      sizeX: Math.ceil(Math.random() * initPeakSize),
      sizeY: Math.ceil(Math.random() * initPeakSize),
      x: Math.floor(Math.random() * (cols - padding * 2)) + padding,
      y: Math.floor(Math.random() * (rows - padding * 2)) + padding,
      elevation: (Math.random() * 0.2 * maxElevation) + (0.8 * maxElevation),
    });
  }

  return peaks;
}

function applyPeakDefinitions(field: ElevationMap, peaks: PeakDefinition[]): ElevationMap {
  const numCols: number = field.length;
  const numRows: number = field[0].length;

  for (const peak of peaks) {
    const minX = Math.max(0, Math.floor(peak.x - peak.sizeX - 2));
    const maxX = Math.min(numCols - 1, Math.ceil(peak.x + peak.sizeX + 2));
    const minY = Math.max(0, Math.floor(peak.y - peak.sizeY - 2));
    const maxY = Math.min(numRows - 1, Math.ceil(peak.y + peak.sizeY + 2));

    for (let nx = minX; nx <= maxX; nx++) {
      for (let ny = minY; ny <= maxY; ny++) {
        const dx = nx - peak.x;
        const dy = ny - peak.y;
        const ellipseDistance = Math.sqrt(
          Math.pow(dx / (peak.sizeX + 0.75), 2) +
          Math.pow(dy / (peak.sizeY + 0.75), 2)
        );

        if (ellipseDistance > 1.75) continue;

        let influence: number;
        if (ellipseDistance <= 1) {
          influence = 1;
        } else {
          influence = map(ellipseDistance, 1, 1.75, 1, 0.15);
        }

        field[nx][ny] = lerp(field[nx][ny], peak.elevation, influence);
      }
    }
  }

  return field;
}

function smoothTerrain(field: ElevationMap, numIterations: number = 5): void {
  const cols: number = field[0].length;
  const rows: number = field.length;

  for (let iteration = 0; iteration < numIterations; iteration++) {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const average: number = calculateAverage(field, i, j);
        field[i][j] = (field[i][j] + average) / 2;
      }
    }
  }
}

function calculateAverage(field: ElevationMap, x: number, y: number): number {
  const cols: number = field[0].length;
  const rows: number = field.length;

  let sum: number = 0;
  let count: number = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const neighborX: number = x + i;
      const neighborY: number = y + j;

      if (neighborX >= 0 && neighborX < cols && neighborY >= 0 && neighborY < rows) {
        sum += field[neighborX][neighborY];
        count++;
      }
    }
  }

  return count > 0 ? sum / count : field[x][y];
}

function createMotionMask(
  cols: number,
  rows: number,
  fullStrengthRadius: number = 0.48,
  fadeEndRadius: number = 0.8
): ElevationMap {
  const centerX: number = (cols - 1) / 2;
  const centerY: number = (rows - 1) / 2;
  const maxRadius: number = Math.min(centerX, centerY);
  const mask: ElevationMap = [];

  for (let i = 0; i < cols; i++) {
    mask[i] = [];
    for (let j = 0; j < rows; j++) {
      const dx: number = i - centerX;
      const dy: number = j - centerY;
      const radiusFraction: number = Math.sqrt(dx * dx + dy * dy) / maxRadius;

      if (radiusFraction <= fullStrengthRadius) {
        mask[i][j] = 1;
      } else if (radiusFraction >= fadeEndRadius) {
        mask[i][j] = 0;
      } else {
        const progress: number = (radiusFraction - fullStrengthRadius) / (fadeEndRadius - fullStrengthRadius);
        mask[i][j] = 1 - progress * progress * (3 - 2 * progress);
      }
    }
  }

  return mask;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function hash3(x: number, y: number, z: number): number {
  const dot = x * 127.1 + y * 311.7 + z * 74.7;
  return fract(Math.sin(dot) * 43758.5453123);
}

function gradient3(ix: number, iy: number, iz: number): [number, number, number] {
  const angleA = hash3(ix, iy, iz) * Math.PI * 2;
  const angleB = hash3(ix + 19.19, iy + 7.73, iz + 3.11) * Math.PI * 2;
  const z = Math.cos(angleB);
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return [Math.cos(angleA) * r, Math.sin(angleA) * r, z];
}

function dotGridGradient(ix: number, iy: number, iz: number, x: number, y: number, z: number): number {
  const gradient = gradient3(ix, iy, iz);
  const dx = x - ix;
  const dy = y - iy;
  const dz = z - iz;
  return dx * gradient[0] + dy * gradient[1] + dz * gradient[2];
}

function perlin3(x: number, y: number, z: number): number {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;
  const z0 = Math.floor(z);
  const z1 = z0 + 1;

  const sx = fade(x - x0);
  const sy = fade(y - y0);
  const sz = fade(z - z0);

  const n000 = dotGridGradient(x0, y0, z0, x, y, z);
  const n100 = dotGridGradient(x1, y0, z0, x, y, z);
  const n010 = dotGridGradient(x0, y1, z0, x, y, z);
  const n110 = dotGridGradient(x1, y1, z0, x, y, z);
  const n001 = dotGridGradient(x0, y0, z1, x, y, z);
  const n101 = dotGridGradient(x1, y0, z1, x, y, z);
  const n011 = dotGridGradient(x0, y1, z1, x, y, z);
  const n111 = dotGridGradient(x1, y1, z1, x, y, z);

  const nx00 = lerp(n000, n100, sx);
  const nx10 = lerp(n010, n110, sx);
  const nx01 = lerp(n001, n101, sx);
  const nx11 = lerp(n011, n111, sx);

  const nxy0 = lerp(nx00, nx10, sy);
  const nxy1 = lerp(nx01, nx11, sy);

  return lerp(nxy0, nxy1, sz);
}

function canvasSetup(
  canvas: HTMLCanvasElement,
  width:number,
  height:number,
  canvasPadding: number = 0
): number {
  const pixelRatio = window.devicePixelRatio || 1;
  const rez = BASE_REZ * pixelRatio;
  const totalWidth = width + canvasPadding * 2;
  const totalHeight = height + canvasPadding * 2;

  canvas.width = totalWidth * pixelRatio;
  canvas.height = totalHeight * pixelRatio;

  canvas.style.width = `${totalWidth}px`;
  canvas.style.height = `${totalHeight}px`;
  canvas.style.left = `${-canvasPadding}px`;
  canvas.style.top = `${-canvasPadding}px`;

  ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.lineWidth = pixelRatio > 1 ? 2 : 1;
    ctxStroke(ctx, "#2E2C2C");
  }

  return rez;
}

function normaliseField(field: ElevationMap): ElevationMap {
  const flattenField: number[] = ([] as number[]).concat(...field);
  const fieldMax: number = Math.max(...flattenField);
  const fieldMin: number = Math.min(...flattenField);

  const normalise = (value: number, fieldMin: number, fieldMax: number): number => {
    return (value - fieldMin) / (fieldMax - fieldMin) * 2 - 1;
  };

  return field.map((row) => row.map((value) => normalise(value, fieldMin, fieldMax)));
}

function getState(a: number, b: number, c: number, d: number): number {
  return (a > 0 ? 8 : 0) + (b > 0 ? 4 : 0) + (c > 0 ? 2 : 0) + (d > 0 ? 1 : 0);
}

function draw(
  ctx: CanvasRenderingContext2D,
  rez: number,
  offsetX: number,
  offsetY: number,
  interval: number = 0.25
): void {
  let isThick = true;

  for (let h = -1; h < 1; h += interval) {
    ctx.lineWidth = isThick
      ? (window.devicePixelRatio > 2 ? 3 : 1.5)
      : (window.devicePixelRatio > 2 ? 2 : 1);
    isThick = !isThick;

    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const f0 = field[i][j] - h;
        const f1 = field[i + 1][j] - h;
        const f2 = field[i + 1][j + 1] - h;
        const f3 = field[i][j + 1] - h;

        const x = offsetX + i * rez;
        const y = offsetY + j * rez;
        const a = [x + rez * f0 / (f0 - f1), y];
        const b = [x + rez, y + rez * f1 / (f1 - f2)];
        const c = [x + rez * (1 - f2 / (f2 - f3)), y + rez];
        const d = [x, y + rez * (1 - f3 / (f3 - f0))];

        const state = getState(f0, f1, f2, f3);
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

function buildTerrain(seedField: ElevationMap, peaks: PeakDefinition[]): ElevationMap {
  const terrain = cloneField(seedField);
  createElevationCircle(terrain, 800, 0.9);
  applyPeakDefinitions(terrain, peaks);
  smoothTerrain(terrain, 10);
  return normaliseField(terrain);
}

function createContourScene(
  canvas: HTMLCanvasElement,
  width:number,
  height:number,
  options: AnimateContoursOptions = {}
): ContourScene | null {
  const canvasPadding = options.canvasPadding ?? 0;
  const rez = canvasSetup(canvas, width, height, canvasPadding);
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

  if (canvas && ctx) {
    cols = 1 + width / BASE_REZ;
    rows = 1 + height / BASE_REZ;

    const seedField = initializeElevationMap(cols, rows, maxElevation * 0.25);
    const peaks = createPeakDefinitions(cols, rows, maxElevation * 1.25, 3, 5);
    const baseField = buildTerrain(seedField, peaks);

    return {
      canvas,
      ctx,
      seedField,
      peaks,
      motionMask: createMotionMask(cols, rows),
      animatedField: baseField,
      rez,
      cols,
      rows,
      offsetX: canvasPadding * (window.devicePixelRatio || 1),
      offsetY: canvasPadding * (window.devicePixelRatio || 1),
    };
  }

  return null;
}

function getAnimatedPeaks(scene: ContourScene, time: number, options: AnimateContoursOptions): PeakDefinition[] {
  const peakDrift = options.peakDrift ?? 1.6;
  const peakHeightDrift = options.peakHeightDrift ?? 0.08;
  const peakSpeed = options.peakSpeed ?? 0.00012;
  const minPadding = Math.round(scene.cols * 0.3);
  const maxX = scene.cols - 1 - minPadding;
  const maxY = scene.rows - 1 - minPadding;

  return scene.peaks.map((peak, index) => {
    const offsetX = perlin3(index * 17.1, 0.3, time * peakSpeed * 1.1) * peakDrift;
    const offsetY = perlin3(index * 29.7, 4.6, time * peakSpeed * 0.9) * peakDrift;
    const heightOffset = perlin3(index * 13.9, 8.2, time * peakSpeed * 0.7) * peakHeightDrift;

    return {
      ...peak,
      x: clamp(peak.x + offsetX, minPadding, maxX),
      y: clamp(peak.y + offsetY, minPadding, maxY),
      elevation: peak.elevation * (1 + heightOffset),
    };
  });
}

function renderContourScene(scene: ContourScene, time: number = 0, options: AnimateContoursOptions = {}): void {
  const amplitude = options.amplitude ?? 0.028;
  const speed = options.speed ?? 0.00012;
  const scale = options.scale ?? 0.16;
  const animatedPeaks = getAnimatedPeaks(scene, time, options);
  const animatedBaseField = buildTerrain(scene.seedField, animatedPeaks);

  for (let i = 0; i < animatedBaseField.length; i++) {
    for (let j = 0; j < animatedBaseField[i].length; j++) {
      const motionValue = perlin3(i * scale, j * scale, time * speed);
      scene.animatedField[i][j] =
        animatedBaseField[i][j] +
        motionValue * scene.motionMask[i][j] * amplitude;
    }
  }

  field = scene.animatedField;
  cols = scene.cols;
  rows = scene.rows;

  scene.ctx.clearRect(0, 0, scene.canvas.width, scene.canvas.height);
  draw(scene.ctx, scene.rez, scene.offsetX, scene.offsetY, 0.24);
}

export function drawContours(
  canvas: HTMLCanvasElement,
  width:number,
  height:number,
  options: AnimateContoursOptions = {}
): void {
  const scene = createContourScene(canvas, width, height, options);
  if (!scene) return;

  renderContourScene(scene, 0, options);
}

export function animateContours(
  canvas: HTMLCanvasElement,
  width:number,
  height:number,
  options: AnimateContoursOptions = {}
): () => void {
  const scene = createContourScene(canvas, width, height, options);
  if (!scene) return () => {};

  let animationFrameId = 0;
  let isActive = true;

  const animate = (time: number): void => {
    if (!isActive) return;

    renderContourScene(scene, time, options);
    animationFrameId = window.requestAnimationFrame(animate);
  };

  animationFrameId = window.requestAnimationFrame(animate);

  return () => {
    isActive = false;
    window.cancelAnimationFrame(animationFrameId);
  };
}
