import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { BoardPerViewExample, YourOwnUiExample } from '../../../../dataset-control/guide/advanced/yourOwnUiExamples'

const STEP = 'Your own UI'

const DESCRIPTION = `
{{block: progress}}

The deal list should look and work as the rest of your app does. This step changes how a part draws a piece, adds a total of the selected deals as a part of your own, and draws a view as a board instead of a grid.

{{canvas: Your own UI}}

## How it works

There are three ways to change what the control draws, and the examples on this page use each:

| To change | Use | Here |
|---|---|---|
| A piece of a part, such as its button or a column in its callout | A slot in the part's \`components\` | The quick find's callout names each column's logical name |
| What sits in a region | A part of your own | *Selected* totals the selected deals |
| What draws the records | A body of your own, picked by the view's \`data\` | *Board* in the second example |

### Slots

The control and every part take a \`components\` map of pieces and slots, as on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview). A slot gets the props its default would get, and each default is exported, such as \`DatasetControlUiViewSwitcherComponents\`, so a slot can draw it and add to it. Every slot is under *Slots* on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview). Menu items and commands are not slots: they are added through the part's hooks, such as the ribbon's \`hooks.commands\` on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

\`className\` adds a class to the control's box. To put a context provider of yours around the parts, put it inside the control: it is drawn once the control has loaded, so it can call \`useDatasetControl()\`.

### Parts of your own

A part of your own is any component inside the control. \`useDataProviderEvents(events)\` returns the provider and draws the part again on each of the provider's events, as *Selected* does on \`onRecordsSelected\`; \`useDataProvider()\` returns it without drawing again. \`useDatasetControl()\` returns the control, and \`useControlStateStore(key)\` keeps what the part should remember for each view, as on [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview).

\`useProvidePart(control, key, create)\` makes the part's members once with \`create\` and provides them on the control under \`key\` while the part is drawn, for \`control.parts\` as on [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview). The key has to be one of \`IDatasetControlPartMap\`, so *types.ts* declares \`selectedValue\` on it, and that types what \`create\` returns. The hook's other form, and \`afterCommit\`, are under *Parts* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). For a part that looks like a built-in one, \`DatasetControl.Ui\` holds the regions and most parts as plain UI, with no control behind them; the ribbon and the notifications are not in it, so use the exported \`Ribbon\` and \`NotificationMessageBar\`.

## A board per view

{{canvas: A board per view}}

A view carries anything else in the \`data\` its \`resolve\` returns, and \`getView().data\` reads it, typed by the control's \`TData\`. \`DealsBody\` reads it to draw *Board* as \`DealBoard\` and every other view as the grid. Each view loads anew, so the body reads its view once.

\`DealBoard\` reads the deals from the provider, as every part does, so the quick find narrows the board as it does the grid; \`DatasetControl.EmptyState\` stands in for either while no deal matches. Edit columns changes the provider's columns, so offer it only while the body shows columns.

## Try it

- Click the search field: the callout lists *Deal (name)*.
- Tick three deals: *Selected* shows their total, and changes as you tick another.
- In *A board per view*, open *Board*: one column per stage. Search for *Contoso*: three cards are left.
- Search for *zzz*: the empty state stands in for the board.

## Remember

- Slots change how a piece is drawn; hooks add items and commands.
- A part of your own is any component inside the control, reading its provider.
- A view's \`data\` lets the body draw each view its own way.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Advanced/Your own UI',
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

export const YourOwnUi: Story = {
    name: 'Your own UI',
    tags: ['!dev'],
    render: () => renderStory(<YourOwnUiExample />),
}

export const ABoardPerView: Story = {
    name: 'A board per view',
    tags: ['!dev'],
    render: () => renderStory(<BoardPerViewExample />),
}
