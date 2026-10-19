#!/bin/bash
cd "$(dirname "$0")/jogo"
( sleep 1; open "http://127.0.0.1:8765/" 2>/dev/null || xdg-open "http://127.0.0.1:8765/" ) &
python3 -m http.server 8765 --bind 127.0.0.1
