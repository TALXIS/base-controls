import React, { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
    ComboBox,
    Icon,
    IconButton,
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
    {
        id: 'cell-span',
        title: 'Cell rowspan and colspan',
        summary: 'Use `Form.Cell colspan` and `rowspan` when a field or custom content should span across multiple grid tracks.',
        notes: [
            '`colspan` is useful for wider controls such as multiline text, maps, or custom composite content.',
            '`rowspan` helps when one cell should stay taller while neighboring cells stack beside it; multiline fields are a common fit.',
            'These options work inside the section grid, so they combine naturally with `Form.Section layout`.',
        ],
        code: `const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("span");

  return (
    <Form.Root {...formProps}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="span" label="Span" layout={{ lg: 1 }}>
          <Form.Column>
            <Form.Section label="Grid spanning" layout={{ xs: 1, md: 2, lg: 3 }} cellLabelPosition="Top">
              <Form.Field name="text">
                <Form.Cell label="Title">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="phone">
                <Form.Cell label="Phone">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="url">
                <Form.Cell label="Website">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="multilinetext">
                <Form.Cell label="Long description" colspan={2} rowspan={10}>
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Cell label="Office map">
                <OpenMap
                  latitude={50.0755}
                  longitude={14.4378}
                  zoom={13}
                  title="Prague office"
                  description="A custom cell can also span, but this example keeps the emphasis on the multiline field."
                />
              </Form.Cell>
              <Form.Field name="optionset">
                <Form.Cell label="Stage">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="twooptions">
                <Form.Cell label="Approved">
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="dateonly">
                <Form.Cell label="Start date" colspan={2}>
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
]

const renderLayoutExample = (example: ILayoutExample) => {
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
            onAfterSave: ({ success }: { success: boolean }) => {
                const currentData = formApiRef.current?.getData()
                console.log(success ? "Form saved" : "Save failed", { success, currentData })
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
        <div>
            <div className={styles.exampleHeader}>
                <div className={styles.exampleCopy} />
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div className={styles.exampleBody}>
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
Build responsive React compose layouts by combining tab-level columns, section-level grids, label behavior, and grid spanning.

- Use \`Form.Tab layout\` to shape the broad column structure of the page.
- Use \`Form.Section layout\` to control the cell grid density inside each section.
- Tune labels with \`labelWidth\`, \`cellLabelPosition\`, and \`cellLabelCollapseBreakpoint\`.
- Use \`colspan\` and \`rowspan\` when fields or custom content should span across multiple grid tracks.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const samplesById = Object.fromEntries(layoutExamples.map((sample) => [sample.id, sample])) as Record<string, ILayoutExample>

export const TabLayoutBreakpoints: Story = {
    name: 'Tab layout breakpoints',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Uses \`Form.Tab layout\` to control how many top-level columns render at each breakpoint.

- collapses from multiple columns down to one as space tightens
- controls the broad page density for a tab
- keeps each section in its own top-level column shell
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderLayoutExample(samplesById['tab-breakpoints']), 18),
}

export const SectionLayoutGrids: Story = {
    name: 'Section layout grids',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Uses \`Form.Section layout\` to control how many cells render per row inside a section.

- densifies one section progressively across breakpoints
- separates section grid behavior from tab column behavior
- fits wider sets of fields into a single responsive section
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderLayoutExample(samplesById['section-grid']), 18),
}

export const CombineTabAndSectionResponsiveness: Story = {
    name: 'Combine tab and section responsiveness',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Combines tab and section breakpoint maps to create coarse and fine-grained responsive behavior together.

- lets tabs collapse independently from section grids
- keeps logical groups intact while each group repacks its fields
- mixes responsive field grids with richer custom content cells
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderLayoutExample(samplesById['mixed-columns-and-sections']), 18),
}

export const SectionLabelBehavior: Story = {
    name: 'Section label behavior',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Uses \`labelWidth\`, \`cellLabelPosition\`, and \`cellLabelCollapseBreakpoint\` to tune how labels behave as sections get narrower.

- keeps denser horizontal labels where space allows
- collapses labels above controls below a chosen width
- aligns left labels consistently across fields
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderLayoutExample(samplesById['section-label-behavior']), 18),
}

export const CellRowspanAndColspan: Story = {
    name: 'Cell rowspan and colspan',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Uses \`Form.Cell colspan\` and \`rowspan\` when fields or custom content should span across multiple grid tracks.

- gives larger cells more room within the section grid
- supports multiline fields, maps, and other wider content
- combines naturally with responsive section layouts
                `.trim(),
            },
        },
    },
    render: () => renderStory(renderLayoutExample(samplesById['cell-span']), 18),
}
