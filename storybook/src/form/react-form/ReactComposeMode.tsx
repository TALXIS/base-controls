import { useEffect, useMemo, useRef, useState } from "react"
import { Form, useField } from "@talxis/base-controls/components/Form"
import type { IFormApi } from "@talxis/base-controls/components/Form"
import {
    CommandBar,
    ICommandBarItemProps,
    Icon,
    IconButton,
    MessageBar,
    MessageBarType,
    Pivot,
    PivotItem,
    Slider,
    Stack,
    Text,
    TextField,
    ComboBox,
    Toggle,
    getTheme,
    mergeStyleSets,
} from "@fluentui/react"
import { getDemoRecord, getMemoryStrategy } from "../shared/formModel"
import { defaultFormCode } from "./defaultFormCode"
import { FormCodeEditor } from "./FormCodeEditor"
import { LiveFormCode } from "./LiveFormCode"
import { OpenMap } from "./OpenMap"
import { RecordDataEditor } from "./RecordDataEditor"
import { ModelBuilderPanel } from "../shared/ModelBuilderPanel"
import { useModelColumns } from "../shared/useModelColumns"
import { reactModelStore } from "./reactModel"
import { ReactComposeCodeViewer } from "./ReactComposeCodeViewer"
import { stepperFormCode } from "./stepperFormCode"
import { Step, StepButton, StepContent, Stepper } from "@mui/material"

const availableGlobals = [
    "React",
    "Form",
    "useField",
    "Stack",
    "FluentText",
    "TextField",
    "Icon",
    "ComboBox",
    "IconButton",
    "Slider",
    "OpenMap",
    "formProps",
]

const theme = getTheme()

const serializeRecord = (record: { [key: string]: any }) => JSON.stringify(record, null, 2)

const styles = mergeStyleSets({
    modeLayout: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
    },
    card: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
    },
    cardBody: {
        padding: 18,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
    },
    workspaceTabsBody: {
        padding: "0 18px",
        borderBottom: `1px solid ${theme.palette.neutralLight}`,
        flexShrink: 0,
        height: 43,
        minHeight: 43,
        background: theme.palette.white,
        selectors: {
            "& .ms-Pivot": {
                height: "100%",
            },
            "& .ms-Pivot-links": {
                height: "100%",
            },
            "& .ms-Pivot-link": {
                height: "100%",
                lineHeight: "43px",
            },
        },
    },
    commandBarBody: {
        borderBottom: `1px solid ${theme.palette.neutralLight}`,
        flexShrink: 0,
        background: theme.palette.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        selectors: {
            "& .ms-CommandBar": {
                background: theme.palette.white,
            },
        },
    },
    commandBarMain: {
        flex: "1 1 320px",
        minWidth: 0,
    },
    commandBarControls: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
        flex: "0 1 auto",
        flexWrap: "wrap",
        minWidth: 0,
        padding: "8px 12px",
    },
    toolbarToggle: {
        marginBottom: 0,
    },
    viewportToolbar: {
        padding: "8px 0 0",
        flexShrink: 0,
    },
    previewSurface: {
        display: "flex",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
    },
    viewportWindow: {
        flexShrink: 0,
        minWidth: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        overflow: "auto",
        transition: "width 120ms ease-out",
    },
    fillBody: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
    },
    editorSurface: {
        flex: 1,
        minHeight: 0,
        height: "100%",
    },
    editorStatus: {
        flexShrink: 0,
    },
    previewEditorLayout: {
        display: "grid",
        gridTemplateColumns: "minmax(420px, 560px) minmax(620px, 1fr)",
        gap: 24,
        minHeight: 0,
        alignItems: "stretch",
        flex: 1,
        "@media (max-width: 1480px)": {
            gridTemplateColumns: "minmax(380px, 500px) minmax(0, 1fr)",
        },
    },
    previewEditorLayoutExpanded: {
        gridTemplateColumns: "minmax(0, 1fr)",
    },
    previewColumn: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minWidth: 0,
        minHeight: 0,
    },
    previewEditorCard: {
        minHeight: 360,
        height: 360,
    },
    fullScreenSurface: {
        display: "flex",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
    },
})

type TComposeWorkspaceView = "preview" | "data" | "model"
type TComposeTabsFlavor = "pivot" | "stepper"
type TComposeStepperOrientation = "horizontal" | "vertical"

interface IReactComposeModeProps {
    initialTabsFlavor?: TComposeTabsFlavor
    initialStepperOrientation?: TComposeStepperOrientation
    initialView?: TComposeWorkspaceView
    initialModelEditorMode?: "ui" | "json"
    hideTabsFlavorPivot?: boolean
    hideWorkspaceViewPivot?: boolean
    useStorybookViewport?: boolean
    hideModelEditorModeToggle?: boolean
    initialShowPreviewCode?: boolean
    hidePreviewCodeToggle?: boolean
}

export const ReactComposeMode = (props: IReactComposeModeProps) => {
    const [tabsFlavor, setTabsFlavor] = useState<TComposeTabsFlavor>(props.initialTabsFlavor ?? "pivot")
    const [activeView, setActiveView] = useState<TComposeWorkspaceView>(props.initialView ?? "preview")
    const [modelEditorMode, setModelEditorMode] = useState<"ui" | "json">(props.initialModelEditorMode ?? "ui")
    const stepperOrientation: TComposeStepperOrientation = props.initialStepperOrientation ?? "horizontal"
    const [code, setCode] = useState(defaultFormCode)
    const [showPreviewCode, setShowPreviewCode] = useState(props.initialShowPreviewCode ?? false)
    const [compileError, setCompileError] = useState<string | null>(null)
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [viewportWidth, setViewportWidth] = useState(960)
    const [recordData, setRecordData] = useState(() => serializeRecord(getDemoRecord()))
    const [modelColumns, setModelColumns] = useModelColumns(reactModelStore)
    const formApiRef = useRef<IFormApi | null>(null)
    const currentRecord = useMemo(() => getDemoRecord(), [])
    const strategy = useMemo(() => getMemoryStrategy(), [])
    const fluent = useMemo(
        () => ({ Stack, FluentText: Text, TextField, Icon, ComboBox, IconButton, Slider, OpenMap, MuiStepper: Stepper, MuiStep: Step, MuiStepButton: StepButton, MuiStepContent: StepContent }),
        [],
    )
    const commandBarItems = useMemo<ICommandBarItemProps[]>(() => {
        if (activeView !== "model") {
            return []
        }

        return [
            {
                key: "copy-model-json",
                text: "Copy model JSON",
                iconProps: { iconName: "Copy" },
                onClick: async () => {
                    await navigator.clipboard.writeText(JSON.stringify(modelColumns, null, 2))
                    console.log("Model copied", { modelColumns })
                },
            },
        ]
    }, [activeView, modelColumns])

    const commandBarControls = useMemo<React.ReactNode>(() => {
        if (activeView === "preview") {
            if (props.hidePreviewCodeToggle) {
                return null
            }

            return <Toggle
                label="Code"
                inlineLabel
                checked={showPreviewCode}
                onChange={(_event, checked) => setShowPreviewCode(!!checked)}
                styles={{ root: styles.toolbarToggle }}
            />
        }

        if (activeView !== "model") {
            return null
        }

        if (props.hideModelEditorModeToggle) {
            return null
        }

        return <Toggle
            label=""
            onText="JSON"
            offText="Guided UI"
            checked={modelEditorMode === "json"}
            onChange={(_event, checked) => setModelEditorMode(checked ? "json" : "ui")}
            styles={{ root: styles.toolbarToggle }}
        />
    }, [activeView, modelEditorMode, props.hideModelEditorModeToggle, props.hidePreviewCodeToggle, showPreviewCode])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            try {
                const parsedRecord = JSON.parse(recordData) as { [key: string]: any }
                const nextSerializedRecord = serializeRecord(parsedRecord)
                const currentSerializedRecord = serializeRecord(currentRecord)

                setJsonError(null)

                if (nextSerializedRecord === currentSerializedRecord) {
                    return
                }

                Object.keys(currentRecord).forEach((key) => {
                    delete currentRecord[key]
                })
                Object.assign(currentRecord, parsedRecord)
                formApiRef.current?.refresh()
            } catch (error) {
                setJsonError((error as Error).message)
            }
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [currentRecord, recordData])

    const formProps = useMemo(
        () => ({
            strategy,
            onFormReady: (api) => {
                formApiRef.current = api
            },
            onAfterSave: ({ success }) => {
                const currentData = formApiRef.current?.getData()
                console.log(success ? "Form saved" : "Save failed", { success, currentData })
                setRecordData(serializeRecord(currentRecord))
            },
        } as React.ComponentProps<typeof Form.Root>),
        [strategy, currentRecord],
    )

    return <div className={styles.modeLayout}>
            <Stack className={styles.card}>
                {!props.hideTabsFlavorPivot && <Pivot
                    className={styles.workspaceTabsBody}
                    selectedKey={tabsFlavor}
                    overflowBehavior="menu"
                    overflowAriaLabel="More tabs flavors"
                    onLinkClick={(item) => {
                        const nextFlavor = item?.props.itemKey as TComposeTabsFlavor | undefined
                        if (nextFlavor) {
                            setTabsFlavor(nextFlavor)
                        }
                    }}
                >
                    <PivotItem itemKey="pivot" headerText="Pivot tabs" />
                    <PivotItem itemKey="stepper" headerText="Stepper tabs" />
                </Pivot>}

                {!props.hideWorkspaceViewPivot && <Pivot
                    className={styles.workspaceTabsBody}
                    selectedKey={activeView}
                    overflowBehavior="menu"
                    overflowAriaLabel="More workspace views"
                    onLinkClick={(item) => {
                        const nextView = item?.props.itemKey as TComposeWorkspaceView | undefined
                        if (nextView) {
                            setActiveView(nextView)
                        }
                    }}
                >
                    <PivotItem itemKey="preview" headerText="Preview" />
                    <PivotItem itemKey="data" headerText="Data" />
                    <PivotItem itemKey="model" headerText="Model" />
                </Pivot>}

                {(commandBarItems.length > 0 || commandBarControls) && (
                    <div className={styles.commandBarBody}>
                        <div className={styles.commandBarMain}>
                            <CommandBar
                                items={commandBarItems}
                                styles={{
                                    root: { width: "100%" },
                                }}
                            />
                        </div>
                        {commandBarControls && <div className={styles.commandBarControls}>{commandBarControls}</div>}
                    </div>
                )}

                {activeView === "model" && (
                    <Stack tokens={{ childrenGap: 16 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                        <ModelBuilderPanel
                            columns={modelColumns}
                            editorMode={modelEditorMode}
                            onEditorModeChange={setModelEditorMode}
                            onChange={setModelColumns}
                        />
                    </Stack>
                )}

                {activeView === "data" && (
                    <Stack tokens={{ childrenGap: 16 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                        <div className={styles.editorSurface}>
                            <RecordDataEditor value={recordData} onChange={setRecordData} />
                        </div>
                        {jsonError && (
                            <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                <pre className="toast-details">{jsonError}</pre>
                            </MessageBar>
                        )}
                    </Stack>
                )}

                {activeView === "preview" && (
                    <Stack tokens={{ childrenGap: 12 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                        {!props.useStorybookViewport && <div className={styles.viewportToolbar}>
                            <Slider
                                label="Viewport width"
                                styles={{
                                    root: { width: "100%", margin: 0 },
                                    slideBox: { width: "100%" },
                                }}
                                min={320}
                                max={1440}
                                step={10}
                                value={viewportWidth}
                                showValue
                                valueFormat={(nextValue) => `${nextValue}px`}
                                onChange={setViewportWidth}
                            />
                        </div>}
                        {!showPreviewCode && (
                            <div className={styles.fullScreenSurface}>
                                <div className={styles.previewSurface}>
                                    <div className={styles.viewportWindow} style={{ width: props.useStorybookViewport ? '100%' : `${viewportWidth}px` }}>
                                        <LiveFormCode
                                            code={tabsFlavor === "pivot" ? code : stepperFormCode.replaceAll('__STEPPER_ORIENTATION__', stepperOrientation)}
                                            formProps={formProps}
                                            useField={useField}
                                            fluent={fluent}
                                            onError={tabsFlavor === "pivot" ? setCompileError : undefined}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {showPreviewCode && (
                            <div className={styles.fullScreenSurface}>
                                <div className={styles.editorSurface}>
                                    {tabsFlavor === "pivot" ? (
                                        <FormCodeEditor
                                            value={code}
                                            onChange={setCode}
                                        />
                                    ) : (
                                        <ReactComposeCodeViewer
                                            value={stepperFormCode.replaceAll('__STEPPER_ORIENTATION__', stepperOrientation)}
                                            label="Stepper override TSX"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {tabsFlavor === "pivot" && compileError && showPreviewCode && (
                            <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                <pre className="toast-details">{compileError}</pre>
                            </MessageBar>
                        )}
                    </Stack>
                )}
            </Stack>
        </div>
}
