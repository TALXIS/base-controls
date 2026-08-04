import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Text, getTheme, mergeStyleSets } from '@fluentui/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { renderStory } from './storyHelpers'

const theme = getTheme()

const styles = mergeStyleSets({
    page: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        borderBottom: `1px solid ${theme.palette.neutralLight}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    sectionBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    bullets: {
        margin: 0,
        paddingLeft: 20,
    },
    exampleHeader: {
        borderBottom: `1px solid ${theme.palette.neutralLighter}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
    },
    exampleCopy: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0,
        flex: 1,
    },
    exampleBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    previewFrame: {
        minHeight: 420,
        width: '100%',
        overflow: 'hidden',
    },
    viewportWindow: {
        width: '100%',
    },
})

interface IXrmCustomComponentsExample {
    id: string
    title: string
    summary: string
    notes: string[]
    code: string
    render: () => React.ReactNode
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
        code: `import { XrmForm } from "@talxis/base-controls/components/Form";
import { ControlComponents } from "@talxis/base-controls/components/Form/components/adapters/control";
import { FormControl, Slider as MuiSlider, TextField as MuiTextField } from "@mui/material";

const customControlIdSet = new Set(["customLeadName", "customPhoneNumber", "customEngagementStage", "customMomentumScore", "customWorkspaceUrl", "customNotesPanel"]);

const customControlComponents = {
  control: {
    onRenderControl: (props) => {
      const controlName = props.id ?? "";

      if (!customControlIdSet.has(controlName)) {
        return ControlComponents.onRenderControl(props);
      }

      if (controlName === "customLeadName") {
        return <MuiTextField fullWidth size="small" variant="outlined" label="Lead name" />;
      }

      if (controlName === "customPhoneNumber") {
        return <MuiTextField fullWidth size="small" variant="outlined" label="Primary phone" />;
      }

      if (controlName === "customWorkspaceUrl") {
        return <MuiTextField fullWidth size="small" variant="outlined" label="Workspace URL" />;
      }

      if (controlName === "customMomentumScore") {
        return <MuiSlider value={72} />;
      }

      if (controlName === "customEngagementStage") {
        return <FormControl fullWidth size="small">...</FormControl>;
      }

      return ControlComponents.onRenderControl(props);
    },
  },
};

<XrmForm strategy={strategy} components={customControlComponents} />`,
        render: () => (
            <XrmMode
                initialView="custom-components"
                initialCustomComponentsFlavor="controls"
                initialShowCustomComponentsData={false}
                initialShowCustomComponentsXml={false}
                hideWorkspaceViewPivot
                hideCustomComponentsPivot
                hideCustomTabsOrientationSelector
                hideCustomComponentsEditorToggles
                useStorybookViewport
            />
        ),
    },
    {
        id: 'tabs',
        title: 'Replace the tabs renderer',
        summary: 'Swap the default Xrm tabs presentation for a custom tabs shell while keeping the same underlying runtime-driven tab content.',
        notes: [
            'The example keeps the orientation switch inside the rendered preview, matching the React compose tabs demo.',
            'The code view isolates the custom tabs implementation without showing extra data or FormXml panels.',
        ],
        code: `import React from "react";
import { ComboBox, Stack, Text } from "@fluentui/react";
import { Step, StepButton, StepContent, Stepper } from "@mui/material";
import { XrmForm } from "@talxis/base-controls/components/Form";

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

const [orientation, setOrientation] = React.useState("horizontal");

<>
  <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
    <Text>Tabs orientation</Text>
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
    strategy={strategy}
    components={{
      tabs: {
        onRenderTabs: (tabsProps) => <XrmStepperTabs {...tabsProps} orientation={orientation} />,
      },
    }}
  />
</>`,
        render: () => (
            <XrmMode
                initialView="custom-components"
                initialCustomComponentsFlavor="tabs"
                initialCustomTabsOrientation="horizontal"
                initialShowCustomComponentsData={false}
                initialShowCustomComponentsXml={false}
                hideWorkspaceViewPivot
                hideCustomComponentsPivot
                hideCustomTabsOrientationSelector={false}
                hideCustomComponentsEditorToggles
                useStorybookViewport
            />
        ),
    },
]

const meta = {
    title: 'Form/Xrm/Custom Components',
    tags: ['autodocs'],
    name: 'Overview',
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
            controls: { disable: true },
            description: {
                component: `
These stories show common ways to customize Xrm presentation while keeping the FormXml-driven runtime in place.

- Replace control presentation for selected Xrm controls.
- Replace the tabs renderer with a custom tabs shell.

Each story keeps its own isolated form instance and opens directly in the live preview surface tailored to that customization scenario.
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
    render: () => renderStory(samplesById.controls.render(), 18),
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
    render: () => renderStory(samplesById.tabs.render(), 18),
}
