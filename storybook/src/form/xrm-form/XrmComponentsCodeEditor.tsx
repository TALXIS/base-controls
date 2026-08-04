import Editor, { BeforeMount, OnMount } from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"
import type * as MonacoNamespace from "monaco-editor"
import { useMemo, useRef } from "react"

interface IXrmComponentsCodeEditorProps {
    value: string
    label?: string
    path?: string
    language?: "javascript" | "typescript"
    height?: string
    maxHeight?: string
    readOnly?: boolean
    onChange?: (value: string) => void
    declarations?: string
    kind?: "components" | "form-context"
    resetToken?: string | number
}

const defaultEditorHeight = "520px"
const styles = mergeStyleSets({
    root: {
        width: "100%",
        height: defaultEditorHeight,
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
        minHeight: defaultEditorHeight,
        overflow: "hidden",
    },
})

const xrmTypeBridgeDeclarations = `type XrmDisplayState = "expanded" | "collapsed";
type XrmRequirementLevel = "none" | "required" | "recommended";
type XrmNotificationLevel = "ERROR" | "WARNING" | "INFO";

interface IXrmItemCollection<TItem> {
  get(name: string): TItem | null;
  get(index: number): TItem | null;
  get(): TItem[];
  forEach(delegate: (item: TItem, index: number) => void): void;
  getLength(): number;
}

interface IXrmSectionContext {
  getName(): string;
  getLabel(): string;
  setLabel(label: string): void;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  controls: IXrmItemCollection<IXrmControlContext>;
}

interface IXrmTabContext {
  readonly sections: IXrmItemCollection<IXrmSectionContext>;
  getName(): string;
  getLabel(): string;
  setLabel(label: string): void;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  getDisplayState(): XrmDisplayState;
  setDisplayState(state: XrmDisplayState): void;
  setFocus(): void;
}

interface IXrmAttributeContext {
  getName(): string;
  getValue(): any;
  setValue(value: any): void;
  setIsValid(isValid: boolean, message?: string): void;
  getRequiredLevel(): XrmRequirementLevel;
  setRequiredLevel(level: XrmRequirementLevel): void;
  getIsDirty(): boolean;
  fireOnChange(): void;
  addOnChange(handler: () => void): void;
  removeOnChange(handler: () => void): void;
  controls: IXrmItemCollection<IXrmControlContext>;
}

interface IXrmControlContext {
  getName(): string;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  getDisabled(): boolean;
  setDisabled(disabled: boolean): void;
  getLabel(): string;
  setLabel(label: string): void;
  getAttribute(): IXrmAttributeContext | null;
}

interface IXrmEntityContext {
  getId(): string;
  getEntityName(): string;
  getPrimaryAttributeValue(): string;
  isValid(): boolean;
  save(): Promise<void>;
  attributes: IXrmItemCollection<IXrmAttributeContext>;
}

interface IXrmDataContext {
  readonly entity: IXrmEntityContext;
  readonly attributes: IXrmItemCollection<IXrmAttributeContext>;
  readonly process: any;
  getIsDirty(): boolean;
  isValid(): boolean;
  save(): Promise<void>;
  refresh(save?: boolean): Promise<void>;
}

interface IXrmUiContext {
  readonly tabs: IXrmItemCollection<IXrmTabContext>;
  readonly controls: IXrmItemCollection<IXrmControlContext>;
  readonly formSelector: any;
  readonly navigation: any;
  readonly process: any;
  readonly footerSection: any;
  readonly quickForms: any;
  setFormNotification(message: string, level: XrmNotificationLevel, uniqueId: string): boolean;
  clearFormNotification(uniqueId: string): boolean;
}

interface IXrmFormContext {
  readonly data: IXrmDataContext;
  readonly ui: IXrmUiContext;
  getAttribute(nameOrIndexOrDelegate?: any): any;
  getControl(nameOrIndexOrDelegate?: any): any;
}
`

const xrmComponentsDeclarations = `${xrmTypeBridgeDeclarations}
declare const React: typeof import("react");
declare const XrmForm: any;
declare const ControlComponents: {
  onRenderControl: (props: IXrmControlRenderProps) => React.ReactNode;
};
declare const MuiTextField: any;
declare const MuiSlider: any;
declare const FormControl: any;
declare const InputLabel: any;
declare const MuiTextField: any;
declare const Select: any;
declare const MenuItem: any;
declare const useField: (name?: string | null) => {
  getValue(): any;
  setValue(value: any): void;
} | null;

interface IXrmControlRenderProps {
  id?: string;
  disabled?: boolean;
}

interface IXrmFormReadyParams {
  formContext: IXrmFormContext;
  api: unknown;
}

interface IXrmFormProps {
  strategy: unknown;
  components?: {
    control?: {
      onRenderControl?: (props: IXrmControlRenderProps) => React.ReactNode;
    };
  };
}
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

    typescript.javascriptDefaults.setCompilerOptions({
        allowJs: true,
        allowNonTsExtensions: true,
        checkJs: true,
        esModuleInterop: true,
        noEmit: true,
        target: typescript.ScriptTarget.ES2020,
        typeRoots: ["node_modules/@types"],
    })

    typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    })
}

const formContextScenarioDeclarations = `${xrmTypeBridgeDeclarations}
declare const formContext: IXrmFormContext;
`

export const XrmComponentsCodeEditor = (props: IXrmComponentsCodeEditorProps) => {
    const editorRef = useRef<MonacoNamespace.editor.IStandaloneCodeEditor | null>(null)
    const editorInstanceKey = useMemo(
        () => `${props.path ?? "file:///sandbox/xrm-components-snippet.tsx"}::${String(props.resetToken ?? "")}`,
        [props.path, props.resetToken],
    )

    const handleBeforeMount: BeforeMount = (monaco) => {
        configureMonaco(monaco)
    }

    const handleMount: OnMount = (editor, monaco) => {
        editorRef.current = editor
        const declarations = props.declarations
            ?? (props.kind === "form-context" ? formContextScenarioDeclarations : xrmComponentsDeclarations)
        const filePath = props.kind === "form-context"
            ? "file:///sandbox/xrm-form-context-runtime.d.ts"
            : "file:///sandbox/xrm-components-runtime.d.ts"

        monaco.languages.typescript.typescriptDefaults.setExtraLibs([
            {
                content: declarations,
                filePath,
            },
        ])
        monaco.languages.typescript.javascriptDefaults.setExtraLibs([
            {
                content: declarations,
                filePath,
            },
        ])
    }

    return <Stack className={styles.root}>
        <Text variant="medium" className={styles.label}>
            {props.label ?? "React injection example"}
        </Text>
        <div className={styles.frame} style={{ height: props.height ?? defaultEditorHeight, maxHeight: props.maxHeight }}>
            <Editor
                key={editorInstanceKey}
                path={props.path ?? "file:///sandbox/xrm-components-snippet.tsx"}
                height={props.height ?? defaultEditorHeight}
                defaultLanguage={props.language ?? "typescript"}
                language={props.language ?? "typescript"}
                defaultValue={props.value}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                options={{
                    automaticLayout: true,
                    bracketPairColorization: { enabled: true },
                    domReadOnly: props.readOnly ?? true,
                    fontLigatures: true,
                    fontSize: 13,
                    lineNumbersMinChars: 3,
                    minimap: { enabled: false },
                    padding: { top: 12, bottom: 12 },
                    quickSuggestions: false,
                    readOnly: props.readOnly ?? true,
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
                onChange={(value) => props.onChange?.(value ?? "")}
                theme="vs-light"
            />
        </div>
    </Stack>
}
