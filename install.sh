#!/usr/bin/env bash
set -euo pipefail

# Make sure at least one of the following is installed: Bun (more coming later)
useCommand="bun"
if command -v bun &> /dev/null; then
    echo "Bun is installed, using it"
    useCommand="bun"
# elif command -v ... &> /dev/null; then
#     echo "... is installed, using it"
#     useCommand="..."
else
    echo "Please install Bun (https://bun.sh) to use this script (more alternatives may come later)"
    exit 1
fi

echo "Cloning CloudVoxel repo (https://github.com/OpenVoxelStudios/CloudVoxel) into $PWD..."
git clone https://github.com/OpenVoxelStudios/CloudVoxel.git -q
cd CloudVoxel

cp .env.example .env.production
cp .env.example .env.development
cp clientconfig.example.ts clientconfig.ts
cp config.example.ts config.ts

echo ""
echo "Installing dependencies... (this can take a moment)"
if [ "$useCommand" = "bun" ]; then
    bun install
    if ! bun pm trust --all >/dev/null 2>&1; then
        echo "Failed to run post-install scripts, trying without"
    fi

    echo "Getting the database ready..."
    bun run db.generate >/dev/null
    bun run db.migrate >/dev/null
fi

echo ""
echo "Done! Thank you for using CloudVoxel!"
echo "Don't forget to edit the following files:"
echo "- $PWD/clientconfig.ts : All the configuration that will be used client side"
echo "- $PWD/config.ts : The server side configuration"
echo "- $PWD/.env.production : All the credentials and keys for a production environment"
echo "- $PWD/.env.development : (only required if running dev server) All the credentials and keys for a development environment"
echo ""
echo "CloudVoxel has been installed to $PWD/CloudVoxel"
echo ""
echo "To start the server for production, run the following command:"
if [ "$useCommand" = "bun" ]; then
    echo "-> bun run bun.start"
fi
