import Editor, { OnMount } from "@monaco-editor/react"
import { Stack, Text, getTheme, mergeStyleSets } from "@fluentui/react"
import type * as MonacoNamespace from "monaco-editor"

interface IReactComposeCodeViewerProps {
    value: string
    label?: string
}

const theme = getTheme()

const styles = mergeStyleSets({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
    },
    label: {
        marginBottom: 8,
        flexShrink: 0,
    },
    frame: {
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
        borderRadius: 8,
    },
})

const sandboxDeclarations = `declare const React: typeof import("react");
declare const Form: any;
declare const Stack: any;
declare const FluentText: any;
declare const TextField: any;
declare const Icon: any;
declare const ComboBox: any;
declare const IconButton: any;
declare const Slider: any;
declare const OpenMap: any;
declare const MuiStepper: any;
declare const MuiStep: any;
declare const MuiStepButton: any;
declare const MuiStepContent: any;
declare const useField: (name?: string | null) => any;
declare const formProps: any;
`

const configureMonaco = (monaco: typeof MonacoNamespace) => {
    const { typescript } = monaco.languages

    typescript.typescriptDefaults.setCompilerOptions({
        allowJs: true,
        allowNonTsExtensions: true,
        esModuleInterop: true,
        jsx: typescript.JsxEmit.React,
        module: typescript.ModuleKind.ESNext,
        noEmit: true,
        target: typescript.ScriptTarget.ES2020,
        typeRoots: ["node_modules/@types"],
    })

    typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    })

    typescript.typescriptDefaults.setExtraLibs([
        {
            content: sandboxDeclarations,
            filePath: "file:///sandbox/react-compose-viewer-runtime.d.ts",
        },
    ])
}

export const ReactComposeCodeViewer = (props: IReactComposeCodeViewerProps) => {
    const handleMount: OnMount = (_, monaco) => {
        configureMonaco(monaco)
    }

    return <Stack className={styles.root}>
        <Text variant="medium" className={styles.label}>
            {props.label ?? "React TSX"}
        </Text>
        <div className={styles.frame}>
            <Editor
                path="file:///sandbox/react-compose-readonly-snippet.tsx"
                height="100%"
                defaultLanguage="typescript"
                language="typescript"
                value={props.value}
                onMount={handleMount}
                options={{
                    automaticLayout: true,
                    bracketPairColorization: { enabled: true },
                    domReadOnly: true,
                    fontLigatures: true,
                    fontSize: 13,
                    lineNumbersMinChars: 3,
                    minimap: { enabled: false },
                    padding: { top: 12, bottom: 12 },
                    quickSuggestions: false,
                    readOnly: true,
                    scrollbar: {
                        alwaysConsumeMouseWheel: true,
                        horizontal: "auto",
                        vertical: "auto",
                    },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    tabSize: 2,
                    wordWrap: "on",
                }}
                theme="vs-light"
            />
        </div>
    </Stack>
}
