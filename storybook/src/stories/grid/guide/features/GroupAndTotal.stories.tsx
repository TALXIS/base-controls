import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { GroupAndTotalExample } from '../../../../grid/guide/features/groupAndTotalExamples'

const STEP = 'Group and total'

const DESCRIPTION = `
{{block: progress}}

The sales manager reviews the pipeline by account manager, with what each one holds and the total. This step opens the deals grouped by account manager, with their value totalled per group and overall.

{{canvas: Group and total}}

## How it works

This step adds two modules to the grid of [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview), and \`loadPipeline\`, which groups and totals the deals as they load. In **Code**, the new lines carry \`//new:\`. Grouping needs AG Grid Enterprise and totals do not; the licence is on [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview).

**Grouping.** \`createGroupingModule()\` gathers the rows under a **group row** for each value of a column. A column's menu offers *Group* while its metadata sets \`CanBeGrouped\` and it is not a multi-select option set, and *Ungroup* once it is grouped. A grouped column moves to the front, is pinned to the left and cannot be edited; its value shows on the group rows only. A group row shows a chevron, the value, how many deals it holds and its totals, and every cell of it is locked. While the rows are grouped, the grid draws no zebra rows.

Each grouped column adds a level: a group row opens onto the groups of the next column. With \`createGroupingModule({ type: 'flat' })\`, there is one level, a group for each combination of values; the provider regroups that way only on its next load.

**Opening groups.** \`defaultExpandedLevel\` sets how deep the groups open by themselves: levels count from \`0\`, the top one, and the default \`-1\` keeps every group closed. The narrow column left of the grouped columns has + and − in its header, which open or close one more level. A group the user opens or closes stays so until a level is applied again.

**Grouping and selection.** A group row's checkbox selects every deal in the group. The grid first loads the deals of each group it selects, and refuses a selection that would load more than \`maxGroupLoadsPerSelection\` groups, \`100\` by default. A group loads at most 5,000 records, and says so when it holds more.

**The totals row.** \`createAggregationModule()\` adds totals. While a column has a total and the list holds a record, the **totals row**, pinned at the bottom, shows the total, and each group row shows its group's. Each column's menu has a *Totals* section with *None* and the functions its \`metadata.SupportedAggregations\` lists; a grouped column always shows its count. The totals cover the whole list as filtered and searched, not only the page on screen, and count saved values: they change after each load, save and delete, not while a value is being edited. Changing a total while the rows are grouped loads the deals again, which clears the selection.

**Summary rows.** Group rows and the totals row are **summary rows**: records like any other, which the grid's hooks and events run for too. Tell them apart with \`record.getDataProvider().getSummarizationType()\`:

| \`getSummarizationType()\` | The row is |
|---|---|
| \`'none'\` | A deal |
| \`'grouping'\` | A group row |
| \`'aggregation'\` | The totals row |

A summary row holds its values under aliases, so \`record.getValue('stage')\` reads \`null\` on it, and a rule that acts on an empty value acts on summary rows too.

**Grouped and totalled from the start.** Grouping and totals belong to the provider's columns: \`loadPipeline\` sets them on the provider before its first load, so the grid opens grouped and totalled. \`provider.grouping.addGroupBy\` and \`provider.aggregation.addAggregation\` write onto the provider's current columns, so call them once the provider has its columns, as \`loadPipeline\` does; replacing the columns drops them. Name the aliases as the column menu does, \`<column>_group\` and \`<column>_<function>\`. To ungroup from code, remove each level with \`provider.grouping.removeGroupBy(alias)\`. How a provider holds groups and totals is under *Groups and totals* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

[**Back where they left off**](?path=/docs/controls-grid-guide-features-back-where-they-left-off--overview) keeps which groups are open, and [**Open groups on demand**](?path=/docs/controls-grid-guide-features-open-groups-on-demand--overview) fetches a group's deals only as it opens. Both modules' parameters and members are under *Modules* on [**Reference**](?path=/docs/controls-grid-reference--overview).

## Try it

- The deals open in four groups, each with its count and summed value. Ben Carter's holds 8 deals and the most value, $182,000.00, and the totals row sums all 30: $532,500.00.
- Open *Stage*'s menu and pick **Group**: each account manager's deals split by stage, in groups that start closed. David Kim's holds one, *Won*.
- Press + in the header left of *Account manager*: the stage groups open, down to the deals. Press −: they close again.
- In *Probability (%)*'s menu, pick **Average** under *Totals*: every group row and the totals row add the average probability.
- Filter *Stage* to *Won*: only David Kim's group is left, and the totals drop to his 7 deals, $125,500.00.

## Remember

- Grouping and totals belong to the provider's columns; set them before the first load to open grouped and totalled.
- Group rows and the totals row are summary rows, which read \`null\` for a column's value.
- Grouping needs AG Grid Enterprise; totals do not.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Features/Group and total',
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

export const GroupAndTotal: Story = {
    name: 'Group and total',
    tags: ['!dev'],
    render: () => renderStory(<GroupAndTotalExample />),
}
