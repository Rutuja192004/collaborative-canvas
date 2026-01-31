// make canvas & ctx global
window.canvas = document.getElementById("canvas");
window.ctx = canvas.getContext("2d");

// resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();
  redrawFromState(currentState);
});

let drawing = false;
let currentAction = null;
let currentState = [];

let tool = "brush";

// color input
const colorInput = document.getElementById("color");

// force default color
if (!colorInput.value) {
  colorInput.value = "#ff0000";
}

let width = 4;

// UI controls
document.getElementById("width").oninput = (e) => {
  width = +e.target.value;
};

const brushBtn = document.getElementById("brush");
const eraserBtn = document.getElementById("eraser");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");

// helper to set active button
function setActive(btn) {
  [brushBtn, eraserBtn, undoBtn, redoBtn].forEach((b) =>
    b.classList.remove("active"),
  );
  btn.classList.add("active");
}

brushBtn.onclick = () => {
  tool = "brush";
  setActive(brushBtn);
};

eraserBtn.onclick = () => {
  tool = "eraser";
  setActive(eraserBtn);
};

undoBtn.onclick = () => {
  socket.send(JSON.stringify({ type: "undo" }));
  setActive(undoBtn);
};

redoBtn.onclick = () => {
  socket.send(JSON.stringify({ type: "redo" }));
  setActive(redoBtn);
};

document.getElementById("undo").onclick = () => {
  socket.send(JSON.stringify({ type: "undo" }));
};

document.getElementById("redo").onclick = () => {
  socket.send(JSON.stringify({ type: "redo" }));
};

// pointer events
canvas.addEventListener("pointerdown", startDraw);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", endDraw);
canvas.addEventListener("pointerleave", endDraw);

let lastCursorSend = 0;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function startDraw(e) {
  drawing = true;
  const { x, y } = getPos(e);

  // lock color at stroke start
  const strokeColor = colorInput.value;

  currentAction = {
    id: crypto.randomUUID(),
    tool,
    color: strokeColor,
    width,
    points: [{ x, y }],
  };

  ctx.beginPath();
  ctx.moveTo(x, y);

  socket.send(
    JSON.stringify({
      type: "draw:start",
      action: currentAction,
    }),
  );
}

function draw(e) {
  if (!drawing) return;

  const { x, y } = getPos(e);
  const point = { x, y };

  currentAction.points.push(point);

  ctx.globalCompositeOperation =
    currentAction.tool === "eraser" ? "destination-out" : "source-over";

  ctx.strokeStyle = currentAction.color;
  ctx.lineWidth = currentAction.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.lineTo(x, y);
  ctx.stroke();

  socket.send(
    JSON.stringify({
      type: "draw:move",
      action: {
        id: currentAction.id,
        point,
      },
    }),
  );

  // throttle cursor
  if (Date.now() - lastCursorSend > 30) {
    lastCursorSend = Date.now();
    sendCursor(x, y);
  }
}

function endDraw() {
  if (!drawing) return;
  drawing = false;

  socket.send(
    JSON.stringify({
      type: "draw:end",
      action: currentAction,
    }),
  );

  currentAction = null;
}

function drawAction(action) {
  ctx.beginPath();

  ctx.globalCompositeOperation =
    action.tool === "eraser" ? "destination-out" : "source-over";

  ctx.strokeStyle = action.color;
  ctx.lineWidth = action.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const pts = action.points;
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }

  ctx.stroke();
  ctx.closePath();
}

// redraw from server state
window.redrawFromState = function (state) {
  currentState = state;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.forEach(drawAction);
};
