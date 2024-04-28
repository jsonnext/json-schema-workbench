import { useEffect, useRef } from "react"
import { SchemaState, useMainStore } from "@/store/main"
import { autocompletion } from "@codemirror/autocomplete"
import { history } from "@codemirror/commands"
import {
  bracketMatching,
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language"
import { lintGutter } from "@codemirror/lint"
import { EditorState } from "@codemirror/state"
import { EditorView, gutter, lineNumbers } from "@codemirror/view"
import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror"
import { jsonSchema, updateSchema } from "codemirror-json-schema"
import { json5Schema } from "codemirror-json-schema/json5"
import { yamlSchema } from "codemirror-json-schema/yaml"

// import { debounce } from "@/lib/utils"
import {
  jsonDark,
  jsonDarkHighlightStyle,
  jsonDarkTheme,
  useTheme,
} from "./theme"

/**
 * none of these are required for json4 or 5
 * but they will improve the DX
 */
const commonExtensions = [
  history(),
  autocompletion(),
  EditorView.lineWrapping,
  EditorState.tabSize.of(2),
  lintGutter(),

  gutter({ class: "CodeMirror-lint-markers" }),
  foldGutter(),
  bracketMatching(),
  lineNumbers(),
  indentOnInput(),
]

const languageExtensions = {
  json4: jsonSchema,
  json5: json5Schema,
  yaml: yamlSchema,
}

export interface JSONEditorProps extends Omit<ReactCodeMirrorProps, "value"> {
  onValueChange?: (newValue: string) => void
  schema?: Record<string, unknown>
  editorKey: keyof SchemaState["editors"]
  value?: string
}
export const JSONEditor = ({
  schema,
  onValueChange = () => {},
  editorKey,
  value,
  ...rest
}: JSONEditorProps) => {
  const editorMode = useMainStore(
    (state) => state.editors[editorKey].mode ?? state.userSettings.mode
  )
  const languageExtension = languageExtensions[editorMode](schema)
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  useEffect(() => {
    if (
      !schema ||
      !editorRef?.current?.view ||
      Object.keys(schema)?.length === 0
    ) {
      return
    }
    updateSchema(editorRef?.current.view, schema)
  }, [schema])
  const theme = useTheme()

  return (
    <CodeMirror
      value={value ?? "{}"}
      extensions={[...commonExtensions, languageExtension]}
      onChange={onValueChange}
      theme={theme.theme === "dark" ? jsonDarkTheme : "light"}
      ref={editorRef}
      contextMenu="true"
      {...rest}
    />
  )
}
