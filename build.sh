#!/usr/bin/env bash
set -e

# Ensure we are in the project root
cd "$(dirname "$0")"

BUILD_TYPE="dev"
DEP_ACTION="auto"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --stable) BUILD_TYPE="stable" ;;
        --dev) BUILD_TYPE="dev" ;;
        --build-deps|-b) DEP_ACTION="build" ;;
        --download-deps|-d) DEP_ACTION="download" ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

DEST_DIR="src"

# elfldr é sempre compilado a partir do submódulo (raphasilv247/elfldr),
# usando o PS5 Payload SDK (variável PS5_PAYLOAD_SDK).
build_elfldr_from_source() {
    echo "=== Compilando elfldr a partir do submódulo ==="

    if [ -z "${PS5_PAYLOAD_SDK:-}" ]; then
        echo "Error: PS5_PAYLOAD_SDK não está definido. Instale o PS5 Payload SDK." >&2
        exit 1
    fi
    if [ ! -e "third_party/ps5-elfldr/.git" ]; then
        echo "Error: submódulo third_party/ps5-elfldr não inicializado. Rode: git submodule update --init --recursive" >&2
        exit 1
    fi

    rm -f "$DEST_DIR"/elfldr-ps5-*.elf
    make -C third_party/ps5-elfldr clean all

    ELFLDR_VER=$(git -C third_party/ps5-elfldr describe --tags --always)
    cp third_party/ps5-elfldr/elfldr-ps5.elf "$DEST_DIR/elfldr-ps5-${ELFLDR_VER}.elf"

    if [ "${GITHUB_OUTPUT:-}" ]; then
        echo "elfldr_ver=${ELFLDR_VER}" >> "$GITHUB_OUTPUT"
    fi
    echo "elfldr compilado: ${ELFLDR_VER}"
}

# Helper to build kexp from source
build_kexp_from_source() {
    echo "=== Compilando kexp a partir do submódulo ==="
    if [ ! -e "third_party/ps5-kexp/.git" ]; then
        echo "Error: submódulo third_party/ps5-kexp não inicializado. Rode: git submodule update --init --recursive" >&2
        exit 1
    fi
    rm -f "$DEST_DIR"/kexp-*.bin "$DEST_DIR"/kexp_v*.bin
    (cd third_party/ps5-kexp && ./build.sh)
    KEXP_VER=$(git -C third_party/ps5-kexp describe --tags --always)
    cp third_party/ps5-kexp/build/kexp.bin "$DEST_DIR/kexp-${KEXP_VER}.bin"
    if [ "${GITHUB_OUTPUT:-}" ]; then
        echo "kexp_ver=${KEXP_VER}" >> "$GITHUB_OUTPUT"
    fi
}

# Resolve dependency action
if [ "$DEP_ACTION" = "download" ]; then
    ./scripts/download_deps.sh
    build_elfldr_from_source
elif [ "$DEP_ACTION" = "build" ]; then
    build_kexp_from_source
    build_elfldr_from_source
else
    # Auto: se o kexp já existe, usa; senão baixa. elfldr é sempre compilado.
    if ls "$DEST_DIR"/kexp-*.bin >/dev/null 2>&1; then
        echo "kexp já presente."
    else
        ./scripts/download_deps.sh
    fi
    build_elfldr_from_source
fi

echo "Creating Y2JB update package..."
make all BUILD_TYPE=$BUILD_TYPE
