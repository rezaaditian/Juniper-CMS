import { SerializedEditorState } from "lexical";
import { lexicalDefaultValue } from "./lexical-default-state";

export function parseContentToLexicalState(
  content: string | undefined
): SerializedEditorState {
  if (!content) return lexicalDefaultValue;

  try {
    const parsed = JSON.parse(content);
    if (parsed?.root?.children) {
      return parsed as unknown as SerializedEditorState;
    } else {
      return {
        root: {
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: String(content),
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  version: 1,
                },
              ],
              direction: "ltr",
              indent: 0,
              format: "",
              version: 1,
            },
          ],
          direction: "ltr",
          indent: 0,
          format: "",
          type: "root",
          version: 1,
        },
      } as unknown as SerializedEditorState;
    }
  } catch {
    return {
      root: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: String(content),
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                version: 1,
              },
            ],
            direction: "ltr",
            indent: 0,
            format: "",
            version: 1,
          },
        ],
        direction: "ltr",
        indent: 0,
        format: "",
        type: "root",
        version: 1,
      },
    } as unknown as SerializedEditorState;
  }
}
