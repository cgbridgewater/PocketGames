import { BOX_HEIGHT, CANVAS_HEIGHT, CANVAS_WIDTH, INITIAL_BOX_Y } from './Constants';

export function drawBackground(context) {
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function gameOver(context) {
  context.fillStyle = 'rgba(255, 0, 0, 0.5)';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function createStepColor(step) {
  if (step === 0) return '#C23866';

  const red = Math.floor(Math.random() * 255);
  const green = Math.floor(Math.random() * 255);
  const blue = Math.floor(Math.random() * 255);

  return `rgb(${red}, ${green}, ${blue})`;
}

export function drawDebris(context, currentDebris, currentCamera) {
  if (!context) return;

  const { x, y, width } = currentDebris;
  const newY = INITIAL_BOX_Y - y + currentCamera;

  context.fillStyle = 'red';
  context.fillRect(x, newY, width, BOX_HEIGHT);
}

export function drawBoxes(context, currentBoxes, currentCamera) {
  if (!context) return;

  currentBoxes.forEach((box) => {
    const { x, y, width, color } = box;
    const newY = INITIAL_BOX_Y - y + currentCamera;
    
    context.fillStyle = color;
    context.fillRect(x, newY, width, BOX_HEIGHT);
  });
}
