import * as Babel from "@babel/standalone"
import React from "react"
import { mergeStyleSets } from "@fluentui/react"
import { XrmForm } from "@talxis/base-controls"
import type { IXrmFormContext } from "@talxis/base-controls"
import { CommandBar, ICommandBarItemProps } from "@legacy";
import { createFormContextSandboxState } from "../../form/xrm-form/formContextModel"
import { resetXrmBusinessFlows } from "../../form/xrm-form/xrmBusinessFlows"
import { XrmComponentsCodeEditor } from "../../form/xrm-form/XrmComponentsCodeEditor"
import type { IFormContextDocsExample } from "./formContextExamples"
import { ExampleRunner } from "./storyHelpers"

const styles = mergeStyleSets({
    preview: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
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

    const commandBarItems: ICommandBarItemProps[] = [{ key: "run-code", text: "Run code", iconProps: { iconName: "Play" }, onClick: runCode }]

    return (
        <ExampleRunner
            code={script}
            seedCode={props.docsExample.code}
            onCodeChange={setScript}
            onReset={resetPreview}
            error={error}
            renderPreview={() => (
                <div className={styles.preview}>
                    <CommandBar items={commandBarItems} />
                    <XrmForm
                        key={previewKey}
                        onLoad={sandbox.onLoad}
                        onFormReady={(params) => {
                            setFormContext(params.formContext)
                        }}
                    />
                </div>
            )}
            renderCode={() => (
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
            )}
        />
    )
}
