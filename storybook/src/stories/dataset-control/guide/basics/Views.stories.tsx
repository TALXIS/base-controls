import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { ViewsExample } from '../../../../dataset-control/guide/basics/viewsExamples'

const STEP = 'Views'

const DESCRIPTION = `
{{block: progress}}

The team looks at the same deals in different ways: all of them, only the won ones, or the biggest first. A view gives each way a name, and the view switcher above the grid moves between them.

{{canvas: Views}}

## How it works

The deal list is the one from the last step, with views and a view switcher; in **Code**, the lines this step adds carry a \`//new:\` comment.

**Views.** \`onLoad\` returns the views beside the provider, and \`DatasetControl.ViewSwitcher\`, in the start of the header, lists them by name; the first view opens first. A view has these keys:

| Key | What it is |
|---|---|
| \`id\` | Unique among the control's views. |
| \`name\` | Shown in the view switcher. |
| \`group\` | \`{ id, name }\`: the header the view is listed under, such as *Reports*. Views without one are listed under *System views*. |
| \`resolve(provider)\` | Runs as the view opens, and may be async. It sets the provider up, such as its filter or sorting, and returns what the view shows. |

\`resolve\` returns the view's \`columns\`, in the order they show, and two optional keys: \`linking\`, the related entities its columns come from, and \`data\`, anything else the view carries. Never set the columns or the linking on the provider in \`resolve\`, and never call \`addAggregation\` or \`addGroupBy\` there: return totals and grouping on the columns instead, as \`aggregation\` and \`grouping\`.

**Available columns.** A view names its columns, and the provider describes them: the control completes each one from the provider's available columns, which \`onGetAvailableColumns()\` returns. A \`MemoryDataProvider\` offers only the columns of its \`metadata.SavedQueries\`, so \`DealsProvider\` overrides \`onGetAvailableColumns()\` to offer \`DEAL_COLUMNS\`. A column the provider does not offer is used as the view gives it when it has a \`dataType\`, and left out otherwise. Keys the view gives win over the provider's, such as \`isHidden\`, or the \`order\` that \`columns()\` sets from each name's place.

**Hidden columns.** A view filters and sorts only by the columns it lists, so hide a column the view filters or sorts by, as *Won deals* does with \`stage\`.

Picking a view loads the deals again for it, as the next step shows, and **Data** shows the columns of the open view.

## Try it

- Open the view switcher: *All deals* and *Won deals* are under *System views*, and *Biggest deals* under *Reports*. Pick *Biggest deals*: the largest *Value* comes first.
- Switch to *Won deals*: it holds 7 deals, and no *Stage* column.
- In **Code**, add \`'probability'\` after \`'value'\` in the columns of *Won deals*. Back in **Preview**, the list opens on *All deals* again; switch to *Won deals*: *Probability (%)* shows after *Value*.

## Remember

- A view names its columns, and the provider describes them.
- \`resolve\` sets the provider up for the view, such as its filter or sorting.
- Hide a column the view filters or sorts by.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Basics/Views',
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

export const Views: Story = {
    name: 'Views',
    tags: ['!dev'],
    render: () => renderStory(<ViewsExample />),
}
