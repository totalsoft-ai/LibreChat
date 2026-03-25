#!/bin/bash
# Generate help documentation from Word documents.
# Run this whenever docs/Tessa_User_Manual_v2.docx or
# docs/Manual de utilizare Tessa_V2.docx are updated.
#
# Requirements: pip install python-docx Pillow
# Usage: bash custom/scripts/generate_help.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

EN_MANUAL="$PROJECT_ROOT/custom/docs/Tessa_User_Manual_v2.docx"
RO_MANUAL="$PROJECT_ROOT/custom/docs/Manual de utilizare Tessa_V2.docx"

OUTPUT_BASE="$PROJECT_ROOT/docs/user-guide"
IMAGES_DIR="$PROJECT_ROOT/client/public/help-images"

echo "========================================="
echo "  TESSA Help Documentation Generator"
echo "========================================="
echo ""
echo "  EN manual : $EN_MANUAL"
echo "  RO manual : $RO_MANUAL"
echo "  Output    : $OUTPUT_BASE/{en,ro}/"
echo "  Images    : $IMAGES_DIR"
echo ""

# --- Checks ---
if [ ! -f "$EN_MANUAL" ]; then
    echo "Error: English manual not found at:"
    echo "  $EN_MANUAL"
    exit 1
fi

if [ ! -f "$RO_MANUAL" ]; then
    echo "Error: Romanian manual not found at:"
    echo "  $RO_MANUAL"
    exit 1
fi

if ! python3 -c "import docx" 2>/dev/null; then
    echo "Error: python-docx not installed."
    echo "Run: pip install python-docx Pillow"
    echo "  or: pip install -r custom/scripts/requirements-help.txt"
    exit 1
fi

# --- Setup directories ---
mkdir -p "$OUTPUT_BASE/en"
mkdir -p "$OUTPUT_BASE/ro"
mkdir -p "$IMAGES_DIR"

# Clear old generated images
echo "Clearing old images..."
rm -f "$IMAGES_DIR"/en_*.png "$IMAGES_DIR"/en_*.jpg "$IMAGES_DIR"/en_*.gif
rm -f "$IMAGES_DIR"/ro_*.png "$IMAGES_DIR"/ro_*.jpg "$IMAGES_DIR"/ro_*.gif

# --- Parse EN ---
echo "Parsing English manual..."
python3 "$SCRIPT_DIR/parse_docx.py" \
    "$EN_MANUAL" \
    "$IMAGES_DIR" \
    "$OUTPUT_BASE/en" \
    "en"
echo "  Done."

# --- Parse RO ---
echo "Parsing Romanian manual..."
python3 "$SCRIPT_DIR/parse_docx.py" \
    "$RO_MANUAL" \
    "$IMAGES_DIR" \
    "$OUTPUT_BASE/ro" \
    "ro"
echo "  Done."

echo ""
echo "========================================="
echo "  Generation complete!"
echo ""
echo "  EN sections : $OUTPUT_BASE/en/"
echo "  RO sections : $OUTPUT_BASE/ro/"
echo "  Images      : $IMAGES_DIR"
echo ""
echo "  Restart the backend to pick up changes."
echo "========================================="
