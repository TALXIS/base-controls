import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { YourFirstListExample } from '../../../../concepts/guide/basics/yourFirstListExamples'

const STEP = 'Your first list'

const DESCRIPTION = `
{{block: progress}}

A coffee chain is opening six stores across Europe, and this guide builds the app its team plans them in, one step at a time. This first step goes from an empty React application to the six stores in a grid.

{{canvas: Your first list}}

## How it works

### Install

\`\`\`bash
npm install @talxis/base-controls @talxis/client-libraries @fluentui/react@8.121.5
\`\`\`

Base Controls runs on React 16.8 or 17 and Fluent UI 8.121.5 or earlier.

### The root providers

Wrap the application in the providers once, then add controls anywhere below them, as the example does: the page renders its \`GridExample\`, which stands for your application's root component. \`PcfContextProvider\` and \`AppThemeProvider\` are required; add the others when you need what they provide.

| Provider | Provides | Without it |
|---|---|---|
| \`PcfContextProvider\` | The user, formatting, dialogs and data access: [**PCF context**](?path=/docs/concepts-pcf-context--overview) | The controls throw |
| \`AppThemeProvider\` | The theme: [**Theming**](?path=/docs/concepts-theming--overview) | The controls throw |
| \`StateProvider\` | A store for what controls keep across mounts: [**State persistence**](?path=/docs/concepts-state-persistence--overview) | Every control shares one in-memory store for the page |
| \`LabelsProvider\` | Your wording and translations: [**Localization**](?path=/docs/concepts-localization--overview) | English |

The controls draw Fluent's icons: register them once with \`initializeIcons()\` from \`@fluentui/react\`, as [**Fluent UI**](?path=/docs/concepts-fluent-ui--overview) describes.

### The list

Each store is a **record**: a row with a value in each column. A **data provider** holds the records, with their columns, sorting, filters, selection and unsaved changes; a \`DatasetControl\` loads it, and the grid in its body draws it. The stores are in *stores.ts* in **Code**.

| In the code | What it is |
|---|---|
| \`createStoresProvider\` | In *stores.ts*: a \`MemoryDataProvider\`, which keeps the records of \`STORES\` in memory and saves changes back into them. Every kind of provider is on [**Data providers**](?path=/docs/concepts-data-providers--overview). |
| \`onLoad\` | Returns \`{ provider }\`. The control calls it on every load, so \`loadStores\` makes a new provider each time, over the same \`STORES\`: see [**DatasetControl**](?path=/docs/controls-datasetcontrol-overview--overview). |
| \`DatasetControl.Body\`, \`ClientSideGrid\` | The body holds what draws the records: here a grid, which takes no provider of its own and draws the control's. See [**Grid**](?path=/docs/controls-grid-get-started--overview). |
| \`enableOptionSetColors\` | Draws each option that has a colour, such as each status in \`STATUSES\`, as a tag in that colour. Every prop of the grid is on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). |

The examples use \`React\` and \`dayjs\` without importing them; your own files import them.

## Try it

- In **Code**, open *stores.ts*, copy the last row of \`STORES\` below it, and give the copy the \`storeid\` \`'vienna'\` and the \`name\` \`'Vienna Naschmarkt'\`. Back in **Preview**, a seventh store is the last row.
- In *stores.ts*, change the \`Color\` of *Planned* to \`'#0078d4'\`: the planned stores turn blue.
- In *GridExample.tsx*, remove \`enableOptionSetColors\`: *Status* turns to plain text.

## Remember

- The root providers go once around the whole application.
- A provider holds the records, the \`DatasetControl\` loads it through \`onLoad\`, and the grid in its body draws it.
- \`onLoad\` runs on every load, so keep the records outside it.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Basics/Your first list',
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

export const YourFirstList: Story = {
    name: 'Your first list',
    tags: ['!dev'],
    render: () => renderStory(<YourFirstListExample />),
}
