import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Text, Toggle, getTheme, mergeStyleSets } from '@fluentui/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { XrmComponentsCodeEditor } from '../../form/xrm-form/XrmComponentsCodeEditor'
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

interface IXrmCustomComponentsExampleCardProps {
    example: IXrmCustomComponentsExample
}

const XrmCustomComponentsExampleCard = (props: IXrmCustomComponentsExampleCardProps) => {
    const { example } = props
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div>
            <div className={styles.exampleHeader}>
                <div className={styles.exampleCopy}>
                    <Text variant="large" styles={{ root: { fontWeight: 600 } }}>{example.title}</Text>
                    <Text>{example.summary}</Text>
                </div>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div className={styles.exampleBody}>
                <ul className={styles.bullets}>
                    {example.notes.map((note) => (
                        <li key={note}>
                            <Text>{note}</Text>
                        </li>
                    ))}
                </ul>
                <div className={styles.previewFrame}>
                    <div className={styles.viewportWindow}>
                        {showCode ? (
                            <XrmComponentsCodeEditor value={example.code} />
                        ) : (
                            example.render()
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const XrmCustomUiDocsPage = () => {
    return (
        <div className={styles.page}>
            <div>
                <div className={styles.sectionBody} />
            </div>

            {customComponentsExamples.map((example) => (
                <XrmCustomComponentsExampleCard key={example.id} example={example} />
            ))}

            <div>
                <div className={styles.sectionHeader}>
                    <Text variant="large">Where to use it</Text>
                </div>
                <div className={styles.sectionBody}>
                    <ul className={styles.bullets}>
                        <li><Text>Swap out selected Xrm presentation layers without throwing away the FormXml-driven runtime.</Text></li>
                        <li><Text>Customize individual controls when the default Xrm projection is not enough.</Text></li>
                        <li><Text>Replace the tabs shell while keeping the same runtime-backed tab content and navigation behavior.</Text></li>
                    </ul>
                </div>
            </div>
        </div>
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
            controls: { disable: true },
            description: {
                component: `
Use this page to explore how Xrm UI can be customized while staying on top of the FormXml-driven runtime.

- Replace control presentation for selected Xrm controls.
- Replace the tabs renderer with a custom tabs shell.

Each example below renders a live preview and can switch to the Monaco-backed code editor that powers it.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<XrmCustomUiDocsPage />),
}
