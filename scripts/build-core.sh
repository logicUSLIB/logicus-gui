#!/bin/sh
# Build the Elm core of the GUI (logicus-app-core) into js/LogicUSApp/AppCore.js.
# Requires Elm 0.19.1 (https://github.com/elm/compiler/releases/tag/0.19.1).
set -eu
cd "$(dirname "$0")/../logicus-app-core"
elm make --optimize src/AppCore.elm --output=../js/LogicUSApp/AppCore.js
