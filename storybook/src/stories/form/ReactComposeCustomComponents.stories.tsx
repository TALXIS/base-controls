import React, { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
    ComboBox,
    Icon,
    IconButton,
    Link,
    Slider,
    Stack,
    Text,
    TextField,
    Toggle,
    getTheme,
    mergeStyleSets,
} from '@fluentui/react'
import { Step, StepButton, StepContent, Stepper } from '@mui/material'
import { Form, useField } from '@talxis/base-controls/components/Form'
import type { IFormApi } from '@talxis/base-controls/components/Form'
import { renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { LiveFormCode } from '../../form/react-form/LiveFormCode'
import { OpenMap } from '../../form/react-form/OpenMap'
import { getMemoryStrategy } from '../../form/shared/formModel'

const theme = getTheme()

const styles = mergeStyleSets({
    page: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        padding: 20,
        borderBottom: `1px solid ${theme.palette.neutralLight}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    sectionBody: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    bullets: {
        margin: 0,
        paddingLeft: 20,
    },
    exampleHeader: {
        padding: '16px 18px',
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
        padding: 18,
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
    note: {
        color: theme.palette.neutralSecondary,
    },
})

interface ICustomComponentsExample {
    id: string
    title: string
    summary: string
    notes: string[]
    code: string
}

const customComponentsExamples: ICustomComponentsExample[] = [
    {
        id: 'custom-tabs',
        title: 'Replace the tabs renderer',
        summary: 'Use `Form.Tabs components.onRenderTabs` to swap the default tab header with a custom presentation component.',
        notes: [
            'This is useful when navigation should look like a stepper, wizard, sidebar, or another domain-specific shell.',
            'The underlying tabs state and tab content stay the same; you replace the presentation layer only.',
        ],
        code: `const stepperTabs = [
  { id: "general", label: "General" },
  { id: "details", label: "Details" },
  { id: "schedule", label: "Schedule" },
];

const getStepIndex = (tabId) => Math.max(stepperTabs.findIndex((tab) => tab.id === tabId), 0);

function StepperTabs(props) {
  const { children, expandedTab, onTabChange, orientation } = props;
  const tabs = React.Children.toArray(children).filter(React.isValidElement);
  const activeStepIndex = getStepIndex(expandedTab);
  const activeTab = tabs.find((tab) => tab.props.id === expandedTab) ?? tabs[0] ?? null;

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <MuiStepper nonLinear orientation={orientation} activeStep={activeStepIndex}>
        {tabs.map((tab) => {
          const isActive = tab.props.id === expandedTab;

          return (
            <MuiStep key={tab.props.id} expanded={orientation === "vertical" ? isActive : undefined}>
              <MuiStepButton color="inherit" onClick={() => onTabChange(tab.props.id)}>
                {tab.props.label || tab.props.id}
              </MuiStepButton>
              {orientation === "vertical" ? <MuiStepContent>{tab}</MuiStepContent> : null}
            </MuiStep>
          );
        })}
      </MuiStepper>
      {orientation === "horizontal" ? activeTab : null}
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");
  const [orientation, setOrientation] = React.useState("horizontal");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <FluentText>Tabs orientation</FluentText>
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
      <Form.Tabs
        expandedTab={activeTab}
        onTabChange={setActiveTab}
        components={{
          onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} orientation={orientation} />,
        }}
      >
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="details" label="Details">
          <Form.Column>
            <Form.Section label="Status" layout={{ lg: 2 }}>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptionscolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
        <Form.Tab id="schedule" label="Schedule">
          <Form.Column>
            <Form.Section label="Dates" layout={{ lg: 2 }}>
              <Form.Field name="dateonly"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="datetime"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-field-content',
        title: 'Compose custom field content',
        summary: 'Use `Form.Field`, `Form.Cell`, and hooks like `useField` when a field needs a custom React presentation instead of the stock control renderer.',
        notes: [
            'This is a good fit for read/write custom widgets that still participate in the form runtime.',
            'You can read and write the bound field value while keeping validation, save flow, and notifications integrated.',
        ],
        code: `function RatingButtons() {
  const field = useField("number");
  const currentValue = Number(field?.getValue() ?? 0);

  return (
    <Stack horizontal tokens={{ childrenGap: 8 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <IconButton
          key={value}
          iconProps={{ iconName: value <= currentValue ? "FavoriteStarFill" : "FavoriteStar" }}
          title={\`Rate \${value}\`}
          onClick={() => field?.setValue(value)}
        />
      ))}
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("custom");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="custom" label="Custom field content" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Standard runtime fields" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Custom projection" layout={{ lg: 1 }} cellLabelPosition="Top">
              <Form.Field name="number">
                <Form.Cell label="Priority rating">
                  <RatingButtons />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="currency">
                <Form.Cell label="Budget">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-rich-cells',
        title: 'Mix runtime fields with custom content cells',
        summary: 'Custom components do not have to replace the whole form surface; they can be introduced selectively alongside standard fields.',
        notes: [
            'This is useful for summaries, helper panels, or domain-specific visualizations embedded in the form layout.',
            'Keeping the custom content compact usually reads better than mixing several large custom surfaces in one section.',
        ],
        code: `function SummaryPanel() {
  const textField = useField("text");
  const phoneField = useField("phone");
  const stageField = useField("optionset");

  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          padding: 12,
          border: "1px solid #e1dfdd",
        },
      }}
    >
      <FluentText variant="mediumPlus">Record summary</FluentText>
      <FluentText>Name: {String(textField?.getValue() ?? "-")}</FluentText>
      <FluentText>Phone: {String(phoneField?.getValue() ?? "-")}</FluentText>
      <FluentText>Stage: {String(stageField?.getValue() ?? "-")}</FluentText>
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Form inputs" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Custom workspace" layout={{ lg: 1 }} cellLabelPosition="Top">
              <Form.Cell label="Live summary">
                <SummaryPanel />
              </Form.Cell>
              <Form.Field name="multilinetext">
                <Form.Cell label="Notes">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
    {
        id: 'custom-sections-and-labels',
        title: 'Render cells through a custom section component',
        summary: 'When the default section look is not enough, you can render the fields directly through your own custom section component inside `Form.Root`.',
        notes: [
            'A custom section can render `Form.Field` and `Form.Cell` directly while taking full control over header and body presentation.',
            'This is useful when one area needs branded visuals or a distinct framing that the stock section chrome does not provide.',
        ],
        code: `function CustomSection(props) {
  return (
    <Stack
      tokens={{ childrenGap: 12 }}
      styles={{
        root: {
          padding: 16,
          background: "#ffffff",
          borderLeft: "4px solid #0078d4",
        },
      }}
    >
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Icon iconName="Design" />
        <FluentText variant="large">{props.title}</FluentText>
      </Stack>
      <FluentText styles={{ root: { color: "#605e5c" } }}>{props.subtitle}</FluentText>
      <Stack tokens={{ childrenGap: 10 }}>
        {props.children}
      </Stack>
    </Stack>
  );
}

function GuidancePanel() {
  return (
    <Stack
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          padding: 12,
          background: "#ffffff",
        },
      }}
    >
      <FluentText variant="mediumPlus">Author guidance</FluentText>
      <FluentText>
        Any custom React can live inside Form.Root. That includes custom headings, grouped guidance, summaries, and bespoke layout wrappers.
      </FluentText>
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <GuidancePanel />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Standard section" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell label="Name"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell label="Phone"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell label="Website"><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <CustomSection
                title="Custom-looking section"
                subtitle="This section is fully custom and renders the fields directly."
            >
              <Form.Cell label="Map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="A custom section component can render the fields and choose its own framing."
                />
              </Form.Cell>
              <Form.Field name="multilinetext">
                <Form.Cell label="Notes">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <GuidancePanel />
            </CustomSection>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
]

interface ICustomComponentsExampleCardProps {
    example: ICustomComponentsExample
}

const CustomComponentsExampleCard = (props: ICustomComponentsExampleCardProps) => {
    const { example } = props
    const [code, setCode] = useState(example.code)
    const [showCode, setShowCode] = useState(false)
    const [compileError, setCompileError] = useState<string | null>(null)
    const strategy = useMemo(() => getMemoryStrategy(), [])
    const formApiRef = useRef<IFormApi | null>(null)

    const formProps = useMemo(
        () => ({
            strategy,
            onFormReady: (api: IFormApi) => {
                formApiRef.current = api
            },
            onAfterSave: () => {
                formApiRef.current?.refresh()
            },
        } as React.ComponentProps<typeof Form.Root>),
        [strategy],
    )

    const fluent = useMemo(
        () => ({
            Stack,
            FluentText: Text,
            TextField,
            Icon,
            ComboBox,
            IconButton,
            Slider,
            OpenMap,
            MuiStepper: Stepper,
            MuiStep: Step,
            MuiStepButton: StepButton,
            MuiStepContent: StepContent,
        }),
        [],
    )

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
                            <FormCodeEditor value={code} onChange={setCode} />
                        ) : (
                            <LiveFormCode
                                code={code}
                                formProps={formProps}
                                useField={useField}
                                fluent={fluent}
                                onError={setCompileError}
                            />
                        )}
                    </div>
                </div>
                {compileError ? <Text variant="small" styles={{ root: { color: theme.palette.redDark } }}>{compileError}</Text> : null}
            </div>
        </div>
    )
}

const CustomComponentsDocsPage = () => {
    return (
        <div className={styles.page}>
            <div>
                <div className={styles.sectionBody} />
            </div>

            {customComponentsExamples.map((example) => (
                <CustomComponentsExampleCard key={example.id} example={example} />
            ))}

            <div>
                <div className={styles.sectionHeader}>
                    <Text variant="large">Where to use it</Text>
                </div>
                <div className={styles.sectionBody}>
                    <ul className={styles.bullets}>
                        <li><Text>Swap out presentation shells without throwing away the form runtime.</Text></li>
                        <li><Text>Build higher-level UI for specific fields when a stock control is not enough.</Text></li>
                        <li><Text>Embed richer visual or contextual helpers directly into the authored form layout.</Text></li>
                    </ul>
                    <Text>
                        For responsive layout authoring, go to
                        {' '}
                        <Link href="?path=/docs/form-react-compose-layout--docs">Layout</Link>
                        .
                    </Text>
                </div>
            </div>
        </div>
    )
}

const meta = {
    title: 'Form/React compose/Custom Components',
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
Use this page to explore how React compose can be extended with custom presentation components and custom field content.

- Override larger presentation layers such as tabs with \`components\` props.
- Author field-specific custom UI by combining \`Form.Field\`, \`Form.Cell\`, and \`useField\`.
- Render selected groups through a custom section component when you need a different section look and want to place the fields directly inside it.
- Mix runtime-managed controls with custom content cells in the same layout.

Each example below renders a live form preview and can switch to the Monaco-backed code editor that powers it.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {
    render: () => renderStory(<CustomComponentsDocsPage />),
}
