import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmComponentsCodeEditor } from '../../form/xrm-form/XrmComponentsCodeEditor'
import { XrmCustomComponentsLivePreview } from './XrmCustomComponentsLivePreview'
import { ExampleRunner, renderStory } from './storyHelpers'

interface IXrmCustomComponentsExample {
    id: string
    title: string
    summary: string
    notes: string[]
    code: string
}

const customComponentsExamples: IXrmCustomComponentsExample[] = [
    {
        id: 'controls',
        title: 'Replace control presentation',
        summary: 'Swap selected Xrm control rendering with custom React while keeping the Xrm runtime and FormXml-driven structure intact.',
        notes: [
            'Use this when specific Xrm controls need a tailored visual treatment.',
            'The form remains model-driven; only the rendered control presentation changes.',
        ],
        code: `const strategy = new XrmMemoryStrategy({
  onGetData: () => getCustomComponentsRecord(),
  onGetColumns: () => xrmCustomComponentsModelStore.getRuntimeColumns(),
  onGetMetadata: () => formMetadata,
  onGetFormXml: () => getCustomComponentsFormXml(),
});

const customControlIds = new Set(["customLeadName", "customPhoneNumber", "customEngagementStage", "customMomentumScore", "customWorkspaceUrl", "customNotesPanel"]);

const LeadNameControl = () => {
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

const PhoneNumberControl = () => {
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

const WorkspaceUrlControl = () => {
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
};

const MomentumScoreControl = () => {
  const field = useField();
  const value = Number(field?.getValue() ?? 0);

  return (
    <MuiSlider
      min={0}
      max={100}
      step={1}
      value={value}
      onChange={(_event, nextValue) => field?.setValue(nextValue)}
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

const NotesControl = () => {
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
};

const XrmCustomComponentsExample = () => {
  return (
    <XrmForm
      strategy={strategy}
      components={{
        control: {
          onRenderControl: (props) => {
            const controlName = props.id ?? "";

            if (!customControlIds.has(controlName)) {
              return ControlComponents.onRenderControl(props);
            }

            if (controlName === "customLeadName") {
              return <LeadNameControl />;
            }

            if (controlName === "customPhoneNumber") {
              return <PhoneNumberControl />;
            }

            if (controlName === "customWorkspaceUrl") {
              return <WorkspaceUrlControl />;
            }

            if (controlName === "customMomentumScore") {
              return <MomentumScoreControl />;
            }

            if (controlName === "customEngagementStage") {
              return <EngagementStageControl />;
            }

            if (controlName === "customNotesPanel") {
              return <NotesControl />;
            }

            return ControlComponents.onRenderControl(props);
          },
        },
      }}
    />
  );
};`,
    },
    {
        id: 'tabs',
        title: 'Replace the tabs renderer',
        summary: 'Swap the default Xrm tabs presentation for a custom tabs shell while keeping the same underlying runtime-driven tab content.',
        notes: [
            'The example keeps the orientation switch inside the rendered preview, matching the React compose tabs demo.',
            'The code view isolates the custom tabs implementation without showing extra data or FormXml panels.',
        ],
        code: `const strategy = new XrmMemoryStrategy({
  onGetData: () => getCustomComponentsRecord(),
  onGetColumns: () => xrmCustomComponentsModelStore.getRuntimeColumns(),
  onGetMetadata: () => formMetadata,
  onGetFormXml: () => getCustomComponentsFormXml(),
});

function XrmStepperTabs(props) {
  const { children, expandedTab, onTabChange, orientation } = props;
  const tabs = React.Children.toArray(children).filter(React.isValidElement);
  const activeTab = tabs.find((tab) => tab.props.id === expandedTab) ?? tabs[0] ?? null;
  const activeStepIndex = Math.max(tabs.findIndex((tab) => tab.props.id === expandedTab), 0);

  return (
    <Stack tokens={{ childrenGap: 12 }}>
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
    </Stack>
  );
}

const XrmCustomComponentsExample = () => {
  const [orientation, setOrientation] = React.useState("horizontal");

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center" wrap>
        <Text variant="small">Tabs orientation</Text>
        <ComboBox
          selectedKey={orientation}
          options={[
            { key: "horizontal", text: "Horizontal" },
            { key: "vertical", text: "Vertical" },
          ]}
          onChange={(_event, option) => {
            if (option?.key) {
              setOrientation(String(option.key));
            }
          }}
        />
      </Stack>

      <XrmForm
        key={orientation}
        strategy={strategy}
        components={{
          tabs: {
            onRenderTabs: (tabsProps) => <XrmStepperTabs {...tabsProps} orientation={orientation} />,
          },
        }}
      />
    </Stack>
  );
};`,
    },
    {
        id: 'ribbon',
        title: 'Replace the ribbon renderer',
        summary: 'Swap the default command bar shell with a fully native Material UI toolbar, wiring Save directly to formContext.data.save().',
        notes: [
            'Use this when the host application renders the rest of its UI in Material UI and wants a real MUI Button, not the runtime-supplied Fluent Save button.',
            'The runtime-supplied "save" item (and its commandBarButtonAs renderer) is ignored entirely; only the "unsaved-changes" far item is read, to drive the dirty-state chip.',
        ],
        code: `const strategy = new XrmMemoryStrategy({
  onGetData: () => getCustomComponentsRecord(),
  onGetColumns: () => xrmCustomComponentsModelStore.getRuntimeColumns(),
  onGetMetadata: () => formMetadata,
  onGetFormXml: () => getCustomComponentsFormXml(),
});

function MaterialRibbon(props) {
  const { farItems = [], onSave } = props;
  const unsavedItem = farItems.find((item) => item.key === "unsaved-changes");

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderRadius: 2, mb: 2 }}>
      <Toolbar variant="dense" sx={{ justifyContent: "space-between", gap: 1 }}>
        <MuiButton variant="contained" size="small" onClick={onSave}>
          Save
        </MuiButton>
        {unsavedItem && <Chip label={unsavedItem.text} color="warning" size="small" variant="outlined" />}
      </Toolbar>
    </AppBar>
  );
}

const XrmCustomComponentsExample = () => {
  const [formContext, setFormContext] = React.useState(null);

  return (
    <XrmForm
      strategy={strategy}
      onFormReady={({ formContext: nextFormContext }) => setFormContext(nextFormContext)}
      components={{
        ribbon: {
          onRenderCommandBar: (commandBarProps) => (
            <MaterialRibbon {...commandBarProps} onSave={() => formContext?.data.save()} />
          ),
        },
      }}
    />
  );
};`,
    },
    {
        id: 'notifications',
        title: 'Replace the notifications renderer',
        summary: 'Swap the default notifications list with dismissable, self-clearing Material UI Snackbars while notifications are still raised through the standard formContext.ui API.',
        notes: [
            'Use this when the host application renders the rest of its UI in Material UI and wants form notifications to match, stacked as toasts instead of an inline list.',
            'Each toast auto-hides after 6 seconds and can also be dismissed early via its close button; dismissal is local to this renderer, not a call back into the runtime.',
            'The buttons in this example call formContext.ui.setFormNotification to raise notifications, exactly like a form script would.',
        ],
        code: `const strategy = new XrmMemoryStrategy({
  onGetData: () => getCustomComponentsRecord(),
  onGetColumns: () => xrmCustomComponentsModelStore.getRuntimeColumns(),
  onGetMetadata: () => formMetadata,
  onGetFormXml: () => getCustomComponentsFormXml(),
});

function MaterialNotifications(props) {
  const { messages = [] } = props;
  const [dismissed, setDismissed] = React.useState({});

  const severityByLevel = {
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  };

  const dismiss = (key) => {
    setDismissed((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <>
      {messages.map((message, index) => {
        const key = \`\${index}-\${message.text}\`;

        if (dismissed[key]) {
          return null;
        }

        return (
          <Snackbar
            key={key}
            open
            autoHideDuration={6000}
            onClose={(_event, reason) => reason !== "clickaway" && dismiss(key)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ bottom: \`\${16 + index * 64}px !important\` }}
          >
            <Alert
              severity={severityByLevel[message.level] ?? "info"}
              variant="filled"
              onClose={() => dismiss(key)}
              sx={{ width: "100%" }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
}

const XrmCustomComponentsExample = () => {
  const [formContext, setFormContext] = React.useState(null);

  const addNotification = (level) => {
    const uniqueId = \`custom-\${level}-\${Date.now()}\`;
    formContext?.ui.setFormNotification(\`Custom \${level.toLowerCase()} notification\`, level, uniqueId);
  };

  return (
    <MuiStack spacing={2}>
      <MuiStack direction="row" spacing={1}>
        <MuiButton variant="contained" onClick={() => addNotification("INFO")}>Add info</MuiButton>
        <MuiButton variant="outlined" color="warning" onClick={() => addNotification("WARNING")}>Add warning</MuiButton>
        <MuiButton variant="outlined" color="error" onClick={() => addNotification("ERROR")}>Add error</MuiButton>
      </MuiStack>

      <XrmForm
        strategy={strategy}
        onFormReady={({ formContext: nextFormContext }) => setFormContext(nextFormContext)}
        components={{
          notifications: {
            onRenderNotifications: (notificationsProps) => <MaterialNotifications {...notificationsProps} />,
          },
        }}
      />
    </MuiStack>
  );
};`,
    },
]

const renderCustomComponentsExample = (example: IXrmCustomComponentsExample) => {
    const [code, setCode] = React.useState(example.code)
    const [compileError, setCompileError] = React.useState<string | null>(null)

    return (
        <ExampleRunner
            error={compileError}
            renderPreview={() => <XrmCustomComponentsLivePreview code={code} onError={setCompileError} />}
            renderCode={() => (
                <XrmComponentsCodeEditor
                    value={code}
                    onChange={setCode}
                    readOnly={false}
                    label=""
                    kind="components"
                    height="640px"
                />
            )}
        />
    )
}

const meta = {
    title: 'Form/Xrm/Custom Components',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
Replace parts of the Xrm rendering with your own components while the layout stays driven by FormXml.

These stories keep the same FormXml-driven structure and \`formContext\` surface; only the rendering of selected pieces changes.

> Some stories below use Material UI purely to demonstrate that presentation is fully swappable, not because it's the recommended choice. To keep a form visually coherent, prefer sticking to Fluent UI where possible — that's what the rest of the runtime renders with.

## What you can replace

- **Control presentation** — swap the rendered UI for selected Xrm controls without touching the rest of the form.
- **Tabs shell** — replace the tabs renderer with a custom stepper, wizard, or other navigation shell while tab state and content stay runtime-driven.
- **Ribbon** — replace the command bar shell with a custom toolbar while the Save button and dirty-state behavior stay runtime-driven.
- **Notifications** — replace the notifications list with a custom renderer while notifications are still raised through \`formContext.ui.setFormNotification\`.

Each story runs its own isolated form instance and opens directly in the live preview for that scenario.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const samplesById = Object.fromEntries(customComponentsExamples.map((sample) => [sample.id, sample])) as Record<string, IXrmCustomComponentsExample>

export const ReplaceControlPresentation: Story = {
    name: 'Replace control presentation',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Swaps selected Xrm controls with custom React renderers while keeping the same formContext-driven behavior and FormXml layout.

- targets individual controls without replacing the whole form shell
- keeps the Xrm runtime contract intact
- focuses on tailored field visuals for selected controls
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById.controls)),
}

export const ReplaceTabsRenderer: Story = {
    name: 'Replace the tabs renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Replaces the default tabs shell with a custom stepper-based renderer while preserving the same runtime-backed tab content and navigation.

- swaps only the tabs presentation layer
- keeps tab state and content driven by the Xrm runtime
- supports switching between horizontal and vertical orientations
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById.tabs)),
}

export const ReplaceRibbonRenderer: Story = {
    name: 'Replace the ribbon renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Replaces the default command bar shell with a native Material UI toolbar, wiring Save directly to \`formContext.data.save()\` instead of the runtime-supplied Fluent button.

- swaps the ribbon presentation layer for real MUI components (AppBar, Toolbar, Button, Chip)
- ignores the runtime's \`commandBarButtonAs\` renderer entirely; Save is a plain MUI \`Button\`
- still reads the "unsaved-changes" far item to drive a dirty-state \`Chip\`
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById.ribbon)),
}

export const ReplaceNotificationsRenderer: Story = {
    name: 'Replace the notifications renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Replaces the default notifications list with dismissable, self-clearing Material UI \`Snackbar\`/\`Alert\` toasts, driven by \`formContext.ui.setFormNotification\`.

- swaps the notifications presentation layer for real MUI components (\`Snackbar\`, \`Alert\`)
- each toast auto-hides after 6 seconds or can be dismissed early via its close button
- includes buttons to add info/warning/error notifications so you can see the custom renderer react live
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderCustomComponentsExample(samplesById.notifications)),
}
