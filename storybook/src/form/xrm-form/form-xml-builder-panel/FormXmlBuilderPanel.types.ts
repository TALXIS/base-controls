import type { IXrmFormStrategy } from "@talxis/base-controls/components/Form"
import type { FormXml } from "@talxis/client-metadata"

export interface IFormXmlBuilderPanelProps {
    formXmlText: string
    parsedFormXml: FormXml | null
    builderError: string | null
    onFormXmlTextChange: (value: string) => void
    strategy: IXrmFormStrategy
    onUndoStackChange?: (count: number, undo: (() => void) | null) => void
}

export type TSelection =
    | { type: "tab"; tabIndex: number }
    | { type: "column"; tabIndex: number; columnIndex: number }
    | { type: "section"; tabIndex: number; columnIndex: number; sectionIndex: number }
    | { type: "field"; tabIndex: number; columnIndex: number; sectionIndex: number; rowIndex: number; cellIndex: number }

export type TInlineEditTarget =
    | { type: "tab"; tabIndex: number }
    | { type: "section"; tabIndex: number; columnIndex: number; sectionIndex: number }
    | { type: "field"; tabIndex: number; columnIndex: number; sectionIndex: number; rowIndex: number; cellIndex: number }

export type TInlineEdit = (TInlineEditTarget & { element: HTMLElement }) | null

export interface ISectionLabelWidthDialogState {
    tabIndex: number
    columnIndex: number
    sectionIndex: number
    value: string
    error: string | null
}

export interface IFieldSpanDialogState {
    tabIndex: number
    columnIndex: number
    sectionIndex: number
    rowIndex: number
    cellIndex: number
    property: "rowspan" | "colspan"
    value: string
    error: string | null
}

export interface ISectionColumnsDialogState {
    tabIndex: number
    columnIndex: number
    sectionIndex: number
    value: string
    error: string | null
}

export interface IContextMenuState {
    target: { x: number; y: number }
    selection: TSelection
}

export interface IFieldPickerMenuState {
    target: { x: number; y: number }
    selection: Extract<TSelection, { type: "section" }>
}

export interface IContextMenuAnchorState {
    target: { x: number; y: number }
    selection: TSelection
}

export interface ICanvasRect {
    top: number
    left: number
    width: number
    height: number
}

export interface ICanvasAnchors {
    tabs: Record<string, ICanvasRect>
    columns: Record<string, ICanvasRect>
    sections: Record<string, ICanvasRect>
    fields: Record<string, ICanvasRect>
}
