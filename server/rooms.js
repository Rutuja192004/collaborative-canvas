// server/rooms.js

const DrawingState = require("./drawing-state");

class Room {
  constructor(id) {
    this.id = id;
    this.users = new Map(); // userId -> socket
    this.state = new DrawingState();
    this.liveActions = new Map(); // actionId -> style
    this.userColors = new Map(); // userId -> color
  }
}

const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Room(roomId));
  }
  return rooms.get(roomId);
}

module.exports = { getRoom };
