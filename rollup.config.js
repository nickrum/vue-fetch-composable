import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

const name = 'vue-fetch-composable';
const globalName = 'VueFetchComposable';

const configs = {
  esmBundler: {
    file: `dist/${name}.esm-bundler.js`,
    format: 'es',
    mode: 'development'
  },
  esmBrowserDev: {
    file: `dist/${name}.esm-browser.js`,
    format: 'es',
    mode: 'development',
    browser: true
  },
  esmBrowserProd: {
    file: `dist/${name}.esm-browser.min.js`,
    format: 'es',
    mode: 'production',
    browser: true
  },
  globalDev: {
    file: `dist/${name}.global.js`,
    format: 'iife',
    mode: 'development',
    browser: true
  },
  globalProd: {
    file: `dist/${name}.global.min.js`,
    format: 'iife',
    mode: 'production',
    browser: true
  },
  cjs: {
    file: `dist/${name}.cjs.js`,
    format: 'cjs',
    mode: 'development'
  }
};

let isTypescriptRun = true;

function createConfig({ file, format, mode = 'development', browser = false }) {
  const isProduction = mode === 'production';

  const config = {
    input: 'src/index.ts',
    external: ['vue'],
    plugins: [],
    output: {
      file: file,
      format: format,
      globals: {
        vue: 'Vue'
      }
    }
  };

  if (format === 'iife' || format === 'umd') {
    config.output.name = globalName;
  }

  config.plugins.push(
    typescript({
      check: isTypescriptRun,
      tsconfigOverride: {
        compilerOptions: {
          declaration: isTypescriptRun
        }
      }
    })
  );

  isTypescriptRun = false;

  config.plugins.push(resolve());

  config.plugins.push(
    replace({
      __DEV__:
        format === 'es' && !browser
          ? `(process.env.NODE_ENV !== 'production')`
          : !isProduction
    })
  );

  if (isProduction) {
    config.plugins.push(terser());
  }

  return config;
}

function createConfigs(configs) {
  return Object.keys(configs).map(key => createConfig(configs[key]));
}

export default createConfigs(configs);
