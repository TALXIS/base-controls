import { Dropdown, MessageBar, MessageBarType, SearchBox, Stack, Text, TextField, mergeStyleSets } from "@fluentui/react"
import { serializeFormXml } from "@talxis/client-metadata"
import { useMemo, useState } from "react"
import { DEFAULT_LANGUAGE_CODE, formTranslationLanguageOptions } from "../constants"
import {
    getColumns,
    getFieldEntries,
    getLabel,
    getSectionsFromColumn,
    getTabs,
    setLabelForLanguage,
    updateFieldInFormXml,
    updateSectionInFormXml,
    updateTabInFormXml,
} from "../formXmlHelpers"
import type { IFormXmlTranslationsPanelProps, TTranslationEntry } from "./FormXmlBuilderPanel.types"

const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 520,
    },
    controls: {
        display: "grid",
        gridTemplateColumns: "minmax(220px, 280px) minmax(220px, 1fr)",
        gap: 12,
        alignItems: "end",
    },
    helperText: {
        color: "#605e5c",
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    card: {
        border: "1px solid #edebe9",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
    },
    location: {
        color: "#605e5c",
        marginBottom: 4,
    },
    defaultLabel: {
        color: "#605e5c",
        marginBottom: 12,
    },
    emptyState: {
        padding: 24,
        border: "1px dashed #c8c6c4",
        borderRadius: 8,
        textAlign: "center",
        color: "#605e5c",
    },
})

export const FormXmlTranslationsPanel = (props: IFormXmlTranslationsPanelProps) => {
    const { builderError, onFormXmlTextChange, parsedFormXml } = props
    const [selectedLanguageCode, setSelectedLanguageCode] = useState<number>(DEFAULT_LANGUAGE_CODE)
    const [searchTerm, setSearchTerm] = useState("")
    const [draftValues, setDraftValues] = useState<Record<string, string>>({})

    const entries = useMemo<TTranslationEntry[]>(() => {
        return getTabs(parsedFormXml).flatMap((tab, tabIndex) => {
            const tabLabel = getLabel(tab.labels, DEFAULT_LANGUAGE_CODE) || tab.name || `Tab ${tabIndex + 1}`
            const tabEntry: TTranslationEntry = {
                key: `tab:${tabIndex}`,
                kind: "tab",
                location: `Tab ${tabIndex + 1}`,
                defaultLabel: tabLabel,
                tabIndex,
                tab,
            }

            const sectionEntries = getColumns(tab).flatMap((column, columnIndex) =>
                getSectionsFromColumn(column).map((section, sectionIndex) => ({
                    key: `section:${tabIndex}:${columnIndex}:${sectionIndex}`,
                    kind: "section" as const,
                    location: `${tabLabel} / Column ${columnIndex + 1} / Section ${sectionIndex + 1}`,
                    defaultLabel: getLabel(section.labels, DEFAULT_LANGUAGE_CODE) || section.name || `Section ${sectionIndex + 1}`,
                    tabIndex,
                    columnIndex,
                    sectionIndex,
                    section,
                }))
            )

            const fieldEntries = getFieldEntries(tab).map((entry) => ({
                key: `field:${tabIndex}:${entry.columnIndex}:${entry.sectionIndex}:${entry.rowIndex}:${entry.cellIndex}`,
                kind: "field" as const,
                location: `${tabLabel} / Column ${entry.columnIndex + 1} / Section ${entry.sectionIndex + 1} / Field`,
                defaultLabel:
                    getLabel(entry.cell.labels, DEFAULT_LANGUAGE_CODE)
                    || getLabel(entry.cell.control?.labels, DEFAULT_LANGUAGE_CODE)
                    || entry.cell.control?.datafieldname
                    || "Field",
                tabIndex,
                columnIndex: entry.columnIndex,
                sectionIndex: entry.sectionIndex,
                rowIndex: entry.rowIndex,
                cellIndex: entry.cellIndex,
                cell: entry.cell,
            }))

            return [tabEntry, ...sectionEntries, ...fieldEntries]
        })
    }, [parsedFormXml])

    const filteredEntries = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        return entries.filter((entry) => {
            if (!normalizedSearch) {
                return true
            }

            const translatedValue = (
                entry.kind === "tab"
                    ? getLabel(entry.tab.labels, selectedLanguageCode)
                    : entry.kind === "section"
                        ? getLabel(entry.section.labels, selectedLanguageCode)
                        : getLabel(entry.cell.labels, selectedLanguageCode) || getLabel(entry.cell.control?.labels, selectedLanguageCode)
            ).toLowerCase()

            return [entry.location, entry.defaultLabel, translatedValue].some((value) => value.toLowerCase().includes(normalizedSearch))
        })
    }, [entries, searchTerm, selectedLanguageCode])

    const applyUpdate = (entry: TTranslationEntry, value: string) => {
        if (!parsedFormXml) {
            return
        }

        const nextXml = serializeFormXml(
            entry.kind === "tab"
                ? updateTabInFormXml(parsedFormXml, entry.tabIndex, (tab) => ({
                      ...tab,
                      labels: setLabelForLanguage(tab.labels, value, selectedLanguageCode),
                  }))
                : entry.kind === "section"
                    ? updateSectionInFormXml(parsedFormXml, entry.tabIndex, entry.columnIndex, entry.sectionIndex, (section) => ({
                          ...section,
                          labels: setLabelForLanguage(section.labels, value, selectedLanguageCode),
                      }))
                    : updateFieldInFormXml(
                          parsedFormXml,
                          entry.tabIndex,
                          entry.columnIndex,
                          entry.sectionIndex,
                          entry.rowIndex,
                          entry.cellIndex,
                          (cell) => ({
                              ...cell,
                              labels: setLabelForLanguage(cell.labels, value, selectedLanguageCode),
                          })
                      )
        )

        onFormXmlTextChange(nextXml)
    }

    const getEntryValue = (entry: TTranslationEntry) => {
        const draftKey = `${selectedLanguageCode}:${entry.key}`
        if (draftKey in draftValues) {
            return draftValues[draftKey]
        }

        return entry.kind === "tab"
            ? getLabel(entry.tab.labels, selectedLanguageCode)
            : entry.kind === "section"
                ? getLabel(entry.section.labels, selectedLanguageCode)
                : getLabel(entry.cell.labels, selectedLanguageCode) || getLabel(entry.cell.control?.labels, selectedLanguageCode)
    }

    return (
        <Stack className={styles.root}>
            <div className={styles.controls}>
                <Dropdown
                    label="Translation language"
                    selectedKey={selectedLanguageCode}
                    options={formTranslationLanguageOptions}
                    onChange={(_event, option) => {
                        if (typeof option?.key === "number") {
                            setSelectedLanguageCode(option.key)
                        }
                    }}
                />
                <SearchBox
                    placeholder="Search labels"
                    value={searchTerm}
                    onChange={(_event, nextValue) => setSearchTerm(nextValue ?? "")}
                />
            </div>

            <Text variant="small" className={styles.helperText}>
                Edit translations for tabs, sections, and fields. Changes update the shared FormXml immediately.
            </Text>

            {builderError && (
                <MessageBar messageBarType={MessageBarType.error}>
                    Fix the raw FormXml first to enable translation editing.
                </MessageBar>
            )}

            {!builderError && filteredEntries.length === 0 && (
                <div className={styles.emptyState}>No labels matched the current filter.</div>
            )}

            {!builderError && filteredEntries.length > 0 && (
                <div className={styles.list}>
                    {filteredEntries.map((entry) => {
                        const translatedValue = getEntryValue(entry)
                        const draftKey = `${selectedLanguageCode}:${entry.key}`

                        return (
                            <div key={entry.key} className={styles.card}>
                                <Text variant="smallPlus" className={styles.location}>{entry.location}</Text>
                                <Text variant="small" className={styles.defaultLabel}>Default (1033): {entry.defaultLabel || "-"}</Text>
                                <TextField
                                    label={`Translation (${selectedLanguageCode})`}
                                    value={translatedValue}
                                    onChange={(_event, nextValue) => {
                                        setDraftValues((current) => ({
                                            ...current,
                                            [draftKey]: nextValue ?? "",
                                        }))
                                    }}
                                    onBlur={() => {
                                        applyUpdate(entry, translatedValue)
                                        setDraftValues((current) => {
                                            const nextDrafts = { ...current }
                                            delete nextDrafts[draftKey]
                                            return nextDrafts
                                        })
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </Stack>
    )
}
