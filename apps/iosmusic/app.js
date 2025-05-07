g.clear(); // Clear the screen

let isPlaying = false; // Assume initially paused
let feedbackTimeout = null; // To manage clearing textual feedback

// Function to draw the UI
function draw() {
  g.reset();
  g.clearRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2); // Clear app area

  const cx = g.getWidth()/2;
  const cy = g.getHeight()/2 - 15; // Vertical center for the icon
  const iconSize = 15; // Adjust size as needed

  if (isPlaying) {
    // Draw Pause icon (two vertical bars)
    const barWidth = iconSize * 0.6;
    const barGap = iconSize * 0.3;
    g.fillRect(cx - barGap/2 - barWidth, cy - iconSize, cx - barGap/2, cy + iconSize); // Left bar
    g.fillRect(cx + barGap/2, cy - iconSize, cx + barGap/2 + barWidth, cy + iconSize); // Right bar
  } else {
    // Draw Play icon (triangle)
    g.fillPoly([
      cx - iconSize * 0.7, cy - iconSize, 
      cx - iconSize * 0.7, cy + iconSize, 
      cx + iconSize * 0.9, cy
    ]);
  }

  g.setFont("6x8", 2);
  g.setFontAlign(0,0); // center X, center Y
  g.drawString("Tap or Swipe", g.getWidth()/2, g.getHeight()/2 + 15);
}

let dragStart = null; // To store drag start coordinates {x, y}

// Define the drag handler function
const onDrag = function(e) {
  if (e.b && !dragStart) { // Button pressed and no drag started yet (drag starts)
    dragStart = { x: e.x, y: e.y };
    return; // Don't do anything until drag ends
  }

  if (!e.b && dragStart) { // Button released and a drag was in progress (drag ends)
    if (typeof Bangle.musicControl === "function") {
      const dx = e.x - dragStart.x;
      const dy = e.y - dragStart.y;

      const DRAG_THRESHOLD = 40; // Minimum pixel movement for a swipe
      const TAP_THRESHOLD = 20;  // Maximum pixel movement for a tap

      let command = null;
      let feedbackMsg = "";

      // Determine if it's a swipe or a tap
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) { // Potential swipe
        if (Math.abs(dx) > Math.abs(dy)) { // More horizontal than vertical
          if (dx > 0) {
            command = "next";
            feedbackMsg = "Next";
          } else {
            command = "prev";
            feedbackMsg = "Previous";
          }
        } else { // More vertical than horizontal
          if (dy < 0) { // Negative dy is swipe up
            command = "volumeup";
            feedbackMsg = "Vol Up";
          } else {
            command = "volumedown";
            feedbackMsg = "Vol Down";
          }
        }
      } else if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) { // Tap
        command = "playpause";
        feedbackMsg = "Play/Pause";
      }

      if (command) {
        try {
          Bangle.buzz(40); // Haptic feedback
          Bangle.musicControl(command);

          if (command === "playpause") {
            isPlaying = !isPlaying; // Toggle state
            feedbackMsg = isPlaying ? "Playing" : "Paused"; // Update feedback for tap
          }
          // For swipes, feedbackMsg is already set (e.g., "Next", "Vol Up")

          draw(); // Immediately redraw to update icon or reflect current state

          // Visual feedback for the action (text message at bottom)
          g.setColor(g.theme.fg);
          g.setFont("6x8", 2);
          g.setFontAlign(0,0);
          const msgY = Bangle.appRect.y2 - 10; // 10px from the bottom of appRect
          // Clear only the area for the text message to avoid flickering the whole screen again
          g.clearRect(Bangle.appRect.x, msgY - 8, Bangle.appRect.x2, msgY + 8);
          g.drawString(feedbackMsg, g.getWidth()/2, msgY); // Centered horizontally

          if (feedbackTimeout) clearTimeout(feedbackTimeout); // Clear existing timeout
          feedbackTimeout = setTimeout(() => {
              draw(); // Redraw main UI to clear feedback message and ensure icon is correct
              feedbackTimeout = null;
          }, 1000);

        } catch (err) {
          E.showAlert("Music cmd fail:\\n" + err.toString().substr(0,100), "Error");
        }
      }
    } else {
      E.showAlert("iOS music ctrl\\nnot available.", "Error");
    }
    dragStart = null; // Reset drag state
  }
};

// Set up drag handler for the whole screen
Bangle.on('drag', onDrag);

// Initial draw of the UI
draw();

// Load and draw widgets (like clock, battery)
Bangle.loadWidgets();
Bangle.drawWidgets();

// When the app is exited (e.g. by pressing the button),
// clear the touch listener to prevent it from firing in other apps.
E.on('kill', () => {
  Bangle.removeListener('drag', onDrag); // Update to remove 'drag' listener
}); 
