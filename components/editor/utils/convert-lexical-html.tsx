"use client"

import { useEffect, useState } from "react"
import { createEditor } from "lexical"
import { $generateHtmlFromNodes } from "@lexical/html"
import { cn } from "@/lib/utils"
import { nodes } from '@/components/blocks/editor-00/nodes';

interface LexicalContentProps {
    content: string
    className?: string
}

export function LexicalContent({ content, className }: LexicalContentProps) {
    const [html, setHtml] = useState("")

    useEffect(() => {
        try {
            const parsed = JSON.parse(content)
            const editor = createEditor({
                nodes
            })
            const editorState = editor.parseEditorState(parsed)

            editor.setEditorState(editorState)
            editor.update(() => {
                const htmlString = $generateHtmlFromNodes(editor)
                setHtml(htmlString)
            })
        } catch (e) {
            console.error("Failed to render Lexical content:", e)
            // setHtml(content || "<p>Invalid content</p>")
            setHtml(`<p>${content}</p>`)
        }
    }, [content])

    return (
      <div
        className={cn("", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
}
