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
import { Form, useField } from '@talxis/base-controls/components/Form'
import type { IFormApi } from '@talxis/base-controls/components/Form'
import { renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { LiveFormCode } from '../../form/react-form/LiveFormCode'
import { OpenMap } from '../../form/react-form/OpenMap'
import { getDemoRecord, getMemoryStrategy } from '../../form/shared/formModel'

const theme = getTheme()

const styles = mergeStyleSets({
    page: {
        display: 'flex',
        flexDirection: 'column',
    },
    section: {
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
    exampleCard: {
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

interface ILayoutExample {
    id: string
    title: string
    summary: string
    notes: string[]
    code: string
}

const layoutExamples: ILayoutExample[] = [
    {
        id: 'tab-breakpoints',
        title: 'Tab layout breakpoints',
        summary: 'Use `Form.Tab layout` to control how many top-level columns render at each breakpoint.',
        notes: [
            '`layout={{ xs: 1, md: 2, lg: 3 }}` lets one tab collapse from three columns down to one as space tightens.',
            'This is the main lever for overall form density within a tab.',
        ],
        code: `const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("profile");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="profile" label="Profile" layout={{ xs: 1, md: 2, lg: 3 }}>
          <Form.Column>
            <Form.Section label="Identity" layout={{ lg: 1 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Preferences" layout={{ lg: 1 }}>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Scheduling" layout={{ lg: 1 }}>
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
        id: 'section-grid',
        title: 'Section layout grids',
        summary: 'Use `Form.Section layout` to control how many cells render per row inside a section.',
        notes: [
            '`layout={{ xs: 1, sm: 2, lg: 4 }}` is ideal when one section should progressively densify.',
            'Tab layout decides column shells; section layout decides the grid inside each shell.',
        ],
        code: `const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="overview" label="Overview" layout={{ lg: 1 }}>
          <Form.Column>
            <Form.Section label="Responsive details" layout={{ xs: 1, sm: 2, lg: 4 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
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
        id: 'mixed-columns-and-sections',
        title: 'Combine tab and section responsiveness',
        summary: 'Tabs and sections can use different breakpoint maps to create coarse and fine-grained responsive behavior together.',
        notes: [
            'A tab can collapse from two columns to one while each section also changes its own internal grid.',
            'This is useful when the page should keep logical groupings even as each group repacks its fields.',
        ],
        code: `const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="workspace" label="Workspace" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section label="Core details" layout={{ xs: 1, md: 2 }}>
              <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section label="Business context" layout={{ xs: 1, sm: 2, lg: 1 }}>
              <Form.Field name="optionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptionscolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="currency"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
            <Form.Section label="Map embed" layout={{ lg: 1 }} cellLabelPosition="Top">
              <Form.Cell label="Office map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="Mixed layouts still support rich content cells."
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
    {
        id: 'section-label-behavior',
        title: 'Section label behavior',
        summary: 'Use `labelWidth`, `cellLabelPosition`, and `cellLabelCollapseBreakpoint` to tune how labels behave as sections get narrower.',
        notes: [
            '`cellLabelPosition="Left"` keeps a denser desktop form when space allows.',
            '`cellLabelCollapseBreakpoint` flips labels above controls below a chosen width.',
            '`labelWidth` keeps left-aligned labels visually consistent across cells.',
        ],
        code: `const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("labels");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="labels" label="Labels" layout={{ xs: 1, lg: 2 }}>
          <Form.Column>
            <Form.Section
              label="Left labels with collapse"
              layout={{ lg: 1 }}
              cellLabelPosition="Left"
              labelWidth={140}
              cellLabelCollapseBreakpoint={420}
            >
              <Form.Field name="text"><Form.Cell label="Name"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="phone"><Form.Cell label="Phone"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="url"><Form.Cell label="Website"><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
          <Form.Column>
            <Form.Section
              label="Top labels for compact spaces"
              layout={{ xs: 1, sm: 2 }}
              cellLabelPosition="Top"
            >
              <Form.Field name="dateonly"><Form.Cell label="Start"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="datetime"><Form.Cell label="Follow up"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="optionset"><Form.Cell label="Stage"><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="twooptions"><Form.Cell label="Approved"><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`,
    },
]

interface ILayoutExampleCardProps {
    example: ILayoutExample
}

const LayoutExampleCard = (props: ILayoutExampleCardProps) => {
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
        }),
        [],
    )

    return (
        <div className={styles.exampleCard}>
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

const LayoutDocsPage = () => {
    return (
        <div className={styles.page}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Text variant="xLarge">Responsive layout in React compose</Text>
                    <Text>
                        React compose exposes responsive layout directly on the authored components. In practice, the two main places to shape responsiveness are
                        {' '}
                        <code>Form.Tab</code>
                        {' '}
                        and
                        {' '}
                        <code>Form.Section</code>
                        .
                    </Text>
                </div>
                <div className={styles.sectionBody}>
                    <ul className={styles.bullets}>
                        <li><Text><code>Form.Tab layout</code> controls how many top-level columns the tab shows per breakpoint.</Text></li>
                        <li><Text><code>Form.Section layout</code> controls how many cells render per row inside that section.</Text></li>
                        <li><Text><code>labelWidth</code>, <code>cellLabelPosition</code>, and <code>cellLabelCollapseBreakpoint</code> tune label behavior within sections.</Text></li>
                    </ul>
                    <Text className={styles.note}>
                        Each example below renders a live form preview and includes a Code toggle so you can inspect the exact Monaco-backed TSX that powers it.
                    </Text>
                </div>
            </div>

            {layoutExamples.map((example) => (
                <LayoutExampleCard key={example.id} example={example} />
            ))}

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Text variant="large">How to think about it</Text>
                </div>
                <div className={styles.sectionBody}>
                    <ul className={styles.bullets}>
                        <li><Text>Start with tab-level columns to define the broad page structure.</Text></li>
                        <li><Text>Then use section-level layout to decide how dense each group of fields should become at different widths.</Text></li>
                        <li><Text>Use label behavior props when horizontal labels are great on desktop but should stack vertically on narrower containers.</Text></li>
                    </ul>
                    <Text>
                        For broader runtime authoring, go back to
                        {' '}
                        <Link href="?path=/docs/form-react-compose--docs">React compose</Link>
                        .
                    </Text>
                </div>
            </div>
        </div>
    )
}

const meta = {
    title: 'Form/React compose/Layout',
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
Use this page to explore how responsive layout is authored directly in React compose.

The examples focus on the main layout controls exposed by \`Form.Tab\` and \`Form.Section\`, including breakpoint maps and label behavior. Each example can switch between a live form preview and the code editor that powers it.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {
    render: () => renderStory(<LayoutDocsPage />),
}
