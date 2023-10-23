const randomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

function euclideanDistance(v1:[x: number, y: number], v2:[x: number, y: number]):number {
  let sumOfSquares = 0;
  for (let i = 0; i < v1.length; i++) {
    sumOfSquares += Math.pow(v2[i] - v1[i], 2);
  }
  return Math.sqrt(sumOfSquares);
}

const squiggle = (r: number, l: number): [number, number][] => {
  let currentLength = 0;
  let currentAngle = 0;

  let points: [number, number][] = [];

  while (currentLength <= l) {

    const newX = r * Math.cos(currentAngle * (Math.PI / 180));
    const newY = r * Math.sin(currentAngle * (Math.PI / 180));
    // if(points.find(([x, y]) => ( Math.round(x)===Math.round(newX) && Math.round(y)===Math.round(newY) ) )){
    //   r += 3;
    // }  
    if(points.find(([x, y]) => (euclideanDistance([x, y], [newX, newY]) < 2))){
      r += 2;
    }
    points.push([newX, newY]);
    currentLength = points.length;
    currentAngle += Math.ceil(randomNumber(4, 7));
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
    // ctx.scale(0.8, 0.8);
    
    // r = starting radius/magnitude
    // l = amount of increments of the angle/theta.
    const points = squiggle(0, 1500);
    
    ctx.translate((targetWidth) / 2, (targetHeight ) / 2);
    
    ctx.lineWidth = 2;
    ctx.beginPath();
      points.forEach((p) => {
      ctx.strokeStyle = "#0B0C0C";
      ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();
  }
}
  