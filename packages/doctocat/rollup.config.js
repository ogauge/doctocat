import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import esbuild from 'rollup-plugin-esbuild'
import {includeCSS} from 'rollup-plugin-include-css'
import {includeDirectives} from 'rollup-plugin-include-directives'
import packageJson from './package.json' assert {type: 'json'}

const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
const dependencies = new Set(
  dependencyTypes.flatMap(type => {
    if (packageJson[type]) {
      return Object.keys(packageJson[type])
    }
    return []
  }),
)
const external = Array.from(dependencies).map(name => {
  return new RegExp(`^${name}(/.*)?`)
})

export default [
  {
    input: ['./src/index.ts'],
    external,
    plugins: [
      nodeResolve({
        include: /node_modules/,
      }),
      commonjs({
        include: /node_modules/,
      }),
      typescript({
        tsconfig: 'tsconfig.build.json',
      }),
      esbuild(),
      includeCSS({
        modulesRoot: 'src',
      }),
      includeDirectives(),
    ],
    output: {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    onwarn(warning, defaultHandler) {
      // Dependencies or modules may use "use client" as an indicator for React
      // Server Components that this module should only be loaded on the client.
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
        return
      }

      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw warning
      }

      defaultHandler(warning)
    },
  },
]
