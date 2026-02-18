import { useState } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import {ToolbarPlugin} from "@/components/editor/plugins/toolbar/toolbar-plugin";
import {BlockFormatDropDown} from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import {FormatParagraph} from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import {FormatHeading} from "@/components/editor/plugins/toolbar/block-format/format-heading";
import {FormatNumberedList} from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import {FormatBulletedList} from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import {FormatCheckList} from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import {FormatQuote} from "@/components/editor/plugins/toolbar/block-format/format-quote";
import {ActionsPlugin} from "@/components/editor/plugins/actions/actions-plugin";
import {ClearEditorActionPlugin} from "@/components/editor/plugins/actions/clear-editor-plugin";
import {TabIndentationPlugin} from "@lexical/react/LexicalTabIndentationPlugin";
import {ElementFormatToolbarPlugin} from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import {HistoryToolbarPlugin} from "@/components/editor/plugins/toolbar/history-toolbar-plugin";
import {FontFormatToolbarPlugin} from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import {LinkToolbarPlugin} from "@/components/editor/plugins/toolbar/link-toolbar-plugin";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import { ClearFormattingToolbarPlugin } from '@/components/editor/plugins/toolbar/clear-formatting-toolbar';
import { ListToolbarWrapper } from '@/components/editor/plugins/toolbar/list-toolbar-plugin';
import { CounterCharacterPlugin } from '@/components/editor/plugins/actions/counter-character-plugin';

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative">
      {/* toolbar plugins */}
        <ToolbarPlugin>
            {({ blockType }) => (
                <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1">
                    <HistoryToolbarPlugin />
                    <BlockFormatDropDown>
                        <FormatParagraph />
                        <FormatHeading levels={["h1", "h2", "h3"]} />
                        <FormatNumberedList />
                        <FormatBulletedList />
                        <FormatCheckList />
                        <FormatQuote />
                    </BlockFormatDropDown>
                    <FontFormatToolbarPlugin format="bold" />
                    <FontFormatToolbarPlugin format="italic" />
                    <FontFormatToolbarPlugin format="underline" />
                    <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
                    <ListToolbarWrapper />
                    <ClearFormattingToolbarPlugin />
                </div>
            )}
        </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* editor plugins */}
          <TabIndentationPlugin />
      </div>
        <ActionsPlugin>
            <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
                <div className="flex flex-1 justify-start">
                    {/* left side action buttons */}
                </div>
                <div>{/* center action buttons */}
                  <CounterCharacterPlugin charset="UTF-16" /></div>
                <div className="flex flex-1 justify-end">
                    {/* right side action buttons */}
                    <>
                        {/*<ClearEditorActionPlugin />*/}
                    </>
                </div>
                <HistoryPlugin />
            </div>
        </ActionsPlugin>
    </div>
  )
}
