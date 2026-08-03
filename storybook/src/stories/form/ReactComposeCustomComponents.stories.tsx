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
    viewportToolbar: {
        paddingBottom: 4,
        maxWidth: 560,
    },
    previewFrame: {
        minHeight: 420,
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
    },
    viewportWindow: {
        minWidth: 320,
        flexShrink: 0,
    },
    zoomedViewport: {
        transformOrigin: 'top center',
    },
    zoomShell: {
        display: 'flex',
        justifyContent: 'center',
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
  const { children, expandedTab, onTabChange } = props;
  const tabs = React.Children.toArray(children).filter(React.isValidElement);
  const activeStepIndex = getStepIndex(expandedTab);
  const activeTab = tabs.find((tab) => tab.props.id === expandedTab) ?? tabs[0] ?? null;

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <MuiStepper nonLinear activeStep={activeStepIndex}>
        {tabs.map((tab) => (
          <MuiStep key={tab.props.id}>
            <MuiStepButton color="inherit" onClick={() => onTabChange(tab.props.id)}>
              {tab.props.label || tab.props.id}
            </MuiStepButton>
          </MuiStep>
        ))}
      </MuiStepper>
      {activeTab}
    </Stack>
  );
}

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs
        expandedTab={activeTab}
        onTabChange={setActiveTab}
        components={{
          onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} />,
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
            'This is useful for maps, summaries, helper panels, or domain-specific visualizations embedded in the form layout.',
            'The composed layout stays declarative because the custom content still lives inside `Form.Cell`.',
        ],
        code: `function SummaryPanel() {
  const textField = useField("text");
  const stageField = useField("optionset");

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <FluentText variant="mediumPlus">Record summary</FluentText>
      <FluentText>Name: {String(textField?.getValue() ?? "-")}</FluentText>
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
              <Form.Cell label="Office map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="Custom content can sit beside runtime-managed fields."
                />
              </Form.Cell>
            </Form.Section>
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
    const [viewportWidth, setViewportWidth] = useState(960)
    const [zoomPercent, setZoomPercent] = useState(100)
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
                    <Text variant="large">{example.title}</Text>
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
                {!showCode ? (
                    <div className={styles.viewportToolbar}>
                        <Stack tokens={{ childrenGap: 8 }}>
                            <Slider
                                label="Viewport width"
                                min={320}
                                max={1920}
                                step={10}
                                value={viewportWidth}
                                showValue
                                valueFormat={(value) => `${value}px`}
                                onChange={setViewportWidth}
                            />
                            <Slider
                                label="Zoom"
                                min={50}
                                max={150}
                                step={5}
                                value={zoomPercent}
                                showValue
                                valueFormat={(value) => `${value}%`}
                                onChange={setZoomPercent}
                            />
                        </Stack>
                    </div>
                ) : null}
                <div className={styles.previewFrame}>
                    <div className={styles.viewportWindow} style={{ width: showCode ? '100%' : `${viewportWidth}px` }}>
                        {showCode ? (
                            <FormCodeEditor value={code} onChange={setCode} />
                        ) : (
                            <div
                                className={styles.zoomShell}
                                style={{
                                    height: `${420 * (zoomPercent / 100)}px`,
                                }}
                            >
                                <div
                                    className={styles.zoomedViewport}
                                    style={{
                                        width: `${viewportWidth}px`,
                                        transform: `scale(${zoomPercent / 100})`,
                                    }}
                                >
                                    <LiveFormCode
                                        code={code}
                                        formProps={formProps}
                                        useField={useField}
                                        fluent={fluent}
                                        onError={setCompileError}
                                    />
                                </div>
                            </div>
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
                <div className={styles.sectionHeader}>
                    <Text variant="xLarge">Custom components in React compose</Text>
                    <Text>
                        React compose lets you keep the form runtime while replacing or extending parts of the UI with custom React components.
                    </Text>
                </div>
                <div className={styles.sectionBody}>
                    <ul className={styles.bullets}>
                        <li><Text>Override larger presentation layers such as tabs with `components` props.</Text></li>
                        <li><Text>Author field-specific custom UI by combining `Form.Field`, `Form.Cell`, and `useField`.</Text></li>
                        <li><Text>Mix runtime-managed controls with custom content cells in the same layout.</Text></li>
                    </ul>
                    <Text className={styles.note}>
                        Each example below renders a live form preview and can switch to the Monaco-backed code editor that powers it.
                    </Text>
                </div>
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

The examples cover replacing the tabs renderer, composing custom field UI with \`useField\`, and embedding richer custom content alongside standard runtime fields.
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
