const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const squiggle = (r: number, l: number): [number, number][] => {
  let currentLength = 0;
  let currentAngle = 0;

  let points: [number, number][] = [];

  while (currentLength <= l) {
    // console.log(currentAngle);

    const newX = r * Math.cos((currentAngle * Math.PI) / 180);
    const newY = r * Math.sin((currentAngle * Math.PI) / 180);
    points.push([newX, newY]);
    currentLength = points.length;
    currentAngle += Math.ceil(Math.random() * 5);
    r += randomNumber(-3, 3);
  }
  return points;
};

export function draw(canvas: HTMLCanvasElement, targetWidth: number=200, targetHeight: number=200): void {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  console.log(dpr);
  const width = targetWidth/dpr;
  const height = targetHeight/dpr;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.scale(0.5, 0.5);
    const points = squiggle(100, 2000);
    
    ctx.translate(width / 2, height / 2);
  
    ctx.beginPath();
      points.forEach((p) => {
      ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();
  }
}
  