{
  pkgs,
  lib,
  importNpmLock,
  buildNpmPackage,
  nodejs,
  tsx,
  typescript,
  esbuild,
  pixman,
  cairo,
  pango,
  libjpeg,
  libpng,
  librsvg,
  pkg-config,
  ...
}: let
  npmDeps = importNpmLock {
    npmRoot = ./.;
  };
  npmjson = lib.fromJSON (builtins.readFile ./package.json);
in {
  package = buildNpmPackage {
    pname = npmjson.name;
    version = "latest";
    src = ./.;
    inherit npmDeps;
    npmConfigHook = importNpmLock.npmConfigHook;
    nativeBuildInputs = [
      # needed for building native dependencies of npm packages
      pkg-config

      # autoreconfHook
      esbuild
      nodejs
      tsx
      typescript
    ];
    dontNpmBuild = true;
    dontNpmInstall = true;
    dontCheckForBrokenSymlinks = true;
    buildInputs = [
      pixman
      cairo
      pango
      libjpeg
      libpng
      librsvg
      pkg-config
    ];
    installPhase = ''
      mkdir -p $out
      cp -rp * $out
    '';
  };
  # packages to be required by the shell
  packages = [tsx typescript nodejs];
  inherit npmDeps;
}
