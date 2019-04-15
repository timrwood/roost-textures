const { overlayPixel } = require("./overlay");

exports.blit270 = function(src, dst, sx, sy, w, h, dx, dy) {
  return rotate(src, dst, sx, sy, w, h, dx, dy, function(x, y) {
    return (dst.height * (dy + x) + (dx + (h - 1) - y)) << 2;
  });
};

exports.blit90 = function(src, dst, sx, sy, w, h, dx, dy) {
  return rotate(src, dst, sx, sy, w, h, dx, dy, function(x, y) {
    return (dst.height * (dy + (w - 1) - x) + (dx + y)) << 2;
  });
};

exports.blit0 = function(src, dst, sx, sy, w, h, dx, dy) {
  return rotate(src, dst, sx, sy, w, h, dx, dy, function(x, y) {
    return (dst.width * (dy + y) + (dx + x)) << 2;
  });
};

exports.blit180 = function(src, dst, sx, sy, w, h, dx, dy) {
  return rotate(src, dst, sx, sy, w, h, dx, dy, function(x, y) {
    return (dst.width * (dy + (h - 1) - y) + (dx + (w - 1) - x)) << 2;
  });
};

function rotate(src, dst, sx, sy, w, h, dx, dy, getDi) {
  let srcData = src.data;
  let dstData = dst.data;
  let ratio = src.width / 64;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let si = (src.width * ratio * (sy + y) + (sx + x) * ratio) << 2;
      let di = getDi(x, y);
      overlayPixel(srcData, dstData, si, di);
    }
  }
}
