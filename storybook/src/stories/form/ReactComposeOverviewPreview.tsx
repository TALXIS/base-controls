import React from "react"
import { MessageBar, MessageBarType, Stack, Text, TextField, Icon, ComboBox, IconButton, Slider, mergeStyleSets } from "@fluentui/react"
import { Step, StepButton, StepContent, Stepper } from "@mui/material"
import { Form, useField } from "@talxis/base-controls/components/Form"
import type { IFormApi } from "@talxis/base-controls/components/Form"
import { FormCodeEditor } from "../../form/react-form/FormCodeEditor"
import { LiveFormCode } from "../../form/react-form/LiveFormCode"
import { OpenMap } from "../../form/react-form/OpenMap"
import { defaultFormCode } from "../../form/react-form/defaultFormCode"
import { getDemoRecord, getMemoryStrategy } from "../../form/shared/formModel"

const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
        flex: 1,
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
        width: "100%",
    },
    editorStatus: {
        flexShrink: 0,
    },
})

interface IReactComposeOverviewPreviewProps {
    showCode?: boolean
}

export const ReactComposeOverviewPreview = (props: IReactComposeOverviewPreviewProps) => {
    const [code, setCode] = React.useState(defaultFormCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)
    const formApiRef = React.useRef<IFormApi | null>(null)
    const currentRecord = React.useMemo(() => getDemoRecord(), [])
    const strategy = React.useMemo(() => getMemoryStrategy(), [])
    const fluent = React.useMemo(
        () => ({
            Stack,
            FluentText: Text,
            TextField,
            Icon,
            ComboBox,
            IconButton,
            Slider,
            OpenMap,
            MuiStepper: Stepper,
            MuiStep: Step,
            MuiStepButton: StepButton,
            MuiStepContent: StepContent,
        }),
        [],
    )

    const formProps = React.useMemo(
        () => ({
            strategy,
            onFormReady: (api: IFormApi) => {
                formApiRef.current = api
            },
            onAfterSave: ({ success }: { success: boolean }) => {
                const currentData = formApiRef.current?.getData()
                console.log(success ? "Form saved" : "Save failed", { success, currentData })
            },
        } as React.ComponentProps<typeof Form.Root>),
        [currentRecord, strategy],
    )

    return (
        <div className={styles.root}>
            {props.showCode ? (
                <FormCodeEditor value={code} onChange={setCode} />
            ) : (
                <div className={styles.previewSurface}>
                    <div className={styles.viewportWindow}>
                        <LiveFormCode
                            code={code}
                            formProps={formProps}
                            useField={useField}
                            fluent={fluent}
                            onError={setCompileError}
                        />
                    </div>
                </div>
            )}

            {compileError && (
                <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                    <pre className="toast-details">{compileError}</pre>
                </MessageBar>
            )}
        </div>
    )
}
