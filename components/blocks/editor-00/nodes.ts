import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    AutoLinkNode,
    LinkNode
  ]
