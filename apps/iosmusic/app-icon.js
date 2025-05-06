// iosmusic.app-icon.js for Bangle.js 2 (48x48 1-bit icon)
module.exports = {
  width : 48, height : 48, bpp : 1,
  transparent : 0, // Background will be color 0 (black for default theme)
  buffer : (function() {
    const w = 48, h = 48;
    var g = Graphics.createArrayBuffer(w, h, 1, {msb:true});
    g.clear(); // Clear with background color (0)
    g.setColor(1); // Set drawing color to 1 (white for default theme)

    // Draw a simple "Play" triangle icon, centered
    // Points: [x1,y1, x2,y2, x3,y3]
    // A reasonably large, filled triangle:
    g.fillPoly([10, 8, 10, 40, 38, 24]);

    return E.toArrayBuffer(g.buffer);
  })()
}; 
