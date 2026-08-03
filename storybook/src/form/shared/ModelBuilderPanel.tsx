import Editor from "@monaco-editor/react"
import { DefaultButton, Dropdown, IDropdownOption, IconButton, MessageBar, MessageBarType, Separator, SpinButton, Stack, Text, TextField, getTheme, mergeStyleSets } from "@fluentui/react"
import { DataTypes, IColumn } from "@talxis/client-libraries"
import { useEffect, useMemo, useState } from "react"
import { IModelOption, createModelColumn, getModelTypeDefinition, modelTypeDefinitions } from "./modelDefinition"
import { parseModelColumns, serializeModelColumns } from "./modelStore"

interface IModelBuilderPanelProps {
    columns: IColumn[]
    onChange: (columns: IColumn[]) => void
    editorMode: TEditorMode
    onEditorModeChange: (mode: TEditorMode) => void
}

type TEditorMode = "ui" | "json"

const theme = getTheme()

const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 0,
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    workspace: {
        display: "grid",
        gridTemplateColumns: "minmax(280px, 320px) minmax(0, 1fr)",
        gap: 16,
        minHeight: 0,
        "@media (max-width: 1120px)": {
            gridTemplateColumns: "1fr",
        },
    },
    listPanel: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        border: `1px solid ${theme.palette.neutralLight}`,
        borderRadius: 8,
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow: theme.effects.elevation4,
        minHeight: 0,
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "auto",
        minHeight: 0,
    },
    listItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${theme.palette.neutralLight}`,
        background: theme.palette.neutralLighterAlt,
        cursor: "pointer",
        textAlign: "left",
    },
    listItemContent: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
    },
    listItemName: {
        color: theme.palette.neutralPrimary,
        fontWeight: 600,
    },
    listItemDisplayName: {
        color: theme.palette.neutralSecondary,
    },
    listItemSelected: {
        borderColor: theme.palette.themePrimary,
        boxShadow: `inset 0 0 0 1px ${theme.palette.themePrimary}`,
        background: "rgba(222, 236, 255, 0.18)",
    },
    listItemMeta: {
        color: theme.palette.neutralSecondary,
    },
    listItemActions: {
        display: "flex",
        gap: 4,
        flexShrink: 0,
    },
    detailPanel: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        border: `1px solid ${theme.palette.neutralLight}`,
        borderRadius: 8,
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow: theme.effects.elevation4,
        minHeight: 0,
        overflow: "auto",
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
        "@media (max-width: 860px)": {
            gridTemplateColumns: "1fr",
        },
    },
    fullWidth: {
        gridColumn: "1 / -1",
    },
    inlineRow: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
    },
    targetRow: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 8,
        alignItems: "end",
        "@media (max-width: 860px)": {
            gridTemplateColumns: "1fr auto",
        },
    },
    optionRow: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) 120px auto auto",
        gap: 8,
        alignItems: "end",
        "@media (max-width: 860px)": {
            gridTemplateColumns: "1fr",
        },
    },
    colorPicker: {
        width: 40,
        height: 32,
        padding: 0,
        border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
        borderRadius: 4,
        background: "transparent",
        cursor: "pointer",
    },
    jsonEditor: {
        width: "100%",
        minHeight: 520,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
        borderRadius: 8,
    },
})

const dataTypeOptions: IDropdownOption[] = modelTypeDefinitions.map((definition) => ({
    key: definition.key,
    text: definition.label,
}) as IDropdownOption)

const createUniqueName = (baseName: string, columns: IColumn[]) => {
    const existing = new Set(columns.map((column) => column.name))
    if (!existing.has(baseName)) {
        return baseName
    }

    let suffix = 2
    while (existing.has(`${baseName}${suffix}`)) {
        suffix += 1
    }

    return `${baseName}${suffix}`
}

const normalizeOptions = (value: unknown): IModelOption[] => {
    if (!Array.isArray(value)) {
        return []
    }

    return value.map((option, index) => {
        const next = (option ?? {}) as Partial<IModelOption>
        return {
            Label: next.Label ?? `Option ${index + 1}`,
            Value: typeof next.Value === "number" ? next.Value : index + 1,
            Color: next.Color ?? "",
        }
    })
}

export const ModelBuilderPanel = (props: IModelBuilderPanelProps) => {
    const { columns, editorMode, onChange } = props
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [jsonValue, setJsonValue] = useState(() => serializeModelColumns(columns))
    const [jsonError, setJsonError] = useState<string | null>(null)

    useEffect(() => {
        setJsonValue(serializeModelColumns(columns))
        setSelectedIndex((current) => Math.min(current, Math.max(columns.length - 1, 0)))
    }, [columns])

    const selectedColumn = columns[selectedIndex] ?? null
    const selectedDefinition = getModelTypeDefinition(selectedColumn?.dataType)

    const updateColumns = (updater: (current: IColumn[]) => IColumn[]) => {
        onChange(updater(columns))
    }

    const updateSelectedColumn = (updater: (column: IColumn) => IColumn) => {
        if (!selectedColumn) {
            return
        }

        updateColumns((current) => current.map((column, index) => (index === selectedIndex ? updater(column) : column)))
    }

    const addColumn = (dataType: string) => {
        const created = createModelColumn(dataType as any)
        const nextName = createUniqueName(created.name, columns)
        const nextColumn = {
            ...created,
            name: nextName,
            alias: nextName,
        }

        updateColumns((current) => [...current, nextColumn])
        setSelectedIndex(columns.length)
    }

    const removeSelectedColumn = () => {
        if (!selectedColumn) {
            return
        }

        updateColumns((current) => current.filter((_, index) => index !== selectedIndex))
        setSelectedIndex((current) => Math.max(0, current - 1))
    }

    useEffect(() => {
        if (editorMode !== "json") {
            return
        }

        const timeoutId = window.setTimeout(() => {
            try {
                const parsed = parseModelColumns(jsonValue)
                onChange(parsed)
                setJsonError(null)
            } catch (error) {
                setJsonError((error as Error).message)
            }
        }, 150)

        return () => window.clearTimeout(timeoutId)
    }, [editorMode, jsonValue, onChange])

    const optionSet = normalizeOptions(selectedColumn?.metadata?.OptionSet)
    const lookupTargets = Array.isArray(selectedColumn?.metadata?.Targets) ? selectedColumn?.metadata?.Targets : []

    return <div className={styles.root}>
        {editorMode === "json" && (
            <Stack tokens={{ childrenGap: 12 }}>
                <div className={styles.jsonEditor}>
                    <Editor
                        height="520px"
                        defaultLanguage="json"
                        language="json"
                        value={jsonValue}
                        onChange={(nextValue) => {
                            setJsonValue(nextValue ?? "")
                            setJsonError(null)
                        }}
                        options={{
                            automaticLayout: true,
                            bracketPairColorization: { enabled: true },
                            fontLigatures: true,
                            fontSize: 13,
                            formatOnPaste: true,
                            formatOnType: true,
                            lineNumbersMinChars: 3,
                            minimap: { enabled: false },
                            padding: { top: 12, bottom: 12 },
                            scrollbar: {
                                alwaysConsumeMouseWheel: true,
                                horizontal: "auto",
                                vertical: "auto",
                            },
                            scrollBeyondLastLine: true,
                            smoothScrolling: true,
                            tabSize: 2,
                            wordWrap: "on",
                        }}
                        theme="vs-light"
                    />
                </div>
                {jsonError && (
                    <MessageBar messageBarType={MessageBarType.error} isMultiline>
                        <pre className="toast-details">{jsonError}</pre>
                    </MessageBar>
                )}
            </Stack>
        )}

        {editorMode === "ui" && (
            <div className={styles.workspace}>
                <div className={styles.listPanel}>
                    <div className={styles.inlineRow}>
                        <Dropdown
                            label="Add field"
                            placeholder="Choose a field type"
                            options={dataTypeOptions}
                            onChange={(_event, option) => option && addColumn(String(option.key))}
                        />
                    </div>
                    <div className={styles.list}>
                        {columns.map((column, index) => {
                            const definition = getModelTypeDefinition(column.dataType)
                            return (
                                <button
                                    key={`${column.name}-${index}`}
                                    type="button"
                                    className={`${styles.listItem} ${selectedIndex === index ? styles.listItemSelected : ""}`.trim()}
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    <div className={styles.listItemContent}>
                                        <Text variant="mediumPlus" className={styles.listItemName}>{column.displayName || column.name}</Text>
                                        <Text variant="small" className={styles.listItemDisplayName}>
                                            Display name: {column.displayName || "-"}
                                        </Text>
                                        <Text variant="small" className={styles.listItemMeta}>
                                            Name: {column.name}
                                        </Text>
                                        <Text variant="small" className={styles.listItemMeta}>
                                            Type: {definition?.label ?? column.dataType}
                                        </Text>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className={styles.detailPanel}>
                    {!selectedColumn && (
                        <MessageBar messageBarType={MessageBarType.info}>
                            Add a field to start building the shared form model.
                        </MessageBar>
                    )}

                    {selectedColumn && (
                        <>
                            <div className={styles.inlineRow}>
                                <Text variant="xLarge">{selectedColumn.displayName || selectedColumn.name}</Text>
                                <IconButton
                                    iconProps={{ iconName: "Delete" }}
                                    title="Remove field"
                                    ariaLabel="Remove field"
                                    onClick={removeSelectedColumn}
                                />
                            </div>

                            <div className={styles.detailGrid}>
                                <TextField
                                    label="Display name"
                                    value={selectedColumn.displayName ?? ""}
                                    onChange={(_event, nextValue) => updateSelectedColumn((column) => ({ ...column, displayName: nextValue ?? "" }))}
                                />
                                <Dropdown
                                    label="Data type"
                                    selectedKey={selectedColumn.dataType}
                                    options={dataTypeOptions}
                                    onChange={(_event, option) => {
                                        if (!option) {
                                            return
                                        }

                                        const dataType = String(option.key)
                                        const template = createModelColumn(dataType as DataTypes)
                                        updateSelectedColumn((column) => ({
                                            ...column,
                                            dataType,
                                            metadata: template.metadata,
                                        }))
                                    }}
                                />
                                <TextField
                                    label="Name"
                                    value={selectedColumn.name}
                                    onChange={(_event, nextValue) => updateSelectedColumn((column) => ({ ...column, name: nextValue ?? "" }))}
                                />
                            </div>

                            <Separator>Type details</Separator>
                            <Text variant="small" styles={{ root: { color: theme.palette.neutralSecondary } }}>
                                {selectedDefinition?.description ?? "Configure metadata for the selected field type."}
                            </Text>

                            {selectedDefinition?.supportsLookupTargets && (
                                <Stack tokens={{ childrenGap: 8 }}>
                                    <Text variant="mediumPlus">Lookup targets</Text>
                                    {lookupTargets.map((target, index) => (
                                        <div className={styles.targetRow} key={index}>
                                            <TextField
                                                label={index === 0 ? "Target entity" : undefined}
                                                value={target}
                                                onChange={(_event, nextValue) => updateSelectedColumn((column) => ({
                                                    ...column,
                                                    metadata: {
                                                        ...(column.metadata ?? {}),
                                                        Targets: lookupTargets.map((item, itemIndex) => itemIndex === index ? (nextValue ?? "") : item),
                                                    },
                                                }))}
                                            />
                                            <IconButton iconProps={{ iconName: "Delete" }} title="Remove target" ariaLabel="Remove target" onClick={() => updateSelectedColumn((column) => ({
                                                ...column,
                                                metadata: {
                                                    ...(column.metadata ?? {}),
                                                    Targets: lookupTargets.filter((_, itemIndex) => itemIndex !== index),
                                                },
                                            }))} />
                                        </div>
                                    ))}
                                    <DefaultButton text="Add target" onClick={() => updateSelectedColumn((column) => ({
                                        ...column,
                                        metadata: {
                                            ...(column.metadata ?? {}),
                                            Targets: [...lookupTargets, "newTarget"],
                                        },
                                    }))} />
                                </Stack>
                            )}

                            {selectedDefinition?.supportsOptionSet && (
                                <Stack tokens={{ childrenGap: 8 }}>
                                    <Text variant="mediumPlus">Options</Text>
                                    {optionSet.map((option, index) => (
                                        <div className={styles.optionRow} key={index}>
                                            <TextField
                                                label={index === 0 ? "Label" : undefined}
                                                value={option.Label}
                                                onChange={(_event, nextValue) => updateSelectedColumn((column) => ({
                                                    ...column,
                                                    metadata: {
                                                        ...(column.metadata ?? {}),
                                                        OptionSet: optionSet.map((item, itemIndex) => itemIndex === index ? { ...item, Label: nextValue ?? "" } : item),
                                                    },
                                                }))}
                                            />
                                            <SpinButton
                                                label={index === 0 ? "Value" : undefined}
                                                value={String(option.Value)}
                                                min={0}
                                                step={1}
                                                onChange={(_event, nextValue) => updateSelectedColumn((column) => ({
                                                    ...column,
                                                    metadata: {
                                                        ...(column.metadata ?? {}),
                                                        OptionSet: optionSet.map((item, itemIndex) => itemIndex === index ? { ...item, Value: Number(nextValue ?? 0) } : item),
                                                    },
                                                }))}
                                            />
                                            <input
                                                type="color"
                                                aria-label={`Pick color for ${option.Label || `option ${index + 1}`}`}
                                                className={styles.colorPicker}
                                                value={option.Color || "#000000"}
                                                onChange={(event) => updateSelectedColumn((column) => ({
                                                    ...column,
                                                    metadata: {
                                                        ...(column.metadata ?? {}),
                                                        OptionSet: optionSet.map((item, itemIndex) => itemIndex === index ? { ...item, Color: event.target.value } : item),
                                                    },
                                                }))}
                                            />
                                            <IconButton iconProps={{ iconName: "Delete" }} title="Remove option" ariaLabel="Remove option" onClick={() => updateSelectedColumn((column) => ({
                                                ...column,
                                                metadata: {
                                                    ...(column.metadata ?? {}),
                                                    OptionSet: optionSet.filter((_, itemIndex) => itemIndex !== index),
                                                },
                                            }))} />
                                        </div>
                                    ))}
                                    <DefaultButton text="Add option" onClick={() => updateSelectedColumn((column) => ({
                                        ...column,
                                        metadata: {
                                            ...(column.metadata ?? {}),
                                            OptionSet: [...optionSet, { Label: `Option ${optionSet.length + 1}`, Value: optionSet.length + 1, Color: "" }],
                                        },
                                    }))} />
                                </Stack>
                            )}
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
}
