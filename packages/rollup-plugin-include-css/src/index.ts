import type {Plugin} from 'rollup'
import path from 'node:path'
import {createHash} from 'node:crypto'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'

interface IncludeCSSOptions {
  /**
   * Provide the root directory for your package. This is used to calculate the
   * relative path for generated CSS files
   */
  modulesRoot: string

  /**
   * Optionally provide an array of postcss plugins to use during CSS
   * compilation.
   */
  postcssPlugins?: Array<postcss.AcceptedPlugin>

  /**
   * Optionally provide options to pass forward to `postcss-modules` when
   * compiling CSS
   */
  postcssModulesOptions?: Parameters<typeof postcssModules>[0]
}

export function includeCSS(options: IncludeCSSOptions): Plugin {
  const {modulesRoot, postcssPlugins = [], postcssModulesOptions = {}} = options
  const rootDirectory = path.isAbsolute(modulesRoot) ? modulesRoot : path.resolve(process.cwd(), modulesRoot)

  return {
    name: 'include-css',
    resolveId(source, importer) {
      if (!importer) {
        return
      }

      // If we're working with a css asset that is not a CSS module, assume that
      // it has been generated by our plugin and should be marked as external.
      if (source.endsWith('.css') && !source.endsWith('.module.css')) {
        return {
          id: path.resolve(path.dirname(importer), source),
          external: true,
        }
      }
    },
    async transform(code, id) {
      if (!id.endsWith('.css')) {
        return
      }

      // When transforming CSS modules, we want to emit the generated CSS as an
      // asset and include the generated file in our generated CSS Modules file
      // which contains the classes. This makes sure that if the file containing
      // the classes is used, then the associated styles for those classes is
      // also included

      let cssModuleClasses = null
      // @ts-expect-error this seems to work
      const result = await postcss([
        ...postcssPlugins,
        postcssModules({
          ...postcssModulesOptions,
          getJSON(filename, json) {
            if (postcssModulesOptions.getJSON) {
              postcssModulesOptions.getJSON(filename, json)
            }
            cssModuleClasses = json
          },
        }),
      ]).process(code, {from: id})
      const source = result.css
      const hash = getSourceHash(source)
      const relativePath = path.relative(rootDirectory, id)

      const fileName = path.join(
        path.dirname(relativePath),
        path.format({
          name: path.basename(relativePath, '.module.css') + `-${hash}`,
          ext: '.css',
        }),
      )

      this.emitFile({
        type: 'asset',
        source,
        fileName,
      })

      return {
        code: `
          import './${path.basename(fileName)}';
          export default ${JSON.stringify(cssModuleClasses)}
        `,
      }
    },
  }
}

const DEFAULT_HASH_SIZE = 8

function getSourceHash(source: string) {
  return createHash('sha256').update(source).digest('hex').slice(0, DEFAULT_HASH_SIZE)
}
