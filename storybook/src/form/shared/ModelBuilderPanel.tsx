import Editor from "@monaco-editor/react"
import {
    ActionButton,
    CommandBar,
    IconButton,
    MessageBar,
    MessageBarType,
    Panel,
    PanelType,
    SpinButton,
    Stack,
    Text,
    TextField,
    getTheme,
    mergeStyleSets,
} from "@fluentui/react"
import { DataProvider, DataTypes, Dataset, IColumn, IRawRecord, IRecordSaveOperationResult, MemoryDataProvider } from "@talxis/client-libraries"
import { ReactElement, useEffect, useMemo, useRef, useState } from "react"
import { DatasetControl, Grid } from "@talxis/base-controls/components"
import { DatasetControl as DatasetControlUtil } from "@talxis/base-controls/utils/dataset-control"
import { usePcfContext } from "@talxis/base-controls/utils"
import { Form, IMemoryStrategyParams, IOnSaveParams, MemoryStrategy, useField } from "@talxis/base-controls/components/Form"
import { ICommandBarItemProps } from "@talxis/base-controls/legacy/react-components"
import type { IComponentProps as IDatasetControlRenderProps, IHeaderProps, IRibbonQuickFindWrapperProps } from "@talxis/base-controls/components/DatasetControl/interfaces"
import type { IRibbonComponentProps } from "@talxis/base-controls/components/Ribbon/interfaces"

type TRibbonRenderProps = Parameters<IRibbonComponentProps["onRender"]>[0]
type TRibbonDefaultRender = Parameters<IRibbonComponentProps["onRender"]>[1]
type TOnRenderCommandBar = TRibbonRenderProps["onRenderCommandBar"]
type TCommandBarProps = Parameters<TOnRenderCommandBar>[0]
type TCommandBarDefaultRender = Parameters<TOnRenderCommandBar>[1]
import { IModelOption, TSupportedModelDataType, createModelColumn, getModelTypeDefinition, modelTypeDefinitions } from "./modelDefinition"
import { parseModelColumns, serializeModelColumns } from "./modelStore"
import { baseEditorOptions } from "./monacoEditor"

interface IModelBuilderPanelProps {
    columns: IColumn[]
    onChange: (columns: IColumn[]) => void
    editorMode: TEditorMode
    onEditorModeChange: (mode: TEditorMode) => void
    lockedFieldNames?: Set<string>
    primaryIdAttribute?: string
}

export type TEditorMode = "ui" | "json"

const theme = getTheme()

const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        minHeight: 0,
    },
    tableWrap: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        border: `1px solid ${theme.palette.neutralLight}`,
        borderRadius: 8,
        backgroundColor: theme.semanticColors.bodyBackground,
    },
    panelSection: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 16,
    },
    metadataList: {
        display: "flex",
        flexDirection: "column",
    },
    metadataHeaderRow: {
        display: "grid",
        gap: 8,
        alignItems: "center",
        padding: "0 0 6px",
    },
    metadataRow: {
        display: "grid",
        gap: 8,
        alignItems: "center",
        padding: "6px 0",
        borderBottom: `1px solid ${theme.palette.neutralLighter}`,
    },
    metadataRowLast: {
        borderBottom: "none",
    },
    targetRowColumns: {
        gridTemplateColumns: "minmax(0, 1fr) 32px",
    },
    optionRowColumns: {
        gridTemplateColumns: "minmax(0, 1fr) 90px 40px 32px",
    },
    metadataHeaderLabel: {
        color: theme.palette.neutralSecondary,
        fontWeight: 600,
    },
    metadataEmptyState: {
        padding: "8px 0",
        color: theme.palette.neutralSecondary,
    },
    metadataFooter: {
        paddingTop: 6,
    },
    colorSwatch: {
        width: 28,
        height: 28,
        padding: 0,
        border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
        borderRadius: 6,
        background: "transparent",
        cursor: "pointer",
    },
    jsonWrap: {
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
        borderRadius: 8,
    },
})

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

const typeOptionSet = modelTypeDefinitions.map((definition, index) => ({ Label: definition.label, Value: index + 1, Color: "" }))
const typeValueByDataType = new Map(modelTypeDefinitions.map((definition, index) => [definition.key as string, index + 1]))

const gridDisplayColumns: IColumn[] = [
    { name: "name", alias: "name", displayName: "Field", dataType: DataTypes.SingleLineText, order: 0, visualSizeFactor: 220, isPrimary: true },
    { name: "typeLabel", alias: "typeLabel", displayName: "Type", dataType: DataTypes.OptionSet, order: 1, visualSizeFactor: 160, metadata: { OptionSet: typeOptionSet } },
    { name: "details", alias: "details", displayName: "Details", dataType: DataTypes.SingleLineText, order: 2, visualSizeFactor: 220 },
]

const toDisplayRow = (column: IColumn): IRawRecord => ({
    name: column.name,
    typeLabel: typeValueByDataType.get(column.dataType) ?? 0,
    details: describeColumn(column),
})

const describeColumn = (column: IColumn): string => {
    const definition = getModelTypeDefinition(column.dataType)

    if (definition?.supportsLookupTargets) {
        const rawTargets = column.metadata?.Targets
        const targets = Array.isArray(rawTargets) ? rawTargets : []
        return targets.length ? `Targets: ${targets.join(", ")}` : "No targets configured"
    }

    if (definition?.supportsOptionSet) {
        const options = normalizeOptions(column.metadata?.OptionSet)
        return `${options.length} option${options.length === 1 ? "" : "s"}`
    }

    return "—"
}

class FieldEditorStrategy extends MemoryStrategy {
    private _onCommit: (updatedData: { [key: string]: any }) => void

    constructor(params: IMemoryStrategyParams, onCommit: (updatedData: { [key: string]: any }) => void) {
        super(params)
        this._onCommit = onCommit
    }

    public async onSave(params: IOnSaveParams): Promise<IRecordSaveOperationResult> {
        this._onCommit(params.updatedData)
        return {
            success: true,
            fields: Object.keys(params.updatedData),
            recordId: params.recordId,
        }
    }
}

const LookupTargetsField = () => {
    const field = useField()
    const targets: string[] = Array.isArray(field?.getValue()) ? field!.getValue() : []

    return (
        <div className={styles.metadataList}>
            {targets.length > 0 && (
                <div className={`${styles.metadataHeaderRow} ${styles.targetRowColumns}`}>
                    <Text variant="small" className={styles.metadataHeaderLabel}>Target entity</Text>
                    <span />
                </div>
            )}

            {targets.length === 0 && (
                <div className={styles.metadataEmptyState}>
                    <Text variant="small">No lookup targets yet.</Text>
                </div>
            )}

            {targets.map((target, index) => (
                <div
                    className={`${styles.metadataRow} ${styles.targetRowColumns} ${index === targets.length - 1 ? styles.metadataRowLast : ""}`}
                    key={index}
                >
                    <TextField
                        borderless
                        placeholder="Entity logical name"
                        value={target}
                        onChange={(_event, nextValue) => field?.setValue(targets.map((item, itemIndex) => itemIndex === index ? (nextValue ?? "") : item))}
                    />
                    <IconButton iconProps={{ iconName: "Delete" }} title="Remove target" ariaLabel="Remove target" onClick={() => field?.setValue(targets.filter((_, itemIndex) => itemIndex !== index))} />
                </div>
            ))}

            <div className={styles.metadataFooter}>
                <ActionButton iconProps={{ iconName: "Add" }} onClick={() => field?.setValue([...targets, "newTarget"])}>Add target</ActionButton>
            </div>
        </div>
    )
}

const OptionSetField = (props: { maxOptions?: number; restrictValueTo01?: boolean }) => {
    const field = useField()
    const optionSet = normalizeOptions(field?.getValue())
    const atMaxOptions = props.maxOptions !== undefined && optionSet.length >= props.maxOptions

    return (
        <div className={styles.metadataList}>
            {optionSet.length > 0 && (
                <div className={`${styles.metadataHeaderRow} ${styles.optionRowColumns}`}>
                    <Text variant="small" className={styles.metadataHeaderLabel}>Label</Text>
                    <Text variant="small" className={styles.metadataHeaderLabel}>Value</Text>
                    <Text variant="small" className={styles.metadataHeaderLabel}>Color</Text>
                    <span />
                </div>
            )}

            {optionSet.length === 0 && (
                <div className={styles.metadataEmptyState}>
                    <Text variant="small">No options yet.</Text>
                </div>
            )}

            {optionSet.map((option, index) => (
                <div
                    className={`${styles.metadataRow} ${styles.optionRowColumns} ${index === optionSet.length - 1 ? styles.metadataRowLast : ""}`}
                    key={index}
                >
                    <TextField
                        borderless
                        placeholder="Label"
                        value={option.Label}
                        onChange={(_event, nextValue) => field?.setValue(optionSet.map((item, itemIndex) => itemIndex === index ? { ...item, Label: nextValue ?? "" } : item))}
                    />
                    <SpinButton
                        value={String(option.Value)}
                        min={0}
                        max={props.restrictValueTo01 ? 1 : undefined}
                        step={1}
                        onChange={(_event, nextValue) => {
                            let value = Number(nextValue ?? 0)
                            if (props.restrictValueTo01) {
                                value = value <= 0 ? 0 : 1
                            }
                            field?.setValue(optionSet.map((item, itemIndex) => itemIndex === index ? { ...item, Value: value } : item))
                        }}
                    />
                    <input
                        type="color"
                        aria-label={`Pick color for ${option.Label || `option ${index + 1}`}`}
                        className={styles.colorSwatch}
                        value={option.Color || "#000000"}
                        onChange={(event) => field?.setValue(optionSet.map((item, itemIndex) => itemIndex === index ? { ...item, Color: event.target.value } : item))}
                    />
                    <IconButton iconProps={{ iconName: "Delete" }} title="Remove option" ariaLabel="Remove option" onClick={() => field?.setValue(optionSet.filter((_, itemIndex) => itemIndex !== index))} />
                </div>
            ))}

            <div className={styles.metadataFooter}>
                <ActionButton
                    iconProps={{ iconName: "Add" }}
                    disabled={atMaxOptions}
                    onClick={() => {
                        const nextValue = props.restrictValueTo01
                            ? (optionSet.some((option) => option.Value === 0) ? 1 : 0)
                            : optionSet.length + 1
                        field?.setValue([...optionSet, { Label: `Option ${optionSet.length + 1}`, Value: nextValue, Color: "" }])
                    }}
                >
                    Add option
                </ActionButton>
            </div>
        </div>
    )
}

const NameField = (props: { isNew: boolean }) => {
    const field = useField("name")
    const value = String(field?.getValue() ?? "")

    if (!props.isNew) {
        return (
            <Form.Field name="name">
                <Form.Cell label="Name">
                    <Form.Control components={{ onRenderControl: () => <TextField value={value} readOnly /> }} />
                </Form.Cell>
            </Form.Field>
        )
    }

    const validation = { error: value.trim().length === 0, errorMessage: "Name is required." }

    return (
        <Form.Field name="name" validation={validation}>
            <Form.Cell label="Name">
                <Form.Control />
            </Form.Cell>
        </Form.Field>
    )
}

const FieldMetadataSection = (props: { dataType: string }) => {
    const definition = getModelTypeDefinition(props.dataType)
    const targetsField = useField("targets")
    const optionSetField = useField("optionSet")

    if (definition?.supportsLookupTargets) {
        const targets: string[] = Array.isArray(targetsField?.getValue()) ? targetsField!.getValue() : []
        const validation = { error: targets.length === 0, errorMessage: "Add at least one lookup target." }

        return (
            <Form.Column>
                <Form.Section label="Lookup targets" cellLabelPosition="Top">
                    <Form.Field name="targets" validation={validation}>
                        <Form.Cell label={null}>
                            <Form.Control components={{ onRenderControl: () => <LookupTargetsField /> }} />
                        </Form.Cell>
                    </Form.Field>
                </Form.Section>
            </Form.Column>
        )
    }

    if (definition?.supportsOptionSet) {
        const optionSet = normalizeOptions(optionSetField?.getValue())
        const isTwoOptions = props.dataType === DataTypes.TwoOptions
        const hasDuplicateValues = new Set(optionSet.map((option) => option.Value)).size !== optionSet.length

        const validation = optionSet.length === 0
            ? { error: true, errorMessage: "Add at least one option." }
            : isTwoOptions && hasDuplicateValues
                ? { error: true, errorMessage: "Two Options fields must have one option set to 0 and one set to 1." }
                : { error: false, errorMessage: "" }

        return (
            <Form.Column>
                <Form.Section label="Options" cellLabelPosition="Top">
                    <Form.Field name="optionSet" validation={validation}>
                        <Form.Cell label={null}>
                            <Form.Control components={{ onRenderControl: () => <OptionSetField maxOptions={props.dataType === DataTypes.TwoOptions ? 2 : undefined} restrictValueTo01={props.dataType === DataTypes.TwoOptions} /> }} />
                        </Form.Cell>
                    </Form.Field>
                </Form.Section>
            </Form.Column>
        )
    }

    return null
}

const DuplicateNameWarning = (props: { columns: IColumn[]; selectedIndex: number | null }) => {
    const nameField = useField("name")
    const currentName = String(nameField?.getValue() ?? "")
    const isDuplicate = props.columns.some((column, index) => index !== props.selectedIndex && column.name === currentName)

    if (!isDuplicate) {
        return null
    }

    return (
        <MessageBar messageBarType={MessageBarType.warning}>
            Another field already uses the name "{currentName}".
        </MessageBar>
    )
}

export const ModelBuilderPanel = (props: IModelBuilderPanelProps) => {
    const { columns, editorMode, onChange, lockedFieldNames = new Set<string>(), primaryIdAttribute } = props
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [draftColumn, setDraftColumn] = useState<IColumn | null>(null)
    const [selectedRecordNames, setSelectedRecordNames] = useState<string[]>([])
    const [jsonValue, setJsonValue] = useState(() => serializeModelColumns(columns))
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [panelNotification, setPanelNotification] = useState<string | null>(null)

    const pcfContext = usePcfContext()
    const pcfContextRef = useRef(pcfContext)
    pcfContextRef.current = pcfContext

    const dataset = useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: [],
            metadata: {
                PrimaryIdAttribute: "name",
                PrimaryNameAttribute: "name",
                LogicalName: "field",
                EntitySetName: "fields",
                DisplayName: "Field",
                DisplayCollectionName: "Fields"
            },
        })
        const ds = new Dataset(provider)
        ds.setColumns(gridDisplayColumns)
        return ds
    }, [])

    const datasetControl = useMemo(() => new DatasetControlUtil({
        state: {},
        controlId: "model-builder-fields",
        onGetPcfContext: () => pcfContextRef.current,
        onGetParameters: () => ({
            Grid: dataset,
            Height: { raw: "100%" },
            RowHeight: { raw: 36 },
            SelectableRows: { raw: "multiple" },
            EnableEditing: { raw: false },
            EnablePagination: { raw: false },
            EnableFiltering: { raw: true },
            EnableSorting: { raw: true },
            EnableNavigation: { raw: true },
            EnableQuickFind: { raw: true },
            EnableCommandBar: { raw: true },
            EnableRecordCount: { raw: false },
            EnablePageSizeSwitcher: { raw: false },
            EnableEditColumns: { raw: false },
            EnableAutoSave: { raw: false },
            EnableZebra: { raw: true },
            EnableGroupedColumnsPinning: { raw: false },
            DestroyDatasetOnUnmount: { raw: false },
        }),
    }), [dataset])

    useEffect(() => {
        dataset.setDataSource(columns.map(toDisplayRow))
        void dataset.refresh()
    }, [dataset, columns])

    useEffect(() => {
        dataset.setInterceptor("onOpenDatasetItem", (entityReference) => {
            const name = entityReference.id.guid
            const realIndex = columns.findIndex((column) => column.name === name)
            setSelectedIndex(realIndex >= 0 ? realIndex : null)
            setPanelNotification(null)
        })
    }, [dataset, columns])

    useEffect(() => {
        const handleSelectionChanged = (ids: string[]) => setSelectedRecordNames(ids)
        dataset.addEventListener("onRecordsSelected", handleSelectionChanged)
        return () => dataset.removeEventListener("onRecordsSelected", handleSelectionChanged)
    }, [dataset])

    useEffect(() => {
        setJsonValue(serializeModelColumns(columns))
    }, [columns])

    useEffect(() => {
        if (selectedIndex !== null && selectedIndex >= columns.length) {
            setSelectedIndex(null)
        }
    }, [columns.length, selectedIndex])

    const selectedColumn = draftColumn ?? (selectedIndex !== null ? columns[selectedIndex] ?? null : null)
    const selectedColumnDefinition = selectedColumn ? getModelTypeDefinition(selectedColumn.dataType) : undefined

    const panelNotificationMessages = [
        ...(panelNotification ? [{ text: panelNotification, level: 'ERROR' as const }] : []),
        ...(selectedColumnDefinition?.supportsLookupTargets
            ? [{ text: 'Lookups are currently only supported in environments with Xrm (model-driven apps).', level: 'INFO' as const }]
            : []),
    ]

    const getDeleteLockReason = (name: string): string | null => {
        if (name === primaryIdAttribute) {
            return `"${name}" is the primary ID attribute and can't be deleted.`
        }

        if (lockedFieldNames.has(name)) {
            return `"${name}" is used on the form and can't be deleted until it's removed from the FormXml.`
        }

        return null
    }

    const getBulkDeleteLockMessage = (names: string[]): string | null => {
        const primaryLocked = names.filter((name) => name === primaryIdAttribute)
        const formXmlLocked = names.filter((name) => name !== primaryIdAttribute && lockedFieldNames.has(name))

        const parts: string[] = []
        if (primaryLocked.length > 0) {
            parts.push(`${primaryLocked.map((name) => `"${name}"`).join(", ")} ${primaryLocked.length === 1 ? "is" : "are"} the primary ID attribute and can't be deleted.`)
        }
        if (formXmlLocked.length > 0) {
            parts.push(`${formXmlLocked.map((name) => `"${name}"`).join(", ")} ${formXmlLocked.length === 1 ? "is" : "are"} used on the form and can't be deleted until removed from the FormXml.`)
        }

        return parts.length > 0 ? parts.join(" ") : null
    }

    const updateColumns = (updater: (current: IColumn[]) => IColumn[]) => {
        onChange(updater(columns))
    }

    const closePanel = () => {
        setDraftColumn(null)
        setSelectedIndex(null)
        setPanelNotification(null)
    }

    const applyMetadataChanges = (column: IColumn, updatedData: { [key: string]: any }) => {
        let nextColumn = column

        if ("name" in updatedData) {
            nextColumn = { ...nextColumn, name: updatedData.name ?? "" }
        }

        if ("targets" in updatedData) {
            nextColumn = { ...nextColumn, metadata: { ...(nextColumn.metadata ?? {}), Targets: updatedData.targets } }
        }

        if ("optionSet" in updatedData) {
            nextColumn = { ...nextColumn, metadata: { ...(nextColumn.metadata ?? {}), OptionSet: updatedData.optionSet } }
        }

        return nextColumn
    }

    const commitFieldChangesRef = useRef<(updatedData: { [key: string]: any }) => void>(() => { })
    commitFieldChangesRef.current = (updatedData) => {
        if (draftColumn) {
            const nextColumn = applyMetadataChanges(draftColumn, updatedData)
            updateColumns((current) => [...current, nextColumn])
            setDraftColumn(null)
            return
        }

        if (selectedIndex === null) {
            return
        }

        updateColumns((current) => current.map((column, index) => (
            index === selectedIndex ? applyMetadataChanges(column, updatedData) : column
        )))
    }

    const fieldStrategy = useMemo(() => {
        const column = draftColumn ?? (selectedIndex !== null ? columns[selectedIndex] ?? null : null)
        return new FieldEditorStrategy({
            onGetColumns: () => [
                { name: "name", alias: "name", displayName: "Name", dataType: DataTypes.SingleLineText },
                { name: "targets", alias: "targets", displayName: "Lookup targets", dataType: DataTypes.Multiple },
                { name: "optionSet", alias: "optionSet", displayName: "Options", dataType: DataTypes.Multiple },
            ],
            onGetData: () => {
                const rawTargets = column?.metadata?.Targets
                return {
                    id: column?.name ?? "",
                    name: column?.name ?? "",
                    targets: Array.isArray(rawTargets) ? rawTargets : [],
                    optionSet: normalizeOptions(column?.metadata?.OptionSet),
                }
            },
            onGetMetadata: () => ({ PrimaryIdAttribute: "id", PrimaryNameAttribute: "name" }),
        }, (updatedData) => commitFieldChangesRef.current(updatedData))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftColumn, selectedIndex])

    const addColumn = (dataType: TSupportedModelDataType) => {
        const created = createModelColumn(dataType)
        const nextName = createUniqueName(created.name, columns)
        const definition = getModelTypeDefinition(dataType)

        setSelectedIndex(null)
        setPanelNotification(null)
        setDraftColumn({
            ...created,
            name: nextName,
            alias: nextName,
            metadata: {
                ...created.metadata,
                ...(definition?.supportsLookupTargets ? { Targets: [] } : {}),
                ...(definition?.supportsOptionSet ? { OptionSet: [] } : {}),
            },
        })
    }

    const removeColumn = (index: number) => {
        updateColumns((current) => current.filter((_, currentIndex) => currentIndex !== index))
        setSelectedIndex(null)
    }

    const discardOrRemoveSelected = async () => {
        if (draftColumn) {
            setDraftColumn(null)
            return
        }

        if (selectedIndex === null) {
            return
        }

        const column = columns[selectedIndex]
        const lockReason = column ? getDeleteLockReason(column.name) : null
        if (lockReason) {
            setPanelNotification(lockReason)
            return
        }

        const result = await pcfContextRef.current.navigation.openConfirmDialog({
            title: "Delete field",
            text: `Are you sure you want to delete the field "${column?.name}"?`,
        })

        if (result.confirmed) {
            removeColumn(selectedIndex)
        }
    }

    const removeColumnsByName = (names: string[]) => {
        const nameSet = new Set(names)
        updateColumns((current) => current.filter((column) => !nameSet.has(column.name)))
        setSelectedRecordNames([])
        dataset.clearSelectedRecordIds()
        if (selectedIndex !== null && nameSet.has(columns[selectedIndex]?.name)) {
            setSelectedIndex(null)
        }
    }

    const addFieldCommandBarItem: ICommandBarItemProps = {
        key: "add-field",
        text: "Add field",
        iconProps: { iconName: "Add" },
        subMenuProps: {
            items: modelTypeDefinitions.map((definition) => ({
                key: definition.key,
                text: definition.label,
                onClick: () => addColumn(definition.key),
            })),
        },
    }

    const deleteSelectedFields = async () => {
        if (selectedRecordNames.length === 0) {
            return
        }

        const lockMessage = getBulkDeleteLockMessage(selectedRecordNames)
        if (lockMessage) {
            dataset.getDataProvider().setError(true, lockMessage)
            return
        }

        const result = await pcfContextRef.current.navigation.openConfirmDialog({
            title: "Delete field",
            text: selectedRecordNames.length === 1
                ? `Are you sure you want to delete the field "${selectedRecordNames[0]}"?`
                : `Are you sure you want to delete ${selectedRecordNames.length} fields?`,
        })

        if (result.confirmed) {
            removeColumnsByName(selectedRecordNames)
        }
    }

    const deleteFieldCommandBarItem: ICommandBarItemProps = {
        key: "delete-field",
        text: "Delete",
        iconProps: { iconName: "Delete" },
        onClick: () => {
            void deleteSelectedFields()
        },
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

    return <div className={styles.root}>
        {editorMode === "json" && (
            <Stack tokens={{ childrenGap: 12 }} className={styles.root}>
                <div className={styles.jsonWrap}>
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        language="json"
                        value={jsonValue}
                        onChange={(nextValue) => {
                            setJsonValue(nextValue ?? "")
                            setJsonError(null)
                        }}
                        options={{
                            ...baseEditorOptions,
                            formatOnPaste: true,
                            formatOnType: true,
                            padding: { top: 12, bottom: 12 },
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
            <div className={styles.tableWrap}>
                <DatasetControl
                    onGetDatasetControlInstance={() => datasetControl}
                    onGetControlComponent={(controlProps) => <Grid
                        provider={controlProps.parameters.Grid.getDataProvider()}
                        enableEditing={controlProps.parameters.EnableEditing?.raw === true}
                        enableNavigation={controlProps.parameters.EnableNavigation?.raw !== false}
                        enableZebra={controlProps.parameters.EnableZebra?.raw !== false}
                        selectableRows={controlProps.parameters.SelectableRows?.raw}
                        rowHeight={controlProps.parameters.RowHeight?.raw ?? undefined}
                        height={controlProps.parameters.Height?.raw ?? undefined}
                    />}
                    onOverrideComponentProps={() => ({
                        onRender: (renderProps: IDatasetControlRenderProps, defaultRender: (props: IDatasetControlRenderProps) => ReactElement) => defaultRender({
                            ...renderProps,
                            onRenderHeader: (headerProps: IHeaderProps, defaultRenderHeader: (props: IHeaderProps) => ReactElement) => defaultRenderHeader({
                                ...headerProps,
                                onRenderRibbonQuickFindWrapper: (wrapperProps: IRibbonQuickFindWrapperProps, defaultRenderWrapper: (props: IRibbonQuickFindWrapperProps) => ReactElement) => defaultRenderWrapper({
                                    ...wrapperProps,
                                    onRenderRibbon: (ribbonProps: TRibbonRenderProps, defaultRenderRibbon: TRibbonDefaultRender) => defaultRenderRibbon({
                                        ...ribbonProps,
                                        onRenderCommandBar: (commandBarProps: TCommandBarProps, defaultRenderCommandBar: TCommandBarDefaultRender) => ribbonProps.onRenderCommandBar({
                                            ...commandBarProps,
                                            items: [
                                                ...(commandBarProps.items ?? []).filter((item: ICommandBarItemProps) => item.key !== DataProvider.CONST.REFRESH_COMMAND_ID),
                                                addFieldCommandBarItem,
                                                ...(selectedRecordNames.length > 0 ? [deleteFieldCommandBarItem] : []),
                                            ],
                                        }, defaultRenderCommandBar),
                                    }),
                                }),
                            }),
                        }),
                    })}
                />
            </div>
        )}

        <Panel
            isOpen={selectedColumn !== null}
            onDismiss={closePanel}
            type={PanelType.medium}
            headerText={selectedColumn ? (selectedColumn.displayName || selectedColumn.name) : ""}
        >
            {selectedColumn && (
                <div className={styles.panelSection}>
                    <Form.Root
                        key={selectedColumn.name}
                        strategy={fieldStrategy}
                        onAfterSave={({ success }: { success: boolean }) => {
                            if (success) {
                                closePanel()
                            }
                        }}
                    >
                        <Form.Notifications messages={panelNotificationMessages} />
                        <Form.Ribbon
                            components={{
                                onRenderCommandBar: (commandBarProps) => (
                                    <CommandBar
                                        {...commandBarProps}
                                        items={[
                                            ...commandBarProps.items,
                                            {
                                                key: "remove-field",
                                                text: draftColumn ? "Discard" : "Remove field",
                                                iconProps: { iconName: "Delete" },
                                                onClick: () => {
                                                    void discardOrRemoveSelected()
                                                },
                                            },
                                        ]}
                                    />
                                ),
                            }}
                        />
                        <Form.Column>
                            <Form.Section label="Field details">
                                <NameField isNew={!!draftColumn} />
                            </Form.Section>
                        </Form.Column>
                        <DuplicateNameWarning columns={columns} selectedIndex={selectedIndex} />
                        <FieldMetadataSection dataType={selectedColumn.dataType} />
                    </Form.Root>
                </div>
            )}
        </Panel>
    </div>
}
