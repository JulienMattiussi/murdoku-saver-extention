#!/usr/bin/env bash
# Regenerates the extension icons (a red "M" on a dark tile).
# Requires ImageMagick 7 (`magick`).
set -euo pipefail

cd "$(dirname "$0")"

for size in 16 48 128; do
  radius=$((size / 6))
  point=$((size * 7 / 10))
  magick -size "${size}x${size}" xc:none \
    -fill "#2b2135" -draw "roundrectangle 0,0 $((size - 1)),$((size - 1)) ${radius},${radius}" \
    -fill "#e0473c" -font DejaVu-Sans-Bold -pointsize "$point" \
    -gravity center -annotate +0+0 "M" \
    "icon-${size}.png"
done

echo "Icons written to $(pwd)"
