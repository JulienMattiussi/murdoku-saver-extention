#!/usr/bin/env bash
# Draws the README previews (button location + open panel) with ImageMagick.
# They mirror src/panel/panel.css: keep colors and layout in sync with it.
# Requires ImageMagick 7 (`magick`) and the DejaVu Sans fonts.
set -euo pipefail

cd "$(dirname "$0")"

S=2 # drawn at 2x for sharp rendering on high-density screens
INK="#1f1a24"
PAPER="#fffdf8"
MUTED="#7b7385"
LINE="#e6e0d6"
ACCENT="#e0473c"
PAGE="#f1eef4"
FONT="DejaVu-Sans"
BOLD="DejaVu-Sans-Bold"

draw=()

# box x0 y0 x1 y1 radius fill stroke stroke-width [shadow-offset]
box() {
  local x0=$1 y0=$2 x1=$3 y1=$4 r=$5 fill=$6 stroke=$7 sw=$8 shadow=${9:-0}
  if ((shadow > 0)); then
    draw+=(-fill "$INK" -stroke none -draw "roundrectangle $(((x0 + shadow) * S)),$(((y0 + shadow) * S)) $(((x1 + shadow) * S)),$(((y1 + shadow) * S)) $((r * S)),$((r * S))")
  fi
  draw+=(-fill "$fill" -stroke "$stroke" -strokewidth $((sw * S)) -draw "roundrectangle $((x0 * S)),$((y0 * S)) $((x1 * S)),$((y1 * S)) $((r * S)),$((r * S))")
}

# text x y size color font content (x, y = left baseline)
text() {
  draw+=(-stroke none -fill "$4" -font "$5" -pointsize $(($3 * S)) -annotate "+$(($1 * S))+$(($2 * S))" "$6")
}

# centered text in a box: x0 x1 y size color font content
ctext() {
  local width
  width=$(magick -font "$6" -pointsize $(($4 * S)) label:"$7" -format "%w" info:)
  draw+=(-stroke none -fill "$5" -font "$6" -pointsize $(($4 * S)) -annotate "+$(((($1 + $2) * S - width) / 2))+$(($3 * S))" "$7")
}

dashed() {
  draw+=(-stroke "$LINE" -strokewidth $((2 * S)) -fill none -draw "stroke-dasharray $((4 * S)) $((3 * S)) line $(($1 * S)),$(($3 * S)) $(($2 * S)),$(($3 * S))")
}

render() {
  magick -size "$(($1 * S))x$(($2 * S))" "xc:$PAGE" "${draw[@]}" "${@:3}"
  draw=()
}

icon() { # icon x y size
  echo "(" ../icons/icon-128.png -resize "$(($3 * S))x$(($3 * S))" ")" -geometry "+$(($1 * S))+$(($2 * S))" -composite
}

# Saved state row: y-top name date
row() {
  local y=$1
  dashed 44 316 "$y"
  text 44 $((y + 22)) 13 "$INK" "$BOLD" "$2"
  text 44 $((y + 38)) 11 "$MUTED" "$FONT" "$3"
  box 212 $((y + 12)) 283 $((y + 40)) 8 "$ACCENT" "$INK" 2 2
  ctext 212 283 $((y + 31)) 12 "#ffffff" "$BOLD" "Charger"
  box 289 $((y + 12)) 316 $((y + 40)) 8 "#ffffff" "$INK" 2 2
  ctext 289 316 $((y + 31)) 12 "$ACCENT" "$BOLD" "✕"
}

# 1. Where the button is: top-right corner of a puzzle page
box 0 0 371 30 1 "#dcd7e0" "#c9c2cf" 1
box 12 6 250 24 9 "#ffffff" "#d5d0da" 1
text 24 20 11 "$MUTED" "$FONT" "murdoku.com/play/puzzle-…"
draw+=(-fill none -stroke "$ACCENT" -strokewidth $((2 * S)) -draw "circle $((358 * S)),$((44 * S)) $((371 * S)),$((44 * S))")
draw+=(-stroke "$ACCENT" -strokewidth $((2 * S)) -draw "line $((262 * S)),$((80 * S)) $((338 * S)),$((54 * S))")
draw+=(-fill "$ACCENT" -stroke none -draw "polygon $((344 * S)),$((52 * S)) $((332 * S)),$((50 * S)) $((336 * S)),$((60 * S))")
text 104 96 13 "$INK" "$BOLD" "Murdoku Save Bank"
text 104 112 11 "$MUTED" "$FONT" "top-right corner of every puzzle"
# shellcheck disable=SC2046
render 372 130 $(icon 348 34 20) button-location.png

# 2. The open panel with two saved states
box 330 4 350 24 5 "$INK" "$INK" 1 1
box 30 32 330 252 14 "$PAPER" "$INK" 3 4
text 44 62 15 "$INK" "$BOLD" "Murdoku Save Bank"
text 44 78 11 "$MUTED" "$FONT" "puzzle-a-messy-situation-hard"
box 44 92 250 122 8 "#ffffff" "$INK" 2
text 54 112 13 "$MUTED" "$FONT" "Nom de l'état"
box 256 92 316 122 8 "$ACCENT" "$INK" 2 2
ctext 256 316 112 12 "#ffffff" "$BOLD" "Sauver"
row 136 "Hypothèse Colonel" "16/10 14:12"
row 190 "Début" "16/10 13:53"
# shellcheck disable=SC2046
render 356 266 $(icon 330 4 20) panel-preview.png

echo "Previews written to $(pwd)"
