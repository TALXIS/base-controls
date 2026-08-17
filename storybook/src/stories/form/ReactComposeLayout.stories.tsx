import React, { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form } from '@talxis/base-controls/components/Form'
import type { IFormApi } from '@talxis/base-controls/components/Form'
import { ExampleRunner, renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { getMemoryStrategy } from '../../form/shared/formModel'
import { ReactComposeLivePreview } from './ReactComposeLivePreview'

interface ILayoutExample {
    id: string
    title: string
    summary: string
    notes: string[]
    code: string
}

const sharedStrategyCode = `const strategy = new MemoryStrategy({
  onGetData: () => recordData,
  onGetColumns: () => modelColumns,
  onGetMetadata: () => ({
    PrimaryIdAttribute: "id",
    PrimaryNameAttribute: "text",
  }),
});
`

const layoutExamples: ILayoutExample[] = [
    {
        id: 'tab-breakpoints',
        title: 'Tab layout breakpoints',
        summary: 'Use `Form.Tab layout` to control how many top-level columns render at each breakpoint.',
        notes: [
            '`layout={{ xs: 1, md: 2, lg: 3 }}` lets one tab collapse from three columns down to one as space tightens.',
            'This is the main lever for overall form density within a tab.',
        ],
        code: `${sharedStrategyCode}
const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("profile");

  return (
    <Form.Root strategy={strategy}>
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
        code: `${sharedStrategyCode}
const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <Form.Root strategy={strategy}>
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
        code: `${sharedStrategyCode}
const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("workspace");

  return (
    <Form.Root strategy={strategy}>
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
        code: `${sharedStrategyCode}
const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("labels");

  return (
    <Form.Root strategy={strategy}>
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
        code: `${sharedStrategyCode}
const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("span");

  return (
    <Form.Root strategy={strategy}>
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

    return (
        <ExampleRunner
            error={compileError}
            renderPreview={() => (
                <ReactComposeLivePreview code={code} formProps={formProps} onError={setCompileError} />
            )}
            renderCode={() => <FormCodeEditor value={code} onChange={setCode} />}
        />
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
            description: {
                component: `
Control form density and responsiveness with layout props on \`Form.Tab\`, \`Form.Section\`, and \`Form.Cell\`.

Layout is breakpoint-driven at two levels: tabs decide the broad column structure, sections decide the field grid inside each column. Both accept the same breakpoint map (\`xs\`, \`sm\`, \`md\`, \`lg\`) independently, so coarse and fine-grained responsiveness compose freely.

## What you can control

- **Column structure** — \`Form.Tab layout\` sets how many top-level columns render at each breakpoint.
- **Field grids** — \`Form.Section layout\` sets how many cells render per row inside a section.
- **Label behavior** — \`labelWidth\`, \`cellLabelPosition\`, and \`cellLabelCollapseBreakpoint\` tune how labels sit relative to controls as space tightens.
- **Grid spanning** — \`Form.Cell colspan\` and \`rowspan\` let a field or custom content span multiple grid tracks.
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
    render: () => renderStory(renderLayoutExample(samplesById['tab-breakpoints'])),
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
    render: () => renderStory(renderLayoutExample(samplesById['section-grid'])),
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
    render: () => renderStory(renderLayoutExample(samplesById['mixed-columns-and-sections'])),
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
    render: () => renderStory(renderLayoutExample(samplesById['section-label-behavior'])),
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
    render: () => renderStory(renderLayoutExample(samplesById['cell-span'])),
}
