const closureCompiler = require('google-closure-compiler-js').compile
const fs = require('fs')
const path = require('path')

module.exports = {
  parse: function (app, fileName) {
    let params = app.get('params').js.compiler.params || {}
    let externs
    const logger = app.get('logger')

    // make a copy of the params so the originals aren't modified
    params = JSON.parse(JSON.stringify(params))

    if (params.externs) {
      // process externs
      if (typeof params.externs === 'string') {
        params.externs = [{ src: fs.readFileSync(path.join(app.get('appDir'), params.externs), 'utf-8') }]
      } else {
        externs = []
        params.externs.forEach((extern) => {
          externs.push(
            {
              src: fs.readFileSync(path.join(app.get('appDir'), extern), 'utf-8')
            }
          )
        })
        params.externs = externs
      }
    }

    params.jsCode = [{ src: fs.readFileSync(path.join(app.get('jsPath'), fileName), 'utf-8') }]

    const compilerOut = closureCompiler(params)
    const newJs = compilerOut.compiledCode
    const errors = compilerOut.errors
    const warnings = compilerOut.warnings

    if (app.get('params').js.compiler.showWarnings === true && warnings[0]) {
      logger.warn('⚠️  JS Compiler Warnings:')
      logger.warn(warnings)
    }

    if (errors[0]) {
      throw errors
    }

    return newJs
  }
}
