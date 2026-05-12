setup:
    git submodule update --recursive

default: dev

dev: run

run:
  npx tsx src/main.ts

build: 
  tsc

rebuild-deps:
  #!/usr/bin/env nu
  try { rm .npmrc }
  try { rm result* }
  try { rm node_modules }
  nix-build -A node_modules
  echo 'package-lock-only=true' | save .npmrc
  ln -sf result-2/node_modules .
