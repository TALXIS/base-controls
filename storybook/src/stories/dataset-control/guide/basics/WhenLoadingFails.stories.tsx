import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { WhenLoadingFailsExample } from '../../../../dataset-control/guide/basics/whenLoadingFailsExamples'

const STEP = 'When loading fails'

const DESCRIPTION = `
{{block: progress}}

The deals service is down now and then, and the list has to recover. When a load throws, the control shows the error in place of the list, and the user tries again.

{{canvas: When loading fails}}

## How it works

From this step on, **Code** keeps the deals, their provider, the views and \`loadDeals\` of the last step in *deals.ts*, and the entry imports what it uses. The new lines carry \`//new:\`.

**A failed load.** \`loadDealsOrFail\` throws on every other load, as a service that does not answer would. When a load throws, from \`onLoad\`, a view's \`resolve\`, the provider's first page or a [**module**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview), the control draws the error in place of its parts and keeps no provider.

| The error shows | What it is |
|---|---|
| Its title | The error's \`message\`. |
| **Details** | Opens the error dialog with the error's \`cause\`, or its stack when it has none. |
| **Try again** | Mounts the control anew on the view that failed, so \`onLoad\` runs again. |

A part that throws while it draws shows the same error, and there **Try again** draws the parts again without a load. The error of a later load, such as a search, is on [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview), and every failure is under *Failures* on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

## Try it

- Press **Details**: the error dialog shows *The deals service did not respond within 30 seconds.*
- Press **Try again**: *My deals* opens.
- Switch to *Won deals*: this load fails too. Press **Try again**: *Won deals* opens.

## Remember

- Throw from \`onLoad\`, and the control shows the error in place of the list.
- The error's \`message\` is its title, and **Details** shows its \`cause\`.
- **Try again** loads the view that failed again.

Your list loads, switches views and recovers. Features adds the tools around it.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Basics/When loading fails',
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

export const WhenLoadingFails: Story = {
    name: 'When loading fails',
    tags: ['!dev'],
    render: () => renderStory(<WhenLoadingFailsExample />),
}
