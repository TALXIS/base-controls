import Editor, { OnMount } from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"
import type * as MonacoNamespace from "monaco-editor"

interface IFormCodeEditorProps {
    value: string
    onChange: (value: string) => void
}

const styles = mergeStyleSets({
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
    },
    label: {
        marginBottom: 8,
        flexShrink: 0,
    },
    frame: {
        height: 640,
        overflow: "hidden",
    },
})

const sandboxDeclarations = `declare const React: typeof import("react");
declare const Stack: any;
declare const FluentText: any;
declare const TextField: any;
declare const Icon: any;
declare const Slider: any;
declare const OpenMap: any;

interface ISandboxFieldValidationResult {
  error: boolean;
  errorMessage: string;
}

interface ISandboxField {
  getValue(): any;
  setValue(value: any): void;
  isValid(): ISandboxFieldValidationResult | null;
}

interface ISandboxValidation extends ISandboxFieldValidationResult {
  fieldName?: string;
}

interface ISandboxFormApiField {
  getValue(): any;
  setValue(value: any): void;
}

interface ISandboxFormApi {
  refresh(): void;
  getData(): { [key: string]: any };
  getField(fieldName: string): ISandboxFormApiField;
}

interface ISandboxFormEventHandlers {
  onFieldValueChanged(fieldName: string, newValue: any): void;
  onValidationSummaryChanged(validationSummary: ISandboxValidation[]): void;
  onDirtyStateChanged(isDirty: boolean): void;
  onError(error: any, message: string): void;
  onBeforeSave(): void;
  onAfterSave(params: { success: boolean }): void;
}

interface ISandboxFormProps extends Partial<ISandboxFormEventHandlers> {
  strategy: unknown;
  children?: React.ReactNode;
  onFormReady?: (api: ISandboxFormApi) => void;
  labels?: Record<string, string>;
}

interface ISandboxLayoutBreakpoints {
  lg: number;
  md: number;
  sm: number;
  xs: number;
}

interface ISandboxTabsProps {
  expandedTab: string;
  onTabChange(tabId: string): void;
  children?: React.ReactNode;
  components?: Record<string, unknown>;
}

interface ISandboxTabProps {
  id: string;
  label?: string;
  children?: React.ReactNode;
  layout?: Partial<ISandboxLayoutBreakpoints>;
  style?: React.CSSProperties;
  onColumnsPerRowChanged?: (columnsPerRow: number) => void;
}

type ISandboxCellLabelPosition = "Top" | "Left";
type ISandboxRequiredLevel = 0 | 1 | 2 | 3;

interface ISandboxSectionProps {
  id?: string;
  showLabel?: boolean;
  showBar?: boolean;
  visible?: boolean;
  layout?: Partial<ISandboxLayoutBreakpoints>;
  labelWidth?: number;
  cellLabelCollapseBreakpoint?: number;
  cellLabelPosition?: ISandboxCellLabelPosition;
  label?: string;
  children?: React.ReactNode;
}

interface ISandboxFieldProps {
  name?: string;
  requiredLevel?: ISandboxRequiredLevel | null;
  children?: React.ReactNode;
  validation?: ISandboxFieldValidationResult | null;
}

interface ISandboxColumnProps {
  colspan?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

interface ISandboxCellProps {
  label?: string;
  colspan?: number;
  rowspan?: number;
  requiredLevel?: ISandboxRequiredLevel;
  children?: React.ReactNode;
}

interface ISandboxNotificationsProps {
  messages?: {
    text: string;
    level: "ERROR" | "WARNING" | "INFO";
  }[];
  components?: Record<string, unknown>;
}

interface ISandboxRibbonProps {
  onSave?: () => void;
  components?: Record<string, unknown>;
}

interface ISandboxSkeletonProps {}

interface ISandboxSimpleProps {
  children?: React.ReactNode;
}

interface ISandboxControlProps {
  disabled?: boolean;
}

declare const Form: {
  Root: (props: ISandboxFormProps) => JSX.Element;
  Tabs: (props: ISandboxTabsProps) => JSX.Element;
  Tab: (props: ISandboxTabProps) => JSX.Element;
  Section: (props: ISandboxSectionProps) => JSX.Element;
  Column: (props: ISandboxColumnProps) => JSX.Element;
  Field: (props: ISandboxFieldProps) => JSX.Element;
  Cell: (props: ISandboxCellProps) => JSX.Element;
  Control: (props: ISandboxControlProps) => JSX.Element;
  Notifications: (props: ISandboxNotificationsProps) => JSX.Element;
  Ribbon: (props: ISandboxRibbonProps) => JSX.Element;
  Skeleton: (props: ISandboxSkeletonProps) => JSX.Element;
};

declare const useField: (name?: string | null) => ISandboxField | null;
declare const formProps: ISandboxFormProps;
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
            filePath: "file:///sandbox/form-runtime.d.ts",
        },
    ])
}

export const FormCodeEditor = (props: IFormCodeEditorProps) => {
    const { onChange, value } = props

    const handleMount: OnMount = (_, monaco) => {
        configureMonaco(monaco)
    }

    return <Stack className={styles.root}>
        <Text variant="medium" className={styles.label}>
            Form TSX
        </Text>
        <div className={styles.frame}>
            <Editor
                path="file:///sandbox/form-snippet.tsx"
                height="640px"
                defaultLanguage="typescript"
                language="typescript"
                value={value}
                onMount={handleMount}
                onChange={(nextValue) => onChange(nextValue ?? "")}
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
                    scrollBeyondLastLine: true,
                    smoothScrolling: true,
                    tabSize: 2,
                    wordWrap: "on",
                }}
                theme="vs-light"
            />
        </div>
    </Stack>
}
