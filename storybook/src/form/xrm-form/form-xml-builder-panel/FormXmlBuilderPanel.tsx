import { Checkbox, ContextualMenu, Dialog, DialogFooter, DialogType, IContextualMenuItem, PrimaryButton, SearchBox, Stack, Text, TextField, DefaultButton, IconButton, Pivot as FluentPivot } from "@fluentui/react"
import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragOverEvent, DragStartEvent, PointerSensor, useSensor } from "@dnd-kit/core"
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { XrmForm, Pivot } from "@talxis/base-controls/components/Form"
import type { IXrmFormContext, ITabsComponentProps } from "@talxis/base-controls/components/Form"
import { serializeFormXml } from "@talxis/client-metadata"
import type { FormXml, FormXmlCell, FormXmlSection } from "@talxis/client-metadata"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TabComponents } from '@talxis/base-controls/components/Form/components/ui';
import { DEFAULT_LANGUAGE_CODE, getClassIdForColumn } from "../constants"
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
    setLabelForLanguage,
    updateColumnInFormXml,
    updateFieldInFormXml,
    updateSectionInFormXml,
    updateTabInFormXml,
} from "../formXmlHelpers"
import { columnWidthPresets, fieldColSpanPresets, fieldRowSpanPresets, sectionColumnsPresets, sectionLabelWidthPresets, styles, theme } from "./FormXmlBuilderPanel.styles"
import type {
    ICanvasAnchors,
    ICanvasRect,
    IContextMenuAnchorState,
    IContextMenuState,
    IFieldPickerMenuState,
    IFieldSpanDialogState,
    IFormXmlBuilderPanelProps,
    ISectionColumnsDialogState,
    ISectionLabelWidthDialogState,
    TInlineEdit,
    TInlineEditTarget,
    TSelection,
} from "./FormXmlBuilderPanel.types"
import { DraggableColumn, DraggableField, DraggableSection, SortableTab } from "./FormXmlBuilderPanel.overlays"

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
const getTabHeaderAnchorId = (tabName: string) => `tab-header-${tabName}`
const getColumnAnchorId = (tabName: string, columnIndex: number) => `column-${tabName}-${columnIndex}`
const getSectionAnchorId = (section: FormXmlSection, sectionIndex: number) => `section-${section.id ?? section.name ?? `section-${sectionIndex}`}`
const getFieldAnchorId = (cell: FormXmlCell, fallback: string) => `cell-${cell.id ?? cell.control?.datafieldname ?? fallback}`
const parseDragId = (value: string | number | null | undefined) => String(value ?? "").split(":")

const getDataIdSelector = (value: string) => `[data-id="${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`
const getTabAnchorKey = (tab: { id?: string; name?: string }, tabIndex: number) => tab.id ?? tab.name ?? `tab-${tabIndex}`

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

export const FormXmlBuilderPanel = ({
    formXmlText,
    parsedFormXml,
    builderError,
    onFormXmlTextChange,
    selectedLanguageCode,
    strategy,
    columns: modelColumns,
    onUndoStackChange,
}: IFormXmlBuilderPanelProps) => {
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
    const [dragOverTabIndex, setDragOverTabIndex] = useState<number | null>(null)
    const [fieldDragSide, setFieldDragSide] = useState<"before" | "after" | "left" | "right">("before")
    const dragStartPointerYRef = useRef<number | null>(null)
    const dragStartPointerXRef = useRef<number | null>(null)
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
    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    })

    const formColumns = useMemo(
        () => modelColumns.filter((column) => !column.isHidden && !!column.displayName),
        [modelColumns]
    )
    const tabs = useMemo(() => getTabs(parsedFormXml), [parsedFormXml])
    const expandedTabIndex = Math.max(0, tabs.findIndex((tab) => tab.expanded))
    const activeTabIndex = tabs[selection.tabIndex] ? selection.tabIndex : expandedTabIndex
    const activeTab = tabs[activeTabIndex]
    const columns = useMemo(() => getColumns(activeTab), [activeTab])
    const isAnyDragActive = activeDragId !== null
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
    const memoizedForm = useMemo(
        () => (
            <XrmForm
                key={formXmlText}
                strategy={strategy}
                components={{
                    tabs: {
                        // The builder measures every tab header's real DOM position to draw its
                        // drag/edit overlay; Fluent's overflow menu would collapse overflowing tabs
                        // out of the layout entirely, so disable it here (builder-only override).
                        onRenderTabs: (tabsProps: ITabsComponentProps) => (
                            <Pivot
                                {...tabsProps}
                                components={{
                                    onRenderPivot: (pivotProps) => <FluentPivot {...pivotProps} overflowBehavior="none" />,
                                }}
                            />
                        ),
                    },
                }}
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
        ),
        [activeTabIndex, formXmlText, strategy, tabs]
    )

    const applyFormXmlUpdate = (updater: (formXml: FormXml) => FormXml) => {
        if (!parsedFormXml) {
            return
        }

        setUndoStack((current) => [...current, formXmlText])
        const nextXml = serializeFormXml(updater(parsedFormXml))
        onFormXmlTextChange(nextXml)
    }

    const undoLastChange = useCallback(() => {
        setUndoStack((current) => {
            const previousXml = current[current.length - 1]
            if (!previousXml) {
                return current
            }

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
        // Some labels (e.g. Fluent Pivot tab text) inherit a line-height matching their
        // full clickable area, which would otherwise make the outline box oversized;
        // re-center within that area since inline-block no longer sits on the baseline.
        labelEl.style.lineHeight = "normal"
        labelEl.style.verticalAlign = "middle"
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
            labelEl!.style.lineHeight = ""
            labelEl!.style.verticalAlign = ""

            if (!value) {
                setInlineEdit(null)
                return
            }

            if (edit.type === "tab") {
                applyFormXmlUpdate((formXml) =>
                    updateTabInFormXml(formXml, edit.tabIndex, (tab) => ({
                        ...tab,
                        labels: setLabelForLanguage(tab.labels, value, selectedLanguageCode),
                    }))
                )
            } else if (edit.type === "section") {
                applyFormXmlUpdate((formXml) =>
                    updateSectionInFormXml(formXml, edit.tabIndex, edit.columnIndex, edit.sectionIndex, (section) => ({
                        ...section,
                        labels: setLabelForLanguage(section.labels, value, selectedLanguageCode),
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
                            labels: setLabelForLanguage(cell.labels, value, selectedLanguageCode),
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
                labelEl!.style.lineHeight = ""
                labelEl!.style.verticalAlign = ""
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

    // Cross-tab transfer only ever targets a tab header, whose DOM is always mounted (unlike a
    // non-active tab's columns/sections, which aren't rendered) - so this must stay a live
    // getBoundingClientRect() lookup rather than a cached anchor.
    const resolveTargetTabIndex = (pointerX: number, pointerY: number, sourceTabIndex: number) => {
        const canvas = formWindowRef.current
        if (!canvas) return null

        for (let tabIndex = 0; tabIndex < tabs.length; tabIndex += 1) {
            if (tabIndex === sourceTabIndex) continue
            const tabHeader = canvas.querySelector<HTMLElement>(getDataIdSelector(getTabHeaderAnchorId(getTabAnchorKey(tabs[tabIndex], tabIndex))))
            const rect = tabHeader?.getBoundingClientRect()
            if (rect && pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom) {
                return tabIndex
            }
        }
        return null
    }

    const resolveSectionDragTarget = (
        pointerX: number,
        pointerY: number,
        sourceColumnIndex: number,
        sourceSectionIndex: number
    ): { targetTabIndex: number; targetColumnIndex: number | null; targetSectionIndex: number | null; side: "before" | "after" | "append" } => {
        const foreignTabIndex = resolveTargetTabIndex(pointerX, pointerY, activeTabIndex)
        if (foreignTabIndex !== null) {
            return { targetTabIndex: foreignTabIndex, targetColumnIndex: null, targetSectionIndex: null, side: "append" }
        }

        const canvas = formWindowRef.current
        if (!canvas) {
            return { targetTabIndex: activeTabIndex, targetColumnIndex: null, targetSectionIndex: null, side: "append" }
        }

        const canvasRect = canvas.getBoundingClientRect()
        const localX = pointerX - canvasRect.left
        const localY = pointerY - canvasRect.top

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
            const sections = columns[columnIndex]?.sections?.section ?? []
            for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
                if (columnIndex === sourceColumnIndex && sectionIndex === sourceSectionIndex) continue

                const rect = anchors.sections[getSectionId(columnIndex, sectionIndex)]
                if (!rect || localX < rect.left || localX > rect.left + rect.width || localY < rect.top || localY > rect.top + rect.height) {
                    continue
                }

                return {
                    targetTabIndex: activeTabIndex,
                    targetColumnIndex: columnIndex,
                    targetSectionIndex: sectionIndex,
                    side: localY < rect.top + rect.height / 2 ? "before" : "after",
                }
            }
        }

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
            const rect = anchors.columns[getColumnDropId(columnIndex)]
            if (!rect || localX < rect.left || localX > rect.left + rect.width || localY < rect.top || localY > rect.top + rect.height + 40) {
                continue
            }

            return { targetTabIndex: activeTabIndex, targetColumnIndex: columnIndex, targetSectionIndex: null, side: "append" }
        }

        return { targetTabIndex: activeTabIndex, targetColumnIndex: null, targetSectionIndex: null, side: "append" }
    }

    const resolveColumnDragTarget = (
        pointerX: number,
        pointerY: number,
        sourceIndex: number
    ): { targetTabIndex: number; targetIndex: number | null; side: "before" | "after" } => {
        const foreignTabIndex = resolveTargetTabIndex(pointerX, pointerY, activeTabIndex)
        if (foreignTabIndex !== null) {
            return { targetTabIndex: foreignTabIndex, targetIndex: null, side: "before" }
        }

        const canvas = formWindowRef.current
        if (!canvas) {
            return { targetTabIndex: activeTabIndex, targetIndex: null, side: "before" }
        }

        const canvasRect = canvas.getBoundingClientRect()
        const localX = pointerX - canvasRect.left

        // Columns sit side by side and are ordered horizontally, so the target is purely a
        // function of X - do not gate on the target's own height. Columns can have very
        // different heights (e.g. one full of sections next to a near-empty one), and requiring
        // the pointer's Y to fall inside the *target's* own short band made short columns nearly
        // impossible to drop onto.
        const candidates = columns
            .map((_, columnIndex) => ({ columnIndex, rect: anchors.columns[getColumnDropId(columnIndex)] }))
            .filter(({ columnIndex, rect }) => columnIndex !== sourceIndex && !!rect)
            .sort((left, right) => {
                const leftCenter = left.rect!.left + left.rect!.width / 2
                const rightCenter = right.rect!.left + right.rect!.width / 2
                return Math.abs(localX - leftCenter) - Math.abs(localX - rightCenter)
            })

        const nearestColumn = candidates[0]
        if (nearestColumn?.rect) {
            return {
                targetTabIndex: activeTabIndex,
                targetIndex: nearestColumn.columnIndex,
                side: localX < nearestColumn.rect.left + nearestColumn.rect.width / 2 ? "before" : "after",
            }
        }

        return { targetTabIndex: activeTabIndex, targetIndex: null, side: "before" }
    }

    const clearTabDrag = () => {
        setActiveTabDragIndex(null)
        setTabDropIndex(null)
        setActiveDragId(null)
        setDragOverId(null)
        setDragOverSide("before")
        setDragOverTabIndex(null)
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

        if (activeParts[0] === "section" || activeParts[0] === "column-drop") {
            const startX = dragStartPointerXRef.current
            const startY = dragStartPointerYRef.current
            if (startX === null || startY === null) {
                setDragOverId(null)
                setDragOverTabIndex(null)
                return
            }

            const pointerX = startX + event.delta.x
            const pointerY = startY + event.delta.y

            if (activeParts[0] === "section") {
                const target = resolveSectionDragTarget(pointerX, pointerY, Number(activeParts[1]), Number(activeParts[2]))
                setDragOverTabIndex(target.targetTabIndex !== activeTabIndex ? target.targetTabIndex : null)
                if (target.targetTabIndex !== activeTabIndex) {
                    setDragOverId(null)
                } else if (target.targetColumnIndex === null) {
                    setDragOverId(null)
                } else if (target.targetSectionIndex !== null) {
                    setDragOverId(getSectionId(target.targetColumnIndex, target.targetSectionIndex))
                    setDragOverSide(target.side === "before" ? "before" : "after")
                } else {
                    setDragOverId(getColumnDropId(target.targetColumnIndex))
                    setDragOverSide("after")
                }
            } else {
                const target = resolveColumnDragTarget(pointerX, pointerY, Number(activeParts[1]))
                setDragOverTabIndex(target.targetTabIndex !== activeTabIndex ? target.targetTabIndex : null)
                if (target.targetTabIndex !== activeTabIndex || target.targetIndex === null) {
                    setDragOverId(null)
                } else {
                    setDragOverId(getColumnDropId(target.targetIndex))
                    setDragOverSide(target.side)
                }
            }
            return
        }

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
        const usesOwnHitTest = activeParts[0] === "field" || activeParts[0] === "section" || activeParts[0] === "column-drop"
        const resolvedOverId = usesOwnHitTest ? dragOverId ?? event.over?.id : event.over?.id
        const overParts = parseDragId(resolvedOverId)
        const targetTabIndex = dragOverTabIndex
        clearTabDrag()

        if (activeParts[0] === "tab") {
            if (!event.over || overParts[0] !== "tab") return
            const fromIndex = Number(activeParts[1])
            const toIndex = Number(overParts[1])
            if (fromIndex === toIndex) return
            applyFormXmlUpdate((formXml) => reorderTabsInFormXml(formXml, fromIndex, toIndex))
            setSelection({ type: "tab", tabIndex: toIndex })
            return
        }

        if (activeParts[0] === "section") {
            const fromColumnIndex = Number(activeParts[1])
            const fromSectionIndex = Number(activeParts[2])

            if (targetTabIndex !== null) {
                applyFormXmlUpdate((formXml) =>
                    moveSectionToTabInFormXml(formXml, activeTabIndex, fromColumnIndex, fromSectionIndex, targetTabIndex)
                )
                setSelection({ type: "section", tabIndex: targetTabIndex, columnIndex: 0, sectionIndex: 0 })
                return
            }

            if (overParts[0] !== "section" && overParts[0] !== "column-drop") return
            const toColumnIndex = Number(overParts[1])
            const toSectionIndex =
                overParts[0] === "section"
                    ? Number(overParts[2]) + (dragOverSide === "after" ? 1 : 0)
                    : (columns[toColumnIndex]?.sections?.section?.length ?? 0)

            if (toColumnIndex === fromColumnIndex && toSectionIndex === fromSectionIndex) return

            applyFormXmlUpdate((formXml) =>
                moveSectionInFormXml(formXml, activeTabIndex, fromColumnIndex, fromSectionIndex, toColumnIndex, toSectionIndex)
            )
            setSelection({ type: "section", tabIndex: activeTabIndex, columnIndex: toColumnIndex, sectionIndex: toSectionIndex })
            return
        }

        if (activeParts[0] === "column-drop") {
            const sourceIndex = Number(activeParts[1])

            if (targetTabIndex !== null) {
                applyFormXmlUpdate((formXml) => moveColumnToTabInFormXml(formXml, activeTabIndex, sourceIndex, targetTabIndex))
                setSelection({ type: "column", tabIndex: targetTabIndex, columnIndex: 0 })
                return
            }

            if (overParts[0] !== "column-drop") return
            const rawTargetIndex = Number(overParts[1]) + (dragOverSide === "after" ? 1 : 0)
            const targetIndex = sourceIndex < rawTargetIndex ? rawTargetIndex - 1 : rawTargetIndex
            if (targetIndex === sourceIndex) return

            applyFormXmlUpdate((formXml) => moveColumnInFormXml(formXml, activeTabIndex, sourceIndex, targetIndex))
            setSelection({ type: "column", tabIndex: activeTabIndex, columnIndex: targetIndex })
            return
        }

        if (!event.over) return

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
                            {memoizedForm}
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
                                            transferTarget={dragOverTabIndex === tabIndex}
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
                                const rawLeft = tabDropIndex >= tabs.length
                                    ? lastRect.left + lastRect.width + 6
                                    : (targetRect?.left ?? firstRect.left) - 6
                                // Clamp so the indicator never lands outside formWindow's overflow:hidden bounds
                                // (its +/-6px offset would otherwise clip it entirely at the leftmost/rightmost tab).
                                const canvasWidth = formWindowRef.current?.clientWidth
                                const left = canvasWidth !== undefined
                                    ? Math.max(0, Math.min(rawLeft, canvasWidth - 2))
                                    : Math.max(0, rawLeft)

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
                                })() : activeDragId?.startsWith("column-drop:") ? (() => {
                                    const parts = parseDragId(activeDragId)
                                    const columnIndex = Number(parts[1])
                                    const rect = anchors.columns[activeDragId]
                                    if (!rect) return null
                                    return (
                                        <div className={styles.canvasDragPlaceholder} style={{ width: rect.width, height: Math.max(rect.height, 60) + 32 }}>
                                            Column {columnIndex + 1}
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
                                        <DraggableColumn
                                            key={getColumnDropId(columnIndex)}
                                            id={getColumnDropId(columnIndex)}
                                            rect={columnRect}
                                            columnIndex={columnIndex}
                                            empty={sectionCount === 0}
                                            width={displayWidth}
                                            selected={isSelection(selection, { type: "column", tabIndex: activeTabIndex, columnIndex })}
                                            isDragging={activeDragId === getColumnDropId(columnIndex)}
                                            isLast={columnIndex === columns.length - 1}
                                            onClick={() => setSelection({ type: "column", tabIndex: activeTabIndex, columnIndex })}
                                            onContextMenu={(event) => openContextMenu(event, { type: "column", tabIndex: activeTabIndex, columnIndex })}
                                            onResizeStart={(event) => onColumnResizeStart(columnIndex, event)}
                                        />
                                    )
                                })}

                            {activeDragId?.startsWith("column-drop:") && dragOverId && dragOverId !== activeDragId && (() => {
                                const overParts = parseDragId(dragOverId)
                                if (overParts[0] !== "column-drop") return null
                                const targetRect = anchors.columns[dragOverId]
                                if (!targetRect) return null
                                const left = dragOverSide === "before"
                                    ? targetRect.left - 8
                                    : targetRect.left + targetRect.width + 5
                                // Span the full column row (not just the target's own height) so the
                                // indicator reads consistently even when columns have very different heights.
                                const columnRects = columns
                                    .map((_, columnIndex) => anchors.columns[getColumnDropId(columnIndex)])
                                    .filter((rect): rect is ICanvasRect => !!rect)
                                const rowTop = Math.min(...columnRects.map((rect) => rect.top))
                                const rowBottom = Math.max(...columnRects.map((rect) => rect.top + rect.height + 32))
                                return (
                                    <div
                                        className={styles.columnDropIndicator}
                                        style={{ top: rowTop, left, height: rowBottom - rowTop }}
                                    />
                                )
                            })()}

                            {activeTab &&
                                columns.map((column, columnIndex) =>
                                    (column.sections?.section ?? []).map((_section, sectionIndex) => {
                                        const sectionRect = anchors.sections[getSectionId(columnIndex, sectionIndex)]
                                        if (!sectionRect) {
                                            return null
                                        }

                                        return (
                                            <DraggableSection
                                                key={getSectionId(columnIndex, sectionIndex)}
                                                id={getSectionId(columnIndex, sectionIndex)}
                                                rect={sectionRect}
                                                selected={isSelection(selection, { type: "section", tabIndex: activeTabIndex, columnIndex, sectionIndex })}
                                                isDragging={activeDragId === getSectionId(columnIndex, sectionIndex)}
                                                onClick={() => setSelection({ type: "section", tabIndex: activeTabIndex, columnIndex, sectionIndex })}
                                                onDoubleClick={() => startInlineEdit({
                                                    type: "section",
                                                    tabIndex: activeTabIndex,
                                                    columnIndex,
                                                    sectionIndex,
                                                })}
                                                onContextMenu={(event) => openContextMenu(event, { type: "section", tabIndex: activeTabIndex, columnIndex, sectionIndex })}
                                            />
                                        )
                                    })
                                )}

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
