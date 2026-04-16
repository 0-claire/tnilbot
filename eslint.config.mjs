import tseslint from "typescript-eslint";
import { defineConfig, } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import js from "@eslint/js";
import tsdocPlugin from "eslint-plugin-tsdoc";

const setAttributes = (attributes, value) => {
	const attrs = {};
	attributes.forEach(element => attrs[element] = value);
	return attrs;
};


export default defineConfig({ ignores: [
	"node_modules",
	"dist",
	"esbuild.config.mjs",
	"version-bump.mjs",
	"main.js",
	// "package{,-lock}.json",
],rules: {
	"@stylistic/member-delimiter-style": ["warn",{},],
	"max-statements-per-line": ["warn", { max: 1, },],
	"@stylistic/space-before-blocks": ["warn", "always",],
	"@stylistic/line-comment-position": ["warn", { position: "above", },],
	"@stylistic/lines-between-class-members": [
		"warn", 
		"always", 
		{ exceptAfterSingleLine: true, },
	],
	// Add blank lines around certain statements
	"@stylistic/padding-line-between-statements": ["warn",{
		blankLine: "always",
		prev: [
			"block-like",
			"if",
			"try",
			"function",
		].map(statement => statement),
		// ].map(statement => "multiline-"+statement),
		next: "*",
	},],
	semi: ["warn", "always",],
	"@stylistic/comma-dangle": [ "warn", {
		arrays: "always",
		objects: "always",
		imports: "always",
		exports: "always",
		// Don't add commas after function args
		functions: "never",
		importAttributes: "always",
		dynamicImports: "always",
		enums: "never",
		generics: "never",
		tuples: "never",
	},],
	quotes: ["warn", "double",],
	// curly: ["warn", "multi-or-nest",],
	// curly: ["warn", "multi"],
	"max-len": ["warn", { code: 200, },],
	// "max-len": ["warn", { code: 100, },],
	"@stylistic/object-curly-spacing": ["warn", "always",],
	// Avoid adding quotes around object properties that don't require them
	"object-shorthand": [
		"warn", 
		"always", 
		{ avoidQuotes: true, },
	],

	"@stylistic/indent": [
		"warn", 
		"tab", 
		{ ignoreComments: false, },
	],
	"@stylistic/exp-list-style": ["warn", { singleLine: { maxItems: 2, },multiLine: { minItems: 3, }, overrides: {
		// Turn off spacing around members in parentheses
		...setAttributes([
			"ArrayExpression",
			"ArrayPattern",
			"TSFunctionType",
		], { 
			singleLine: { maxItems: 2, },
			multiline: { minItems: 3, }, 
		})
		,
		...setAttributes([
			"ObjectPattern",
			"ObjectExpression",
			// "TSFunctionType",
			"TSInterfaceBody",
			"ImportAttributes",
			"ImportDeclaration",
			"FunctionExpression",
			"ArrowFunctionExpression",
			"{}",
		],{ 
			// spacing: "always",
			singleLine: { maxItems: 1, },
			multiline: { minItems: 2, }, 
		}), 
	}, },],

	// "object-property-newline": ["warn", { allowAllPropertiesOnSameLine: false, },],
	// "@typescript-eslint/no-explicit-any": ["off",],
	// "object-curly-newline": [ "warn", {
	//     multiline: true,
	//     minProperties: 3, 
	// }, ],
	// turn off this god-awful setting
	"@typescript-eslint/no-unused-vars": "warn",
	"no-unused-vars": "warn", 
	"quote-props": ["warn", "as-needed",],
	"no-undef": "off",
	"no-mixed-spaces-and-tabs": "warn",
	"no-useless-catch": "warn",
	"no-extra-semi": "warn",
},plugins: { 
	"@typescript-eslint": tseslint.plugin,
	"@stylistic": stylistic, 
	"react-hooks": reactHooks,
	tsdoc: tsdocPlugin, 
},languageOptions: {
	// allow inline comments disabling xyz feature
	// eslintDisableDirective: true,
	parser: tseslint.parser,
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
},files: ["**/*.{ts,tsx,mts,cts,scss,js,json}","eslint.config.{mjs,js}",],extends: [
	tseslint.configs.recommended,
	reactHooks.configs.flat.recommended,
	js.configs.recommended,
], });
