exports.overlay = function(src, dst) {
  let srcData = src.data;
  let dstData = dst.data;
  for (let i = 0; i < 1024; i += 4) {
    overlayPixel(srcData, dstData, i, i);
  }
};

function overlayPixel(srcData, dstData, si, di) {
  let alpha = srcData[si + 3];

  dstData[di + 0] = lerp(dstData[di + 0], srcData[si + 0], alpha / 256);
  dstData[di + 1] = lerp(dstData[di + 1], srcData[si + 1], alpha / 256);
  dstData[di + 2] = lerp(dstData[di + 2], srcData[si + 2], alpha / 256);
  dstData[di + 3] = Math.max(dstData[di + 3], srcData[si + 3]);
}

exports.overlayPixel = overlayPixel;

function lerp(a, b, t) {
  return a + (b - a) * t;
}
