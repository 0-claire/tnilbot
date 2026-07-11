alias dev := run
alias default := run

setup:
    git submodule update --recursive

# [working-directory: './src/external_gleam/build/dev/javascript/external_gleam/']
[working-directory: './src/external_gleam/']
dev_gleam:
  -gleam build

run_gleam:
  -tsx ./src/lexicon.ts

run: dev_gleam
  npx tsx src/main.ts

build: rebuild-deps bundle

bundle:
  esbuild \
    --bundle \
    --platform=node \
    --format=esm \
    --external:secrets \
    --external:discord.js \
    --external:text-to-image \
    --outfile=dist/bundle.js \
    ./src/main.ts
#    --minify \
#    --external:canvas \

transpile:
  # tsc
  # rm ./dist/secrets.json
  # cp ./secrets.example.json ./dist/
  # tar -czvf

rebuild-deps:
  #!/usr/bin/env nu
  -rm .npmrc
  -rm result*
  -rm node_modules
  nix-build -A node_modules
  echo 'package-lock-only=true' | save .npmrc
  ln -sf result-2/node_modules .
