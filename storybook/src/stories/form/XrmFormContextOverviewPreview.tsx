import * as Babel from "@babel/standalone"
import React from "react"
import { MessageBar, MessageBarType, Toggle, mergeStyleSets } from "@fluentui/react"
import { XrmForm } from "@talxis/base-controls/components/Form"
import type { IXrmFormContext } from "@talxis/base-controls/components/Form"
import { CommandBar, ICommandBarItemProps } from "@legacy"
import { createFormContextSandboxState } from "../../form/xrm-form/formContextModel"
import { resetXrmBusinessFlows } from "../../form/xrm-form/xrmBusinessFlows"
import { XrmComponentsCodeEditor } from "../../form/xrm-form/XrmComponentsCodeEditor"
import type { IFormContextDocsExample } from "./formContextExamples"

const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 520,
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    commandBar: {
        flex: 1,
        minWidth: 0,
    },
    previewFrame: {
        minHeight: 420,
        width: "100%",
        overflow: "hidden",
    },
    hiddenPane: {
        display: "none",
    },
    viewportWindow: {
        width: "100%",
    },
})

const transpileExecutableScript = (code: string, filename: string) => {
    return Babel.transform(code, {
        presets: [["typescript", { allExtensions: true, isTSX: false }]],
        filename,
    }).code ?? ""
}

interface IXrmFormContextOverviewPreviewProps {
    docsExample: IFormContextDocsExample
}

export const XrmFormContextOverviewPreview = (props: IXrmFormContextOverviewPreviewProps) => {
    const sandboxRef = React.useRef(createFormContextSandboxState())
    const sandbox = sandboxRef.current
    const [formContext, setFormContext] = React.useState<IXrmFormContext | null>(null)
    const [previewKey, setPreviewKey] = React.useState(0)
    const [editorResetToken, setEditorResetToken] = React.useState(0)
    const [showCode, setShowCode] = React.useState(false)
    const [script, setScript] = React.useState(props.docsExample.code)
    const [error, setError] = React.useState<string | null>(null)

    const runCode = React.useCallback(() => {
        if (!formContext) {
            return
        }

        try {
            const sourceScript = [script, props.docsExample.runner ?? "onExecuteScenario(formContext)"].join("\n\n")
            const executableScript = transpileExecutableScript(sourceScript, "xrm-form-context-overview.ts")
            const runScenario = new Function("formContext", "resetXrmBusinessFlows", executableScript) as (
                formContext: IXrmFormContext,
                resetXrmBusinessFlows: typeof resetXrmBusinessFlows,
            ) => void
            runScenario(formContext, resetXrmBusinessFlows)
            setError(null)
        } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : String(nextError))
        }
    }, [formContext, props.docsExample.runner, script])

    const resetPreview = React.useCallback(() => {
        setScript(props.docsExample.code)
        setError(null)
        setFormContext(null)
        setPreviewKey((value) => value + 1)
        setEditorResetToken((value) => value + 1)
    }, [props.docsExample.code])

    React.useEffect(() => {
        setScript(props.docsExample.code)
        setError(null)
        setFormContext(null)
        setPreviewKey((value) => value + 1)
        setEditorResetToken((value) => value + 1)
    }, [props.docsExample.code])

    const commandBarItems = React.useMemo<ICommandBarItemProps[]>(
        () => [
            {
                key: "run-code",
                text: "Run code",
                iconProps: { iconName: "Play" },
                onClick: runCode,
            },
            {
                key: "clear",
                text: "Clear",
                iconProps: { iconName: "Undo" },
                onClick: resetPreview,
            },
        ],
        [formContext, resetPreview, runCode, showCode],
    )

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <div className={styles.commandBar}>
                    <CommandBar items={commandBarItems} />
                </div>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>

            <div className={showCode ? undefined : styles.hiddenPane}>
                <XrmComponentsCodeEditor
                    value={script}
                    onChange={setScript}
                    kind="form-context"
                    language="typescript"
                    path="file:///sandbox/xrm-form-context-overview.ts"
                    readOnly={false}
                    label=""
                    resetToken={editorResetToken}
                />
            </div>

            <div className={`${styles.previewFrame} ${showCode ? styles.hiddenPane : ""}`}>
                <div className={styles.viewportWindow}>
                    <XrmForm
                        key={previewKey}
                        strategy={sandbox.getStrategy()}
                        onFormReady={(params) => {
                            setFormContext(params.formContext)
                        }}
                    />
                </div>
            </div>

            {error && (
                <MessageBar messageBarType={MessageBarType.error} isMultiline>
                    <pre className="toast-details">{error}</pre>
                </MessageBar>
            )}
        </div>
    )
}
