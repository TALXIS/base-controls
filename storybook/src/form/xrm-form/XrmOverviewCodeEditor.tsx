import Editor, { OnMount } from "@monaco-editor/react"
import { Stack, mergeStyleSets } from "@fluentui/react"
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs } from "../shared/monacoEditor"

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

export const XrmOverviewCodeEditor = (props: IXrmOverviewCodeEditorProps) => {
    const handleMount: OnMount = (_, monaco) => {
        configureTypeScriptCompiler(monaco)
        registerExtraLibs(monaco, sandboxDeclarations, "file:///sandbox/xrm-overview-runtime.d.ts")
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
                    ...baseEditorOptions,
                    padding: { top: 12, bottom: 0 },
                    quickSuggestions: {
                        comments: false,
                        other: true,
                        strings: true,
                    },
                }}
                theme="vs-light"
            />
        </div>
    </Stack>
}
