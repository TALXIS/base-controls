import {
    FormXmlRowBuilder,
    FormXmlSectionBuilder,
    FormXmlTabBuilder,
} from "@talxis/client-metadata"
import type {
    FormXml,
    FormXmlCell,
    FormXmlColumn,
    FormXmlLabel,
    FormXmlLabels,
    FormXmlRow,
    FormXmlSection,
    FormXmlTab,
} from "@talxis/client-metadata"

export interface IFormXmlSectionEntry {
    section: FormXmlSection
    columnIndex: number
    sectionIndex: number
}

export interface IFormXmlFieldEntry {
    cell: FormXmlCell
    columnIndex: number
    sectionIndex: number
    rowIndex: number
    cellIndex: number
}

export const getLabel = (labels: FormXmlLabels | undefined, languageCode: number) => {
    if (!labels?.label?.length) {
        return ""
    }

    return (labels.label.find((label) => label.languagecode === languageCode) ?? labels.label[0])?.description ?? ""
}

export const makeLabel = (value: string, languageCode: number): FormXmlLabels | undefined => {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
        return undefined
    }

    return {
        label: [
            {
                description: trimmedValue,
                languagecode: languageCode,
            },
        ],
    }
}

export const setLabelForLanguage = (
    labels: FormXmlLabels | undefined,
    value: string,
    languageCode: number
): FormXmlLabels | undefined => {
    const trimmedValue = value.trim()
    const nextLabels = (labels?.label ?? []).filter((label) => label.languagecode !== languageCode)

    if (trimmedValue) {
        nextLabels.push({
            description: trimmedValue,
            languagecode: languageCode,
        } as FormXmlLabel)
    }

    if (nextLabels.length === 0) {
        return undefined
    }

    return {
        label: nextLabels.sort((left, right) => left.languagecode - right.languagecode),
    }
}

export const getTabs = (formXml: FormXml | null | undefined) => formXml?.tabs?.tab ?? []

export const getColumns = (tab: FormXmlTab | undefined) => tab?.columns?.column ?? []

export const getSectionsFromColumn = (column: FormXmlColumn | undefined) => column?.sections?.section ?? []

export const getSectionEntries = (tab: FormXmlTab | undefined): IFormXmlSectionEntry[] =>
    getColumns(tab).flatMap((column, columnIndex) =>
        getSectionsFromColumn(column).map((section, sectionIndex) => ({
            section,
            columnIndex,
            sectionIndex,
        }))
    )

export const getFieldCells = (section: FormXmlSection | undefined) =>
    (section?.rows?.row ?? []).flatMap((row) => (row.cell ?? []).filter((cell) => cell.control?.datafieldname))

export const getFieldEntries = (tab: FormXmlTab | undefined): IFormXmlFieldEntry[] =>
    getSectionEntries(tab).flatMap((entry) =>
        (entry.section.rows?.row ?? []).flatMap((row, rowIndex) =>
            (row.cell ?? []).flatMap((cell, cellIndex) =>
                cell.control?.datafieldname
                    ? [
                          {
                              cell,
                              columnIndex: entry.columnIndex,
                              sectionIndex: entry.sectionIndex,
                              rowIndex,
                              cellIndex,
                          },
                      ]
                    : []
            )
        )
    )

export const buildNewTab = (languageCode: number, name: string, label: string) =>
    new FormXmlTabBuilder(languageCode, { name, label }).build()

export const buildNewColumn = (width: string): FormXmlColumn => ({
    width,
    sections: { section: [] },
})

export const buildNewSection = (languageCode: number, name: string, label: string) =>
    new FormXmlSectionBuilder(languageCode, { name, label }).build()

export const buildNewFieldRow = (
    languageCode: number,
    datafieldname: string,
    classid: string,
    label: string
) => {
    const rowBuilder = new FormXmlRowBuilder(languageCode)
    rowBuilder.addField({ datafieldname, classid, label: label || datafieldname })
    return rowBuilder.build()
}

export const addTabToFormXml = (formXml: FormXml, tab: FormXmlTab): FormXml => ({
    ...formXml,
    tabs: { ...formXml.tabs, tab: [...getTabs(formXml), tab] },
})

export const removeTabFromFormXml = (formXml: FormXml, tabIndex: number): FormXml => ({
    ...formXml,
    tabs: { ...formXml.tabs, tab: getTabs(formXml).filter((_, index) => index !== tabIndex) },
})

export const reorderTabsInFormXml = (formXml: FormXml, fromIndex: number, toIndex: number): FormXml => ({
    ...formXml,
    tabs: {
        ...formXml.tabs,
        tab: moveArrayItem(getTabs(formXml), fromIndex, toIndex),
    },
})

export const updateTabInFormXml = (formXml: FormXml, tabIndex: number, updater: (tab: FormXmlTab) => FormXmlTab) =>
    updateTab(formXml, tabIndex, updater)

export const addColumnToFormXml = (formXml: FormXml, tabIndex: number, column: FormXmlColumn) =>
    updateTab(formXml, tabIndex, (tab) => ({
        ...tab,
        columns: {
            ...tab.columns,
            column: [...getColumns(tab), column],
        },
    }))

export const moveColumnInFormXml = (formXml: FormXml, tabIndex: number, fromIndex: number, toIndex: number) =>
    updateTab(formXml, tabIndex, (tab) => ({
        ...tab,
        columns: {
            ...tab.columns,
            column: moveArrayItem(getColumns(tab), fromIndex, toIndex),
        },
    }))

export const moveColumnToTabInFormXml = (
    formXml: FormXml,
    fromTabIndex: number,
    fromColumnIndex: number,
    toTabIndex: number
) => {
    const tabs = getTabs(formXml)
    const sourceTab = tabs[fromTabIndex]
    const targetTab = tabs[toTabIndex]
    const movedColumn = sourceTab && getColumns(sourceTab)[fromColumnIndex]

    if (!sourceTab || !targetTab || !movedColumn || fromTabIndex === toTabIndex) {
        return formXml
    }

    const nextTabs = tabs.map((tab, index) => {
        if (index === fromTabIndex) {
            return {
                ...tab,
                columns: { ...tab.columns, column: getColumns(tab).filter((_, columnIndex) => columnIndex !== fromColumnIndex) },
            }
        }
        if (index === toTabIndex) {
            return {
                ...tab,
                columns: { ...tab.columns, column: [...getColumns(tab), movedColumn] },
            }
        }
        return tab
    })

    return { ...formXml, tabs: { ...formXml.tabs, tab: nextTabs } }
}

export const removeColumnFromFormXml = (formXml: FormXml, tabIndex: number, columnIndex: number) =>
    updateTab(formXml, tabIndex, (tab) => {
        const columns = getColumns(tab)

        if (columns.length <= 1) {
            return tab
        }

        return {
            ...tab,
            columns: {
                ...tab.columns,
                column: columns.filter((_, index) => index !== columnIndex),
            },
        }
    })

export const updateColumnInFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    updater: (column: FormXmlColumn) => FormXmlColumn
) =>
    updateTab(formXml, tabIndex, (tab) => ({
        ...tab,
        columns: {
            ...tab.columns,
            column: getColumns(tab).map((column, index) => (index === columnIndex ? updater(column) : column)),
        },
    }))

export const addSectionToFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    section: FormXmlSection
) =>
    updateColumnInFormXml(formXml, tabIndex, columnIndex, (column) => ({
        ...column,
        sections: { ...column.sections, section: [...getSectionsFromColumn(column), section] },
    }))

export const moveSectionToTabInFormXml = (
    formXml: FormXml,
    fromTabIndex: number,
    fromColumnIndex: number,
    fromSectionIndex: number,
    toTabIndex: number
) => {
    const tabs = getTabs(formXml)
    const sourceTab = tabs[fromTabIndex]
    const targetTab = tabs[toTabIndex]
    const sourceColumn = sourceTab && getColumns(sourceTab)[fromColumnIndex]
    const movedSection = sourceColumn && getSectionsFromColumn(sourceColumn)[fromSectionIndex]
    const targetColumn = targetTab && getColumns(targetTab)[0]

    if (!sourceTab || !targetTab || !sourceColumn || !movedSection || !targetColumn || fromTabIndex === toTabIndex) {
        return formXml
    }

    const nextTabs = tabs.map((tab, index) => {
        if (index === fromTabIndex) {
            return {
                ...tab,
                columns: {
                    ...tab.columns,
                    column: getColumns(tab).map((column, columnIndex) =>
                        columnIndex === fromColumnIndex
                            ? { ...column, sections: { ...column.sections, section: getSectionsFromColumn(column).filter((_, sectionIndex) => sectionIndex !== fromSectionIndex) } }
                            : column
                    ),
                },
            }
        }
        if (index === toTabIndex) {
            return {
                ...tab,
                columns: {
                    ...tab.columns,
                    column: getColumns(tab).map((column, columnIndex) =>
                        columnIndex === 0
                            ? { ...column, sections: { ...column.sections, section: [...getSectionsFromColumn(column), movedSection] } }
                            : column
                    ),
                },
            }
        }
        return tab
    })

    return { ...formXml, tabs: { ...formXml.tabs, tab: nextTabs } }
}

export const removeSectionFromFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    sectionIndex: number
) =>
    updateColumnInFormXml(formXml, tabIndex, columnIndex, (column) => ({
        ...column,
        sections: {
            ...column.sections,
            section: getSectionsFromColumn(column).filter((_, index) => index !== sectionIndex),
        },
    }))

export const moveSectionInFormXml = (
    formXml: FormXml,
    tabIndex: number,
    fromColumnIndex: number,
    fromSectionIndex: number,
    toColumnIndex: number,
    toSectionIndex?: number
) =>
    updateTab(formXml, tabIndex, (tab) => {
        const columns = getColumns(tab)
        const sourceColumn = columns[fromColumnIndex]
        const targetColumn = columns[toColumnIndex]

        if (!sourceColumn || !targetColumn) {
            return tab
        }

        const sourceSections = [...getSectionsFromColumn(sourceColumn)]
        const [movedSection] = sourceSections.splice(fromSectionIndex, 1)

        if (!movedSection) {
            return tab
        }

        const nextColumns = [...columns]
        nextColumns[fromColumnIndex] = {
            ...sourceColumn,
            sections: {
                ...sourceColumn.sections,
                section: sourceSections,
            },
        }

        const targetSections =
            fromColumnIndex === toColumnIndex
                ? [...sourceSections]
                : [...getSectionsFromColumn(targetColumn)]

        const boundedTargetIndex = Math.max(
            0,
            Math.min(targetSections.length, toSectionIndex ?? targetSections.length)
        )

        targetSections.splice(boundedTargetIndex, 0, movedSection)

        const resolvedTargetColumn = fromColumnIndex === toColumnIndex ? nextColumns[toColumnIndex] : targetColumn
        nextColumns[toColumnIndex] = {
            ...resolvedTargetColumn,
            sections: {
                ...resolvedTargetColumn.sections,
                section: targetSections,
            },
        }

        return {
            ...tab,
            columns: {
                ...tab.columns,
                column: nextColumns,
            },
        }
    })

export const updateSectionInFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    sectionIndex: number,
    updater: (section: FormXmlSection) => FormXmlSection
) =>
    updateColumnInFormXml(formXml, tabIndex, columnIndex, (column) => ({
        ...column,
        sections: {
            ...column.sections,
            section: getSectionsFromColumn(column).map((section, index) =>
                index === sectionIndex ? updater(section) : section
            ),
        },
    }))

export const addFieldRowToFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    sectionIndex: number,
    row: FormXmlRow
) =>
    updateSectionInFormXml(formXml, tabIndex, columnIndex, sectionIndex, (section) => ({
        ...section,
        rows: { ...section.rows, row: [...(section.rows?.row ?? []), row] },
    }))

export const removeFieldFromFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    sectionIndex: number,
    datafieldname: string
) =>
    updateSectionInFormXml(formXml, tabIndex, columnIndex, sectionIndex, (section) => ({
        ...section,
        rows: {
            ...section.rows,
            row: (section.rows?.row ?? [])
                .map((row) => ({
                    ...row,
                    cell: (row.cell ?? []).filter((cell) => cell.control?.datafieldname !== datafieldname),
                }))
                .filter((row) => (row.cell ?? []).length > 0),
        },
    }))

export const updateFieldInFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    sectionIndex: number,
    rowIndex: number,
    cellIndex: number,
    updater: (cell: FormXmlCell) => FormXmlCell
) =>
    updateSectionInFormXml(formXml, tabIndex, columnIndex, sectionIndex, (section) => ({
        ...section,
        rows: {
            ...section.rows,
            row: (section.rows?.row ?? []).map((row, currentRowIndex) =>
                currentRowIndex === rowIndex
                    ? {
                          ...row,
                          cell: (row.cell ?? []).map((cell, currentCellIndex) =>
                              currentCellIndex === cellIndex ? updater(cell) : cell
                          ),
                      }
                    : row
            ),
        },
    }))

export const moveFieldInFormXml = (
    formXml: FormXml,
    tabIndex: number,
    columnIndex: number,
    sectionIndex: number,
    fromRowIndex: number,
    fromCellIndex: number,
    targetRowIndex: number,
    targetCellIndex: number,
    placement: "before" | "after" | "left" | "right"
) =>
    updateSectionInFormXml(formXml, tabIndex, columnIndex, sectionIndex, (section) => {
        const rows = (section.rows?.row ?? []).map((row) => ({
            ...row,
            cell: [...(row.cell ?? [])],
        }))
        const sourceRow = rows[fromRowIndex]
        const targetRow = rows[targetRowIndex]
        const movedCell = sourceRow?.cell?.[fromCellIndex]
        const targetCell = targetRow?.cell?.[targetCellIndex]

        if (!sourceRow || !targetRow || !movedCell || !targetCell || movedCell === targetCell) {
            return section
        }

        sourceRow.cell.splice(fromCellIndex, 1)

        if (sourceRow === targetRow && (placement === "left" || placement === "right")) {
            const resolvedTargetIndex = targetRow.cell.indexOf(targetCell)
            if (resolvedTargetIndex < 0) return section
            const insertionIndex = resolvedTargetIndex + (placement === "right" ? 1 : 0)
            targetRow.cell.splice(insertionIndex, 0, movedCell)
            return {
                ...section,
                rows: { ...section.rows, row: rows },
            }
        }

        const nonEmptyRows = rows.filter((row) => (row.cell ?? []).length > 0)
        const resolvedTargetRowIndex = nonEmptyRows.indexOf(targetRow)
        if (resolvedTargetRowIndex < 0) return section

        if (placement === "left" || placement === "right") {
            const resolvedTargetCellIndex = targetRow.cell.indexOf(targetCell)
            if (resolvedTargetCellIndex < 0) return section
            targetRow.cell.splice(resolvedTargetCellIndex + (placement === "right" ? 1 : 0), 0, movedCell)
        } else {
            nonEmptyRows.splice(resolvedTargetRowIndex + (placement === "after" ? 1 : 0), 0, { cell: [movedCell] })
        }

        return {
            ...section,
            rows: { ...section.rows, row: nonEmptyRows },
        }
    })

export const moveFieldToSectionInFormXml = (
    formXml: FormXml,
    tabIndex: number,
    fromColumnIndex: number,
    fromSectionIndex: number,
    fromRowIndex: number,
    fromCellIndex: number,
    toColumnIndex: number,
    toSectionIndex: number
) =>
    updateTab(formXml, tabIndex, (tab) => {
        if (fromColumnIndex === toColumnIndex && fromSectionIndex === toSectionIndex) {
            return tab
        }

        const columns = getColumns(tab)
        const sourceColumn = columns[fromColumnIndex]
        const targetColumn = columns[toColumnIndex]
        const sourceSection = getSectionsFromColumn(sourceColumn)[fromSectionIndex]
        const targetSection = getSectionsFromColumn(targetColumn)[toSectionIndex]

        if (!sourceColumn || !targetColumn || !sourceSection || !targetSection) {
            return tab
        }

        const sourceRows = (sourceSection.rows?.row ?? []).map((row) => ({
            ...row,
            cell: [...(row.cell ?? [])],
        }))
        const sourceRow = sourceRows[fromRowIndex]
        const movedCell = sourceRow?.cell?.[fromCellIndex]

        if (!sourceRow || !movedCell) {
            return tab
        }

        sourceRow.cell.splice(fromCellIndex, 1)
        const normalizedSourceRows = sourceRows.filter((row) => (row.cell ?? []).length > 0)

        const targetRows =
            fromColumnIndex === toColumnIndex && fromSectionIndex === toSectionIndex
                ? normalizedSourceRows
                : (targetSection.rows?.row ?? []).map((row) => ({
                      ...row,
                      cell: [...(row.cell ?? [])],
                  }))

        targetRows.push({
            cell: [movedCell],
        })

        const nextColumns = [...columns]
        const nextSourceSections = [...getSectionsFromColumn(sourceColumn)]
        nextSourceSections[fromSectionIndex] = {
            ...sourceSection,
            rows: {
                ...sourceSection.rows,
                row: normalizedSourceRows,
            },
        }
        nextColumns[fromColumnIndex] = {
            ...sourceColumn,
            sections: {
                ...sourceColumn.sections,
                section: nextSourceSections,
            },
        }

        const resolvedTargetColumn = fromColumnIndex === toColumnIndex ? nextColumns[toColumnIndex] : targetColumn
        const resolvedTargetSections = [...getSectionsFromColumn(resolvedTargetColumn)]
        resolvedTargetSections[toSectionIndex] = {
            ...targetSection,
            rows: {
                ...targetSection.rows,
                row: targetRows,
            },
        }
        nextColumns[toColumnIndex] = {
            ...resolvedTargetColumn,
            sections: {
                ...resolvedTargetColumn.sections,
                section: resolvedTargetSections,
            },
        }

        return {
            ...tab,
            columns: {
                ...tab.columns,
                column: nextColumns,
            },
        }
    })

const updateTab = (formXml: FormXml, tabIndex: number, updater: (tab: FormXmlTab) => FormXmlTab): FormXml => {
    const tabs = getTabs(formXml)

    if (!tabs[tabIndex]) {
        return formXml
    }

    return {
        ...formXml,
        tabs: {
            ...formXml.tabs,
            tab: tabs.map((tab, index) => (index === tabIndex ? updater(tab) : tab)),
        },
    }
}

const moveArrayItem = <TItem,>(items: TItem[], fromIndex: number, toIndex: number) => {
    if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length ||
        fromIndex === toIndex
    ) {
        return items
    }

    const nextItems = [...items]
    const [movedItem] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, movedItem)
    return nextItems
}
