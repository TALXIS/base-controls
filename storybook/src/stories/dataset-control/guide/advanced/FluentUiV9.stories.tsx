import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { FluentV9Example } from '../../../../dataset-control/guide/advanced/fluentUiV9Examples'

const STEP = 'Fluent UI v9'

const DESCRIPTION = `
{{block: progress}}

Your app is built with Fluent UI v9, and the deal list should look like the rest of it. This step draws every part of the list in v9 through the slots of [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview), while the control underneath stays the same.

{{canvas: Fluent UI v9}}

## How it works

Every slot gets the props its default would get, such as the commands as \`items\` or the views as \`menuProps.items\`, so a design system can stand in for the defaults. The example keeps its slots in its own files:

| File | Holds |
|---|---|
| *v9.tsx* | \`V9\`, the pieces of every part drawn with v9 components, passed to each part's \`components\` |
| *RecordDataGrid.tsx* | The records in v9's \`DataGrid\` in place of the grid, sorted and selected through the provider |
| *DealsRibbon.tsx* | A ribbon of its own: **Mark N as won**, which leaves an unsaved change, and two commands that make the list fail |

It draws in v9 the records, the menus, toolbars, search field and its popover, the column editor's drawer, the *Manage views* drawer, the notifications, the empty state and the load error. It leaves the loading placeholder, the error dialog, and the column editor's pickers and column list as they are.

v9 components need a \`FluentProvider\` around them, so the control's \`container\` piece draws one, light or dark to match the Fluent v8 theme. Every slot and its default are under *Slots* on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

## Try it

- Press **Fail the next load**, under **…** when the toolbar is short of room: the load error shows in a v9 message bar. Press **Try again**.
- Press **Break the connection**: both messages fold under a v9 summary. Click it: the sync message and the error, each in a v9 message bar.
- Search for *zzz*: the empty state shows a v9 icon and heading.

## Remember

- A slot takes any component, so the parts can take any design system.
- v9 needs its \`FluentProvider\`, which the \`container\` piece can draw.

You have seen the whole DatasetControl. Every prop, member and slot is on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Advanced/Fluent UI v9',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FluentUiV9: Story = {
    name: 'Fluent UI v9',
    tags: ['!dev'],
    render: () => renderStory(<FluentV9Example />),
}
