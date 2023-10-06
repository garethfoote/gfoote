const randomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const squiggle = (r: number, l: number): [number, number][] => {
  let currentLength = 0;
  let currentAngle = 0;

  let points: [number, number][] = [];

  console.log(randomNumber(0, 0.07));
  while (currentLength <= l) {

    const newX = r * Math.cos(currentAngle * (Math.PI / 180));
    const newY = r * Math.sin(currentAngle * (Math.PI / 180));
    points.push([newX, newY]);
    currentLength = points.length;
    currentAngle += Math.ceil(Math.random() * 5);
    r += randomNumber(-3, 3);
  }
  return points;
};

export function draw(canvas: HTMLCanvasElement, targetWidth: number=200, targetHeight: number=200): void {
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(window.devicePixelRatio, 2);

  canvas.style.width = targetWidth + "px";
  canvas.style.height = targetHeight + "px";
  canvas.width = Math.floor(targetWidth * dpr);
  canvas.height = Math.floor(targetHeight * dpr);

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    // ctx.scale(0.5, 0.5);
    
    // r = starting radius/magnitude
    // l = amount of increments of the angle/theta.
    const points = squiggle(50, 1500);
    
    ctx.translate((targetWidth) / 2, (targetHeight ) / 2);
  
    ctx.beginPath();
      points.forEach((p) => {
      ctx.strokeStyle = "#0B0C0C";
      ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();
  }
}
  