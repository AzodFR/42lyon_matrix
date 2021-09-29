import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import livereload from "rollup-plugin-livereload"
import { terser } from "rollup-plugin-terser"
import autoPreprocess from "svelte-preprocess"
import json from "@rollup/plugin-json"
import babel from '@rollup/plugin-babel';

const production = !process.env.ROLLUP_WATCH

function serve() {
	let server

	function toExit() {
		if (server) server.kill(0)
	}

	return {
		writeBundle() {
			if (server) return
			server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true,
			})

			process.on("SIGTERM", toExit)
			process.on("exit", toExit)
		},
	}
}

const onwarn = (warning, onwarn) => {
	if (warning.message.includes("Unused CSS selector")) return true
	return onwarn(warning)
}

export default {
	input: "src/main.js",
	output: {
		sourcemap: true,
		format: "iife",
		name: "app",
		file: "public/build/bundle.js",
	},
	onwarn,
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			preprocess: autoPreprocess(),
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css: (css) => {
				css.write("bundle.css")
			},
		}),
		babel({  
			extensions: [ ".js", ".mjs", ".html", ".svelte" ],
			babelHelpers: 'bundled'
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ["svelte"],
		}),

		commonjs(),

		json(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload("public"),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
	],
	watch: {
		clearScreen: false,
	},
}