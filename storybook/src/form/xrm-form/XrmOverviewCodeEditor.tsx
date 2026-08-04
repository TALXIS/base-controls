import Editor, { OnMount } from "@monaco-editor/react"
import { Stack, mergeStyleSets } from "@fluentui/react"
import type * as MonacoNamespace from "monaco-editor"

interface IXrmOverviewCodeEditorProps {
    value: string
    onChange: (value: string) => void
}

const styles = mergeStyleSets({
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
    },
    frame: {
        height: 640,
        overflow: "hidden",
    },
})

const sandboxDeclarations = `declare const React: typeof import("react");
interface IXrmFormStrategy {
  onGetData(): any;
  onGetColumns(): any[];
  onGetMetadata(): any;
  onGetFormXml(): string;
}
interface IXrmFormProps {
  strategy: IXrmFormStrategy;
  children?: React.ReactNode;
}
declare const XrmForm: React.ComponentType<IXrmFormProps>;
interface IXrmMemoryStrategyParams {
  onGetData: () => any;
  onGetColumns: () => any[];
  onGetMetadata: () => any;
  onGetFormXml: () => string;
}
declare const XrmMemoryStrategy: new (config: IXrmMemoryStrategyParams) => IXrmFormStrategy;
declare const formMetadata: {
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
};
declare const currentFormXml: string;
declare const getXrmRecord: () => Record<string, any>;
declare const xrmModelStore: {
  getRuntimeColumns: () => any[];
};
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
            filePath: "file:///sandbox/xrm-overview-runtime.d.ts",
        },
    ])
}

export const XrmOverviewCodeEditor = (props: IXrmOverviewCodeEditorProps) => {
    const handleMount: OnMount = (_, monaco) => {
        configureMonaco(monaco)
    }

    return <Stack className={styles.root}>
        <div className={styles.frame}>
            <Editor
                path="file:///sandbox/xrm-overview-snippet.tsx"
                height="640px"
                defaultLanguage="typescript"
                language="typescript"
                value={props.value}
                onMount={handleMount}
                onChange={(nextValue) => props.onChange(nextValue ?? "")}
                options={{
                    automaticLayout: true,
                    bracketPairColorization: { enabled: true },
                    fontLigatures: true,
                    fontSize: 13,
                    lineNumbersMinChars: 3,
                    minimap: { enabled: false },
                    padding: { top: 12, bottom: 0 },
                    quickSuggestions: {
                        comments: false,
                        other: true,
                        strings: true,
                    },
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
