import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { ChooseTheColumnsExample } from '../../../../dataset-control/guide/features/chooseTheColumnsExamples'

const STEP = 'Choose the columns'

const DESCRIPTION = `
{{block: progress}}

Each salesperson reads the deals by different columns: Ben wants the probability on *Won deals*, Anna does not. **Edit columns** lets each of them choose the columns of a view.

{{canvas: Choose the columns}}

## How it works

\`DealsRibbon\` from [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) moves to *DealsRibbon.tsx* as it was, and the header gets \`DatasetControl.EditColumns\`: a button that opens the column editor for the open view. In **Code**, the new line carries \`//new:\`.

| The user | The editor |
|---|---|
| Picks a column under *Add column...* | Adds it first in the list |
| Drags a column onto another | Puts it in that column's place |
| Presses a column's cross | Removes it |
| Presses **Save** | Saves the columns to the view and loads it again |
| Presses **Cancel**, or closes the panel | Drops the changes |

- **Loading:** the picker says *Loading...* while the columns load; a failed load shows its error with **Details** and **Try again**.
- **Hidden columns:** the list leaves them out, and saving keeps them, as \`stage\` on *Won deals*.
- **Disabled:** the button while the provider loads, and **Save** while no visible column is left.
- **Saving:** clears the selection and mounts the control again on the same view; with unsaved changes, it asks first, as in *Act on deals*.

The picker offers what the provider's \`onGetAvailableColumns()\` returns: \`DealsProvider\` in *deals.ts* offers every deal column, as in [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview). When the provider's \`onGetAvailableRelatedColumns()\` returns related entities, a *Column source* picker lets the user add their columns too.

Each view keeps the columns the user saved while the control is mounted; [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview) keeps them longer.

## Try it

- Switch to *Won deals*, press **Edit columns** and add *Probability (%)*: it goes first in the list.
- Drag *Probability (%)* onto *Account manager* and press **Save**: the grid shows it second, after *Deal*.
- Switch to *All deals* and back: *Probability (%)* is still there.
- Open the editor again and remove every column: **Save** turns off.

## Remember

- The provider decides which columns are offered.
- Saving the editor mounts the control again, on the same view.
- Each view keeps the columns the user chose.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Features/Choose the columns',
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

export const ChooseTheColumns: Story = {
    name: 'Choose the columns',
    tags: ['!dev'],
    render: () => renderStory(<ChooseTheColumnsExample />),
}
