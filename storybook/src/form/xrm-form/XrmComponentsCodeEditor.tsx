import Editor, { BeforeMount, OnMount } from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"
import type * as MonacoNamespace from "monaco-editor"

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
        overflow: "visible",
    },
})

const baseXrmDeclarations = `declare namespace Xrm {
  namespace Attributes {
    type RequirementLevel = "none" | "required" | "recommended";
    type AttributeType = string;
  }

  namespace Controls {
    type ControlType = string;
  }

  namespace Collection {
    interface ItemCollection<T> {
      get(): T[];
      get(index: number): T | null;
      get(name: string): T | null;
      forEach(delegate: (item: T, index: number) => void): void;
      getLength(): number;
    }
  }

  namespace Events {
    type ContextSensitiveHandler = () => void;
    type DataLoadEventHandler = () => void;
    type SaveEventHandler = () => void;
    type SaveEventHandlerAsync = () => Promise<void>;
  }

  interface Privilege {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
  }

  interface EntityReference {
    id: string;
    entityType: string;
    name?: string;
  }

  interface SaveOptions {
    saveMode?: number;
  }

  type SubmitMode = "always" | "dirty" | "never";
  type DisplayState = "expanded" | "collapsed";
}

declare namespace XrmEnum {
  type FormType = number;
}

interface IXrmSectionContext {
  getName(): string;
  getLabel(): string;
  setLabel(label: string): void;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
}

interface IXrmTabContext {
  readonly sections: Xrm.Collection.ItemCollection<IXrmSectionContext>;
  getName(): string;
  getLabel(): string;
  setLabel(label: string): void;
  getVisible(): boolean;
  setVisible(visible: boolean): void;
  getDisplayState(): Xrm.DisplayState;
  setDisplayState(state: Xrm.DisplayState): void;
  setFocus(): void;
  addTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
  removeTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
}

interface IXrmAttributeContext {
  getName(): string;
  getValue(): any;
  setValue(value: any): void;
  setIsValid(isValid: boolean, message?: string): void;
  getAttributeType(): Xrm.Attributes.AttributeType;
  getRequiredLevel(): Xrm.Attributes.RequirementLevel;
  setRequiredLevel(level: Xrm.Attributes.RequirementLevel): void;
  getIsDirty(): boolean;
  getSubmitMode(): Xrm.SubmitMode;
  fireOnChange(): void;
  addOnChange(handler: Xrm.Events.ContextSensitiveHandler): void;
  removeOnChange(handler: Xrm.Events.ContextSensitiveHandler): void;
  getUserPrivilege(): Xrm.Privilege;
  controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
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
  getControlType(): Xrm.Controls.ControlType;
}

interface IXrmEntityContext {
  getId(): string;
  getEntityName(): string;
  getEntityReference(): Xrm.EntityReference;
  getPrimaryAttributeValue(): string;
  isValid(): boolean;
  addOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void;
  removeOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void;
  save(saveOptions?: Xrm.SaveOptions): Promise<void>;
  attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
}

interface IXrmDataContext {
  readonly entity: IXrmEntityContext;
  readonly attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
  readonly process: any;
  getIsDirty(): boolean;
  isValid(): boolean;
  save(saveOptions?: Xrm.SaveOptions): Promise<void>;
  refresh(save?: boolean): Promise<void>;
  addOnLoad(handler: Xrm.Events.DataLoadEventHandler): void;
  removeOnLoad(handler: Xrm.Events.DataLoadEventHandler): void;
}

interface IXrmUiContext {
  readonly tabs: Xrm.Collection.ItemCollection<IXrmTabContext>;
  readonly controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
  readonly formSelector: any;
  readonly navigation: any;
  readonly process: any;
  readonly footerSection: any;
  readonly quickForms: any;
  getFormType(): XrmEnum.FormType;
  addOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void;
  removeOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void;
  setFormNotification(message: string, level: "ERROR" | "WARNING" | "INFO", uniqueId: string): boolean;
  clearFormNotification(uniqueId: string): boolean;
}

interface IXrmFormContext {
  readonly data: IXrmDataContext;
  readonly ui: IXrmUiContext;
  getAttribute(nameOrIndexOrDelegate?: string | number | ((item: IXrmAttributeContext, index: number) => boolean)): IXrmAttributeContext | IXrmAttributeContext[] | null;
  getControl(nameOrIndexOrDelegate?: string | number | ((item: IXrmControlContext, index: number) => boolean)): IXrmControlContext | IXrmControlContext[] | null;
}
`

const xrmComponentsDeclarations = `declare const React: typeof import("react");
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

${baseXrmDeclarations}

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

const formContextScenarioDeclarations = `${baseXrmDeclarations}
declare const formContext: IXrmFormContext;
`

export const XrmComponentsCodeEditor = (props: IXrmComponentsCodeEditorProps) => {
    const handleBeforeMount: BeforeMount = (monaco) => {
        configureMonaco(monaco)
    }

    const handleMount: OnMount = (_, monaco) => {
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
                path={props.path ?? "file:///sandbox/xrm-components-snippet.tsx"}
                height={props.height ?? defaultEditorHeight}
                defaultLanguage={props.language ?? "typescript"}
                language={props.language ?? "typescript"}
                value={props.value}
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
                    scrollBeyondLastLine: true,
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
