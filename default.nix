{pkgs, ...}: let
  build = pkgs.callPackage ./build.nix {};
in {
  inherit build;
  shell = pkgs.mkShellNoCC {
    packages = [build.package] ++ build.packages;
  };
  npmDeps = build.npmDeps;
}
