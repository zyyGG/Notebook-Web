
import { Plugin } from 'vite'
import { TransformResult } from 'rollup'
import Frontmatter, { FrontMatterResult } from 'front-matter'
import MarkdownIt, { Options as MarkdownItOptions } from 'markdown-it'


class ExportedContent {
  #exports: string[] = []
  #contextCode = ''

  addContext (contextCode: string): void {
    this.#contextCode += `${contextCode}\n`
  }

  addExporting (exported: string): void {
    this.#exports.push(exported)
  }

  export (): string {
    return [this.#contextCode, `export { ${this.#exports.join(', ')} }`].join('\n')
  }
}

interface PluginOptions {

}

function tf (code: string, id: string, options: PluginOptions): TransformResult {
  if (!id.endsWith('.md')) return null

  const content = new ExportedContent()
  // 属性头的解析
  const fmResult: FrontMatterResult<string> = Frontmatter(code)
  content.addContext(`const attributes = ${JSON.stringify(fmResult.attributes)}`)
  content.addExporting('attributes')

  // markdown解析为html
  const html = MarkdownIt({
    html: true,
  }).render(fmResult.body)
  content.addContext(`const html = ${JSON.stringify(html)}`)
  content.addExporting('html')

  // content.addContext(`const file = { path: 5 }`)
  // content.addExporting('file')

  return {
    code: content.export(),
    map: null,
  }
}

function ViteMarkdown(options?: PluginOptions): Plugin { 
  return {
    name: 'vite-plugin-markdown',
    enforce: 'pre',
    transform(code, id) {
      return tf(code, id, options || {})
    },
  }
}

export default ViteMarkdown