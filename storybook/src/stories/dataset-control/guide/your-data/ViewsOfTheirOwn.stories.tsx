import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { ViewsOfTheirOwnExample } from '../../../../dataset-control/guide/your-data/viewsOfTheirOwnExamples'

const STEP = 'Views of their own'

const DESCRIPTION = `
{{block: progress}}

Each salesperson sorts and filters the deals their own way, and wants the list like that again tomorrow. This step lets them save it as a view of their own, listed beside yours.

{{canvas: Views of their own}}

## How it works

A **module** adds a feature to the control. Pass it in the control's \`modules\`, and every load loads it anew before \`onLoad\`, as the grid's modules of [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) load with the grid. \`createLocalStorageUserQueriesModule\` adds the user's own views, kept in this browser under \`storageKey\`. Most deal lists in this guide use the same key, so a view saved on one shows on the others. [**Where views are kept**](?path=/docs/controls-datasetcontrol-guide-your-data-where-views-are-kept--overview) keeps them elsewhere.

The module lists the user's views under *My views* in the view switcher, and adds three commands below them:

| Command | Does |
|---|---|
| **Save as new view** | Asks for a name, saves the view as it is now, and opens it. |
| **Save changes** | Saves the open view again; only on a view of the user's own. |
| **Manage views** | Opens a panel where the user renames and deletes their views. Closing it loads the control again. |

Each is on unless \`enableSaveAsNewView\`, \`enableSaveChanges\` or \`enableManageViews\` is \`false\`. \`DatasetControl.UserQueries\` inside the switcher draws the panel, and throws without the module.

### What a user view keeps

A **user view** keeps its columns, hidden ones too, with their order, width, grouping and totals, and the links its related columns come through. It does not keep the sorting, the filter or the search, so without more, a view saved from *Won deals* shows every deal.

\`saveWithView(key, getter, applier?)\` on the module keeps more, and returns its remover. On every save, \`getter\` returns the value to keep under \`key\`; as the view opens, \`applier(value, provider)\` puts it back on the provider before the first page. Leave the applier out for a value only your own UI reads, through \`getView().data\` (see [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview)). A getter that returns \`undefined\` keeps nothing under its key, a getter that throws stops the save, and a second call for the same key throws.

\`saveDealViewData\` keeps the sorting, the filter and the search. It runs in \`onSetup\`, which gets the control of every load before its modules load, and \`modules.observe\` calls back once the module has loaded; [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview) covers \`onSetup\`. *types.ts*, new here, declares each key on \`IUserQuerySavedValueMap\`, so the getter and the applier are typed. The grid's sorting module, new here too, lets the user sort from a column's header.

## Try it

- Switch to *All deals*, sort *Value* larger to smaller from its header, and pick **Save as new view** in the view switcher. Name it *Big first*: it opens sorted, under *My views*.
- Switch to *Won deals* and save it as *Won by the team*: it shows the 7 won deals.
- Pick **Manage views**, tick *Won by the team*, press **Delete** and confirm, then close the panel: the switcher no longer lists it, and the list opens on *My deals*.
- In **Code**, delete the \`filtering\` line, then save *Won deals* again: the new view shows every deal.

## Remember

- A module adds a feature to the control and loads anew on every load.
- A user view keeps its columns; \`saveWithView\` keeps the rest.
- Call \`saveWithView\` from \`onSetup\`, for the module of every load.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Your data/Views of their own',
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

export const ViewsOfTheirOwn: Story = {
    name: 'Views of their own',
    tags: ['!dev'],
    render: () => renderStory(<ViewsOfTheirOwnExample />),
}
