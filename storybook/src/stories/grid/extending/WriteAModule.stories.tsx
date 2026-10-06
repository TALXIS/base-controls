import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { UnsavedChangesBarExample } from '../../../grid/examples/writeModuleExamples'

const DESCRIPTION = `
A module packages a feature of your own: it registers hooks, follows events, adds a service other parts of the grid can use, and draws its own UI inside the grid. The built-in modules are written the same way, against the same runtime.

## What a module is

A module is an \`IGridModule\`:

| Member | What it is |
|---|---|
| \`onRegister(runtime)\` | Called once, as the grid mounts, with the grid's runtime. Register your hooks, services and listeners here. |
| \`agGridModules\` | AG Grid modules the feature needs, registered as the grid mounts. See [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview). |

Pass your modules in \`modules.custom\`:

\`\`\`tsx
import { createClientSideRowModelModule, Grid, IGridModule } from '@talxis/base-controls'
import { IDataProvider } from '@talxis/client-libraries'

const HIGH = 1

export const urgentTicketsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellThemeHook((theme, { record }) => {
            if (Number(record.getValue('priority')) === HIGH) {
                theme.colors.text = '#a4262c'
            }
        })
    },
}

export const TicketQueue = (props: { provider: IDataProvider }) => <Grid.Root
    provider={props.provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        custom: [urgentTicketsModule],
    }} />
\`\`\`

- \`modules\` is read once, as the grid mounts. Build a module once, as a constant or in \`useMemo\`, and mount the grid again with a new \`key\` to swap it.
- Yours register after the built-in ones, so their services, such as \`runtime.services.find('rowSelection')\`, already answer in your \`onRegister\`: see [**Modules**](?path=/docs/grid-modules--overview).
- \`onRegister\` runs before AG Grid exists: reach its api with \`runtime.services.whenAvailable('gridApi', gridApi => ...)\`. It also runs while \`<Grid.Root />\` renders for the first time, so it must not set React state.
- Take what the module works on from \`runtime.services\`, such as \`runtime.services.get('provider')\`, rather than from outside, and it works in any grid.
- A module that needs options, or state of your app, is a function that builds one: \`createCopyColumnModule(onCopied)\`. Read state that changes through a getter or a ref, since the module is built once. The examples on [**Hooks**](?path=/docs/grid-extending-hooks--overview) do both.

## Cleaning up

The provider outlives the grid. A listener you add to it stays, and keeps your module alive, until you remove it. Remove it on the runtime's \`onDestroyed\` event, which fires as the grid unmounts:

\`\`\`tsx
import { IGridModule } from '@talxis/base-controls'
import { IRecordSaveOperationResult } from '@talxis/client-libraries'
import { telemetry } from './telemetry'

export const refusedSavesModule: IGridModule = {
    onRegister: runtime => {
        const provider = runtime.services.get('provider')
        const onRecordSaved = (result: IRecordSaveOperationResult) => {
            if (!result.success) {
                telemetry.track('saveRefused', { recordId: result.recordId })
            }
        }
        provider.addEventListener('onAfterRecordSaved', onRecordSaved)
        runtime.events.addEventListener('onDestroyed', () => provider.removeEventListener('onAfterRecordSaved', onRecordSaved))
    },
}
\`\`\`

The same goes for anything else outside the grid, such as a timer or a listener on \`window\`. Hooks, listeners on the grid's services and AG Grid's api go with the grid.

{{story: An unsaved changes bar}}

## A service of your own

\`runtime.services.register(key, resolve)\` adds a service under a key of your own. Other modules then reach it with \`runtime.services.find(key)\`, and anything the grid draws with \`useGridService(key)\`.

- \`resolve\` runs on every lookup and nothing is cached, so build the service once and hand it back: \`register('unsavedChanges', () => unsavedChanges)\`, never \`register('unsavedChanges', () => createUnsavedChanges())\`.
- Registering under a key that is taken replaces that service.
- A service only answers questions. When its state changes, tell whoever draws it, as the bar's \`subscribe\` does.

Declare the key once in your project, next to the module, and the key, the service's type and its methods are typed everywhere you reach it:

\`\`\`tsx
export interface IUnsavedChanges {
    getCount(): number
    subscribe(listener: (count: number) => void): () => void
}

declare module '@talxis/base-controls' {
    interface IGridModuleServiceMap {
        unsavedChanges: IUnsavedChanges
    }
}
\`\`\`

- The file has to import or export something, as this one exports \`IUnsavedChanges\`. In a file that does neither, \`declare module\` replaces the package's types instead of adding to them.
- A key in \`IGridModuleServiceMap\` is one a grid may not have, so \`find\` and \`useGridService\` answer \`IUnsavedChanges | undefined\`, and \`get\` throws in a grid without your module.
- The live example uses \`declare global\` in place of \`declare module\`, because the docs editor declares the grid's types globally.

## Drawing inside the grid

\`runtime.services.get('surfaces').registerSurfaceHook(hook, priority?)\` adds something to what the grid draws inside its own element, after the rows. The hook pushes \`{ key, onRender }\` onto the list, and \`onRender\` returns what to draw, or \`null\` while there is nothing to show.

- Surfaces are drawn in ascending priority. The built-in ones are the filter callout (\`'filterCallout'\`), the dialog grouping opens when a selection would load too many groups (\`'groupSelectionLimit'\`), and the legacy client API's notification callout (\`'notificationCallout'\`).
- A surface is inside the grid's React tree, so its components can call \`useGridService\`, and they are drawn in the grid's theme.
- The list is read each time \`<Grid.Root />\` renders, not when your state changes, so a surface's component follows its own state, as the bar subscribes to its service. A surface hook registered after the grid mounted appears the next time \`<Grid.Root />\` renders.
- A surface that draws a block, such as the bar, makes a grid without \`height\` taller, as the example shows. Callouts, panels and dialogs draw in a layer of their own and take no room.
`

const meta = {
    title: 'Grid/Extending/Write a module',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AnUnsavedChangesBar: Story = {
    name: 'An unsaved changes bar',
    render: () => renderStory(<UnsavedChangesBarExample />),
    parameters: {
        docs: {
            description: {
                story: `A buyer updates prices and stock across the catalogue, then saves once. The module registers an \`unsavedChanges\` service with \`getCount()\` and \`subscribe()\`, follows the provider's \`onRecordColumnValueChanged\`, \`onAfterRecordSaved\` and \`onNewDataLoaded\`, and draws a bar through \`registerSurfaceHook\` whose component reads the service with \`useGridService\`. Change a few prices: the bar counts the products, Save all saves them, and Discard puts the old values back.`,
            },
        },
    },
}
