import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ComboBox, CommandBar, DefaultButton, Dialog, DialogFooter, DialogType, ICommandBarItemProps, MessageBar, MessageBarType, Pivot, PivotItem, PrimaryButton, Slider, Stack, Text, Toggle, getTheme, mergeStyleSets } from "@fluentui/react"
import { FormXmlSectionBuilder, FormXmlTabBuilder, parseFormXml, serializeFormXml } from "@talxis/client-metadata"
import { XrmForm } from "@talxis/base-controls/components/Form"
import type { IFormApi, IXrmFormContext } from "@talxis/base-controls/components/Form"
import { ControlComponents } from "@talxis/base-controls/components/Form/components/adapters/control"
import { useField } from "@talxis/base-controls/components/Form"
import { FormXmlBuilderPanel } from "./FormXmlBuilderPanel"
import { FormXmlEditor } from "./FormXmlEditor"
import { RecordDataEditor } from "../react-form/RecordDataEditor"
import { XrmRecordBuilderPanel } from "./XrmRecordBuilderPanel"
import { getCurrentFormXml, getXrmRecord, getXrmStrategy, setCurrentFormXml } from "./xrmModel"
import { formContextModelStore, getFormContextRecord, getFormContextStrategy, getFormContextXml, setFormContextXml } from "./formContextModel"
import { IXrmBusinessFlowScenario, resetXrmBusinessFlows, xrmBusinessFlowScenarios } from "./xrmBusinessFlows"
import { ModelBuilderPanel } from "../shared/ModelBuilderPanel"
import { useModelColumns } from "../shared/useModelColumns"
import { xrmModelStore } from "./xrmModel"
import { DEFAULT_LANGUAGE_CODE } from "./constants"
import { XrmComponentsCodeEditor } from "./XrmComponentsCodeEditor"
import { getCustomComponentsFormXml, getCustomComponentsRecord, getCustomComponentsStrategy, setCustomComponentsFormXml } from "./xrmCustomComponentsModel"
import { FormControl, InputLabel, MenuItem, Select, Slider as MuiSlider, Step, StepButton, StepContent, Stepper, TextField as MuiTextField } from "@mui/material"

const theme = getTheme()

const muiCustomControlSpacingSx = {
    my: 1.25,
}

const muiSliderShellSx = {
    ...muiCustomControlSpacingSx,
    px: 2,
    pr: 4,
    boxSizing: "border-box" as const,
    width: "100%",
    minHeight: "100%",
    display: "flex",
    alignItems: "center",
}

const customComponentControlIds = ["customLeadName", "customPhoneNumber", "customEngagementStage", "customMomentumScore", "customWorkspaceUrl", "customNotesPanel"] as const

const xrmCustomTabs = [
    { id: "customControlsTab", label: "General" },
    { id: "defaultControlsTab", label: "Fallback" },
] as const

const customComponentsSnippet = `import { XrmForm } from "@talxis/base-controls/components/Form";
import { useField } from "@talxis/base-controls/components/Form";
import { ControlComponents } from "@talxis/base-controls/components/Form/components/adapters/control";
import { FormControl, InputLabel, MenuItem, Select, Slider as MuiSlider, TextField as MuiTextField } from "@mui/material";

const customControlIds = new Set(["customLeadName", "customPhoneNumber", "customEngagementStage", "customMomentumScore", "customWorkspaceUrl", "customNotesPanel"]);

const LeadNameControl = (props) => {
  const field = useField();

  return (
    <MuiTextField
      fullWidth
      size="small"
      variant="outlined"
      label="Lead name"
      value={String(field?.getValue() ?? "")}
      onChange={(event) => field?.setValue(event.target.value)}
    />
  );
};

const PhoneNumberControl = (props) => {
  const field = useField();

  return (
    <MuiTextField
      fullWidth
      size="small"
      variant="outlined"
      label="Primary phone"
      value={String(field?.getValue() ?? "")}
      onChange={(event) => field?.setValue(event.target.value)}
    />
  );
};

const MomentumScoreControl = (props) => {
  const field = useField();
  const value = Number(field?.getValue() ?? 0);

  return (
    <MuiSlider
      min={0}
      max={100}
      step={1}
      value={value}
      onChange={(nextValue) => field?.setValue(nextValue)}
    />
  );
};

const EngagementStageControl = () => {
  const field = useField();

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="engagement-stage-label">Engagement stage</InputLabel>
      <Select
        labelId="engagement-stage-label"
        label="Engagement stage"
        value={Number(field?.getValue() ?? 1)}
        onChange={(event) => field?.setValue(event.target.value)}
      >
        <MenuItem value={1}>New</MenuItem>
        <MenuItem value={2}>Qualified</MenuItem>
        <MenuItem value={3}>Ready</MenuItem>
      </Select>
    </FormControl>
  );
};

export const CustomXrmForm = () => {
  return (
    <XrmForm
      strategy={strategy}
      components={{
        control: {
          onRenderControl: (props) => {
            if (!customControlIds.has(props.id ?? "")) {
              return ControlComponents.onRenderControl(props);
            }

            if (props.id === "customLeadName") {
              return <LeadNameControl {...props} />;
            }

            if (props.id === "customPhoneNumber") {
              return <PhoneNumberControl {...props} />;
            }

            if (props.id === "customEngagementStage") {
              return <EngagementStageControl />;
            }

            if (props.id === "customMomentumScore") {
              return <MomentumScoreControl {...props} />;
            }

            if (props.id === "customWorkspaceUrl") {
              const field = useField();

              return (
                <MuiTextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  label="Workspace URL"
                  value={String(field?.getValue() ?? "")}
                  onChange={(event) => field?.setValue(event.target.value)}
                />
              );
            }

            if (props.id === "customNotesPanel") {
              const field = useField();

              return (
                <MuiTextField
                  fullWidth
                  multiline
                  minRows={4}
                  variant="outlined"
                  label="Narrative notes"
                  value={String(field?.getValue() ?? "")}
                  onChange={(event) => field?.setValue(event.target.value)}
                />
              );
            }

            return ControlComponents.onRenderControl(props);
          },
        },
      }}
    />
  );
};`

const xrmStepperTabsSnippet = `import { XrmForm } from "@talxis/base-controls/components/Form";
import { Step, StepButton, StepContent, Stepper } from "@mui/material";

function StepperTabs(props) {
  const { children, expandedTab, onTabChange, orientation } = props;
  const tabs = React.Children.toArray(children).filter(React.isValidElement);
  const activeStepIndex = Math.max(tabs.findIndex((tab) => tab.props.id === expandedTab), 0);
  const activeTab = tabs.find((tab) => tab.props.id === expandedTab) ?? tabs[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Stepper nonLinear orientation={orientation} activeStep={activeStepIndex}>
        {tabs.map((tab) => {
          const isActive = tab.props.id === expandedTab;

          return (
            <Step key={tab.props.id} expanded={orientation === "vertical" ? isActive : undefined}>
              <StepButton color="inherit" onClick={() => onTabChange(tab.props.id)}>
                {tab.props.label || tab.props.id}
              </StepButton>
              {orientation === "vertical" ? <StepContent>{tab}</StepContent> : null}
            </Step>
          );
        })}
      </Stepper>
      {orientation === "horizontal" ? activeTab : null}
    </div>
  );
}

export const CustomXrmStepperForm = () => {
  const [orientation, setOrientation] = React.useState("horizontal");

  return (
    <XrmForm
      strategy={strategy}
      components={{
        tabs: {
          onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} orientation={orientation} />,
        },
      }}
    />
  );
};`

const serializeRecord = (record: { [key: string]: any }) => JSON.stringify(record, null, 2)
const maxEventLogEntries = 200
const getTimestamp = () => new Date().toLocaleTimeString()

const createEmptyFormXml = () => {
    const tab = new FormXmlTabBuilder(DEFAULT_LANGUAGE_CODE, {
        name: "new_tab",
        label: "New tab",
    }).build()

    const section = new FormXmlSectionBuilder(DEFAULT_LANGUAGE_CODE, {
        name: "new_section",
        label: "New section",
    }).build()

    return serializeFormXml({
        showImage: "false",
        shownavigationbar: "false",
        tabs: {
            tab: [
                {
                    ...tab,
                    expanded: true,
                    columns: {
                        column: [
                            {
                                width: "100%",
                                sections: {
                                    section: [section],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    })
}

const styles = mergeStyleSets({
    modeLayout: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
    },
    workspaceTabsBody: {
        padding: "0 18px",
        borderBottom: `1px solid ${theme.palette.neutralLight}`,
        flexShrink: 0,
        height: 43,
        minHeight: 43,
        background: theme.palette.white,
        selectors: {
            "& .ms-Pivot": {
                height: "100%",
            },
            "& .ms-Pivot-links": {
                height: "100%",
            },
            "& .ms-Pivot-link": {
                height: "100%",
                lineHeight: "43px",
            },
        },
    },
    commandBarBody: {
        borderBottom: `1px solid ${theme.palette.neutralLight}`,
        flexShrink: 0,
        background: theme.palette.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        selectors: {
            "& .ms-CommandBar": {
                background: theme.palette.white,
            },
        },
    },
    commandBarMain: {
        flex: "1 1 320px",
        minWidth: 0,
    },
    commandBarControls: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
        flex: "0 1 auto",
        flexWrap: "wrap",
        minWidth: 0,
        padding: "8px 12px",
    },
    toolbarToggle: {
        marginBottom: 0,
    },
    viewportToolbar: {
        padding: "8px 0 0",
        flexShrink: 0,
    },
    previewEditorLayout: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(420px, 0.9fr)",
        gap: 24,
        minHeight: 0,
        width: "100%",
        alignItems: "stretch",
        "@media (max-width: 1280px)": {
            gridTemplateColumns: "1fr",
        },
    },
    previewEditorLayoutExpanded: {
        gridTemplateColumns: "minmax(0, 1fr)",
    },
    bottomLayout: {
        display: "grid",
        gridTemplateColumns: "minmax(420px, 560px) minmax(620px, 1fr)",
        gap: 24,
        alignItems: "start",
        "@media (max-width: 1480px)": {
            gridTemplateColumns: "minmax(380px, 500px) minmax(0, 1fr)",
        },
        "@media (max-width: 1180px)": {
            gridTemplateColumns: "1fr",
        },
    },
    formContextLayout: {
        display: "grid",
        gridTemplateColumns: "minmax(420px, 560px) minmax(620px, 1fr)",
        gap: 24,
        alignItems: "start",
        "@media (max-width: 1480px)": {
            gridTemplateColumns: "minmax(380px, 500px) minmax(0, 1fr)",
        },
    },
    editorsColumn: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minWidth: 0,
    },
    previewColumn: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minWidth: 0,
    },
    card: {
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
    },
    cardBody: {
        padding: 18,
        minHeight: 0,
    },
    previewSurface: {
        display: "flex",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
    },
    viewportWindow: {
        flexShrink: 0,
        minWidth: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        overflow: "auto",
        transition: "width 120ms ease-out",
    },
    scenarioList: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    scenarioCard: {
        padding: 14,
        borderRadius: 8,
        border: `1px solid ${theme.palette.neutralLight}`,
        background: theme.palette.neutralLighterAlt,
    },
    scenarioCardActive: {
        borderColor: theme.palette.themePrimary,
        boxShadow: `inset 0 0 0 1px ${theme.palette.themePrimary}`,
        background: theme.palette.white,
    },
    scenarioEffects: {
        margin: "8px 0 0",
        paddingLeft: 18,
        color: theme.palette.neutralPrimary,
    },
    scenarioActions: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 12,
    },
    eventLog: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    consoleWindow: {
        display: "flex",
        flexDirection: "column",
        minHeight: 420,
        maxHeight: 620,
        overflow: "hidden",
        borderRadius: 10,
        border: `1px solid #0f172a`,
        background: "#020617",
        boxShadow: "inset 0 0 0 1px rgba(148, 163, 184, 0.1)",
    },
    consoleToolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
        background: "#0f172a",
    },
    consoleTitle: {
        color: "#e2e8f0",
    },
    consoleHint: {
        color: "#94a3b8",
    },
    consoleBody: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        overflow: "auto",
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    },
    consoleEmpty: {
        color: "#94a3b8",
        padding: "6px 2px",
    },
    eventLogItem: {
        padding: 10,
        borderRadius: 8,
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "rgba(15, 23, 42, 0.72)",
    },
    eventLogMeta: {
        display: "block",
        color: "#38bdf8",
        marginBottom: 4,
    },
    eventLogText: {
        color: "#e2e8f0",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },
    fillCard: {
        flex: 1,
    },
    fillBody: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
    },
    editorSurface: {
        flex: 1,
        minHeight: 0,
    },
    editorStatus: {
        flexShrink: 0,
    },
    scrollBody: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "auto",
    },
    builderViewportShell: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        minHeight: 0,
    },
    builderViewportWindow: {
        width: "100%",
        maxWidth: "100%",
        minHeight: 0,
    },
    formContextBody: {
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        padding: 0,
    },
    showcaseLayout: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(420px, 0.9fr)",
        gap: 24,
        minHeight: 0,
        width: "100%",
        alignItems: "stretch",
        "@media (max-width: 1280px)": {
            gridTemplateColumns: "1fr",
        },
    },
    showcaseLayoutExpanded: {
        gridTemplateColumns: "minmax(0, 1fr)",
    },
    showcaseColumn: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minWidth: 0,
        minHeight: 0,
    },
    showcasePreviewCard: {
        minHeight: 420,
    },
    showcasePreviewCardExpanded: {
        minHeight: 420,
    },
    showcaseEditorCard: {
        minHeight: 560,
        height: 560,
    },
    showcaseCallout: {
        borderRadius: 10,
        border: `1px solid ${theme.palette.neutralLight}`,
        background: theme.palette.neutralLighterAlt,
        padding: 16,
    },
    showcaseChips: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 12,
    },
    showcaseChip: {
        padding: "4px 10px",
        borderRadius: 999,
        background: theme.palette.themeLighterAlt,
        color: theme.palette.themeDarkAlt,
        fontSize: 12,
        fontWeight: 600,
    },
})

const SleekTextFieldControl = (props: { id?: string, disabled?: boolean }) => {
    const field = useField()
    const value = String(field?.getValue() ?? "")

    return <MuiTextField
        fullWidth
        size="small"
        variant="outlined"
        label="Lead name"
        value={value}
        disabled={props.disabled}
        onChange={(event) => field?.setValue(event.target.value)}
        sx={{
            ...muiCustomControlSpacingSx,
            "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                backgroundColor: "#fff",
            },
        }}
    />
}

const SleekUrlFieldControl = (props: { id?: string, disabled?: boolean }) => {
    const field = useField()
    const value = String(field?.getValue() ?? "")

    return <MuiTextField
        fullWidth
        size="small"
        variant="outlined"
        label="Workspace URL"
        value={value}
        disabled={props.disabled}
        onChange={(event) => field?.setValue(event.target.value)}
        sx={{
            ...muiCustomControlSpacingSx,
            "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                backgroundColor: "#fff",
            },
        }}
    />
}

const SleekPhoneFieldControl = (props: { id?: string, disabled?: boolean }) => {
    const field = useField()
    const value = String(field?.getValue() ?? "")

    return <MuiTextField
        fullWidth
        size="small"
        variant="outlined"
        label="Primary phone"
        value={value}
        disabled={props.disabled}
        onChange={(event) => field?.setValue(event.target.value)}
        sx={{
            ...muiCustomControlSpacingSx,
            "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                backgroundColor: "#fff",
            },
        }}
    />
}

const SleekMomentumFieldControl = (props: { id?: string, disabled?: boolean }) => {
    const field = useField()
    const value = Number(field?.getValue() ?? 0)

    return <div style={muiSliderShellSx}>
        <MuiSlider
            min={0}
            max={100}
            step={1}
            disabled={props.disabled}
            value={value}
            valueLabelDisplay="auto"
            onChange={(_event, nextValue) => field?.setValue(Array.isArray(nextValue) ? nextValue[0] : nextValue)}
            sx={{
                color: "#7c3aed",
                width: "100%",
                boxSizing: "border-box",
                "& .MuiSlider-thumb": {
                    boxShadow: "0 6px 16px rgba(124, 58, 237, 0.28)",
                },
                "& .MuiSlider-valueLabel": {
                    right: "auto",
                },
            }}
        />
    </div>
}

const SleekEngagementStageControl = () => {
    const field = useField()

    return <FormControl fullWidth size="small" sx={muiCustomControlSpacingSx}>
        <InputLabel id="custom-engagement-stage-label">Engagement stage</InputLabel>
        <Select
            labelId="custom-engagement-stage-label"
            label="Engagement stage"
            value={Number(field?.getValue() ?? 1)}
            onChange={(event) => field?.setValue(event.target.value)}
            sx={{
                borderRadius: 2.5,
                backgroundColor: "#fff",
            }}
        >
            <MenuItem value={1}>New</MenuItem>
            <MenuItem value={2}>Qualified</MenuItem>
            <MenuItem value={3}>Ready</MenuItem>
        </Select>
    </FormControl>
}

const SleekNotesFieldControl = (props: { id?: string, disabled?: boolean }) => {
    const field = useField()
    const value = String(field?.getValue() ?? "")

    return <MuiTextField
        fullWidth
        multiline
        minRows={4}
        variant="outlined"
        label="Narrative notes"
        value={value}
        disabled={props.disabled}
        onChange={(event) => field?.setValue(event.target.value)}
        sx={{
            ...muiCustomControlSpacingSx,
            "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                backgroundColor: "#fff",
            },
        }}
    />
}

interface IXrmStepperTabsProps {
    children?: React.ReactNode
    expandedTab: string
    onTabChange: (tabId: string) => void
    orientation: "horizontal" | "vertical"
}

const XrmStepperTabs = (props: IXrmStepperTabsProps) => {
    const tabs = React.Children.toArray(props.children).filter(React.isValidElement)
    const activeStepIndex = Math.max(tabs.findIndex((tab) => tab.props.id === props.expandedTab), 0)
    const activeTab = tabs.find((tab) => tab.props.id === props.expandedTab) ?? tabs[0] ?? null

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stepper nonLinear orientation={props.orientation} activeStep={activeStepIndex}>
            {tabs.map((tab) => {
                const isActive = tab.props.id === props.expandedTab

                return <Step key={tab.props.id} expanded={props.orientation === "vertical" ? isActive : undefined}>
                    <StepButton color="inherit" onClick={() => props.onTabChange(tab.props.id)}>
                        {tab.props.label || tab.props.id}
                    </StepButton>
                    {props.orientation === "vertical" ? <StepContent>{tab}</StepContent> : null}
                </Step>
            })}
        </Stepper>
        {props.orientation === "horizontal" ? activeTab : null}
    </Stack>
}

interface IXrmDemoEvent {
    id: number
    category: string
    timestamp: string
    message: string
}

const getScenarioFunctionName = () => "onExecuteScenario"

const formatScenarioScript = (scenario: IXrmBusinessFlowScenario) => {
    const functionName = getScenarioFunctionName()

    return [
        `// ${scenario.title}`,
        `// ${scenario.description}`,
        `const ${functionName} = (formContext) => {`,
        `  if (!formContext) return;`,
        ``,
        ...scenario.code.map((line) => `  ${line}`),
        `}`,
        ``,
        `${functionName}(formContext)`,
    ].join("\n")
}

const getEmptyScenarioScript = (scenario: IXrmBusinessFlowScenario) => {
    const functionName = getScenarioFunctionName()

    return [
        `// ${scenario.title}`,
        `const ${functionName} = (formContext) => {`,
        `  if (!formContext) return;`,
        ``,
        `}`,
        ``,
        `${functionName}(formContext)`,
    ].join("\n")
}

type TXrmWorkspaceView = "preview" | "builder" | "data" | "model" | "form-context" | "custom-components"
type TXrmCustomComponentsFlavor = "controls" | "tabs"

interface IXrmModeProps {
    initialView?: TXrmWorkspaceView
    initialCustomComponentsFlavor?: TXrmCustomComponentsFlavor
    initialFormContextScenarioId?: string
    formContextScenarioIds?: string[]
    hideWorkspaceViewPivot?: boolean
    hideCustomComponentsPivot?: boolean
    useStorybookViewport?: boolean
    initialModelEditorMode?: "ui" | "json"
    initialBuilderEditorMode?: "ui" | "xml"
    initialDataEditorMode?: "ui" | "json"
    hideModelEditorModeToggle?: boolean
    hideBuilderEditorModeToggle?: boolean
    hideDataEditorModeToggle?: boolean
    initialShowCustomComponentsCode?: boolean
    initialShowCustomComponentsData?: boolean
    initialShowCustomComponentsXml?: boolean
    initialCustomTabsOrientation?: "horizontal" | "vertical"
    hideCustomTabsOrientationSelector?: boolean
    hideCustomComponentsEditorToggles?: boolean
    hideFormContextScenarioPanel?: boolean
    hideFormContextConsole?: boolean
    showFormContextCodePanel?: boolean
    initialShowPreviewXml?: boolean
}

export const XrmMode = (props: IXrmModeProps) => {
    const [activeView, setActiveView] = useState<TXrmWorkspaceView>(props.initialView ?? "preview")
    const [modelEditorMode, setModelEditorMode] = useState<"ui" | "json">(props.initialModelEditorMode ?? "ui")
    const [xml, setXml] = useState(() => props.initialView === "form-context" ? getFormContextXml() : getCurrentFormXml())
    const [xmlError, setXmlError] = useState<string | null>(null)
    const [json, setJson] = useState(() => serializeRecord(props.initialView === "form-context" ? getFormContextRecord() : getXrmRecord()))
    const [dataEditorMode, setDataEditorMode] = useState<"ui" | "json">(props.initialDataEditorMode ?? "ui")
    const [showPreviewXml, setShowPreviewXml] = useState(props.initialShowPreviewXml ?? false)
    const [modelColumns, setModelColumns] = useModelColumns(props.initialView === "form-context" ? formContextModelStore : xrmModelStore)
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [builderEditorMode, setBuilderEditorMode] = useState<"ui" | "xml">(props.initialBuilderEditorMode ?? "ui")
    const [viewportWidth, setViewportWidth] = useState(960)
    const [builderUndoCount, setBuilderUndoCount] = useState(0)
    const builderUndoRef = useRef<(() => void) | null>(null)
    const [showResetDialog, setShowResetDialog] = useState(false)
    const [previewInstanceKey, setPreviewInstanceKey] = useState(0)
    const [customComponentsPreviewKey, setCustomComponentsPreviewKey] = useState(0)
    const [customTabsPreviewKey, setCustomTabsPreviewKey] = useState(0)
    const [formContext, setFormContext] = useState<IXrmFormContext | null>(null)
    const [activeScenarioId, setActiveScenarioId] = useState<string | null>(props.initialFormContextScenarioId ?? null)
    const [formContextScenarioScripts, setFormContextScenarioScripts] = useState<Record<string, string>>(() => Object.fromEntries(xrmBusinessFlowScenarios.map((scenario) => [scenario.id, formatScenarioScript(scenario)])))
    const [demoEvents, setDemoEvents] = useState<IXrmDemoEvent[]>([])
    const apiRef = useRef<IFormApi | null>(null)
    const customComponentsApiRef = useRef<IFormApi | null>(null)
    const nextEventIdRef = useRef(0)
    const currentRecord = useMemo(() => props.initialView === "form-context" ? getFormContextRecord() : getXrmRecord(), [props.initialView])
    const strategy = useMemo(() => props.initialView === "form-context" ? getFormContextStrategy() : getXrmStrategy(), [props.initialView])
    const customComponentsRecord = useMemo(() => getCustomComponentsRecord(), [])
    const customComponentsStrategy = useMemo(() => getCustomComponentsStrategy(), [])
    const [customComponentsXml, setCustomComponentsXml] = useState(() => getCustomComponentsFormXml())
    const [customComponentsXmlError, setCustomComponentsXmlError] = useState<string | null>(null)
    const [customComponentsJson, setCustomComponentsJson] = useState(() => serializeRecord(customComponentsRecord))
    const [customComponentsJsonError, setCustomComponentsJsonError] = useState<string | null>(null)
    const [showCustomComponentsCode, setShowCustomComponentsCode] = useState(props.initialShowCustomComponentsCode ?? false)
    const [showCustomComponentsData, setShowCustomComponentsData] = useState(props.initialShowCustomComponentsData ?? false)
    const [showCustomComponentsXml, setShowCustomComponentsXml] = useState(props.initialShowCustomComponentsXml ?? false)
    const [customComponentsFlavor, setCustomComponentsFlavor] = useState<TXrmCustomComponentsFlavor>(props.initialCustomComponentsFlavor ?? "controls")
    const [customTabsOrientation, setCustomTabsOrientation] = useState<"horizontal" | "vertical">(props.initialCustomTabsOrientation ?? "horizontal")
    const showAnyCustomComponentsEditor = showCustomComponentsCode || showCustomComponentsData || showCustomComponentsXml
    const customControlIdSet = useMemo(() => new Set<string>(customComponentControlIds), [])
    const visibleFormContextScenarios = useMemo(() => {
        if (!props.formContextScenarioIds || props.formContextScenarioIds.length === 0) {
            return xrmBusinessFlowScenarios
        }

        const allowedScenarioIds = new Set(props.formContextScenarioIds)
        return xrmBusinessFlowScenarios.filter((scenario) => allowedScenarioIds.has(scenario.id))
    }, [props.formContextScenarioIds])
    const customControlComponents = useMemo(() => ({
        control: {
            onRenderControl: (props: { id?: string, disabled?: boolean }) => {
                const controlName = props.id ?? ""

                if (!customControlIdSet.has(controlName)) {
                    return ControlComponents.onRenderControl(props)
                }

                if (controlName === "customLeadName") {
                    return <SleekTextFieldControl {...props} />
                }

                if (controlName === "customWorkspaceUrl") {
                    return <SleekUrlFieldControl {...props} />
                }

                if (controlName === "customPhoneNumber") {
                    return <SleekPhoneFieldControl {...props} />
                }

                if (controlName === "customMomentumScore") {
                    return <SleekMomentumFieldControl {...props} />
                }

                if (controlName === "customEngagementStage") {
                    return <SleekEngagementStageControl />
                }

                if (controlName === "customNotesPanel") {
                    return <SleekNotesFieldControl {...props} />
                }

                return ControlComponents.onRenderControl(props)
            },
        },
    }), [customControlIdSet])
    const activeScenario = useMemo(() => {
        return xrmBusinessFlowScenarios.find((scenario) => scenario.id === activeScenarioId) ?? null
    }, [activeScenarioId])
    const activeScenarioScript = useMemo(() => {
        if (!activeScenario) {
            return [
                "// Select a form context scenario to inspect and edit the runtime script.",
                "// Reapply the scenario to execute the current code in this editor.",
            ].join("\n")
        }

        return formContextScenarioScripts[activeScenario.id] ?? formatScenarioScript(activeScenario)
    }, [activeScenario, formContextScenarioScripts])
    const parsedFormXml = useMemo(() => {
        try {
            return {
                value: parseFormXml(xml),
                error: null as string | null,
            }
        } catch (error) {
            return {
                value: null,
                error: (error as Error).message,
            }
        }
    }, [xml])

    const parsedCustomComponentsFormXml = useMemo(() => {
        try {
            return {
                value: parseFormXml(customComponentsXml),
                error: null as string | null,
            }
        } catch (error) {
            return {
                value: null,
                error: (error as Error).message,
            }
        }
    }, [customComponentsXml])

    useEffect(() => {
        setShowCustomComponentsCode(props.initialShowCustomComponentsCode ?? false)
    }, [props.initialShowCustomComponentsCode])

    useEffect(() => {
        setShowCustomComponentsData(props.initialShowCustomComponentsData ?? false)
    }, [props.initialShowCustomComponentsData])

    useEffect(() => {
        setShowCustomComponentsXml(props.initialShowCustomComponentsXml ?? false)
    }, [props.initialShowCustomComponentsXml])

    useEffect(() => {
        if (props.initialCustomComponentsFlavor) {
            setCustomComponentsFlavor(props.initialCustomComponentsFlavor)
        }
    }, [props.initialCustomComponentsFlavor])

    useEffect(() => {
        if (props.initialCustomTabsOrientation) {
            setCustomTabsOrientation(props.initialCustomTabsOrientation)
        }
    }, [props.initialCustomTabsOrientation])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            try {
                if (!parsedFormXml.value) {
                    throw new Error(parsedFormXml.error ?? "Invalid FormXml")
                }

                setXmlError(null)

                const currentXml = props.initialView === "form-context" ? getFormContextXml() : getCurrentFormXml()

                if (xml === currentXml) {
                    return
                }

                if (props.initialView === "form-context") {
                    setFormContextXml(xml)
                } else {
                    setCurrentFormXml(xml)
                }
                apiRef.current?.refresh()
            } catch (error) {
                setXmlError((error as Error).message)
            }
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [parsedFormXml.error, parsedFormXml.value, props.initialView, xml])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            try {
                if (!parsedCustomComponentsFormXml.value) {
                    throw new Error(parsedCustomComponentsFormXml.error ?? "Invalid FormXml")
                }

                setCustomComponentsXmlError(null)

                if (customComponentsXml === getCustomComponentsFormXml()) {
                    return
                }

                setCustomComponentsFormXml(customComponentsXml)
                customComponentsApiRef.current?.refresh()
                setCustomComponentsPreviewKey((value) => value + 1)
            } catch (error) {
                setCustomComponentsXmlError((error as Error).message)
            }
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [customComponentsXml, parsedCustomComponentsFormXml.error, parsedCustomComponentsFormXml.value])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            try {
                const parsedRecord = JSON.parse(json) as { [key: string]: any }
                const nextSerializedRecord = serializeRecord(parsedRecord)
                const currentSerializedRecord = serializeRecord(currentRecord)

                setJsonError(null)

                if (nextSerializedRecord === currentSerializedRecord) {
                    return
                }

                Object.keys(currentRecord).forEach((key) => {
                    delete currentRecord[key]
                })
                Object.assign(currentRecord, parsedRecord)
                apiRef.current?.refresh()
            } catch (error) {
                setJsonError((error as Error).message)
            }
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [currentRecord, json])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            try {
                const parsedRecord = JSON.parse(customComponentsJson) as { [key: string]: any }
                const nextSerializedRecord = serializeRecord(parsedRecord)
                const currentSerializedRecord = serializeRecord(customComponentsRecord)

                setCustomComponentsJsonError(null)

                if (nextSerializedRecord === currentSerializedRecord) {
                    return
                }

                Object.keys(customComponentsRecord).forEach((key) => {
                    delete customComponentsRecord[key as keyof typeof customComponentsRecord]
                })
                Object.assign(customComponentsRecord, parsedRecord)
                customComponentsApiRef.current?.refresh()
                setCustomComponentsPreviewKey((value) => value + 1)
            } catch (error) {
                setCustomComponentsJsonError((error as Error).message)
            }
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [customComponentsJson, customComponentsRecord])

    const appendDemoEvent = useCallback((category: string, message: string) => {
        setDemoEvents((current) => [
            {
                id: nextEventIdRef.current++,
                category,
                timestamp: getTimestamp(),
                message,
            },
            ...current,
        ].slice(0, maxEventLogEntries))
    }, [])

    useEffect(() => {
        if (!formContext) {
            return
        }

        appendDemoEvent("formContext", "The XrmFormContext instance is ready for subscriptions and runtime mutations.")

        const uiLoadHandler = () => {
            appendDemoEvent("ui.onLoad", "UI onLoad fired.")
        }

        const dataLoadHandler = () => {
            appendDemoEvent("data.onLoad", "Data onLoad fired.")
        }

        const saveHandler: Xrm.Events.SaveEventHandlerAsync = async () => {
            appendDemoEvent("save", `onSave fired for record ${currentRecord.id}.`)
        }

        formContext.ui.addOnLoad(uiLoadHandler)
        formContext.data.addOnLoad(dataLoadHandler)
        formContext.data.entity.addOnSave(saveHandler)

        const tabCleanupFns = ["OverviewTab", "MetricsTab", "SchedulingTab"]
            .map((tabName) => formContext.ui.tabs.get(tabName))
            .filter((tab): tab is NonNullable<typeof tab> => !!tab)
            .map((tab) => {
                const handler = () => {
                    appendDemoEvent("tab", `Tab state change fired for ${tab.getLabel() || tab.getName()} (${tab.getDisplayState()}).`)
                }

                tab.addTabStateChange(handler)

                return () => tab.removeTabStateChange(handler)
            })

        const attributeCleanupFns = formContext.data.attributes.get().map((attribute) => {
            const handler = () => {
                appendDemoEvent("attribute.onChange", `${attribute.getName()} changed to ${JSON.stringify(attribute.getValue())}.`)
            }

            attribute.addOnChange(handler)

            return () => attribute.removeOnChange(handler)
        })

        return () => {
            formContext.ui.removeOnLoad(uiLoadHandler)
            formContext.data.removeOnLoad(dataLoadHandler)
            formContext.data.entity.removeOnSave(saveHandler)
            tabCleanupFns.forEach((cleanup) => cleanup())
            attributeCleanupFns.forEach((cleanup) => cleanup())
        }
    }, [appendDemoEvent, currentRecord.id, formContext])

    useEffect(() => {
        if (!formContext || !activeScenario) {
            return
        }

        const cleanupFns = (activeScenario.validations ?? []).map(({ attributeName, run }) => {
            const attribute = formContext.getAttribute(attributeName)

            if (!attribute) {
                return () => undefined
            }

            const handler = () => {
                run(formContext)
                appendDemoEvent("validation", `Revalidated ${attributeName} after onChange for ${activeScenario.title}.`)
            }

            attribute.addOnChange(handler)

            return () => attribute.removeOnChange(handler)
        })

        return () => {
            cleanupFns.forEach((cleanup) => cleanup())
        }
    }, [activeScenario, appendDemoEvent, formContext])

    const applyScenario = (scenario: IXrmBusinessFlowScenario) => {
        if (!formContext) {
            return
        }

        const scenarioScript = formContextScenarioScripts[scenario.id] ?? scenario.code

        try {
            const runScenario = new Function("formContext", "resetXrmBusinessFlows", scenarioScript) as (formContext: IXrmFormContext, resetXrmBusinessFlows: typeof resetXrmBusinessFlows) => void
            runScenario(formContext, resetXrmBusinessFlows)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            appendDemoEvent("scenario.error", `Scenario script failed for ${scenario.title}: ${message}`)
            console.log("Scenario script failed", { scenarioId: scenario.id, title: scenario.title, message })
            return
        }

        setActiveScenarioId(scenario.id)
        appendDemoEvent("scenario", `Applied ${scenario.title}.`)
    }

    const triggerSaveHandlers = () => {
        if (!formContext) {
            return
        }

        appendDemoEvent("command", "Triggered save through formContext.data.entity.save().")
        void formContext.data.entity.save()
    }

    const resetInteractionPreview = () => {
        const scenarioIdToKeep = activeScenarioId ?? visibleFormContextScenarios[0]?.id ?? null

        if (formContext) {
            resetXrmBusinessFlows(formContext)
        }
        setFormContextScenarioScripts(() => Object.fromEntries(
            xrmBusinessFlowScenarios.map((scenario) => [scenario.id, getEmptyScenarioScript(scenario)])
        ))
        setActiveScenarioId(scenarioIdToKeep)
        setFormContext(null)
        setDemoEvents([])
        nextEventIdRef.current = 0
        apiRef.current = null
        setPreviewInstanceKey((value) => value + 1)
    }

    const clearConsole = () => {
        setDemoEvents([])
        nextEventIdRef.current = 0
    }

    const resetBuilderView = () => {
        const nextXml = createEmptyFormXml()
        setCurrentFormXml(nextXml)
        setXml(nextXml)
        setXmlError(null)
        setBuilderEditorMode("ui")
        setBuilderUndoCount(0)
        builderUndoRef.current = null
        apiRef.current?.refresh()
        setPreviewInstanceKey((value) => value + 1)
        setShowResetDialog(false)
    }

    const undoBuilderChange = () => {
        builderUndoRef.current?.()
    }

    const copyFormXml = async () => {
        await navigator.clipboard.writeText(xml)
        console.log("FormXml copied", { xml })
    }

    const commandBarItems = useMemo<ICommandBarItemProps[]>(() => {
        if (activeView === "preview") {
            return []
        }

        if (activeView === "builder") {
            return [
                {
                    key: "copy-form-xml",
                    text: "Copy FormXml",
                    iconProps: { iconName: "Copy" },
                    onClick: () => {
                        void copyFormXml()
                    },
                },
                {
                    key: "undo-builder",
                    text: "Undo",
                    iconProps: { iconName: "Undo" },
                    disabled: builderUndoCount === 0,
                    onClick: undoBuilderChange,
                },
                {
                    key: "reset-builder",
                    text: "Reset",
                    iconProps: { iconName: "Refresh" },
                    onClick: () => setShowResetDialog(true),
                },
            ]
        }

        if (activeView === "model") {
            return [
                {
                    key: "copy-model-json",
                    text: "Copy model JSON",
                    iconProps: { iconName: "Copy" },
                    onClick: async () => {
                        await navigator.clipboard.writeText(JSON.stringify(modelColumns, null, 2))
                        console.log("Model copied", { modelColumns })
                    },
                },
            ]
        }

        if (activeView === "form-context") {
            return [
                {
                    key: "run-form-context-code",
                    text: "Run code",
                    iconProps: { iconName: "Play" },
                    disabled: !formContext || !activeScenario,
                    onClick: () => {
                        if (!activeScenario) {
                            return
                        }

                        applyScenario(activeScenario)
                    },
                },
                {
                    key: "remount-form-context-form",
                    text: "Clear",
                    iconProps: { iconName: "Refresh" },
                    onClick: resetInteractionPreview,
                },
            ]
        }

        return []
    }, [activeScenario, activeView, applyScenario, builderEditorMode, builderUndoCount, formContext, modelColumns, resetInteractionPreview, viewportWidth])

    const commandBarControls = useMemo<React.ReactNode>(() => {
        if (activeView === "preview") {
            return <Toggle
                label="FormXml"
                inlineLabel
                checked={showPreviewXml}
                onChange={(_event, checked) => setShowPreviewXml(!!checked)}
                styles={{ root: styles.toolbarToggle }}
            />
        }

        if (activeView === "builder" && !props.hideBuilderEditorModeToggle) {
            return <Toggle
                label="Builder mode"
                inlineLabel
                onText="XML"
                offText="Visual builder"
                checked={builderEditorMode === "xml"}
                onChange={(_event, checked) => setBuilderEditorMode(checked ? "xml" : "ui")}
                styles={{ root: styles.toolbarToggle }}
            />
        }

        if (activeView === "model" && !props.hideModelEditorModeToggle) {
            return <Toggle
                label=""
                onText="JSON"
                offText="Guided UI"
                checked={modelEditorMode === "json"}
                onChange={(_event, checked) => setModelEditorMode(checked ? "json" : "ui")}
                styles={{ root: styles.toolbarToggle }}
            />
        }

        if (activeView === "data" && !props.hideDataEditorModeToggle) {
            return <Toggle
                label="Data mode"
                inlineLabel
                onText="Editor"
                offText="Graphical"
                checked={dataEditorMode === "json"}
                onChange={(_event, checked) => setDataEditorMode(checked ? "json" : "ui")}
                styles={{ root: styles.toolbarToggle }}
            />
        }

        return null
    }, [activeView, builderEditorMode, dataEditorMode, modelEditorMode, props.hideBuilderEditorModeToggle, props.hideDataEditorModeToggle, props.hideModelEditorModeToggle, showPreviewXml])

    return <>
        <div className={styles.modeLayout}>
            <Stack className={styles.fillCard}>
                {!props.hideWorkspaceViewPivot && <Pivot
                    className={styles.workspaceTabsBody}
                    selectedKey={activeView}
                    overflowBehavior="menu"
                    overflowAriaLabel="More workspace views"
                    onLinkClick={(item) => {
                        const nextView = item?.props.itemKey as TXrmWorkspaceView | undefined
                        if (nextView) {
                            setActiveView(nextView)
                        }
                    }}
                >
                    <PivotItem itemKey="preview" headerText="Preview" />
                    <PivotItem itemKey="data" headerText="Data" />
                    <PivotItem itemKey="model" headerText="Model" />
                    <PivotItem itemKey="builder" headerText="Builder" />
                    <PivotItem itemKey="custom-components" headerText="Custom components" />
                    <PivotItem itemKey="form-context" headerText="Form context" />
                </Pivot>}

                {(commandBarItems.length > 0 || commandBarControls) && (
                    <div className={styles.commandBarBody}>
                        <div className={styles.commandBarMain}>
                            <CommandBar
                                items={commandBarItems}
                                styles={{
                                    root: { width: "100%" },
                                }}
                            />
                        </div>
                        {commandBarControls && <div className={styles.commandBarControls}>{commandBarControls}</div>}
                    </div>
                )}

                {activeView === "model" && (
                    <div className={`${styles.cardBody} ${styles.fillBody}`}>
                        <ModelBuilderPanel
                            columns={modelColumns}
                            editorMode={modelEditorMode}
                            onEditorModeChange={setModelEditorMode}
                            onChange={setModelColumns}
                        />
                    </div>
                )}

                {activeView === "preview" && (
                    <div className={`${styles.cardBody} ${styles.fillBody}`}>
                        {!props.useStorybookViewport && <div className={styles.viewportToolbar}>
                            <Slider
                                label="Viewport width"
                                styles={{
                                    root: { width: "100%", margin: 0 },
                                    slideBox: { width: "100%" },
                                }}
                                min={320}
                                max={1440}
                                step={10}
                                value={viewportWidth}
                                showValue
                                valueFormat={(value) => `${value}px`}
                                onChange={setViewportWidth}
                            />
                        </div>}
                        {!showPreviewXml && (
                            <div className={styles.fullScreenSurface}>
                                <div className={styles.previewSurface}>
                                    <div className={styles.viewportWindow} style={{ width: props.useStorybookViewport ? '100%' : `${viewportWidth}px` }}>
                                        <XrmForm
                                            key={previewInstanceKey}
                                            strategy={strategy}
                                            onAfterSave={({ success }) => {
                                                const currentData = apiRef.current?.getData()
                                                console.log(success ? "Form saved" : "Save failed", { success, currentData })
                                                setJson(serializeRecord(currentRecord))
                                            }}
                                            onFormReady={(params) => {
                                                apiRef.current = params.api
                                                setFormContext(params.formContext)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {showPreviewXml && (
                            <>
                                <div className={styles.editorSurface}>
                                    <FormXmlEditor value={xml} onChange={setXml} />
                                </div>
                                {xmlError && (
                                    <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                        <pre className="toast-details">{xmlError}</pre>
                                    </MessageBar>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeView === "builder" && (
                    <div className={`${styles.cardBody} ${styles.scrollBody}`}>
                        {!props.useStorybookViewport && <div className={styles.viewportToolbar}>
                            <Slider
                                label="Viewport width"
                                styles={{
                                    root: { width: "100%", margin: 0 },
                                    slideBox: { width: "100%" },
                                }}
                                min={320}
                                max={1440}
                                step={10}
                                value={viewportWidth}
                                showValue
                                valueFormat={(value) => `${value}px`}
                                onChange={setViewportWidth}
                            />
                        </div>}
                        {xmlError && (
                            <MessageBar messageBarType={MessageBarType.warning} isMultiline>
                                Fix the raw FormXml first to re-enable graphical editing.
                            </MessageBar>
                        )}
                        {builderEditorMode === "ui" ? (
                            <div className={styles.builderViewportShell}>
                                <div className={styles.builderViewportWindow} style={{ width: props.useStorybookViewport ? '100%' : `${viewportWidth}px` }}>
                                    <FormXmlBuilderPanel
                                        formXmlText={xml}
                                        parsedFormXml={parsedFormXml.value}
                                        builderError={parsedFormXml.error}
                                        onFormXmlTextChange={setXml}
                                        onUndoStackChange={(count, undo) => {
                                            setBuilderUndoCount(count)
                                            builderUndoRef.current = undo
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.editorSurface}>
                                    <FormXmlEditor value={xml} onChange={setXml} />
                                </div>
                                {xmlError && (
                                    <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                        <pre className="toast-details">{xmlError}</pre>
                                    </MessageBar>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeView === "data" && (
                    <div className={`${styles.cardBody} ${styles.fillBody}`}>
                        {dataEditorMode === "ui" ? (
                            <XrmRecordBuilderPanel
                                columns={modelColumns}
                                record={currentRecord}
                                onChange={(nextRecord) => {
                                    Object.keys(currentRecord).forEach((key) => {
                                        delete currentRecord[key]
                                    })
                                    Object.assign(currentRecord, nextRecord)
                                    setJson(serializeRecord(nextRecord))
                                    setJsonError(null)
                                    apiRef.current?.refresh()
                                }}
                            />
                        ) : (
                            <div className={styles.editorSurface}>
                                <RecordDataEditor value={json} onChange={setJson} />
                            </div>
                        )}
                        {jsonError && (
                            <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                <pre className="toast-details">{jsonError}</pre>
                            </MessageBar>
                        )}
                    </div>
                )}

                {activeView === "custom-components" && (
                    <div className={styles.formContextBody}>
                        {!props.hideCustomComponentsPivot && <Pivot
                            className={styles.workspaceTabsBody}
                            selectedKey={customComponentsFlavor}
                            overflowBehavior="menu"
                            overflowAriaLabel="More custom component demos"
                            onLinkClick={(item) => {
                                const nextFlavor = item?.props.itemKey as TXrmCustomComponentsFlavor | undefined
                                if (nextFlavor) {
                                    setCustomComponentsFlavor(nextFlavor)
                                }
                            }}
                        >
                            <PivotItem itemKey="controls" headerText="Custom controls" />
                            <PivotItem itemKey="tabs" headerText="Custom tabs" />
                        </Pivot>}
                        {!props.hideCustomComponentsEditorToggles && <div>
                            <Toggle
                                label="Code"
                                inlineLabel
                                checked={showCustomComponentsCode}
                                onChange={(_event, checked) => setShowCustomComponentsCode(!!checked)}
                                styles={{ root: { marginBottom: 0 } }}
                            />
                            <Toggle
                                label="Data"
                                inlineLabel
                                checked={showCustomComponentsData}
                                onChange={(_event, checked) => setShowCustomComponentsData(!!checked)}
                                styles={{ root: { marginBottom: 0 } }}
                            />
                            <Toggle
                                label="FormXml"
                                inlineLabel
                                checked={showCustomComponentsXml}
                                onChange={(_event, checked) => setShowCustomComponentsXml(!!checked)}
                                styles={{ root: { marginBottom: 0 } }}
                            />
                        </div>}
                        <div className={`${styles.showcaseLayout} ${!showAnyCustomComponentsEditor ? styles.showcaseLayoutExpanded : ""}`.trim()}>
                            <Stack className={styles.showcaseColumn}>
                                <Stack className={`${styles.card} ${styles.showcasePreviewCard} ${!showAnyCustomComponentsEditor ? styles.showcasePreviewCardExpanded : ""}`.trim()}>
                                    <Stack tokens={{ childrenGap: 16 }} className={styles.cardBody}>
                                        {customComponentsFlavor === "controls" ? undefined : !props.hideCustomTabsOrientationSelector && (
                                            <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center" wrap>
                                                <Text variant="small">Tabs orientation</Text>
                                                <ComboBox
                                                    selectedKey={customTabsOrientation}
                                                    options={[
                                                        { key: "horizontal", text: "Horizontal" },
                                                        { key: "vertical", text: "Vertical" },
                                                    ]}
                                                    onChange={(_event, option) => {
                                                        const nextOrientation = option?.key
                                                        if (nextOrientation === "horizontal" || nextOrientation === "vertical") {
                                                            setCustomTabsOrientation(nextOrientation)
                                                        }
                                                    }}
                                                />
                                            </Stack>
                                        )}
                                        <div className={styles.previewSurface}>
                                            <div className={styles.viewportWindow} style={{ width: "100%" }}>
                                                {customComponentsFlavor === "controls" ? (
                                                    <XrmForm
                                                        key={customComponentsPreviewKey}
                                                        strategy={customComponentsStrategy}
                                                        components={customControlComponents}
                                                        onFormReady={({ api }) => {
                                                            customComponentsApiRef.current = api
                                                        }}
                                                    />
                                                ) : (
                                                    <XrmForm
                                                        key={`${customTabsPreviewKey}-${customTabsOrientation}`}
                                                        strategy={customComponentsStrategy}
                                                        components={{
                                                            tabs: {
                                                                onRenderTabs: (tabsProps) => (
                                                                    <XrmStepperTabs
                                                                        {...tabsProps}
                                                                        orientation={customTabsOrientation}
                                                                    />
                                                                ),
                                                            },
                                                        }}
                                                        onFormReady={({ api }) => {
                                                            customComponentsApiRef.current = api
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </Stack>
                                </Stack>
                            </Stack>

                            {showAnyCustomComponentsEditor && <Stack className={styles.editorsColumn}>
                                {showCustomComponentsCode && <Stack className={`${styles.card} ${styles.showcaseEditorCard}`.trim()}>
                                    <Stack tokens={{ childrenGap: 16 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                                        <div className={styles.editorSurface}>
                                            <XrmComponentsCodeEditor value={customComponentsFlavor === "controls" ? customComponentsSnippet : xrmStepperTabsSnippet} />
                                        </div>
                                    </Stack>
                                </Stack>}

                                {showCustomComponentsData && <Stack className={`${styles.card} ${styles.showcaseEditorCard}`.trim()}>
                                    <Stack tokens={{ childrenGap: 16 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                                        <div className={styles.editorSurface}>
                                            <RecordDataEditor value={customComponentsJson} onChange={setCustomComponentsJson} />
                                        </div>
                                        {customComponentsJsonError && (
                                            <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                                <pre className="toast-details">{customComponentsJsonError}</pre>
                                            </MessageBar>
                                        )}
                                    </Stack>
                                </Stack>}

                                {showCustomComponentsXml && <Stack className={`${styles.card} ${styles.showcaseEditorCard}`.trim()}>
                                    <Stack tokens={{ childrenGap: 16 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                                        <div className={styles.editorSurface}>
                                            <FormXmlEditor value={customComponentsXml} onChange={setCustomComponentsXml} />
                                        </div>
                                        {customComponentsXmlError && (
                                            <MessageBar className={styles.editorStatus} messageBarType={MessageBarType.error} isMultiline>
                                                <pre className="toast-details">{customComponentsXmlError}</pre>
                                            </MessageBar>
                                        )}
                                    </Stack>
                                </Stack>}
                            </Stack>}
                        </div>
                    </div>
                )}

                {activeView === "form-context" && (
                    <div className={styles.formContextBody}>
                        <div className={styles.formContextLayout}>
                            <div className={styles.previewColumn}>
                                <div className={styles.previewSurface}>
                                    <div className={styles.viewportWindow} style={{ width: props.useStorybookViewport ? '100%' : `${viewportWidth}px` }}>
                                        <XrmForm
                                            key={previewInstanceKey}
                                            strategy={strategy}
                                            onAfterSave={({ success }) => {
                                                const currentData = apiRef.current?.getData()
                                                console.log(success ? "Form saved" : "Save failed", { success, currentData })
                                                setJson(serializeRecord(currentRecord))
                                            }}
                                            onFormReady={(params) => {
                                                apiRef.current = params.api
                                                setFormContext(params.formContext)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Stack className={styles.editorsColumn}>
                                {props.showFormContextCodePanel && (
                                    <Stack className={styles.card}>
                                        <Stack tokens={{ childrenGap: 16 }} className={`${styles.cardBody} ${styles.fillBody}`.trim()}>
                                            <div className={styles.editorSurface}>
                                                <XrmComponentsCodeEditor
                                                    value={activeScenarioScript}
                                                    label="Scenario script"
                                                    language="javascript"
                                                    path="file:///sandbox/xrm-form-context-scenario.js"
                                                    height="520px"
                                                    kind="form-context"
                                                    readOnly={false}
                                                    onChange={(value) => {
                                                        if (!activeScenario) {
                                                            return
                                                        }

                                                        setFormContextScenarioScripts((current) => ({
                                                            ...current,
                                                            [activeScenario.id]: value,
                                                        }))
                                                    }}
                                                />
                                            </div>
                                        </Stack>
                                    </Stack>
                                )}

                                {!props.hideFormContextConsole && (
                                    <Stack className={styles.card}>
                                        <Stack tokens={{ childrenGap: 16 }} className={styles.cardBody}>
                                            <div className={styles.consoleWindow}>
                                                <div className={styles.consoleToolbar}>
                                                    <Stack tokens={{ childrenGap: 2 }}>
                                                        <Text variant="medium" className={styles.consoleTitle}>
                                                            formContext console
                                                        </Text>
                                                        <Text variant="small" className={styles.consoleHint}>
                                                            {demoEvents.length} event{demoEvents.length === 1 ? "" : "s"} captured
                                                        </Text>
                                                    </Stack>
                                                    <DefaultButton
                                                        text="Clear console"
                                                        onClick={clearConsole}
                                                    />
                                                </div>
                                                <div className={`${styles.consoleBody} ${styles.eventLog}`.trim()}>
                                                    {demoEvents.length === 0 ? (
                                                        <Text variant="small" className={styles.consoleEmpty}>
                                                            No events yet. Switch tabs in the preview, edit a field, apply a preset, or trigger save.
                                                        </Text>
                                                    ) : (
                                                        <>
                                                            {demoEvents.map((event) => (
                                                                <div key={event.id} className={styles.eventLogItem}>
                                                                    <Text variant="xSmall" className={styles.eventLogMeta}>
                                                                        [{event.timestamp}] {event.category}
                                                                    </Text>
                                                                    <Text variant="small" className={styles.eventLogText}>{event.message}</Text>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Stack>
                                    </Stack>
                                )}
                            </Stack>
                        </div>
                    </div>
                )}
            </Stack>
        </div>

        <Dialog
            hidden={!showResetDialog}
            onDismiss={() => setShowResetDialog(false)}
            dialogContentProps={{
                type: DialogType.normal,
                title: "Reset builder",
                subText: "This will delete all current FormXml changes in the builder and start from a new blank layout.",
            }}
        >
            <DialogFooter>
                <PrimaryButton text="Reset" onClick={resetBuilderView} />
                <DefaultButton text="Cancel" onClick={() => setShowResetDialog(false)} />
            </DialogFooter>
        </Dialog>
    </>
}
