"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { $getSelection, $isRangeSelection } from "lexical"
import { $isListNode } from "@lexical/list"
import { ListOrdered, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { $findMatchingParent } from '@lexical/utils';

export function ListToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const toggleList = (listType: "bullet" | "number") => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const parentList = $findMatchingParent(selection.anchor.getNode(), $isListNode)

      if (parentList) {
        const parentType = parentList.getTag()
        if (
          (listType === "bullet" && parentType === "ul") ||
          (listType === "number" && parentType === "ol")
        ) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
          return
        }
      }

      if (listType === "bullet") {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-transparent transition-colors hover:bg-muted hover:text-muted-foreground"
        onClick={() => toggleList("bullet")}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-transparent transition-colors hover:bg-muted hover:text-muted-foreground"
        onClick={() => toggleList("number")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ListToolbarWrapper() {
  return (
    <>
      <ListPlugin />
      <ListToolbarPlugin />
    </>
  )
}
