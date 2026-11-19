import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { LoadingAndNothingToShowExample } from '../../../../grid/guide/make-it-yours/loadingAndNothingToShowExamples'

const STEP = 'Loading and nothing to show'

const DESCRIPTION = `
{{block: progress}}

When a filter leaves no deals, the grid should say what to try, and while the CRM saves, it should say what it waits for. This step draws the grid's empty state and loading overlay your way.

{{canvas: Loading and nothing to show}}

## How it works

Like [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview), this step starts from *the deal grid*; it hands the grid \`components\`. In **Code**, the new lines carry \`//new:\`.

**The overlays.** The grid draws an overlay over its rows while it has none, and another while the provider loads, from 150 ms into the load. \`components\` is the grid's only \`components\` prop, and it draws these pieces:

| Key | Draws |
|---|---|
| \`overlays.emptyState\` | The overlay of a grid with no rows |
| \`overlays.loading\` | The overlay while the provider loads |
| \`rows.loading\`, \`rows.error\` | The rows a \`ServerSideGrid\` draws in place of a group's deals while they load, or once they failed, as in [**Open groups on demand**](?path=/docs/controls-grid-guide-features-open-groups-on-demand--overview) |

Each piece's \`onRender\` draws its box. The empty state also has \`onRenderIcon\` and \`onRenderText\`, and the loading overlay \`onRenderSpinner\` and \`onRenderText\`. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview), and every slot with its default is under *Slots* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**The text.** The loading overlay's text is the provider's loading message, \`provider.setLoading(true, message)\`, and \`onRenderText\` draws it only while there is one. **Save** loads without a message, so the example's spinner says what the grid waits for. The empty state's text is a label: to change it, see [**Localization**](?path=/docs/concepts-localization--overview).

**Outside a grid.** A DatasetControl body that is not a grid shows the same empty state through \`DatasetControl.EmptyState\`, as the DatasetControl guide's [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview) shows.

## Try it

- Open *Value*'s menu, pick **Filter By**, pick *Greater than*, type 100000 and press **Apply**: no deal is worth that much, and the empty state shows the money icon and your hint.
- Open *Value*'s menu again and pick **Clear**. Change a value and press **Save**: the card covers the rows while the CRM saves.
- In **Code**, remove \`onRenderIcon\`: the empty state's own icon is back.

## Remember

- The grid's \`components\` draw its overlays, and the loading and failed rows of a \`ServerSideGrid\`.
- The loading text is the provider's message, and the empty state's text is a label.

Your grid looks as your app does. *Advanced* hands it to your code.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Make it yours/Loading and nothing to show',
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

export const LoadingAndNothingToShow: Story = {
    name: 'Loading and nothing to show',
    tags: ['!dev'],
    render: () => renderStory(<LoadingAndNothingToShowExample />),
}
