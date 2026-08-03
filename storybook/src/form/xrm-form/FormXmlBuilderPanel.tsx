import { Checkbox, ContextualMenu, Dialog, DialogFooter, DialogType, IContextualMenuItem, PrimaryButton, SearchBox, Stack, Text, TextField, DefaultButton, IconButton, getTheme, mergeStyleSets } from "@fluentui/react"
import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragOverEvent, DragStartEvent, PointerSensor, useDraggable, useDroppable, useSensor } from "@dnd-kit/core"
import { horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS as DndCss } from "@dnd-kit/utilities"
import { XrmForm } from "@talxis/base-controls/components/Form"
import type { IXrmFormContext } from "@talxis/base-controls/components/Form"
import { serializeFormXml } from "@talxis/client-metadata"
import type { FormXml, FormXmlCell, FormXmlSection } from "@talxis/client-metadata"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { getFormColumns } from "../shared/formModel"
import { DEFAULT_LANGUAGE_CODE, getClassIdForColumn } from "./constants"
import { getXrmStrategy, setCurrentFormXml } from "./xrmModel"
import {
    addColumnToFormXml,
    addFieldRowToFormXml,
    addSectionToFormXml,
    addTabToFormXml,
    buildNewColumn,
    buildNewFieldRow,
    buildNewSection,
    buildNewTab,
    getColumns,
    getFieldEntries,
    getLabel,
    getTabs,
    makeLabel,
    moveFieldToSectionInFormXml,
    moveFieldInFormXml,
    moveColumnInFormXml,
    moveColumnToTabInFormXml,
    moveSectionInFormXml,
    moveSectionToTabInFormXml,
    removeColumnFromFormXml,
    removeFieldFromFormXml,
    removeSectionFromFormXml,
    removeTabFromFormXml,
    reorderTabsInFormXml,
    updateColumnInFormXml,
    updateFieldInFormXml,
    updateSectionInFormXml,
    updateTabInFormXml,
} from "./formXmlHelpers"

interface IFormXmlBuilderPanelProps {
    formXmlText: string
    parsedFormXml: FormXml | null
    builderError: string | null
    onFormXmlTextChange: (value: string) => void
    onUndoStackChange?: (count: number, undo: (() => void) | null) => void
}

type TSelection =
    | { type: "tab"; tabIndex: number }
    | { type: "column"; tabIndex: number; columnIndex: number }
    | { type: "section"; tabIndex: number; columnIndex: number; sectionIndex: number }
    | { type: "field"; tabIndex: number; columnIndex: number; sectionIndex: number; rowIndex: number; cellIndex: number }

type TInlineEditTarget =
    | { type: "tab"; tabIndex: number }
    | { type: "section"; tabIndex: number; columnIndex: number; sectionIndex: number }
    | { type: "field"; tabIndex: number; columnIndex: number; sectionIndex: number; rowIndex: number; cellIndex: number }

type TInlineEdit = (TInlineEditTarget & { element: HTMLElement }) | null

interface ISectionLabelWidthDialogState {
    tabIndex: number
    columnIndex: number
    sectionIndex: number
    value: string
    error: string | null
}

interface IFieldSpanDialogState {
    tabIndex: number
    columnIndex: number
    sectionIndex: number
    rowIndex: number
    cellIndex: number
    property: "rowspan" | "colspan"
    value: string
    error: string | null
}

interface ISectionColumnsDialogState {
    tabIndex: number
    columnIndex: number
    sectionIndex: number
    value: string
    error: string | null
}

interface IContextMenuState {
    target: { x: number; y: number }
    selection: TSelection
}

interface IFieldPickerMenuState {
    target: { x: number; y: number }
    selection: Extract<TSelection, { type: "section" }>
}

interface IContextMenuAnchorState {
    target: { x: number; y: number }
    selection: TSelection
}

interface ICanvasRect {
    top: number
    left: number
    width: number
    height: number
}

interface ICanvasAnchors {
    tabs: Record<string, ICanvasRect>
    columns: Record<string, ICanvasRect>
    sections: Record<string, ICanvasRect>
    fields: Record<string, ICanvasRect>
}

interface ISectionDragState {
    sourceTabIndex: number
    sourceColumnIndex: number
    sourceSectionIndex: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    pointerX: number
    pointerY: number
    active: boolean
    targetColumnIndex: number | null
    targetSectionIndex: number | null
    targetTabIndex: number | null
    side: "before" | "after" | "append"
}

interface IColumnDragState {
    sourceTabIndex: number
    sourceIndex: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    pointerX: number
    pointerY: number
    active: boolean
    targetIndex: number | null
    targetTabIndex: number | null
    side: "before" | "after"
}

const theme = getTheme()
const columnWidthPresets = [25, 33, 50, 66, 75, 100]
const sectionLabelWidthPresets = [80, 100, 115, 130, 150, 180, 220]
const sectionColumnsPresets = [1, 2, 3, 4]
const fieldColSpanPresets = [1, 2, 3, 4]
const fieldRowSpanPresets = [1, 2, 3, 4, 5, 6, 8, 10]

const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    helperText: {
        color: theme.palette.neutralSecondary,
    },
    toolbar: {
        display: "flex",
        justifyContent: "flex-end",
    },
    addTabButton: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        border: `1px dashed ${theme.palette.neutralTertiaryAlt}`,
        background: "transparent",
        cursor: "pointer",
        fontSize: 16,
        color: theme.palette.neutralSecondary,
        pointerEvents: "auto",
        selectors: {
            "&:hover": {
                borderColor: theme.palette.themePrimary,
                color: theme.palette.themePrimary,
                background: "rgba(222, 236, 255, 0.18)",
            },
        },
    },
    tabButton: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid transparent",
        background: "transparent",
        cursor: "grab",
        pointerEvents: "auto",
        selectors: {
            "&:hover": {
                    borderColor: "transparent",
                    outline: "1px dashed rgba(96, 94, 92, 0.28)",
                    outlineOffset: 4,
                background: "rgba(96, 94, 92, 0.035)",
            },
        },
    },
    selectedTabButton: {
        borderColor: "transparent",
        outline: "1px dashed rgba(0, 90, 158, 0.72)",
        outlineOffset: 4,
        background: "rgba(222, 236, 255, 0.16)",
        selectors: {
            "&:hover": {
                borderColor: "transparent !important",
                outline: "1px dashed rgba(0, 90, 158, 0.72) !important",
                outlineOffset: "4px !important",
                background: "rgba(222, 236, 255, 0.16)",
            },
        },
    },
    tabTransferTarget: {
        outline: "2px dashed rgba(0, 90, 158, 0.82)",
        outlineOffset: 4,
        background: "rgba(222, 236, 255, 0.16)",
    },
    tabDropIndicator: {
        position: "absolute",
        zIndex: 6,
        width: 2,
        borderRadius: 2,
        background: theme.palette.themePrimary,
        boxShadow: `0 0 0 1px ${theme.palette.white}, 0 0 8px rgba(0, 120, 212, 0.35)`,
        pointerEvents: "none",
    },
    tabDragPlaceholder: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px dashed rgba(0, 120, 212, 0.58)",
        background: "rgba(222, 236, 255, 0.12)",
        color: theme.palette.neutralSecondary,
        opacity: 0.72,
        cursor: "grabbing",
        pointerEvents: "none",
        whiteSpace: "nowrap",
    },
    canvasDragPlaceholder: {
        boxSizing: "border-box",
        border: "1px dashed rgba(0, 90, 158, 0.62)",
        borderRadius: 8,
        background: "rgba(222, 236, 255, 0.16)",
        opacity: 0.72,
        cursor: "grabbing",
        pointerEvents: "none",
    },
    canvasDropIndicator: {
        position: "absolute",
        zIndex: 30,
        height: 3,
        borderRadius: 2,
        background: "rgba(0, 90, 158, 0.82)",
        boxShadow: `0 0 0 1px ${theme.palette.white}, 0 1px 5px rgba(0, 90, 158, 0.45)`,
        pointerEvents: "none",
    },
    columnDropIndicator: {
        position: "absolute",
        zIndex: 30,
        width: 3,
        borderRadius: 2,
        background: "rgba(0, 90, 158, 0.82)",
        boxShadow: `0 0 0 1px ${theme.palette.white}, 1px 0 5px rgba(0, 90, 158, 0.45)`,
        pointerEvents: "none",
    },
    surface: {
        position: "relative",
        minHeight: 0,
        height: "100%",
        overflow: "auto",
        padding: 16,
        borderRadius: 8,
        background: theme.palette.neutralLighterAlt,
        border: `1px solid ${theme.palette.neutralLight}`,
        boxSizing: "border-box",
    },
    formWindow: {
        position: "relative",
        minHeight: 520,
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${theme.palette.neutralLight}`,
        background: theme.palette.white,
        boxShadow: theme.effects.elevation8,
        overflow: "hidden",
    },
    previewBase: {
        position: "relative",
        zIndex: 0,
        selectors: {
            ".ms-CommandBar": {
                display: "none",
            },
            "& *": {
                transition: "none !important",
            },
        },
    },
    overlayLayer: {
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: "auto",
    },
    draggingOverlay: {
        selectors: {
            "& *": {
                cursor: "grabbing !important",
            },
        },
    },
    dragIntentOverlay: {
        selectors: {
            "body.form-builder-grabbing & *": {
                cursor: "grabbing !important",
            },
        },
    },
    overlayBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 999,
        background: "rgba(255, 255, 255, 0.92)",
        border: `1px solid ${theme.palette.neutralLight}`,
        boxShadow: theme.effects.elevation4,
        color: theme.palette.neutralPrimary,
        fontSize: theme.fonts.small.fontSize,
        lineHeight: 1.2,
        maxWidth: "100%",
        opacity: 0,
        transform: "translateY(-2px)",
        transition: "opacity 120ms ease-out, transform 120ms ease-out",
    },
    visibleOverlayBadge: {
        opacity: 1,
        transform: "translateY(0)",
    },
    columnOverlay: {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
        border: "1px dashed transparent",
        background: "transparent",
        pointerEvents: "auto",
        zIndex: 1,
        cursor: "grab",
        selectors: {
            "&:hover": {
                    borderColor: "transparent",
                    outline: "1px dashed rgba(96, 94, 92, 0.20)",
                    outlineOffset: 4,
            },
        },
    },
    columnFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "6px 8px",
        marginTop: "auto",
        borderRadius: "0 0 7px 7px",
        background: "rgba(0, 120, 212, 0.04)",
        border: `1px dashed ${theme.palette.neutralTertiaryAlt}`,
        borderTop: "none",
        color: theme.palette.neutralTertiary,
        fontSize: theme.fonts.small.fontSize,
        cursor: "default",
        pointerEvents: "auto",
        minHeight: 32,
        selectors: {
            "&:hover": {
                background: "rgba(0, 120, 212, 0.08)",
                color: theme.palette.neutralSecondary,
            },
        },
    },
    emptyColumnOverlay: {
        border: "1px dashed rgba(96, 94, 92, 0.22)",
        background: "rgba(96, 94, 92, 0.025)",
    },
    emptyColumnFooter: {
        marginTop: 0,
        minHeight: 48,
        borderTop: `1px dashed ${theme.palette.neutralTertiaryAlt}`,
        borderRadius: 7,
        background: "rgba(96, 94, 92, 0.035)",
        color: theme.palette.neutralSecondary,
    },
    columnResizeHandle: {
        position: "absolute",
        top: 0,
        right: -4,
        width: 8,
        height: "100%",
        cursor: "col-resize",
        pointerEvents: "auto",
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        selectors: {
            "&::after": {
                content: '""',
                display: "block",
                width: 3,
                height: 24,
                borderRadius: 2,
                background: theme.palette.neutralTertiaryAlt,
                transition: "background 120ms ease-out, height 120ms ease-out",
            },
            "&:hover::after": {
                background: theme.palette.themePrimary,
                height: 36,
            },
        },
    },
    selectedOverlay: {
        outline: "1px dashed rgba(0, 90, 158, 0.72)",
        outlineOffset: 4,
        background: "rgba(222, 236, 255, 0.14)",
        selectors: {
            "&:hover": {
                outline: "1px dashed rgba(0, 90, 158, 0.72) !important",
                outlineOffset: "4px !important",
                background: "rgba(222, 236, 255, 0.14)",
            },
        },
    },
    columnMeta: {
        color: theme.palette.neutralSecondary,
    },
    sectionWrapper: {
        position: "absolute",
        borderRadius: 8,
        pointerEvents: "auto",
        zIndex: 2,
        cursor: "grab",
        selectors: {
            "&:hover .form-builder-section-outline": {
                borderColor: "transparent",
                outline: "1px dashed rgba(96, 94, 92, 0.24)",
                outlineOffset: 4,
                background: "rgba(255, 255, 255, 0.06)",
            },
        },
    },
    sectionOverlay: {
        position: "absolute",
        inset: 0,
        borderRadius: 8,
        border: "1px solid transparent",
        background: "transparent",
        pointerEvents: "auto",
    },
    fieldOverlay: {
        position: "absolute",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        borderRadius: 6,
        border: "1px solid transparent",
        background: "transparent",
        margin: -4,
        padding: 4,
        color: theme.palette.neutralSecondary,
        cursor: "grab",
        pointerEvents: "auto",
        zIndex: 3,
        selectors: {
            "&:hover": {
                borderColor: "transparent",
                outline: "1px dashed rgba(96, 94, 92, 0.22)",
                outlineOffset: 4,
                background: "rgba(255, 255, 255, 0.06)",
            },
        },
    },
    fieldMeta: {
        color: theme.palette.neutralTertiary,
    },
    emptyState: {
        padding: 16,
        borderRadius: 8,
        border: `1px dashed ${theme.palette.neutralQuaternaryAlt}`,
        color: theme.palette.neutralSecondary,
        textAlign: "center",
    },
    activeDropTarget: {
        boxShadow: `inset 0 0 0 1px ${theme.palette.themePrimary}`,
        background: "rgba(222, 236, 255, 0.28)",
    },
})

const getUniqueName = (prefix: string, existingNames: string[]) => {
    let suffix = 1
    let name = `${prefix}_${suffix}`

    while (existingNames.includes(name)) {
        suffix += 1
        name = `${prefix}_${suffix}`
    }

    return name
}
const getTabId = (tabIndex: number) => `tab:${tabIndex}`
const getSectionId = (columnIndex: number, sectionIndex: number) => `section:${columnIndex}:${sectionIndex}`
const getColumnDropId = (columnIndex: number) => `column-drop:${columnIndex}`
const getFieldId = (columnIndex: number, sectionIndex: number, rowIndex: number, cellIndex: number) =>
    `field:${columnIndex}:${sectionIndex}:${rowIndex}:${cellIndex}`
const getFieldDropId = (columnIndex: number, sectionIndex: number) => `field-drop:${columnIndex}:${sectionIndex}`
const getTabHeaderAnchorId = (tabName: string) => `tab-header-${tabName}`
const getColumnAnchorId = (tabName: string, columnIndex: number) => `column-${tabName}-${columnIndex}`
const getSectionAnchorId = (section: FormXmlSection, sectionIndex: number) => `section-${section.id ?? section.name ?? `section-${sectionIndex}`}`
const getFieldAnchorId = (cell: FormXmlCell, fallback: string) => `cell-${cell.id ?? cell.control?.datafieldname ?? fallback}`
const parseDragId = (value: string | number | null | undefined) => String(value ?? "").split(":")

const getDataIdSelector = (value: string) => `[data-id="${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`
const getTabAnchorKey = (tab: { id?: string; name?: string }, tabIndex: number) => tab.id ?? tab.name ?? `tab-${tabIndex}`

const getSectionCells = (section: FormXmlSection | undefined) =>
    (section?.rows?.row ?? []).flatMap((row, rowIndex) =>
        (row.cell ?? []).flatMap((cell, cellIndex) =>
            cell.control?.datafieldname
                ? [{ cell, rowIndex, cellIndex }]
                : []
        )
    )

const getCellLabel = (cell: FormXmlCell, fallback: string) =>
    getLabel(cell.labels, DEFAULT_LANGUAGE_CODE) ||
    getLabel(cell.control?.labels, DEFAULT_LANGUAGE_CODE) ||
    fallback

const getColumnWidthPercent = (width: string | undefined) => {
    const parsedWidth = Number(String(width ?? "").replace("%", "").trim())
    return Number.isFinite(parsedWidth) ? Math.max(10, Math.min(100, parsedWidth)) : 50
}

const formatColumnWidthPercent = (width: number) => `${Math.round(width)}%`

const getSectionLayoutColumns = (section: FormXmlSection | undefined) => {
    const pattern = String(section?.columns ?? "1")
    return Math.max(1, pattern.length)
}

const isSelection = (selection: TSelection, candidate: TSelection) => {
    if (selection.type !== candidate.type || selection.tabIndex !== candidate.tabIndex) {
        return false
    }

    if (selection.type === "tab" && candidate.type === "tab") {
        return true
    }

    if ("columnIndex" in selection && "columnIndex" in candidate && selection.columnIndex !== candidate.columnIndex) {
        return false
    }

    if ("sectionIndex" in selection && "sectionIndex" in candidate && selection.sectionIndex !== candidate.sectionIndex) {
        return false
    }

    if ("rowIndex" in selection && "rowIndex" in candidate && selection.rowIndex !== candidate.rowIndex) {
        return false
    }

    return !("cellIndex" in selection) || !("cellIndex" in candidate) || selection.cellIndex === candidate.cellIndex
}

const toCanvasRect = (element: HTMLElement, canvasRect: DOMRect): ICanvasRect => {
    const rect = element.getBoundingClientRect()
    return {
        top: rect.top - canvasRect.top,
        left: rect.left - canvasRect.left,
        width: rect.width,
        height: rect.height,
    }
}

const useLongPressDragCursor = () => {
    const timeoutRef = useRef<number | null>(null)

    const clear = () => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        document.body.style.cursor = ""
        document.body.classList.remove("form-builder-grabbing")
    }

    const start = (event: React.PointerEvent) => {
        if (event.button !== 0) return
        clear()
        timeoutRef.current = window.setTimeout(() => {
            document.body.style.cursor = "grabbing"
            document.body.classList.add("form-builder-grabbing")
        }, 180)
    }

    useEffect(() => clear, [])

    return { start, clear }
}

export const FormXmlBuilderPanel = ({ formXmlText, parsedFormXml, builderError, onFormXmlTextChange, onUndoStackChange }: IFormXmlBuilderPanelProps) => {
    const [undoStack, setUndoStack] = useState<string[]>([])
    const [selection, setSelection] = useState<TSelection>({ type: "tab", tabIndex: 0 })
    const [contextMenu, setContextMenu] = useState<IContextMenuState | null>(null)
    const [contextMenuAnchor, setContextMenuAnchor] = useState<IContextMenuAnchorState | null>(null)
    const [fieldPickerMenu, setFieldPickerMenu] = useState<IFieldPickerMenuState | null>(null)
    const [anchors, setAnchors] = useState<ICanvasAnchors>({ tabs: {}, columns: {}, sections: {}, fields: {} })
    const [showOnlyUnusedFields, setShowOnlyUnusedFields] = useState(true)
    const [fieldSearchTerm, setFieldSearchTerm] = useState("")
    const [resizePreview, setResizePreview] = useState<Record<number, number> | null>(null)
    const [inlineEdit, setInlineEdit] = useState<TInlineEdit>(null)
    const [sectionLabelWidthDialog, setSectionLabelWidthDialog] = useState<ISectionLabelWidthDialogState | null>(null)
    const [sectionColumnsDialog, setSectionColumnsDialog] = useState<ISectionColumnsDialogState | null>(null)
    const [fieldSpanDialog, setFieldSpanDialog] = useState<IFieldSpanDialogState | null>(null)
    const [activeTabDragIndex, setActiveTabDragIndex] = useState<number | null>(null)
    const [tabDropIndex, setTabDropIndex] = useState<number | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [dragOverId, setDragOverId] = useState<string | null>(null)
    const [dragOverSide, setDragOverSide] = useState<"before" | "after">("before")
    const [fieldDragSide, setFieldDragSide] = useState<"before" | "after" | "left" | "right">("before")
    const dragStartPointerYRef = useRef<number | null>(null)
    const dragStartPointerXRef = useRef<number | null>(null)
    const [sectionDrag, setSectionDrag] = useState<ISectionDragState | null>(null)
    const sectionDragRef = useRef<ISectionDragState | null>(null)
    const [columnDrag, setColumnDrag] = useState<IColumnDragState | null>(null)
    const columnDragRef = useRef<IColumnDragState | null>(null)
    const pendingInlineEditRef = useRef<TInlineEditTarget | null>(null)
    const columnResizeRef = useRef<{
        columnIndex: number
        startX: number
        leftStartWidth: number
        rightStartWidth: number
        totalWidth: number
    } | null>(null)
    const formWindowRef = useRef<HTMLDivElement | null>(null)
    const formContextRef = useRef<IXrmFormContext | null>(null)
    const longPressCursor = useLongPressDragCursor()
    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    })

    const formColumns = useMemo(() => getFormColumns(), [formXmlText])
    const tabs = useMemo(() => getTabs(parsedFormXml), [parsedFormXml])
    const expandedTabIndex = Math.max(0, tabs.findIndex((tab) => tab.expanded))
    const activeTabIndex = tabs[selection.tabIndex] ? selection.tabIndex : expandedTabIndex
    const activeTab = tabs[activeTabIndex]
    const columns = useMemo(() => getColumns(activeTab), [activeTab])
    const isAnyDragActive = activeDragId !== null || sectionDrag?.active === true || columnDrag?.active === true
    const activeFieldEntry =
        selection.type === "field"
            ? getFieldEntries(activeTab).find(
                  (entry) =>
                      entry.columnIndex === selection.columnIndex &&
                      entry.sectionIndex === selection.sectionIndex &&
                      entry.rowIndex === selection.rowIndex &&
                      entry.cellIndex === selection.cellIndex
              )
            : undefined
    const fieldOptions = useMemo(
        () =>
            formColumns.map((column) => ({
                key: column.name,
                text: `${column.name}${column.displayName ? ` - ${column.displayName}` : ""}`,
            })),
        []
    )
    const usedFieldNames = useMemo(
        () => new Set(tabs.flatMap((tab) => getFieldEntries(tab).map((entry) => entry.cell.control?.datafieldname).filter((value): value is string => !!value))),
        [tabs]
    )
    const filteredFieldOptions = useMemo(() => {
        const normalizedSearch = fieldSearchTerm.trim().toLowerCase()
        return fieldOptions.filter((option) => {
            const fieldName = String(option.key)
            const matchesUsage = !showOnlyUnusedFields || !usedFieldNames.has(fieldName)
            const matchesSearch = normalizedSearch.length === 0 || option.text.toLowerCase().includes(normalizedSearch)
            return matchesUsage && matchesSearch
        })
    }, [fieldOptions, fieldSearchTerm, showOnlyUnusedFields, usedFieldNames])

    const applyFormXmlUpdate = (updater: (formXml: FormXml) => FormXml) => {
        if (!parsedFormXml) {
            return
        }

        setUndoStack((current) => [...current, formXmlText])
        const nextXml = serializeFormXml(updater(parsedFormXml))
        setCurrentFormXml(nextXml)
        onFormXmlTextChange(nextXml)
    }

    const undoLastChange = useCallback(() => {
        setUndoStack((current) => {
            const previousXml = current[current.length - 1]
            if (!previousXml) {
                return current
            }

            setCurrentFormXml(previousXml)
            onFormXmlTextChange(previousXml)
            return current.slice(0, -1)
        })
    }, [onFormXmlTextChange])

    useEffect(() => {
        onUndoStackChange?.(undoStack.length, undoStack.length > 0 ? undoLastChange : null)
    }, [onUndoStackChange, undoLastChange, undoStack.length])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
                const target = event.target as HTMLElement | null
                if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
                    return
                }

                event.preventDefault()
                undoLastChange()
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [undoLastChange])

    const onColumnResizeStart = useCallback((columnIndex: number, event: React.PointerEvent) => {
        event.preventDefault()
        event.stopPropagation()
        event.currentTarget.setPointerCapture?.(event.pointerId)

        const leftWidth = getColumnWidthPercent(columns[columnIndex]?.width)
        const rightWidth = getColumnWidthPercent(columns[columnIndex + 1]?.width)
        const totalWidth = leftWidth + rightWidth

        columnResizeRef.current = {
            columnIndex,
            startX: event.clientX,
            leftStartWidth: leftWidth,
            rightStartWidth: rightWidth,
            totalWidth,
        }

        const canvas = formWindowRef.current
        const tabKey = activeTab ? getTabAnchorKey(activeTab, activeTabIndex) : null
        const tabGridEl = canvas && tabKey
            ? canvas.querySelector<HTMLElement>(getDataIdSelector(tabKey))
            : null
        const originalGridTemplate = tabGridEl?.style.gridTemplateColumns ?? ""

        const colWidths = columns.map((col) => getColumnWidthPercent(col.width))

        const onPointerMove = (moveEvent: PointerEvent) => {
            const info = columnResizeRef.current
            if (!info || !canvas) return

            const resizeWidth = tabGridEl?.getBoundingClientRect().width ?? canvas.getBoundingClientRect().width
            const deltaPercent = ((moveEvent.clientX - info.startX) / resizeWidth) * 100
            const newLeft = Math.max(10, Math.min(info.totalWidth - 10, info.leftStartWidth + deltaPercent))
            const newRight = info.totalWidth - newLeft
            info.leftStartWidth = newLeft
            info.rightStartWidth = newRight
            info.startX = moveEvent.clientX

            if (tabGridEl) {
                const liveWidths = [...colWidths]
                liveWidths[info.columnIndex] = newLeft
                liveWidths[info.columnIndex + 1] = newRight
                const totalLive = liveWidths.reduce((sum, w) => sum + w, 0)
                tabGridEl.style.gridTemplateColumns = liveWidths
                    .map((w) => `minmax(0, ${(w / totalLive) * 100}fr)`)
                    .join(" ")
                measureAnchors()
            }

            setResizePreview({ [info.columnIndex]: newLeft, [info.columnIndex + 1]: newRight })
        }

        const onPointerUp = () => {
            const info = columnResizeRef.current
            if (tabGridEl) {
                tabGridEl.style.gridTemplateColumns = originalGridTemplate
            }
            setResizePreview(null)
            if (info) {
                const newLeft = Math.round(info.leftStartWidth)
                const newRight = Math.round(info.rightStartWidth)
                applyFormXmlUpdate((formXml) => {
                    let result = updateColumnInFormXml(formXml, activeTabIndex, info.columnIndex, (col) => ({
                        ...col,
                        width: `${newLeft}%`,
                    }))
                    result = updateColumnInFormXml(result, activeTabIndex, info.columnIndex + 1, (col) => ({
                        ...col,
                        width: `${newRight}%`,
                    }))
                    return result
                })
            }
            columnResizeRef.current = null
            document.removeEventListener("pointermove", onPointerMove)
            document.removeEventListener("pointerup", onPointerUp)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
        }

        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
        document.addEventListener("pointermove", onPointerMove)
        document.addEventListener("pointerup", onPointerUp)
    }, [columns, activeTab, activeTabIndex, parsedFormXml])

    const selectTab = (tabIndex: number) => {
        setSelection({ type: "tab", tabIndex })
        const canvas = formWindowRef.current
        if (!canvas) return
        const tab = tabs[tabIndex]
        if (!tab) return
        const tabHeader = canvas.querySelector<HTMLElement>(
            getDataIdSelector(getTabHeaderAnchorId(getTabAnchorKey(tab, tabIndex)))
        )
        tabHeader?.click()
    }

    const measureAnchors = () => {
        const canvas = formWindowRef.current
        if (!canvas) {
            return
        }

        const canvasRect = canvas.getBoundingClientRect()
        const nextAnchors: ICanvasAnchors = { tabs: {}, columns: {}, sections: {}, fields: {} }

        tabs.forEach((tab, tabIndex) => {
            const tabAnchor = canvas.querySelector<HTMLElement>(
                getDataIdSelector(getTabHeaderAnchorId(getTabAnchorKey(tab, tabIndex)))
            )
            if (tabAnchor) {
                nextAnchors.tabs[getTabId(tabIndex)] = toCanvasRect(tabAnchor, canvasRect)
            }
        })

        const activeTabAnchorKey = activeTab ? getTabAnchorKey(activeTab, activeTabIndex) : null
        if (!activeTabAnchorKey) {
            setAnchors(nextAnchors)
            return
        }

        columns.forEach((column, columnIndex) => {
            const columnAnchor = canvas.querySelector<HTMLElement>(getDataIdSelector(getColumnAnchorId(activeTabAnchorKey, columnIndex)))
            if (columnAnchor) {
                nextAnchors.columns[getColumnDropId(columnIndex)] = toCanvasRect(columnAnchor, canvasRect)
            }

            ;(column.sections?.section ?? []).forEach((section, sectionIndex) => {
                const sectionAnchor = canvas.querySelector<HTMLElement>(getDataIdSelector(getSectionAnchorId(section, sectionIndex)))
                if (sectionAnchor) {
                    nextAnchors.sections[getSectionId(columnIndex, sectionIndex)] = toCanvasRect(sectionAnchor, canvasRect)
                }
            })
        })

        getFieldEntries(activeTab).forEach((entry) => {
            const fieldAnchor = canvas.querySelector<HTMLElement>(
                getDataIdSelector(
                    getFieldAnchorId(entry.cell, `field-${entry.columnIndex}-${entry.sectionIndex}-${entry.rowIndex}-${entry.cellIndex}`)
                )
            )
            if (fieldAnchor) {
                nextAnchors.fields[getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)] = toCanvasRect(fieldAnchor, canvasRect)
            }
        })

        setAnchors(nextAnchors)
    }

    useLayoutEffect(() => {
        measureAnchors()
    }, [formXmlText, activeTabIndex, selection])

    useEffect(() => {
        const canvas = formWindowRef.current
        if (!canvas) {
            return
        }

        let frameId = 0
        const requestMeasure = () => {
            cancelAnimationFrame(frameId)
            frameId = requestAnimationFrame(() => measureAnchors())
        }

        requestMeasure()

        const resizeObserver = new ResizeObserver(requestMeasure)
        resizeObserver.observe(canvas)

        const mutationObserver = new MutationObserver(requestMeasure)
        mutationObserver.observe(canvas, { childList: true, subtree: true, attributes: true })

        window.addEventListener("resize", requestMeasure)
        canvas.addEventListener("scroll", requestMeasure, { passive: true })

        return () => {
            cancelAnimationFrame(frameId)
            resizeObserver.disconnect()
            mutationObserver.disconnect()
            window.removeEventListener("resize", requestMeasure)
            canvas.removeEventListener("scroll", requestMeasure)
        }
    }, [formXmlText, activeTabIndex, tabs.length, columns.length])

    const openContextMenu = (event: React.MouseEvent, nextSelection: TSelection) => {
        event.preventDefault()
        setSelection(nextSelection)
        setFieldPickerMenu(null)
        setContextMenuAnchor({
            target: { x: event.clientX, y: event.clientY },
            selection: nextSelection,
        })
        setContextMenu({
            target: { x: event.clientX, y: event.clientY },
            selection: nextSelection,
        })
    }

    const closeContextMenu = () => {
        setContextMenu(null)
        setContextMenuAnchor(null)
    }

    const openFieldPickerMenu = (target: { x: number; y: number }, nextSelection: Extract<TSelection, { type: "section" }>) => {
        setSelection(nextSelection)
        setContextMenu(null)
        setFieldSearchTerm("")
        setFieldPickerMenu({ target, selection: nextSelection })
    }

    const closeFieldPickerMenu = () => {
        setFieldPickerMenu(null)
        setFieldSearchTerm("")
        if (contextMenuAnchor) {
            setContextMenu({
                target: contextMenuAnchor.target,
                selection: contextMenuAnchor.selection,
            })
        }
    }

    useEffect(() => {
        if (!contextMenu || contextMenu.selection.type !== "section") {
            setFieldSearchTerm("")
        }
    }, [contextMenu])

    const openSectionLabelWidthDialog = (tabIndex: number, columnIndex: number, sectionIndex: number, currentValue: string | number | undefined) => {
        setSectionLabelWidthDialog({
            tabIndex,
            columnIndex,
            sectionIndex,
            value: String(currentValue ?? ""),
            error: null,
        })
        closeContextMenu()
    }

    const submitSectionLabelWidth = () => {
        const dialog = sectionLabelWidthDialog
        if (!dialog) return

        const trimmedValue = dialog.value.trim()
        const parsedValue = Number(trimmedValue)
        if (!trimmedValue || !Number.isInteger(parsedValue) || parsedValue <= 0) {
            setSectionLabelWidthDialog({
                ...dialog,
                error: "Enter a positive whole number in pixels.",
            })
            return
        }

        applyFormXmlUpdate((formXml) =>
            updateSectionInFormXml(formXml, dialog.tabIndex, dialog.columnIndex, dialog.sectionIndex, (current) => ({
                ...current,
                labelwidth: String(parsedValue),
            }))
        )
        setSectionLabelWidthDialog(null)
    }

    const openSectionColumnsDialog = (tabIndex: number, columnIndex: number, sectionIndex: number, currentValue: string | undefined) => {
        setSectionColumnsDialog({
            tabIndex,
            columnIndex,
            sectionIndex,
            value: String(Math.max(1, String(currentValue ?? "1").length)),
            error: null,
        })
        closeContextMenu()
    }

    const submitSectionColumns = () => {
        const dialog = sectionColumnsDialog
        if (!dialog) return

        const trimmedValue = dialog.value.trim()
        const parsedValue = Number(trimmedValue)
        if (!trimmedValue || !Number.isInteger(parsedValue) || parsedValue <= 0) {
            setSectionColumnsDialog({
                ...dialog,
                error: "Enter a positive whole number of columns.",
            })
            return
        }

        applyFormXmlUpdate((formXml) =>
            updateSectionInFormXml(formXml, dialog.tabIndex, dialog.columnIndex, dialog.sectionIndex, (current) => ({
                ...current,
                columns: "1".repeat(parsedValue),
            }))
        )
        setSectionColumnsDialog(null)
    }

    const openFieldSpanDialog = (
        tabIndex: number,
        columnIndex: number,
        sectionIndex: number,
        rowIndex: number,
        cellIndex: number,
        property: "rowspan" | "colspan",
        currentValue: string | number | undefined
    ) => {
        setFieldSpanDialog({
            tabIndex,
            columnIndex,
            sectionIndex,
            rowIndex,
            cellIndex,
            property,
            value: String(currentValue ?? ""),
            error: null,
        })
        closeContextMenu()
    }

    const submitFieldSpan = () => {
        const dialog = fieldSpanDialog
        if (!dialog) return

        const trimmedValue = dialog.value.trim()
        const parsedValue = Number(trimmedValue)
        if (!trimmedValue || !Number.isInteger(parsedValue) || parsedValue <= 0) {
            setFieldSpanDialog({
                ...dialog,
                error: "Enter a positive whole number.",
            })
            return
        }

        applyFormXmlUpdate((formXml) =>
            updateFieldInFormXml(
                formXml,
                dialog.tabIndex,
                dialog.columnIndex,
                dialog.sectionIndex,
                dialog.rowIndex,
                dialog.cellIndex,
                (cell) => ({
                    ...cell,
                    [dialog.property]: String(parsedValue),
                })
            )
        )
        setFieldSpanDialog(null)
    }

    const startInlineEdit = (edit: TInlineEditTarget): boolean => {
        const canvas = formWindowRef.current
        if (!canvas) return false

        let labelEl: HTMLElement | null = null

        if (edit.type === "tab") {
            const tab = tabs[edit.tabIndex]
            if (!tab) return false
            const tabKey = getTabAnchorKey(tab, edit.tabIndex)
            const headerEl = canvas.querySelector<HTMLElement>(getDataIdSelector(getTabHeaderAnchorId(tabKey)))
            // The tab header button contains a <span> with the label text
            labelEl = headerEl?.querySelector<HTMLElement>("span[class*='linkContent'] > span") ?? headerEl
        } else if (edit.type === "section") {
            const section = columns[edit.columnIndex]?.sections?.section?.[edit.sectionIndex]
            if (!section) return false
            const sectionEl = canvas.querySelector<HTMLElement>(getDataIdSelector(getSectionAnchorId(section, edit.sectionIndex)))
            // Section label is a <span> inside the header div
            labelEl = sectionEl?.querySelector<HTMLElement>("div:first-child > span") ?? null
        } else if (edit.type === "field") {
            const fieldEntries = activeTab ? getFieldEntries(activeTab) : []
            const entry = fieldEntries.find(
                (e) => e.columnIndex === edit.columnIndex && e.sectionIndex === edit.sectionIndex && e.rowIndex === edit.rowIndex && e.cellIndex === edit.cellIndex
            )
            if (!entry) return false
            const cellEl = canvas.querySelector<HTMLElement>(getDataIdSelector(getFieldAnchorId(entry.cell, `field-${edit.columnIndex}-${edit.sectionIndex}-${edit.rowIndex}-${edit.cellIndex}`)))
            // Cell label is a <label> element inside the label wrapper
            labelEl = cellEl?.querySelector<HTMLElement>("label") ?? null
        }

        if (!labelEl) return false

        const activeEdit = { ...edit, element: labelEl } as TInlineEdit
        setInlineEdit(activeEdit)

        labelEl.contentEditable = "true"
        labelEl.style.outline = `2px solid ${theme.palette.themePrimary}`
        labelEl.style.borderRadius = "3px"
        labelEl.style.padding = "0 4px"
        labelEl.style.minWidth = "40px"
        labelEl.style.display = "inline-block"
        labelEl.focus()

        // Select all text
        const range = document.createRange()
        range.selectNodeContents(labelEl)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)

        let initialTextPending = true

        const commit = () => {
            labelEl!.removeEventListener("blur", commit)
            labelEl!.removeEventListener("keydown", onKeyDown)
            labelEl!.removeEventListener("beforeinput", onBeforeInput)
            const value = (labelEl!.textContent ?? "").trim()
            labelEl!.contentEditable = "false"
            labelEl!.style.outline = ""
            labelEl!.style.borderRadius = ""
            labelEl!.style.padding = ""
            labelEl!.style.minWidth = ""

            if (!value) {
                setInlineEdit(null)
                return
            }

            if (edit.type === "tab") {
                applyFormXmlUpdate((formXml) =>
                    updateTabInFormXml(formXml, edit.tabIndex, (tab) => ({
                        ...tab,
                        labels: makeLabel(value, DEFAULT_LANGUAGE_CODE),
                    }))
                )
            } else if (edit.type === "section") {
                applyFormXmlUpdate((formXml) =>
                    updateSectionInFormXml(formXml, edit.tabIndex, edit.columnIndex, edit.sectionIndex, (section) => ({
                        ...section,
                        labels: makeLabel(value, DEFAULT_LANGUAGE_CODE),
                    }))
                )
            } else if (edit.type === "field") {
                applyFormXmlUpdate((formXml) =>
                    updateFieldInFormXml(
                        formXml,
                        edit.tabIndex,
                        edit.columnIndex,
                        edit.sectionIndex,
                        edit.rowIndex,
                        edit.cellIndex,
                        (cell) => ({
                            ...cell,
                            labels: makeLabel(value, DEFAULT_LANGUAGE_CODE),
                        })
                    )
                )
            }
            setInlineEdit(null)
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                event.preventDefault()
                labelEl!.blur()
            } else if (event.key === "Escape") {
                event.preventDefault()
                labelEl!.removeEventListener("blur", commit)
                labelEl!.removeEventListener("keydown", onKeyDown)
                labelEl!.removeEventListener("beforeinput", onBeforeInput)
                labelEl!.contentEditable = "false"
                labelEl!.style.outline = ""
                labelEl!.style.borderRadius = ""
                labelEl!.style.padding = ""
                labelEl!.style.minWidth = ""
                setInlineEdit(null)
            }
        }

        const onBeforeInput = (event: InputEvent) => {
            if (!initialTextPending || (!event.inputType.startsWith("insert") && !event.inputType.startsWith("delete"))) {
                return
            }

            event.preventDefault()
            labelEl!.textContent = event.inputType.startsWith("insert") ? event.data ?? "" : ""
            initialTextPending = false

            const replacementRange = document.createRange()
            replacementRange.selectNodeContents(labelEl!)
            replacementRange.collapse(false)
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(replacementRange)
        }

        labelEl.addEventListener("blur", commit)
        labelEl.addEventListener("keydown", onKeyDown)
        labelEl.addEventListener("beforeinput", onBeforeInput)
        return true
    }

    useEffect(() => {
        const pendingEdit = pendingInlineEditRef.current
        if (!pendingEdit || inlineEdit) {
            return
        }

        let frameId = 0
        let attempts = 0
        const startWhenRendered = () => {
            if (pendingInlineEditRef.current !== pendingEdit || inlineEdit) {
                return
            }

            if (startInlineEdit(pendingEdit)) {
                pendingInlineEditRef.current = null
                return
            }

            attempts += 1
            if (attempts < 10) {
                frameId = requestAnimationFrame(startWhenRendered)
            } else {
                pendingInlineEditRef.current = null
            }
        }

        frameId = requestAnimationFrame(startWhenRendered)
        return () => cancelAnimationFrame(frameId)
    }, [formXmlText, activeTabIndex, tabs.length, columns.length, inlineEdit])

    useEffect(() => {
        if (activeTabDragIndex === null) return

        const canvas = formWindowRef.current
        const tab = tabs[activeTabDragIndex]
        const tabHeader = canvas && tab
            ? canvas.querySelector<HTMLElement>(getDataIdSelector(getTabHeaderAnchorId(getTabAnchorKey(tab, activeTabDragIndex))))
            : null
        if (!tabHeader) return

        const previousOpacity = tabHeader.style.opacity
        tabHeader.style.opacity = "0.35"
        return () => {
            tabHeader.style.opacity = previousOpacity
        }
    }, [activeTabDragIndex, tabs])

    const createTab = () => {
        if (!parsedFormXml) return

        const tabIndex = tabs.length
        const name = getUniqueName("new_tab", tabs.map((tab) => tab.name ?? tab.id ?? ""))
        pendingInlineEditRef.current = { type: "tab", tabIndex }
        setSelection({ type: "tab", tabIndex })
        applyFormXmlUpdate((formXml) => {
            const nextFormXml = addTabToFormXml(formXml, buildNewTab(DEFAULT_LANGUAGE_CODE, name, "New tab"))
            return {
                ...nextFormXml,
                tabs: {
                    ...nextFormXml.tabs,
                    tab: getTabs(nextFormXml).map((tab, index) => ({
                        ...tab,
                        expanded: index === tabIndex,
                    })),
                },
            }
        })
    }

    const createSection = (tabIndex: number, columnIndex: number) => {
        if (!parsedFormXml) return

        const sections = columns[columnIndex]?.sections?.section ?? []
        const sectionIndex = sections.length
        const name = getUniqueName("new_section", sections.map((section) => section.name ?? section.id ?? ""))
        pendingInlineEditRef.current = { type: "section", tabIndex, columnIndex, sectionIndex }
        setSelection({ type: "section", tabIndex, columnIndex, sectionIndex })
        applyFormXmlUpdate((formXml) =>
            addSectionToFormXml(formXml, tabIndex, columnIndex, buildNewSection(DEFAULT_LANGUAGE_CODE, name, "New section"))
        )
    }

    const createField = (tabIndex: number, columnIndex: number, sectionIndex: number, datafieldname: string) => {
        if (!parsedFormXml || !datafieldname) return

        const section = columns[columnIndex]?.sections?.section?.[sectionIndex]
        const rowIndex = section?.rows?.row?.length ?? 0
        pendingInlineEditRef.current = { type: "field", tabIndex, columnIndex, sectionIndex, rowIndex, cellIndex: 0 }
        setSelection({ type: "field", tabIndex, columnIndex, sectionIndex, rowIndex, cellIndex: 0 })
        const column = formColumns.find((formColumn) => formColumn.name === datafieldname)
        applyFormXmlUpdate((formXml) =>
            addFieldRowToFormXml(
                formXml,
                tabIndex,
                columnIndex,
                sectionIndex,
                buildNewFieldRow(DEFAULT_LANGUAGE_CODE, datafieldname, getClassIdForColumn(column), datafieldname)
            )
        )
    }

    const contextMenuItems = useMemo(() => {
        if (!contextMenu) {
            return []
        }

        const selected = contextMenu.selection

        if (selected.type === "tab") {
            const isExpanded = tabs[selected.tabIndex]?.expanded === true
            return [
                {
                    key: "add-column",
                    text: "Add column",
                    iconProps: { iconName: "Add" },
                    onClick: () => {
                        applyFormXmlUpdate((formXml) => addColumnToFormXml(formXml, selected.tabIndex, buildNewColumn("50%")))
                        closeContextMenu()
                    },
                },
                {
                    key: "divider-1",
                    itemType: 1,
                },
                {
                    key: "set-expanded",
                    text: isExpanded ? "Default expanded (active)" : "Set as default expanded",
                    iconProps: { iconName: "Pin" },
                    disabled: isExpanded,
                    onClick: () => {
                        applyFormXmlUpdate((formXml) => ({
                            ...formXml,
                            tabs: {
                                ...formXml.tabs,
                                tab: getTabs(formXml).map((tab, index) => ({
                                    ...tab,
                                    expanded: index === selected.tabIndex,
                                })),
                            },
                        }))
                        closeContextMenu()
                    },
                },
                {
                    key: "divider-2",
                    itemType: 1,
                },
                {
                    key: "remove-tab",
                    text: "Remove tab",
                    iconProps: { iconName: "Delete" },
                    disabled: tabs.length <= 1,
                    onClick: () => {
                        applyFormXmlUpdate((formXml) => removeTabFromFormXml(formXml, selected.tabIndex))
                        closeContextMenu()
                    },
                },
            ] satisfies IContextualMenuItem[]
        }

        if (selected.type === "column") {
            return [
                {
                    key: "add-section",
                    text: "Add section",
                    iconProps: { iconName: "Add" },
                    onClick: () => {
                        createSection(selected.tabIndex, selected.columnIndex)
                        closeContextMenu()
                    },
                },
                {
                    key: "divider-1",
                    itemType: 1,
                },
                {
                    key: "column-width",
                    text: "Set width",
                    iconProps: { iconName: "FitWidth" },
                    subMenuProps: {
                        items: columnWidthPresets.map((preset) => ({
                            key: `width-${preset}`,
                            text: `${preset}%`,
                            onClick: () => {
                                applyFormXmlUpdate((formXml) =>
                                    updateColumnInFormXml(formXml, selected.tabIndex, selected.columnIndex, (column) => ({
                                        ...column,
                                        width: `${preset}%`,
                                    }))
                                )
                                closeContextMenu()
                            },
                        })),
                    },
                },
                {
                    key: "divider-2",
                    itemType: 1,
                },
                {
                    key: "remove-column",
                    text: "Remove column",
                    iconProps: { iconName: "Delete" },
                    disabled: columns.length <= 1,
                    onClick: () => {
                        applyFormXmlUpdate((formXml) =>
                            removeColumnFromFormXml(formXml, selected.tabIndex, selected.columnIndex)
                        )
                        closeContextMenu()
                    },
                },
            ] satisfies IContextualMenuItem[]
        }

        if (selected.type === "section") {
            const section = columns[selected.columnIndex]?.sections?.section?.[selected.sectionIndex]
            return [
                {
                    key: "add-field",
                    text: "Add field",
                    iconProps: { iconName: "Add" },
                    onClick: () => openFieldPickerMenu(contextMenu.target, selected),
                    onMouseEnter: () => openFieldPickerMenu(contextMenu.target, selected),
                },
                {
                    key: "divider-1",
                    itemType: 1,
                },
                {
                    key: "label-position",
                    text: "Label position",
                    iconProps: { iconName: "AlignLeft" },
                    subMenuProps: {
                        items: [
                            {
                                key: "top-labels",
                                text: "Top",
                                canCheck: true,
                                checked: section?.celllabelposition === "Top",
                                onClick: () => {
                                    applyFormXmlUpdate((formXml) =>
                                        updateSectionInFormXml(formXml, selected.tabIndex, selected.columnIndex, selected.sectionIndex, (current) => ({
                                            ...current,
                                            celllabelposition: "Top",
                                        }))
                                    )
                                    closeContextMenu()
                                },
                            },
                            {
                                key: "left-labels",
                                text: "Left",
                                canCheck: true,
                                checked: section?.celllabelposition !== "Top",
                                onClick: () => {
                                    applyFormXmlUpdate((formXml) =>
                                        updateSectionInFormXml(formXml, selected.tabIndex, selected.columnIndex, selected.sectionIndex, (current) => ({
                                            ...current,
                                            celllabelposition: "Left",
                                        }))
                                    )
                                    closeContextMenu()
                                },
                            },
                        ],
                    },
                },
                {
                    key: "section-label-width",
                    text: "Set label width",
                    iconProps: { iconName: "Width" },
                    subMenuProps: {
                        items: [
                            ...sectionLabelWidthPresets.map((preset) => ({
                                key: `section-label-width-${preset}`,
                                text: `${preset}px`,
                                canCheck: true,
                                checked: Number(section?.labelwidth) === preset,
                                onClick: () => {
                                    applyFormXmlUpdate((formXml) =>
                                        updateSectionInFormXml(formXml, selected.tabIndex, selected.columnIndex, selected.sectionIndex, (current) => ({
                                            ...current,
                                            labelwidth: String(preset),
                                        }))
                                    )
                                    closeContextMenu()
                                },
                            })),
                            {
                                key: "section-label-width-custom",
                                text: "Custom...",
                                iconProps: { iconName: "Edit" },
                                onClick: () => openSectionLabelWidthDialog(selected.tabIndex, selected.columnIndex, selected.sectionIndex, section?.labelwidth),
                            },
                        ],
                    },
                },
                {
                    key: "section-columns",
                    text: "Set section columns",
                    iconProps: { iconName: "GridViewSmall" },
                    subMenuProps: {
                        items: [
                            ...sectionColumnsPresets.map((preset) => ({
                                key: `section-columns-${preset}`,
                                text: `${preset}`,
                                canCheck: true,
                                checked: getSectionLayoutColumns(section) === preset,
                                onClick: () => {
                                    applyFormXmlUpdate((formXml) =>
                                        updateSectionInFormXml(formXml, selected.tabIndex, selected.columnIndex, selected.sectionIndex, (current) => ({
                                            ...current,
                                            columns: "1".repeat(preset),
                                        }))
                                    )
                                    closeContextMenu()
                                },
                            })),
                            {
                                key: "section-columns-custom",
                                text: "Custom...",
                                iconProps: { iconName: "Edit" },
                                onClick: () => openSectionColumnsDialog(selected.tabIndex, selected.columnIndex, selected.sectionIndex, section?.columns),
                            },
                        ],
                    },
                },
                {
                    key: "toggle-section-label",
                    text: section?.showlabel === false ? "Show section label" : "Hide section label",
                    iconProps: { iconName: section?.showlabel === false ? "View" : "Hide3" },
                    onClick: () => {
                        applyFormXmlUpdate((formXml) =>
                            updateSectionInFormXml(formXml, selected.tabIndex, selected.columnIndex, selected.sectionIndex, (current) => ({
                                ...current,
                                showlabel: !(current.showlabel ?? true),
                            }))
                        )
                        closeContextMenu()
                    },
                },
                {
                    key: "divider-2",
                    itemType: 1,
                },
                {
                    key: "remove-section",
                    text: "Remove section",
                    iconProps: { iconName: "Delete" },
                    onClick: () => {
                        applyFormXmlUpdate((formXml) =>
                            removeSectionFromFormXml(formXml, selected.tabIndex, selected.columnIndex, selected.sectionIndex)
                        )
                        closeContextMenu()
                    },
                },
            ] satisfies IContextualMenuItem[]
        }

        return [
            {
                key: "toggle-disabled",
                text: activeFieldEntry?.cell.control?.disabled ? "Enable control" : "Disable control",
                iconProps: { iconName: activeFieldEntry?.cell.control?.disabled ? "Accept" : "Blocked" },
                onClick: () => {
                    applyFormXmlUpdate((formXml) =>
                        updateFieldInFormXml(
                            formXml,
                            selected.tabIndex,
                            selected.columnIndex,
                            selected.sectionIndex,
                            selected.rowIndex,
                            selected.cellIndex,
                            (cell) => ({
                                ...cell,
                                control: {
                                    ...cell.control,
                                    disabled: !(cell.control?.disabled ?? false),
                                },
                            })
                        )
                    )
                    closeContextMenu()
                },
            },
            {
                key: "divider-1",
                itemType: 1,
            },
            {
                key: "toggle-field-label",
                text: activeFieldEntry?.cell.showlabel === false ? "Show field label" : "Hide field label",
                iconProps: { iconName: activeFieldEntry?.cell.showlabel === false ? "View" : "Hide3" },
                onClick: () => {
                    applyFormXmlUpdate((formXml) =>
                        updateFieldInFormXml(
                            formXml,
                            selected.tabIndex,
                            selected.columnIndex,
                            selected.sectionIndex,
                            selected.rowIndex,
                            selected.cellIndex,
                            (cell) => ({
                                ...cell,
                                showlabel: !(cell.showlabel ?? true),
                            })
                        )
                    )
                    closeContextMenu()
                },
            },
            {
                key: "toggle-field-visibility",
                text: activeFieldEntry?.cell.visible === false ? "Show field" : "Hide field",
                iconProps: { iconName: activeFieldEntry?.cell.visible === false ? "View" : "Hide3" },
                onClick: () => {
                    applyFormXmlUpdate((formXml) =>
                        updateFieldInFormXml(
                            formXml,
                            selected.tabIndex,
                            selected.columnIndex,
                            selected.sectionIndex,
                            selected.rowIndex,
                            selected.cellIndex,
                            (cell) => ({
                                ...cell,
                                visible: !(cell.visible ?? true),
                            })
                        )
                    )
                    closeContextMenu()
                },
            },
            {
                key: "divider-2",
                itemType: 1,
            },
            {
                key: "field-colspan",
                text: "Set column span",
                iconProps: { iconName: "FitWidth" },
                subMenuProps: {
                    items: [
                        ...fieldColSpanPresets.map((preset) => ({
                            key: `field-colspan-${preset}`,
                            text: `${preset}`,
                            canCheck: true,
                            checked: Number(activeFieldEntry?.cell.colspan ?? 1) === preset,
                            onClick: () => {
                                applyFormXmlUpdate((formXml) =>
                                    updateFieldInFormXml(
                                        formXml,
                                        selected.tabIndex,
                                        selected.columnIndex,
                                        selected.sectionIndex,
                                        selected.rowIndex,
                                        selected.cellIndex,
                                        (cell) => ({
                                            ...cell,
                                            colspan: String(preset),
                                        })
                                    )
                                )
                                closeContextMenu()
                            },
                        })),
                        {
                            key: "field-colspan-custom",
                            text: "Custom...",
                            iconProps: { iconName: "Edit" },
                            onClick: () => {
                                openFieldSpanDialog(
                                    selected.tabIndex,
                                    selected.columnIndex,
                                    selected.sectionIndex,
                                    selected.rowIndex,
                                    selected.cellIndex,
                                    "colspan",
                                    activeFieldEntry?.cell.colspan
                                )
                            },
                        },
                    ],
                },
            },
            {
                key: "field-rowspan",
                text: "Set row span",
                iconProps: { iconName: "CollapseContent" },
                subMenuProps: {
                    items: [
                        ...fieldRowSpanPresets.map((preset) => ({
                            key: `field-rowspan-${preset}`,
                            text: `${preset}`,
                            canCheck: true,
                            checked: Number(activeFieldEntry?.cell.rowspan ?? 1) === preset,
                            onClick: () => {
                                applyFormXmlUpdate((formXml) =>
                                    updateFieldInFormXml(
                                        formXml,
                                        selected.tabIndex,
                                        selected.columnIndex,
                                        selected.sectionIndex,
                                        selected.rowIndex,
                                        selected.cellIndex,
                                        (cell) => ({
                                            ...cell,
                                            rowspan: String(preset),
                                        })
                                    )
                                )
                                closeContextMenu()
                            },
                        })),
                        {
                            key: "field-rowspan-custom",
                            text: "Custom...",
                            iconProps: { iconName: "Edit" },
                            onClick: () => {
                                openFieldSpanDialog(
                                    selected.tabIndex,
                                    selected.columnIndex,
                                    selected.sectionIndex,
                                    selected.rowIndex,
                                    selected.cellIndex,
                                    "rowspan",
                                    activeFieldEntry?.cell.rowspan
                                )
                            },
                        },
                    ],
                },
            },
            {
                key: "divider-3",
                itemType: 1,
            },
            {
                key: "remove-field",
                text: "Remove field",
                iconProps: { iconName: "Delete" },
                onClick: () => {
                    const datafieldname = activeFieldEntry?.cell.control?.datafieldname
                    if (!datafieldname) {
                        return
                    }
                    applyFormXmlUpdate((formXml) =>
                        removeFieldFromFormXml(
                            formXml,
                            selected.tabIndex,
                            selected.columnIndex,
                            selected.sectionIndex,
                            datafieldname
                        )
                    )
                    closeContextMenu()
                },
            },
        ] satisfies IContextualMenuItem[]
    }, [activeFieldEntry, columns, contextMenu, tabs.length])

    const updateSectionDragTarget = (drag: ISectionDragState, pointerX: number, pointerY: number) => {
        const canvas = formWindowRef.current
        if (!canvas) return drag

        const canvasRect = canvas.getBoundingClientRect()
        const localX = pointerX - canvasRect.left
        const localY = pointerY - canvasRect.top

        for (let tabIndex = 0; tabIndex < tabs.length; tabIndex += 1) {
            if (tabIndex === drag.sourceTabIndex) continue
            const tabHeader = canvas.querySelector<HTMLElement>(getDataIdSelector(getTabHeaderAnchorId(getTabAnchorKey(tabs[tabIndex], tabIndex))))
            const rect = tabHeader?.getBoundingClientRect()
            if (rect && pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom) {
                return { ...drag, pointerX, pointerY, targetTabIndex: tabIndex, targetColumnIndex: null, targetSectionIndex: null }
            }
        }

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
            const sections = columns[columnIndex]?.sections?.section ?? []
            for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
                if (columnIndex === drag.sourceColumnIndex && sectionIndex === drag.sourceSectionIndex) continue

                const rect = anchors.sections[getSectionId(columnIndex, sectionIndex)]
                if (!rect || localX < rect.left || localX > rect.left + rect.width || localY < rect.top || localY > rect.top + rect.height) {
                    continue
                }

                return {
                    ...drag,
                    pointerX,
                    pointerY,
                    targetColumnIndex: columnIndex,
                    targetSectionIndex: sectionIndex,
                    targetTabIndex: activeTabIndex,
                    side: localY < rect.top + rect.height / 2 ? "before" : "after",
                }
            }
        }

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
            const rect = anchors.columns[getColumnDropId(columnIndex)]
            if (!rect || localX < rect.left || localX > rect.left + rect.width || localY < rect.top || localY > rect.top + rect.height + 40) {
                continue
            }

            return {
                ...drag,
                pointerX,
                pointerY,
                targetColumnIndex: columnIndex,
                targetSectionIndex: null,
                targetTabIndex: activeTabIndex,
                side: "append",
            }
        }

        return { ...drag, pointerX, pointerY, targetTabIndex: activeTabIndex, targetColumnIndex: null, targetSectionIndex: null }
    }

    const finishSectionDrag = () => {
        const drag = sectionDragRef.current
        document.removeEventListener("pointermove", onSectionPointerMove)
        document.removeEventListener("pointerup", finishSectionDrag)
        document.body.style.userSelect = ""
        longPressCursor.clear()

        const distance = drag ? Math.hypot(drag.pointerX - drag.startX, drag.pointerY - drag.startY) : 0
        if (drag?.active && distance >= 8 && drag.targetTabIndex !== null && (drag.targetColumnIndex !== null || drag.targetTabIndex !== drag.sourceTabIndex)) {
            if (drag.targetTabIndex !== drag.sourceTabIndex) {
                const targetTabIndex = drag.targetTabIndex
                if (targetTabIndex !== null) {
                    applyFormXmlUpdate((formXml) =>
                        moveSectionToTabInFormXml(
                            formXml,
                            drag.sourceTabIndex,
                            drag.sourceColumnIndex,
                            drag.sourceSectionIndex,
                            targetTabIndex
                        )
                    )
                    setSelection({ type: "section", tabIndex: targetTabIndex, columnIndex: 0, sectionIndex: 0 })
                }
                sectionDragRef.current = null
                setSectionDrag(null)
                return
            }

            const targetColumnIndex = drag.targetColumnIndex
            const targetSectionIndex = drag.targetSectionIndex === null
                ? (columns[targetColumnIndex]?.sections?.section?.length ?? 0)
                : drag.targetSectionIndex + (drag.side === "after" ? 1 : 0)

            if (targetColumnIndex !== drag.sourceColumnIndex || targetSectionIndex !== drag.sourceSectionIndex) {
                applyFormXmlUpdate((formXml) =>
                    moveSectionInFormXml(
                        formXml,
                        activeTabIndex,
                        drag.sourceColumnIndex,
                        drag.sourceSectionIndex,
                        targetColumnIndex,
                        targetSectionIndex
                    )
                )
                setSelection({ type: "section", tabIndex: activeTabIndex, columnIndex: targetColumnIndex, sectionIndex: targetSectionIndex })
            }
        }

        sectionDragRef.current = null
        setSectionDrag(null)
    }

    const onSectionPointerMove = (event: PointerEvent) => {
        const drag = sectionDragRef.current
        if (!drag) return

        const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
        const active = drag.active || distance >= 8
        if (active) {
            event.preventDefault()
            document.body.style.userSelect = "none"
            document.body.style.cursor = "grabbing"
        }

        const nextDrag = updateSectionDragTarget({ ...drag, active }, event.clientX, event.clientY)
        sectionDragRef.current = nextDrag
        setSectionDrag(nextDrag)
    }

    const startSectionDrag = (columnIndex: number, sectionIndex: number, event: React.PointerEvent) => {
        if (event.button !== 0) return
        event.preventDefault()
        longPressCursor.start(event)
        setSelection({ type: "section", tabIndex: activeTabIndex, columnIndex, sectionIndex })

        const rect = anchors.sections[getSectionId(columnIndex, sectionIndex)]
        const canvas = formWindowRef.current
        if (!rect || !canvas) return

        const canvasRect = canvas.getBoundingClientRect()
        const pointerX = event.clientX
        const pointerY = event.clientY
        const nextDrag: ISectionDragState = {
            sourceTabIndex: activeTabIndex,
            sourceColumnIndex: columnIndex,
            sourceSectionIndex: sectionIndex,
            startX: pointerX,
            startY: pointerY,
            offsetX: pointerX - canvasRect.left - rect.left,
            offsetY: pointerY - canvasRect.top - rect.top,
            pointerX,
            pointerY,
            active: false,
            targetColumnIndex: null,
            targetSectionIndex: null,
            targetTabIndex: activeTabIndex,
            side: "append",
        }

        sectionDragRef.current = nextDrag
        setSectionDrag(nextDrag)
        document.addEventListener("pointermove", onSectionPointerMove)
        document.addEventListener("pointerup", finishSectionDrag)
    }

    const updateColumnDragTarget = (drag: IColumnDragState, pointerX: number, pointerY: number) => {
        const canvas = formWindowRef.current
        if (!canvas) return drag
        const canvasRect = canvas.getBoundingClientRect()
        const localX = pointerX - canvasRect.left
        const localY = pointerY - canvasRect.top

        for (let tabIndex = 0; tabIndex < tabs.length; tabIndex += 1) {
            if (tabIndex === drag.sourceTabIndex) continue
            const tabHeader = canvas.querySelector<HTMLElement>(getDataIdSelector(getTabHeaderAnchorId(getTabAnchorKey(tabs[tabIndex], tabIndex))))
            const rect = tabHeader?.getBoundingClientRect()
            if (rect && pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom) {
                return { ...drag, pointerX, pointerY, targetTabIndex: tabIndex, targetIndex: null }
            }
        }

        const candidates = columns
            .map((_, columnIndex) => ({ columnIndex, rect: anchors.columns[getColumnDropId(columnIndex)] }))
            .filter(({ columnIndex, rect }) =>
                columnIndex !== drag.sourceIndex
                && !!rect
                && localY >= rect.top
                && localY <= rect.top + rect.height + 40
            )
            .sort((left, right) => {
                const leftCenter = left.rect!.left + left.rect!.width / 2
                const rightCenter = right.rect!.left + right.rect!.width / 2
                return Math.abs(localX - leftCenter) - Math.abs(localX - rightCenter)
            })

        const nearestColumn = candidates[0]
        if (nearestColumn?.rect) {
            return {
                ...drag,
                pointerX,
                pointerY,
                targetIndex: nearestColumn.columnIndex,
                targetTabIndex: activeTabIndex,
                side: localX < nearestColumn.rect.left + nearestColumn.rect.width / 2 ? "before" : "after",
            }
        }

        return { ...drag, pointerX, pointerY, targetTabIndex: activeTabIndex, targetIndex: null }
    }

    const finishColumnDrag = () => {
        const drag = columnDragRef.current
        document.removeEventListener("pointermove", onColumnPointerMove)
        document.removeEventListener("pointerup", finishColumnDrag)
        document.body.style.userSelect = ""
        longPressCursor.clear()

        const distance = drag ? Math.hypot(drag.pointerX - drag.startX, drag.pointerY - drag.startY) : 0
        if (drag?.active && distance >= 8 && drag.targetTabIndex !== null && (drag.targetIndex !== null || drag.targetTabIndex !== drag.sourceTabIndex)) {
            if (drag.targetTabIndex !== drag.sourceTabIndex) {
                const targetTabIndex = drag.targetTabIndex
                if (targetTabIndex !== null) {
                    applyFormXmlUpdate((formXml) =>
                        moveColumnToTabInFormXml(formXml, drag.sourceTabIndex, drag.sourceIndex, targetTabIndex)
                    )
                    setSelection({ type: "column", tabIndex: targetTabIndex, columnIndex: 0 })
                }
                columnDragRef.current = null
                setColumnDrag(null)
                return
            }

            const rawTargetIndex = drag.targetIndex + (drag.side === "after" ? 1 : 0)
            const targetIndex = drag.sourceIndex < rawTargetIndex ? rawTargetIndex - 1 : rawTargetIndex
            applyFormXmlUpdate((formXml) => moveColumnInFormXml(formXml, activeTabIndex, drag.sourceIndex, targetIndex))
            setSelection({ type: "column", tabIndex: activeTabIndex, columnIndex: targetIndex })
        }

        columnDragRef.current = null
        setColumnDrag(null)
    }

    const onColumnPointerMove = (event: PointerEvent) => {
        const drag = columnDragRef.current
        if (!drag) return

        const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
        const nextDrag = updateColumnDragTarget(
            { ...drag, active: drag.active || distance >= 8 },
            event.clientX,
            event.clientY
        )
        if (nextDrag.active) {
            event.preventDefault()
            document.body.style.userSelect = "none"
            document.body.style.cursor = "grabbing"
        }
        columnDragRef.current = nextDrag
        setColumnDrag(nextDrag)
    }

    const startColumnDrag = (columnIndex: number, event: React.PointerEvent) => {
        if (event.button !== 0) return
        const target = event.target as HTMLElement | null
        if (target?.closest(`.${styles.columnResizeHandle}`)) {
            return
        }
        event.preventDefault()
        longPressCursor.start(event)
        setSelection({ type: "column", tabIndex: activeTabIndex, columnIndex })

        const rect = anchors.columns[getColumnDropId(columnIndex)]
        const canvas = formWindowRef.current
        if (!rect || !canvas) return
        const canvasRect = canvas.getBoundingClientRect()
        const nextDrag: IColumnDragState = {
            sourceTabIndex: activeTabIndex,
            sourceIndex: columnIndex,
            startX: event.clientX,
            startY: event.clientY,
            offsetX: event.clientX - canvasRect.left - rect.left,
            offsetY: event.clientY - canvasRect.top - rect.top,
            pointerX: event.clientX,
            pointerY: event.clientY,
            active: false,
            targetIndex: null,
            targetTabIndex: activeTabIndex,
            side: "before",
        }

        columnDragRef.current = nextDrag
        setColumnDrag(nextDrag)
        document.addEventListener("pointermove", onColumnPointerMove)
        document.addEventListener("pointerup", finishColumnDrag)
    }

    const clearTabDrag = () => {
        setActiveTabDragIndex(null)
        setTabDropIndex(null)
        setActiveDragId(null)
        setDragOverId(null)
        setDragOverSide("before")
        setFieldDragSide("before")
        dragStartPointerYRef.current = null
        dragStartPointerXRef.current = null
        document.body.style.cursor = ""
        document.body.classList.remove("form-builder-grabbing")
    }

    const onDragStart = (event: DragStartEvent) => {
        document.body.style.cursor = "grabbing"
        setActiveDragId(String(event.active.id))
        setDragOverId(String(event.active.id))
        setDragOverSide("before")
        const activatorEvent = event.activatorEvent
        dragStartPointerYRef.current = activatorEvent && "clientY" in activatorEvent
            ? activatorEvent.clientY
            : null
        dragStartPointerXRef.current = activatorEvent && "clientX" in activatorEvent
            ? activatorEvent.clientX
            : null
        const activeParts = parseDragId(event.active.id)
        if (activeParts[0] !== "tab") return

        const index = Number(activeParts[1])
        setActiveTabDragIndex(index)
        setTabDropIndex(index)
    }

    const onDragOver = (event: DragOverEvent) => {
        const activeParts = parseDragId(event.active.id)
        const overParts = parseDragId(event.over?.id)
        setDragOverId(event.over ? String(event.over.id) : null)
        if (activeParts[0] !== "tab" || overParts[0] !== "tab") return

        const fromIndex = Number(activeParts[1])
        const overIndex = Number(overParts[1])
        setTabDropIndex(fromIndex < overIndex ? overIndex + 1 : overIndex)
    }

    const onDragMove = (event: DragMoveEvent) => {
        const activeParts = parseDragId(event.active.id)
        if (activeParts[0] === "tab") return

        setActiveDragId(String(event.active.id))
        setDragOverId(event.over ? String(event.over.id) : null)

        if (activeParts[0] === "field") {
            const canvas = formWindowRef.current
            const startX = dragStartPointerXRef.current
            const startY = dragStartPointerYRef.current
            if (canvas && startX !== null && startY !== null) {
                const canvasRect = canvas.getBoundingClientRect()
                const pointerX = startX + event.delta.x - canvasRect.left
                const pointerY = startY + event.delta.y - canvasRect.top
                const sourceId = String(event.active.id)
                const target = getFieldEntries(activeTab).find((entry) => {
                    const fieldId = getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)
                    const rect = anchors.fields[fieldId]
                    return fieldId !== sourceId
                        && !!rect
                        && pointerX >= rect.left
                        && pointerX <= rect.left + rect.width
                        && pointerY >= rect.top
                        && pointerY <= rect.top + rect.height
                })

                if (target) {
                    const targetId = getFieldId(target.columnIndex, target.sectionIndex, target.rowIndex, target.cellIndex)
                    const targetRect = anchors.fields[targetId]
                    if (targetRect) {
                        const horizontalDistance = Math.abs(pointerX - (targetRect.left + targetRect.width / 2))
                        const verticalDistance = Math.abs(pointerY - (targetRect.top + targetRect.height / 2))
                        setDragOverId(targetId)
                        setFieldDragSide(
                            horizontalDistance > verticalDistance
                                ? pointerX < targetRect.left + targetRect.width / 2 ? "left" : "right"
                                : pointerY < targetRect.top + targetRect.height / 2 ? "before" : "after"
                        )
                    }
                }
            }
        }

        if (!event.over) return
        const overRect = event.over.rect
        const startPointerY = dragStartPointerYRef.current
        if (startPointerY === null || !overRect) return

        const pointerY = startPointerY + event.delta.y
        setDragOverSide(pointerY >= overRect.top + overRect.height / 2 ? "after" : "before")

        if (activeParts[0] === "field" && event.over.id.toString().startsWith("field:")) {
            const activeRect = event.active.rect.current.translated
            if (activeRect) {
                const activeCenterX = activeRect.left + activeRect.width / 2
                const activeCenterY = activeRect.top + activeRect.height / 2
                const targetCenterX = overRect.left + overRect.width / 2
                const targetCenterY = overRect.top + overRect.height / 2
                const horizontalDistance = Math.abs(activeCenterX - targetCenterX)
                const verticalDistance = Math.abs(activeCenterY - targetCenterY)
                if (horizontalDistance > verticalDistance) {
                    setFieldDragSide(activeCenterX < targetCenterX ? "left" : "right")
                } else {
                    setFieldDragSide(activeCenterY < targetCenterY ? "before" : "after")
                }
            }
        }
    }

    const onDragEnd = (event: DragEndEvent) => {
        const activeParts = parseDragId(event.active.id)
        const resolvedOverId = activeParts[0] === "field" ? dragOverId ?? event.over?.id : event.over?.id
        const overParts = parseDragId(resolvedOverId)
        clearTabDrag()

        if (!event.over) {
            return
        }

        if (activeParts[0] === "tab" && overParts[0] === "tab") {
            const fromIndex = Number(activeParts[1])
            const toIndex = Number(overParts[1])
            if (fromIndex === toIndex) {
                return
            }
            applyFormXmlUpdate((formXml) => reorderTabsInFormXml(formXml, fromIndex, toIndex))
            setSelection({ type: "tab", tabIndex: toIndex })
            return
        }

        if (activeParts[0] === "section" && (overParts[0] === "section" || overParts[0] === "column-drop")) {
            const fromColumnIndex = Number(activeParts[1])
            const fromSectionIndex = Number(activeParts[2])
            const toColumnIndex = Number(overParts[1])
            const toSectionIndex =
                overParts[0] === "section"
                    ? Number(overParts[2]) + (dragOverSide === "after" ? 1 : 0)
                    : (columns[toColumnIndex]?.sections?.section?.length ?? 0)

            applyFormXmlUpdate((formXml) =>
                moveSectionInFormXml(formXml, activeTabIndex, fromColumnIndex, fromSectionIndex, toColumnIndex, toSectionIndex)
            )
            setSelection({ type: "section", tabIndex: activeTabIndex, columnIndex: toColumnIndex, sectionIndex: toSectionIndex })
            return
        }

        if (activeParts[0] === "field" && (overParts[0] === "field-drop" || overParts[0] === "field" || overParts[0] === "section")) {
            const fromColumnIndex = Number(activeParts[1])
            const fromSectionIndex = Number(activeParts[2])
            const fromRowIndex = Number(activeParts[3])
            const fromCellIndex = Number(activeParts[4])
            const toColumnIndex = Number(overParts[1])
            const toSectionIndex = Number(overParts[2])

            if (fromColumnIndex === toColumnIndex && fromSectionIndex === toSectionIndex) {
                if (overParts[0] === "field") {
                    applyFormXmlUpdate((formXml) =>
                        moveFieldInFormXml(
                            formXml,
                            activeTabIndex,
                            fromColumnIndex,
                            fromSectionIndex,
                            fromRowIndex,
                            fromCellIndex,
                            Number(overParts[3]),
                            Number(overParts[4]),
                            fieldDragSide
                        )
                    )
                }
                return
            }

            applyFormXmlUpdate((formXml) =>
                moveFieldToSectionInFormXml(
                    formXml,
                    activeTabIndex,
                    fromColumnIndex,
                    fromSectionIndex,
                    fromRowIndex,
                    fromCellIndex,
                    toColumnIndex,
                    toSectionIndex
                )
            )
            setSelection({ type: "section", tabIndex: activeTabIndex, columnIndex: toColumnIndex, sectionIndex: toSectionIndex })
        }
    }

    return (
        <div className={styles.root}>
            {builderError && (
                <div className={styles.emptyState}>
                    Fix the raw FormXml first to re-enable the visual builder.
                </div>
            )}

            <DndContext
                sensors={[sensor]}
                onDragStart={onDragStart}
                onDragMove={onDragMove}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDragCancel={clearTabDrag}
            >
                <div className={styles.surface}>
                    <div ref={formWindowRef} className={styles.formWindow}>
                        <div className={styles.previewBase}>
                            <XrmForm
                                key={formXmlText}
                                strategy={getXrmStrategy()}
                                onFormReady={({ formContext }) => {
                                    formContextRef.current = formContext
                                    const expandedIdx = Math.max(0, tabs.findIndex((tab) => tab.expanded))
                                    if (activeTabIndex !== expandedIdx) {
                                        const tabCtx = formContext.ui.tabs.get(activeTabIndex)
                                        if (tabCtx) {
                                            tabCtx.setFocus()
                                        }
                                    }
                                }}
                            />
                        </div>

                        <div
                            className={`${styles.overlayLayer} ${styles.dragIntentOverlay} ${isAnyDragActive ? styles.draggingOverlay : ""}`.trim()}
                        >
                            {!activeTab && <div className={styles.emptyState}>Add a tab to start building the form.</div>}

                            <SortableContext items={tabs.map((_, index) => getTabId(index))} strategy={horizontalListSortingStrategy}>
                                {tabs.map((tab, tabIndex) => {
                                    const rect = anchors.tabs[getTabId(tabIndex)]
                                    if (!rect) {
                                        return null
                                    }

                                    return (
                                        <SortableTab
                                            key={getTabId(tabIndex)}
                                            id={getTabId(tabIndex)}
                                            rect={rect}
                                            label={getLabel(tab.labels, DEFAULT_LANGUAGE_CODE) || tab.name || `Tab ${tabIndex + 1}`}
                                            selected={isSelection(selection, { type: "tab", tabIndex })}
                                            isDragging={activeTabDragIndex === tabIndex}
                                            transferTarget={
                                                (sectionDrag?.active && sectionDrag.targetTabIndex === tabIndex && sectionDrag.sourceTabIndex !== tabIndex)
                                                || (columnDrag?.active && columnDrag.targetTabIndex === tabIndex && columnDrag.sourceTabIndex !== tabIndex)
                                            }
                                            onClick={() => selectTab(tabIndex)}
                                            onDoubleClick={() => startInlineEdit({
                                                type: "tab",
                                                tabIndex,
                                            })}
                                            onContextMenu={(event) => openContextMenu(event, { type: "tab", tabIndex })}
                                        />
                                    )
                                })}
                            </SortableContext>

                            {activeTabDragIndex !== null && tabDropIndex !== null && tabs.length > 0 && (() => {
                                const firstRect = anchors.tabs[getTabId(0)]
                                const lastRect = anchors.tabs[getTabId(tabs.length - 1)]
                                if (!firstRect || !lastRect) return null

                                const targetRect = anchors.tabs[getTabId(tabDropIndex)]
                                const left = tabDropIndex >= tabs.length
                                    ? lastRect.left + lastRect.width + 6
                                    : (targetRect?.left ?? firstRect.left) - 6

                                return (
                                    <div
                                        className={styles.tabDropIndicator}
                                        style={{
                                            top: firstRect.top - 4,
                                            left,
                                            height: firstRect.height + 8,
                                        }}
                                    />
                                )
                            })()}

                            <DragOverlay dropAnimation={null}>
                                {activeDragId?.startsWith("tab:") && activeTabDragIndex !== null && tabs[activeTabDragIndex] ? (
                                    <div className={styles.tabDragPlaceholder} style={{ width: anchors.tabs[getTabId(activeTabDragIndex)]?.width }}>
                                        {getLabel(tabs[activeTabDragIndex].labels, DEFAULT_LANGUAGE_CODE) || tabs[activeTabDragIndex].name || `Tab ${activeTabDragIndex + 1}`}
                                    </div>
                                ) : activeDragId?.startsWith("section:") ? (() => {
                                    const parts = parseDragId(activeDragId)
                                    const section = columns[Number(parts[1])]?.sections?.section?.[Number(parts[2])]
                                    const rect = anchors.sections[activeDragId]
                                    if (!section || !rect) return null
                                    return (
                                        <div className={styles.canvasDragPlaceholder} style={{ width: rect.width, height: rect.height }}>
                                            {getLabel(section.labels, DEFAULT_LANGUAGE_CODE) || section.name || "Section"}
                                        </div>
                                    )
                                })() : activeDragId?.startsWith("field:") ? (() => {
                                    const parts = parseDragId(activeDragId)
                                    const entry = activeTab && getFieldEntries(activeTab).find((item) =>
                                        item.columnIndex === Number(parts[1]) && item.sectionIndex === Number(parts[2]) && item.rowIndex === Number(parts[3]) && item.cellIndex === Number(parts[4])
                                    )
                                    const rect = entry ? anchors.fields[getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)] : undefined
                                    if (!entry || !rect) return null
                                    return (
                                        <div className={styles.canvasDragPlaceholder} style={{ width: rect.width, height: rect.height }}>
                                            {getLabel(entry.cell.labels, DEFAULT_LANGUAGE_CODE)
                                                || getLabel(entry.cell.control?.labels, DEFAULT_LANGUAGE_CODE)
                                                || entry.cell.control?.datafieldname
                                                || "Field"}
                                        </div>
                                    )
                                })() : null}
                            </DragOverlay>

                            {(() => {
                                const lastTabRect = tabs.length > 0 ? anchors.tabs[getTabId(tabs.length - 1)] : null
                                if (!lastTabRect && tabs.length > 0) return null
                                const plusLeft = lastTabRect ? lastTabRect.left + lastTabRect.width + 8 : 8
                                const plusTop = lastTabRect ? lastTabRect.top + (lastTabRect.height - 28) / 2 : 8
                                return (
                                    <button
                                        className={styles.addTabButton}
                                        style={{ top: plusTop, left: plusLeft }}
                                        onClick={createTab}
                                        disabled={!!builderError}
                                        title="Add tab"
                                    >
                                        +
                                    </button>
                                )
                            })()}

                            {activeTab &&
                                columns.map((column, columnIndex) => {
                                    const columnRect = anchors.columns[getColumnDropId(columnIndex)]
                                    if (!columnRect) {
                                        return null
                                    }
                                    const sectionCount = column.sections?.section?.length ?? 0

                                    const displayWidth = resizePreview && columnIndex in resizePreview
                                        ? formatColumnWidthPercent(resizePreview[columnIndex])
                                        : column.width

                                    return (
                                        <DroppableColumn
                                            key={getColumnDropId(columnIndex)}
                                            id={getColumnDropId(columnIndex)}
                                            rect={columnRect}
                                            columnIndex={columnIndex}
                                            empty={sectionCount === 0}
                                            width={displayWidth}
                                            selected={isSelection(selection, { type: "column", tabIndex: activeTabIndex, columnIndex })}
                                            isDragging={columnDrag?.active === true && columnDrag.sourceIndex === columnIndex}
                                            isLast={columnIndex === columns.length - 1}
                                            onClick={() => setSelection({ type: "column", tabIndex: activeTabIndex, columnIndex })}
                                            onContextMenu={(event) => openContextMenu(event, { type: "column", tabIndex: activeTabIndex, columnIndex })}
                                            onPointerDown={(event) => startColumnDrag(columnIndex, event)}
                                            onResizeStart={(event) => onColumnResizeStart(columnIndex, event)}
                                        />
                                    )
                                })}

                            {columnDrag?.active && (() => {
                                const canvas = formWindowRef.current
                                const sourceRect = anchors.columns[getColumnDropId(columnDrag.sourceIndex)]
                                if (!canvas || !sourceRect) return null
                                const canvasRect = canvas.getBoundingClientRect()
                                return (
                                    <div
                                        className={styles.canvasDragPlaceholder}
                                        style={{
                                            position: "absolute",
                                            left: columnDrag.pointerX - canvasRect.left - columnDrag.offsetX,
                                            top: columnDrag.pointerY - canvasRect.top - columnDrag.offsetY,
                                            width: sourceRect.width,
                                            height: Math.max(sourceRect.height, 60) + 32,
                                            zIndex: 8,
                                        }}
                                    />
                                )
                            })()}

                            {columnDrag?.active && columnDrag.targetIndex !== null && (() => {
                                const targetRect = anchors.columns[getColumnDropId(columnDrag.targetIndex)]
                                if (!targetRect) return null
                                const left = columnDrag.side === "before"
                                    ? targetRect.left - 8
                                    : targetRect.left + targetRect.width + 5
                                return (
                                    <div
                                        className={styles.columnDropIndicator}
                                        style={{ top: targetRect.top, left, height: targetRect.height + 32 }}
                                    />
                                )
                            })()}

                            {activeTab &&
                                columns.map((column, columnIndex) => (
                                    <SortableContext
                                        key={`sections-${columnIndex}`}
                                        items={(column.sections?.section ?? []).map((_, sectionIndex) => getSectionId(columnIndex, sectionIndex))}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {(column.sections?.section ?? []).map((_section, sectionIndex) => {
                                            const sectionRect = anchors.sections[getSectionId(columnIndex, sectionIndex)]
                                            if (!sectionRect) {
                                                return null
                                            }

                                            return (
                                                <SortableSection
                                                    key={getSectionId(columnIndex, sectionIndex)}
                                                    id={getSectionId(columnIndex, sectionIndex)}
                                                    rect={sectionRect}
                                                    selected={isSelection(selection, { type: "section", tabIndex: activeTabIndex, columnIndex, sectionIndex })}
                                                    isDragging={sectionDrag?.active && sectionDrag.sourceColumnIndex === columnIndex && sectionDrag.sourceSectionIndex === sectionIndex}
                                                    onPointerDown={(event) => startSectionDrag(columnIndex, sectionIndex, event)}
                                                    onDoubleClick={() => {
                                                        const section = columns[columnIndex]?.sections?.section?.[sectionIndex]
                                                        if (!section) return
                                                        startInlineEdit({
                                                            type: "section",
                                                            tabIndex: activeTabIndex,
                                                            columnIndex,
                                                            sectionIndex,
                                                        })
                                                    }}
                                                    onContextMenu={(event) => openContextMenu(event, { type: "section", tabIndex: activeTabIndex, columnIndex, sectionIndex })}
                                                />
                                            )
                                        })}
                                    </SortableContext>
                                ))}

                            {activeTab &&
                                getFieldEntries(activeTab).map((entry) => {
                                    const fieldRect = anchors.fields[getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)]
                                    if (!fieldRect) {
                                        return null
                                    }

                                    const fieldSelection: TSelection = {
                                        type: "field",
                                        tabIndex: activeTabIndex,
                                        columnIndex: entry.columnIndex,
                                        sectionIndex: entry.sectionIndex,
                                        rowIndex: entry.rowIndex,
                                        cellIndex: entry.cellIndex,
                                    }

                                    return (
                                        <DraggableField
                                            key={getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)}
                                            id={getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)}
                                            rect={fieldRect}
                                            cell={entry.cell}
                                            selected={isSelection(selection, fieldSelection)}
                                            isDragging={activeDragId === getFieldId(entry.columnIndex, entry.sectionIndex, entry.rowIndex, entry.cellIndex)}
                                            onClick={() => setSelection(fieldSelection)}
                                            onDoubleClick={() => {
                                                startInlineEdit({
                                                    type: "field",
                                                    tabIndex: activeTabIndex,
                                                    columnIndex: entry.columnIndex,
                                                    sectionIndex: entry.sectionIndex,
                                                    rowIndex: entry.rowIndex,
                                                    cellIndex: entry.cellIndex,
                                                })
                                            }}
                                            onContextMenu={(event) => openContextMenu(event, fieldSelection)}
                                        />
                                    )
                                })}

                            {sectionDrag?.active && (() => {
                                const canvas = formWindowRef.current
                                const sourceRect = anchors.sections[getSectionId(sectionDrag.sourceColumnIndex, sectionDrag.sourceSectionIndex)]
                                if (!canvas || !sourceRect) return null
                                const canvasRect = canvas.getBoundingClientRect()
                                const section = columns[sectionDrag.sourceColumnIndex]?.sections?.section?.[sectionDrag.sourceSectionIndex]
                                if (!section) return null

                                return (
                                    <div
                                        className={styles.canvasDragPlaceholder}
                                        style={{
                                            position: "absolute",
                                            left: sectionDrag.pointerX - canvasRect.left - sectionDrag.offsetX,
                                            top: sectionDrag.pointerY - canvasRect.top - sectionDrag.offsetY,
                                            width: sourceRect.width,
                                            height: sourceRect.height,
                                            zIndex: 8,
                                        }}
                                    >
                                        {getLabel(section.labels, DEFAULT_LANGUAGE_CODE) || section.name || "Section"}
                                    </div>
                                )
                            })()}

                            {sectionDrag?.active && sectionDrag.targetColumnIndex !== null && (() => {
                                const targetRect = sectionDrag.targetSectionIndex === null
                                    ? anchors.columns[getColumnDropId(sectionDrag.targetColumnIndex)]
                                    : anchors.sections[getSectionId(sectionDrag.targetColumnIndex, sectionDrag.targetSectionIndex)]
                                if (!targetRect) return null
                                const top = sectionDrag.side === "before"
                                    ? targetRect.top - 8
                                    : targetRect.top + targetRect.height + 2
                                return (
                                    <div
                                        className={styles.canvasDropIndicator}
                                        style={{
                                            top,
                                            left: targetRect.left,
                                            width: targetRect.width,
                                            zIndex: 9,
                                        }}
                                    />
                                )
                            })()}

                            {activeDragId?.startsWith("section:") && dragOverId && dragOverId !== activeDragId && (() => {
                                const overParts = parseDragId(dragOverId)
                                if (overParts[0] !== "section" && overParts[0] !== "column-drop") return null
                                const targetRect = overParts[0] === "section"
                                    ? anchors.sections[dragOverId]
                                    : anchors.columns[getColumnDropId(Number(overParts[1]))]
                                if (!targetRect) return null
                                const top = dragOverSide === "after" ? targetRect.top + targetRect.height + 2 : targetRect.top - 8
                                return <div className={styles.canvasDropIndicator} style={{ top, left: targetRect.left, width: targetRect.width }} />
                            })()}

                            {activeDragId?.startsWith("field:") && dragOverId && (() => {
                                const overParts = parseDragId(dragOverId)
                                if (!["field", "field-drop", "section"].includes(overParts[0])) return null
                                const targetRect = overParts[0] === "field"
                                    ? anchors.fields[dragOverId]
                                    : overParts[0] === "section"
                                        ? anchors.sections[getSectionId(Number(overParts[1]), Number(overParts[2]))]
                                        : anchors.columns[getColumnDropId(Number(overParts[1]))]
                                if (!targetRect) return null
                                if (overParts[0] === "field" && (fieldDragSide === "left" || fieldDragSide === "right")) {
                                    const left = fieldDragSide === "left" ? targetRect.left - 8 : targetRect.left + targetRect.width + 5
                                    return <div className={styles.columnDropIndicator} style={{ top: targetRect.top, left, height: targetRect.height }} />
                                }
                                if (overParts[0] === "section") {
                                    return null
                                }
                                return null
                            })()}

                        </div>
                    </div>
                </div>

            </DndContext>

            {contextMenu && (
                <ContextualMenu
                    target={contextMenu.target}
                    items={contextMenuItems}
                    onDismiss={closeContextMenu}
                />
            )}

            {fieldPickerMenu && (
                <ContextualMenu
                    target={fieldPickerMenu.target}
                    items={filteredFieldOptions.length > 0
                        ? filteredFieldOptions.map((option) => ({
                              key: `add-field-${option.key}`,
                              text: option.text,
                              onClick: () => {
                                  createField(
                                      fieldPickerMenu.selection.tabIndex,
                                      fieldPickerMenu.selection.columnIndex,
                                      fieldPickerMenu.selection.sectionIndex,
                                      String(option.key)
                                  )
                                  closeFieldPickerMenu()
                              },
                          }))
                        : [
                              {
                                  key: "no-fields",
                                  text: "No matching fields",
                                  disabled: true,
                              },
                          ]}
                    onDismiss={closeFieldPickerMenu}
                    onRenderMenuList={(menuProps, defaultRender) => (
                        <div style={{ width: 360, height: 320, display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: 12, borderBottom: `1px solid ${theme.palette.neutralLight}` }}>
                                <Stack tokens={{ childrenGap: 8 }}>
                                    <Checkbox
                                        label="Show only unused fields"
                                        checked={showOnlyUnusedFields}
                                        onChange={(_event, checked) => setShowOnlyUnusedFields(checked ?? false)}
                                    />
                                    <SearchBox
                                        placeholder="Search fields"
                                        value={fieldSearchTerm}
                                        onChange={(_event, newValue) => setFieldSearchTerm(newValue ?? "")}
                                    />
                                </Stack>
                            </div>
                            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                                {defaultRender?.(menuProps)}
                            </div>
                        </div>
                    )}
                />
            )}

            <Dialog
                hidden={!sectionLabelWidthDialog}
                onDismiss={() => setSectionLabelWidthDialog(null)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Set label width",
                    subText: "Enter the section label width in pixels.",
                }}
            >
                <TextField
                    label="Label width"
                    value={sectionLabelWidthDialog?.value ?? ""}
                    onChange={(_event, nextValue) =>
                        setSectionLabelWidthDialog((current) =>
                            current
                                ? {
                                      ...current,
                                      value: nextValue ?? "",
                                      error: null,
                                  }
                                : current
                        )
                    }
                    errorMessage={sectionLabelWidthDialog?.error ?? undefined}
                />
                <DialogFooter>
                    <PrimaryButton text="Apply" onClick={submitSectionLabelWidth} />
                    <DefaultButton text="Cancel" onClick={() => setSectionLabelWidthDialog(null)} />
                </DialogFooter>
            </Dialog>

            <Dialog
                hidden={!fieldSpanDialog}
                onDismiss={() => setFieldSpanDialog(null)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: fieldSpanDialog?.property === "rowspan" ? "Set row span" : "Set column span",
                    subText: "Enter a positive whole-number span value.",
                }}
            >
                <TextField
                    label={fieldSpanDialog?.property === "rowspan" ? "Row span" : "Column span"}
                    value={fieldSpanDialog?.value ?? ""}
                    onChange={(_event, nextValue) =>
                        setFieldSpanDialog((current) =>
                            current
                                ? {
                                      ...current,
                                      value: nextValue ?? "",
                                      error: null,
                                  }
                                : current
                        )
                    }
                    errorMessage={fieldSpanDialog?.error ?? undefined}
                />
                <DialogFooter>
                    <PrimaryButton text="Apply" onClick={submitFieldSpan} />
                    <DefaultButton text="Cancel" onClick={() => setFieldSpanDialog(null)} />
                </DialogFooter>
            </Dialog>

            <Dialog
                hidden={!sectionColumnsDialog}
                onDismiss={() => setSectionColumnsDialog(null)}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Set section columns",
                    subText: "Enter the number of section columns. It will be converted to the FormXml format automatically.",
                }}
            >
                <TextField
                    label="Number of columns"
                    value={sectionColumnsDialog?.value ?? ""}
                    onChange={(_event, nextValue) =>
                        setSectionColumnsDialog((current) =>
                            current
                                ? {
                                      ...current,
                                      value: nextValue ?? "",
                                      error: null,
                                  }
                                : current
                        )
                    }
                    errorMessage={sectionColumnsDialog?.error ?? undefined}
                />
                <DialogFooter>
                    <PrimaryButton text="Apply" onClick={submitSectionColumns} />
                    <DefaultButton text="Cancel" onClick={() => setSectionColumnsDialog(null)} />
                </DialogFooter>
            </Dialog>

        </div>
    )
}

const SortableTab = (props: {
    id: string
    rect: ICanvasRect
    label: string
    selected: boolean
    isDragging: boolean
    transferTarget: boolean
    onClick: () => void
    onDoubleClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id })
    const longPressCursor = useLongPressDragCursor()

    return (
        <div
            ref={setNodeRef}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: props.rect.height,
                transform: props.isDragging ? undefined : DndCss.Transform.toString(transform),
                transition,
                opacity: props.isDragging ? 0.35 : 1,
            }}
            {...attributes}
            {...listeners}
            className={`${styles.tabButton} ${props.selected ? styles.selectedTabButton : ""} ${props.transferTarget ? styles.tabTransferTarget : ""}`.trim()}
            onClick={props.onClick}
            onPointerDown={(event) => {
                if (event.button === 0) props.onClick()
                longPressCursor.start(event)
                listeners?.onPointerDown?.(event)
            }}
            onPointerUp={longPressCursor.clear}
            onPointerCancel={longPressCursor.clear}
            onDoubleClick={props.onDoubleClick}
            onContextMenu={props.onContextMenu}
        />
    )
}

const SortableSection = (props: {
    id: string
    rect: ICanvasRect
    selected: boolean
    isDragging: boolean
    onPointerDown: (event: React.PointerEvent) => void
    onDoubleClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
}) => {
    const { isOver, setNodeRef } = useDroppable({ id: props.id })

    return (
        <div
            ref={setNodeRef}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: props.rect.height,
                opacity: props.isDragging ? 0.35 : 1,
                cursor: props.isDragging ? "grabbing" : undefined,
            }}
            className={`${styles.sectionWrapper} ${isOver ? styles.activeDropTarget : ""}`.trim()}
            onPointerDown={props.onPointerDown}
            onDoubleClick={props.onDoubleClick}
            onContextMenu={props.onContextMenu}
        >
            <div className={`${styles.sectionOverlay} form-builder-section-outline ${props.selected ? styles.selectedOverlay : ""}`.trim()} />
        </div>
    )
}

const DroppableColumn = (props: {
    id: string
    rect: ICanvasRect
    columnIndex: number
    empty: boolean
    width: string | undefined
    selected: boolean
    isDragging: boolean
    isLast: boolean
    onClick: () => void
    onPointerDown: (event: React.PointerEvent) => void
    onContextMenu: (event: React.MouseEvent) => void
    onResizeStart?: (event: React.PointerEvent) => void
}) => {
    const { isOver, setNodeRef } = useDroppable({ id: props.id })
    const footerHeight = 32

    return (
        <div
            ref={setNodeRef}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: Math.max(props.rect.height, 60) + footerHeight,
                opacity: props.isDragging ? 0.35 : 1,
                cursor: props.isDragging ? "grabbing" : undefined,
            }}
            className={`${styles.columnOverlay} ${props.empty ? styles.emptyColumnOverlay : ""} ${props.selected || isOver ? styles.selectedOverlay : ""}`.trim()}
            onPointerDown={props.onPointerDown}
        >
            {!props.isLast && props.onResizeStart && (
                <div
                    className={styles.columnResizeHandle}
                    onPointerDown={(event) => {
                        event.stopPropagation()
                        props.onResizeStart?.(event)
                    }}
                />
            )}
            <div
                className={`${styles.columnFooter} ${props.empty ? styles.emptyColumnFooter : ""}`.trim()}
                onClick={props.onClick}
                onPointerDown={(event) => {
                    if (event.button === 0) props.onClick()
                }}
                onContextMenu={props.onContextMenu}
            >
                <span>Column {props.columnIndex + 1}{props.width ? ` (${props.width})` : ""}</span>
            </div>
        </div>
    )
}

const DraggableField = (props: {
    id: string
    rect: ICanvasRect
    cell: FormXmlCell
    selected: boolean
    isDragging: boolean
    onClick: () => void
    onDoubleClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: props.id })
    const longPressCursor = useLongPressDragCursor()

    return (
        <div
            ref={setNodeRef}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: props.rect.height,
                transform: props.isDragging ? undefined : DndCss.Translate.toString(transform),
                opacity: props.isDragging ? 0.35 : 1,
            }}
            {...attributes}
            {...listeners}
            className={`${styles.fieldOverlay} ${props.selected ? styles.selectedOverlay : ""}`.trim()}
            onClick={props.onClick}
            onPointerDown={(event) => {
                if (event.button === 0) props.onClick()
                longPressCursor.start(event)
                listeners?.onPointerDown?.(event)
            }}
            onPointerUp={longPressCursor.clear}
            onPointerCancel={longPressCursor.clear}
            onDoubleClick={props.onDoubleClick}
            onContextMenu={props.onContextMenu}
        />
    )
}
