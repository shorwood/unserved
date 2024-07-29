import { setHeader } from 'h3'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleIcon } from '../index'

export function iconGet(this: ModuleIcon) {
  return createRoute(
    {
      name: 'GET /api/icons/:name',
      parameters: createParser({
        name: [assertString],
      }),
      query: createParser({
        color: [[assertUndefined], [assertString]],
        remote: [[assertUndefined], [assertStringNumber, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {
      const { Icon } = this.entities
      const { name } = parameters
      const { color, remote } = query
      let svg: string

      // --- Fetch the icon from the remote source.
      if (remote) {
        const [collection, iconName] = name.split(':')
        const url = new URL(`${collection}/${iconName}.svg`, this.iconIconifyUrl)
        const response = await fetch(url)
        if (!response.ok) throw this.errors.ICONIFY_FETCH_FAILED(response)
        svg = await response.text()
      }

      // --- Fetch the icon from the database.
      else {
        const icon = await Icon.findOne({ where: { name }, relations: { collection: true } })
        if (!icon) throw this.errors.ICON_NOT_FOUND(name)
        svg = icon.svg
      }

      // --- Return the icon's svg.
      if (color) svg = svg.replaceAll('currentColor', color)
      svg.replaceAll(/width="[^"]+"/g, 'width="24px"')
      svg.replaceAll(/height="[^"]+"/g, 'height="24px"')
      setHeader(event, 'Content-Type', 'image/svg+xml')
      setHeader(event, 'Content-Length', svg.length)
      setHeader(event, 'Cache-Control', 'public, max-age=31536000')
      return svg
    },
  )
}
