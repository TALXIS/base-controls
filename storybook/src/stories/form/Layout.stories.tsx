import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ResponsiveExample } from '../../form/react-form/layoutExamples'

const DESCRIPTION = `
A form lays its fields out in tabs; each tab holds columns, each column holds sections, and each section holds cells. A tab and a section each measure their own width and draw as many columns in a row as it allows, so one form fits a wide screen and a phone. Try it below: drag *Width of the form* down to 320px.

{{canvas: Narrow the form}}

## Tabs

\`Form.Tabs\` draws a header for each \`Form.Tab\` inside it and shows the open one; headers that do not fit move into a menu. Your state holds the open tab through \`expandedTab\` and \`onTabChange\`, which are both required. A tab takes an \`id\`, unique among the tabs, and a \`label\`; without a label, it is headed by its id.

Tabs are optional: sections can sit straight in \`Form.Root\`, as they do on [**Loading and saving**](?path=/docs/controls-form-loading-and-saving--overview).

## Columns and sections

Each \`Form.Column\` is one column of its tab's grid, and \`colspan\` makes it as wide as several, up to the number in a row. A \`Form.Section\` is a box headed by its \`label\`, holding its cells in a grid of its own. \`showLabel={false}\` or \`showBar={false}\` leaves the heading out, and \`visible={false}\` hides the section.

## Cells

\`Form.Cell\` draws a label, the required mark and the control, and \`colspan\` and \`rowspan\` make it span columns and rows of its section's grid. The label is the column's display name: \`label\` replaces it, and \`label=''\` leaves it out.

Labels sit beside the controls, 115px wide or the section's \`labelWidth\`. In a section narrower than 371px, or than its \`cellLabelCollapseBreakpoint\`, they move above the controls, and \`cellLabelPosition='Top'\` puts them there at any width.

## Breakpoints

\`layout\` on a tab or a section sets how many columns it draws in a row at each breakpoint. Each one picks its breakpoint from its own width, not the window's:

| Breakpoint | Width | Columns when left out |
|---|---|---|
| \`lg\` | Over 996px | The number of children |
| \`md\` | 769 to 996px | \`min(lg, 3)\` |
| \`sm\` | 481 to 768px | \`min(lg, 2)\` |
| \`xs\` | 480px or less | 1 |

The children are the columns of a tab and the cells of a section, so a section of five fields with no \`layout\` draws five in a row when it is wide, and \`layout={{ lg: 1 }}\` keeps one in a row at any width. \`onColumnsPerRowChanged\` on \`Form.Tab\` reports how many columns the tab draws in a row, as the line above the example's form shows.

## Reference

| Part | Props |
|---|---|
| \`Form.Tabs\` | \`expandedTab\`, \`onTabChange\`, \`components\` |
| \`Form.Tab\` | \`id\`, \`label\`, \`layout\`, \`style\`, \`onColumnsPerRowChanged\` |
| \`Form.Column\` | \`id\`, \`colspan\`, \`style\` |
| \`Form.Section\` | \`id\`, \`label\`, \`layout\`, \`showLabel\`, \`showBar\`, \`visible\`, \`labelWidth\`, \`cellLabelPosition\`, \`cellLabelCollapseBreakpoint\` |
| \`Form.Cell\` | \`id\`, \`label\`, \`colspan\`, \`rowspan\`, \`requiredLevel\` |

Every prop is live. The \`id\` of a column, section or cell becomes its \`data-id\`, such as \`section-contact\`. \`components\` of \`Form.Tabs\` draws the tabs your own way: see [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview). \`requiredLevel\` of \`Form.Cell\` changes only the mark: see [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Fields and validation', iconName: 'CheckList', href: '?path=/docs/controls-form-fields-and-validation--overview', text: 'Make fields required, check their values and show what stops a save.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-form-your-own-ui--overview', text: 'Draw a field, the tabs, the ribbon or the notifications your own way.' },
]

const meta = {
    title: 'Controls/Form/Layout',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NarrowTheForm: Story = {
    name: 'Narrow the form',
    render: () => renderStory(<ResponsiveExample />),
}
