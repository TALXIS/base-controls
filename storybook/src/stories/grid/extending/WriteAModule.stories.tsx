import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { UnsavedChangesBarExample } from '../../../grid/examples/writeModuleExamples'

const DESCRIPTION = `
A module packages a feature of your own: it registers hooks, follows events, adds a service other parts of the grid can use, and draws its own UI inside the grid. The built-in modules are written the same way, against the same \`IGrid\`.

## What a module is

A module is an \`IGridModule\`:

| Member | Description |
|---|---|
| \`onRegister(grid)\` | Called once, as the grid mounts, with the grid. Register your hooks, services and listeners here. |
| \`agGridModules\` | AG Grid modules the feature needs, registered as the grid mounts. See [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview). |

Pass your modules in \`modules.custom\`:

\`\`\`tsx
import { createClientSideRowModelModule, DatasetControl, Grid, IGridModule } from '@talxis/base-controls'
import { IDataProvider } from '@talxis/client-libraries'

const HIGH = 1

export const urgentTicketsModule: IGridModule = {
    onRegister: grid => {
        grid.services.get('cells').registerCellTheme((theme, { record }) => {
            if (Number(record.getValue('priority')) === HIGH) {
                theme.colors.text = '#a4262c'
            }
        })
    },
}

export const TicketQueue = (props: { provider: IDataProvider }) => <DatasetControl onLoad={async () => ({ provider: props.provider })}>
    <DatasetControl.Body>
        <Grid
            modules={{
                rowModel: createClientSideRowModelModule(),
                custom: [urgentTicketsModule],
            }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

- Build a module once, as a constant or in \`useMemo\`. \`modules\` is read at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/grid-props-and-events--overview).
- Yours register after the built-in ones, so their services, such as \`grid.services.find('rowSelection')\`, are already there in your \`onRegister\`.
- \`onRegister\` runs before AG Grid exists: reach its api with \`grid.services.whenAvailable('gridApi', gridApi => ...)\`. It also runs while \`<Grid />\` renders for the first time, so it must not set React state.
- Take what the module works on from \`grid.services\`, such as \`grid.services.get('provider')\`, rather than from outside, and it works in any grid.
- A module that needs options, or state of your app, is a function that builds one: \`createCopyColumnModule(onCopied)\`. Read state that changes through a getter or a ref, since the module is built once. The examples on [**Hooks**](?path=/docs/grid-extending-hooks--overview) do both.

## Clean up

The provider outlives the grid. A listener you add to it stays, and keeps your module alive, until you remove it. Remove it on the grid's \`onDestroyed\` event, which fires as the grid unmounts:

\`\`\`tsx
import { IGridModule } from '@talxis/base-controls'
import { IRecordSaveOperationResult } from '@talxis/client-libraries'
import { telemetry } from './telemetry'

export const refusedSavesModule: IGridModule = {
    onRegister: grid => {
        const provider = grid.services.get('provider')
        const onRecordSaved = (result: IRecordSaveOperationResult) => {
            if (!result.success) {
                telemetry.track('saveRefused', { recordId: result.recordId })
            }
        }
        provider.addEventListener('onAfterRecordSaved', onRecordSaved)
        grid.events.addEventListener('onDestroyed', () => provider.removeEventListener('onAfterRecordSaved', onRecordSaved))
    },
}
\`\`\`

The same goes for anything else outside the grid, such as a timer or a listener on \`window\`. Hooks, listeners on the grid's services and AG Grid's api go with the grid.

## Add a service of your own

\`grid.services.register(key, resolve)\` adds a service under a key of your own. Other modules then reach it with \`grid.services.find(key)\`, and anything the grid draws with \`useGridService(key)\`.

- \`resolve\` runs on every lookup and nothing is cached, so build the service once and return it: \`register('unsavedChanges', () => unsavedChanges)\`, never \`register('unsavedChanges', () => createUnsavedChanges())\`.
- Registering under a key that is taken replaces that service.
- A service does not redraw anything. When its state changes, tell whoever draws it, as the bar's \`subscribe\` does.

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
- A key in \`IGridModuleServiceMap\` is one a grid may not have, so \`find\` and \`useGridService\` return \`IUnsavedChanges | undefined\`, and \`get\` throws in a grid without your module.

## Draw inside the grid

\`grid.services.get('surfaces').registerSurface(hook, priority?)\` adds something to what the grid draws inside its own element, after the rows. The hook pushes \`{ key, onRender }\` onto the list, and \`onRender\` returns what to draw, or \`null\` while there is nothing to show.

- Surfaces are drawn in ascending priority. The built-in ones are the filter callout (\`'filterCallout'\`), the dialog grouping opens when a selection would load too many groups (\`'groupSelectionLimit'\`), and the legacy client API's notification callout (\`'notificationCallout'\`).
- A surface is inside the grid's React tree, so its components can call \`useGridService\`, and they are drawn in the grid's theme.
- The list is read each time \`<Grid />\` renders, not when your state changes, so a surface's component follows its own state, as the bar subscribes to its service. A surface hook registered after the grid mounted appears the next time \`<Grid />\` renders.
- A surface that draws a block, such as the bar, makes a grid without \`height\` taller, as the example shows. Callouts, panels and dialogs draw in a layer of their own and take no room.

{{story: Show an unsaved changes bar}}
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
    name: 'Show an unsaved changes bar',
    render: () => renderStory(<UnsavedChangesBarExample />),
    parameters: {
        docs: {
            description: {
                story: `A buyer updates prices across the catalogue, then saves once: the module registers an \`unsavedChanges\` service, follows the provider's save events, and draws a bar through \`registerSurface\` that reads the service with \`useGridService\`. Try: change a few prices, then press *Save all* or *Discard*.`,
            },
        },
    },
}
