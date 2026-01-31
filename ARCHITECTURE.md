---

# 📄 ARCHITECTURE.md

```md
# Architecture and Design

This document explains how the system is designed and how drawing data flows between users.

---

## High Level Overview

The system consists of:

- A browser-based client (canvas app)
- A Node.js server using WebSockets

The server acts as the source of truth for the drawing state.  
All users send their drawing actions to the server, and the server broadcasts them to everyone else.

---

## Data Flow

1. User draws on the canvas
2. The browser converts the drawing into points (x, y)
3. These points are sent to the server using WebSocket messages
4. The server broadcasts the same drawing data to all connected users
5. Each client renders the received drawing data on its canvas

This allows everyone to see drawings in real time.

---

## WebSocket Message Types

The system uses simple message types:

- `join`  
  Sent when a user connects to a room

- `draw:start`  
  Sent when the user starts drawing a stroke

- `draw:move`  
  Sent when the user moves the pointer while drawing

- `draw:end`  
  Sent when the stroke is finished

- `cursor`  
  Used to show other users’ cursor positions

- `undo`  
  Requests the server to undo the last stroke

- `redo`  
  Requests the server to redo the previously undone stroke

- `state:update`  
  Sent by the server when undo or redo happens

---

## Drawing State Storage

The server stores:

- A list of completed strokes (history)
- A redo stack for undone strokes

Each stroke contains:

- Tool type (brush or eraser)
- Color
- Width
- List of points
- User ID
- Timestamp

This allows the server to rebuild the full canvas when a new user joins or refreshes.

---

## Undo / Redo Strategy

Undo and redo are handled globally by the server:

- When a user clicks undo:
  - The server removes the last stroke from the history
  - That stroke is moved to the redo stack
  - The server sends the updated state to all users

- When a user clicks redo:
  - The server restores the last undone stroke
  - The updated state is broadcast to all users

This means:

- One user can undo another user’s drawing
- All clients always stay in sync

---

## Conflict Handling

If multiple users draw at the same time:

- Each stroke is stored in the order the server receives it
- The server assigns an order to strokes
- All users receive the strokes in the same order

This avoids inconsistent canvas states across users.

---

## Performance Decisions

- Only small drawing segments (points) are sent over the network
- The canvas is not cleared and redrawn on every move, only when undo/redo happens
- Cursor updates are throttled to reduce network load
- WebSockets are used for low-latency communication

---

## Why WebSockets Instead of HTTP

WebSockets were chosen because:

- They allow continuous two-way communication
- They are suitable for real-time updates
- They reduce the overhead of repeated HTTP requests

This makes drawing appear smooth and responsive.

---

## Scalability Notes

For a larger number of users:

- Rooms can be separated
- Drawing history could be stored in a database
- Message batching could be introduced
- Load balancing could be added

These were not implemented to keep the project simple and focused on core features.

---

## Summary

The system uses a server-controlled shared drawing state and real-time WebSocket communication to ensure that all users see the same canvas.  
The main focus of the design is correctness and synchronization rather than visual complexity.
