import json5 from "json5"

import { JSONModes } from "@/types/editor"

const parsers = {
  [JSONModes.JSON4]: JSON.parse,
  [JSONModes.JSON5]: json5.parse,
}

const serializers = {
  [JSONModes.JSON4]: JSON.stringify,
  [JSONModes.JSON5]: json5.stringify,
}

export const parse = (editorMode: JSONModes, value: string): Record<string, unknown> => {
  try {
    return parsers[editorMode](value)
  } catch (e) {
    return value ? JSON.parse(value) : {}
  }
}

export const serialize = (
  editorMode: JSONModes,
  value?: Record<string, unknown>
): string => {
    console.log('serializing')
  try {
    // @ts-expect-error
    return serializers[editorMode](value, null, 2)
  } catch (e) {
    return value?.toString() ?? "{}"
  }
}
