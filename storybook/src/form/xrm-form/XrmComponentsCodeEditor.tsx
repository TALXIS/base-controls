import Editor, { BeforeMount, OnMount } from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"
import { useMemo } from "react"
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs } from "../shared/monacoEditor"

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
    kind?: "components" | "form-context" | "overview"
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
interface IXrmMemoryStrategyParams {
  onGetData: () => any;
  onGetColumns: () => any[];
  onGetMetadata: () => any;
  onGetFormXml: () => string;
}
interface IXrmControlComponents {
  onRenderControl?: (props: IXrmControlRenderProps) => React.ReactNode;
}
interface IXrmTabsComponents {
  onRenderTabs?: (props: {
    children?: React.ReactNode;
    selectedKey?: string;
    className?: string;
    styles?: any;
    onLinkClick?: (item?: { props: { itemKey?: string } }, ev?: any) => void;
  }) => React.ReactNode;
}
interface IXrmFormProps {
  strategy: IXrmFormStrategy;
  components?: {
    control?: IXrmControlComponents;
    tabs?: IXrmTabsComponents;
  };
}
declare const XrmForm: React.ComponentType<IXrmFormProps>;
declare const XrmMemoryStrategy: new (params: IXrmMemoryStrategyParams) => IXrmFormStrategy;
declare const formMetadata: {
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
};
declare const getCustomComponentsFormXml: () => string;
declare const getCustomComponentsRecord: () => Record<string, any>;
declare const xrmCustomComponentsModelStore: {
  getRuntimeColumns: () => any[];
};
declare const ControlComponents: {
  onRenderControl: (props: IXrmControlRenderProps) => React.ReactNode;
};
declare const MuiTextField: any;
declare const MuiSlider: any;
declare const FormControl: any;
declare const InputLabel: any;
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

interface IXrmFormStrategy {
  onGetData(): any;
  onGetColumns(): any[];
  onGetMetadata(): any;
  onGetFormXml(): string;
}
`

const formContextScenarioDeclarations = `${xrmTypeBridgeDeclarations}
declare const formContext: IXrmFormContext;
`

export const XrmComponentsCodeEditor = (props: IXrmComponentsCodeEditorProps) => {
    const editorInstanceKey = useMemo(
        () => `${props.path ?? "file:///sandbox/xrm-components-snippet.tsx"}::${String(props.resetToken ?? "")}`,
        [props.path, props.resetToken],
    )

    const handleBeforeMount: BeforeMount = (monaco) => {
        configureTypeScriptCompiler(monaco, { javascript: true })
    }

    const handleMount: OnMount = (_, monaco) => {
        const declarations = props.declarations
            ?? (props.kind === "form-context" ? formContextScenarioDeclarations : xrmComponentsDeclarations)
        const filePath = props.kind === "form-context"
            ? "file:///sandbox/xrm-form-context-runtime.d.ts"
            : "file:///sandbox/xrm-components-runtime.d.ts"

        registerExtraLibs(monaco, declarations, filePath, { javascript: true })
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
                    ...baseEditorOptions,
                    domReadOnly: props.readOnly ?? true,
                    padding: { top: 12, bottom: 12 },
                    quickSuggestions: false,
                    readOnly: props.readOnly ?? true,
                }}
                onChange={(value) => props.onChange?.(value ?? "")}
                theme="vs-light"
            />
        </div>
    </Stack>
}
