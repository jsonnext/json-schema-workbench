import json5 from "json5"
import jsYaml from "js-yaml"

import { JSONModes } from "@/types/editor"

const parsers = {
  [JSONModes.JSON4]: JSON.parse,
  [JSONModes.JSON5]: json5.parse,
  [JSONModes.YAML]: (str: string) => jsYaml.load(str, { schema: jsYaml.JSON_SCHEMA }),
}

const serializers = {
  [JSONModes.JSON4]: (obj: unknown) => JSON.stringify(obj, null, 2),
  [JSONModes.JSON5]: (obj: unknown) => json5.stringify(obj, null, 2),
  [JSONModes.YAML]: (obj: unknown) => jsYaml.dump(obj, { noRefs: true, flowLevel: 12 }),
}

export const parse = (editorMode: JSONModes = JSONModes.JSON4, value: string = '{}'): Record<string, unknown> => {
  return parsers[editorMode](value ?? '{}')
}

export const serialize = (
  editorMode: JSONModes = JSONModes.JSON4,
  value?: Record<string, unknown>
): string => {
    return serializers[editorMode](value ?? {})
}


