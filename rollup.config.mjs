import babel from "@rollup/plugin-babel";
import { nodeResolve } from '@rollup/plugin-node-resolve';
const percentage=process.env.BROWSER_COVER||50;
export default {
	input: ["./client/online.js"],
	output: {
		file: `./client/online.${percentage}.js`,
		format: "umd",
		name: "Online",
		sourcemap: true,
	},
	plugins: [
		babel({
			sourceMaps: true,
			presets: [
				[
					"@babel/preset-env",
					{
						"targets":{
							"browsers":`cover ${percentage}%`
						},
						"modules": false,
						"useBuiltIns": "usage",
						"debug": false,
						"corejs":3
					}
				]
			]
		}),
		nodeResolve(),
	],
}