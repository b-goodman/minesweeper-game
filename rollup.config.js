import fs from "fs";
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss'
import glob from 'glob';
import svg from 'rollup-plugin-svg';

glob.sync('**/*/*.scss').forEach((scss) => {  // Use forEach because https://github.com/rollup/rollup/issues/1873
	const definition = `${scss}.d.ts`
	if (!fs.existsSync(definition))
		fs.writeFileSync(definition, 'export const mod: { [cls: string]: string }\nexport default mod\n')
});


glob.sync('**/*/*.svg').forEach((svg) => {  // Use forEach because https://github.com/rollup/rollup/issues/1873
	const definition = `${svg}.d.ts`
	if (!fs.existsSync(definition))
		fs.writeFileSync(definition, 'export const mod: string;\nexport default mod\n')
});

export default {
    input: 'src/index.ts',
    output: {
        dir: "dist",
        format: "esm",
    },
    plugins: [
        svg(),
        postcss({
			writeDefinitions: true,
            modules: false,
            inject: false,
        }),
        nodeResolve(),
        commonjs(),
        typescript(),
    ]
}