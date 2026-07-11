{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = {
    self,
    nixpkgs,
    ...
  } @ inputs:
    inputs.flake-parts.lib.mkFlake {inherit inputs;}
    {
      systems = ["x86_64-linux"];

      perSystem = {
        self',
        pkgs,
        ...
      }: let
        build = pkgs.callPackage ./build.nix {};
        npmDeps = pkgs.importNpmLock.buildNodeModules {
          npmRoot = ./.;
          derivationArgs = {
            dontCheckForBrokenSymlinks = true;
            npmConfigHook = pkgs.importNpmLock.npmConfigHook;
            buildInputs = with pkgs; [
              pixman
              cairo
              pango
              libjpeg
              libpng
              librsvg
              pkg-config
            ];
          };
          inherit (pkgs) nodejs;
        };
      in {
        # _module.args.top = {
        #   inherit inputs;
        # };

        packages.default = self'.packages.tnilbot;
        packages.tnilbot = (pkgs.callPackage ./build.nix {}).package;

        devShells.default = pkgs.mkShellNoCC {
          dontCheckForBrokenSymlinks = true;
          packages =
            [
              # build.package
              pkgs.importNpmLock.hooks.linkNodeModulesHook
            ]
            ++ build.packages;
          inherit npmDeps;
        };
      };
    };
}
