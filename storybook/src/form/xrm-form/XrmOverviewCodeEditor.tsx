import Editor, { OnMount } from "@monaco-editor/react"
import { Stack, mergeStyleSets } from "@fluentui/react"
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs, useMonacoTheme } from "../shared/monacoEditor"

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
interface IMemoryRecordParams {
  columns: any[];
  data: Record<string, any>;
  metadata: { PrimaryIdAttribute: string; PrimaryNameAttribute: string };
  onSave?: (record: any) => Promise<{ success: boolean; errors?: any[] }>;
}
declare const createMemoryRecord: (params: IMemoryRecordParams) => any;
interface IXrmFormLoadResult {
  record: any;
  formXml: string;
}
interface IXrmFormProps {
  onLoad: () => Promise<IXrmFormLoadResult>;
  autoSave?: boolean;
  children?: React.ReactNode;
}
declare const XrmForm: React.ComponentType<IXrmFormProps>;
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
    const monacoTheme = useMonacoTheme()
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
                theme={monacoTheme}
            />
        </div>
    </Stack>
}
