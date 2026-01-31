# Real-Time Collaborative Drawing Canvas

This project is a real-time drawing application where multiple users can draw on the same canvas at the same time.  
When one user draws, all other connected users can see the drawing instantly.

The main goal of this project was to understand how real-time systems work using WebSockets and how to synchronize shared state between multiple users.

---

## Features

- Draw on a shared canvas in real time
- Brush and eraser tools
- Multiple colors and adjustable stroke width
- See other users’ cursors while they draw
- Global undo and redo (one user can undo another user’s drawing)
- Shows which users are currently online
- Canvas state is restored when a user refreshes the page

---

## Tech Stack

**Frontend**

- HTML
- CSS
- JavaScript (Canvas API)

**Backend**

- Node.js
- WebSocket (ws library)

No external canvas or drawing libraries are used. Everything is done using the raw HTML Canvas API.

---

## How to Run the Project

### 1. Install dependencies

```bash
npm install
```

2. Start the server
   node server/server.js
   You should see:
   WebSocket server running on :3000

3. Open the app

Open client/index.html in your browser.

To test real-time collaboration:

Open the same page in two or more browser tabs

Start drawing in one tab

You will see the drawing appear in the other tabs instantly
How to Test Multi-User Drawing

Open the app in two different tabs

Draw in the first tab

Check that the second tab shows the drawing in real time

Try undo and redo from any tab

Refresh one tab and verify that the drawing is still there

nown Limitations

Drawings are not stored permanently (they are lost when the server restarts)

Performance may reduce if a very large number of strokes are drawn

No authentication is implemented (users are identified only by a generated ID)
