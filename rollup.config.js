import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";

export default {
    entry: "src/router.ts",
    dest: "dist/knockout-router.js",

    format: "umd",
    sourceMap: true,
    moduleName: "KnockoutRouter",

    external: [
        "knockout",
    ],

    globals: {
        "knockout": "ko",
    },

    plugins: [
        typescript(),
        nodeResolve(),
        commonjs(),
    ]
}