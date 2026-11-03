import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { UnsavedChangesBarExample } from '../../../grid/examples/writeModuleExamples'

const DESCRIPTION = `
A module packages a feature of your own: it registers hooks, follows events, shares an instance other parts of the grid can use, and draws its own UI inside the grid. The built-in modules are written the same way, against the same \`IGrid\`.

\`\`\`tsx
import { createClientSideRowModelModule, DatasetControl, Grid, IGridModule } from '@talxis/base-controls'

const HIGH = 1

export const urgentTicketsModule: IGridModule = {
    name: 'urgentTickets',
    onLoad: grid => {
        grid.services.get('cells').registerCellTheme((builder, { record }) => {
            if (Number(record.getValue('priority')) === HIGH) {
                builder.colors.text = '#a4262c'
            }
        })
    },
}

<DatasetControl onLoad={loadTickets}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), urgentTicketsModule]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Show an unsaved changes bar}}

## What a module is

| Member | Description |
|---|---|
| \`name\` | Unique within the grid. What \`onLoad\` returns is registered under it. |
| \`onLoad(grid)\` | Called once as the grid mounts, before AG Grid exists. Register your hooks and listeners here. |
| \`onDestroy(instance)\` | Called as the grid unmounts, with what \`onLoad\` returned. |
| \`agGridModules\` | AG Grid modules the feature needs. See *AG Grid modules* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). |

Build a module once, as a constant or in \`useMemo\`: \`modules\` is read at mount, see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). A module that needs options is a function that builds one, such as \`createCopyColumnModule(onCopied)\`, and reads state that changes through a getter or a ref. The examples on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview) do both.

Modules load in the order of the array, so in your \`onLoad\` the ones before yours are there for \`grid.modules.find\`; reach later ones with \`grid.modules.observe\`. AG Grid's api arrives later too: reach it with \`grid.services.observe('gridApi', ...)\`. \`onLoad\` runs while \`<Grid />\` first renders, so it must not set React state.

Take what the module works on from \`grid.services\`, such as \`grid.services.get('provider')\`, and it works in any grid.

## Clean up

What you register on the grid goes with it. Anything that outlives the grid keeps your module alive until you unsubscribe:

| You subscribed to | Clean up |
|---|---|
| Hooks, \`grid.events\`, the events of the grid's services and modules, AG Grid's api | Nothing. They go with the grid. |
| The provider, \`window\`, a timer or anything else outside the grid | Subscribe inside \`grid.services.observe('gridApi', ...)\` and return the unsubscribe. It runs as AG Grid is destroyed. |
| Something outside the grid that must be followed from \`onLoad\` on, before AG Grid is ready | Keep the unsubscribe in the instance and call it in \`onDestroy\`. |

\`addEventListener\` returns its own unsubscribe, so the usual case is a few lines:

\`\`\`tsx
import { IGridModule } from '@talxis/base-controls'
import { IRecordSaveOperationResult } from '@talxis/client-libraries'
import { telemetry } from './telemetry'

export const refusedSavesModule: IGridModule = {
    name: 'refusedSaves',
    onLoad: grid => {
        const provider = grid.services.get('provider')
        const onRecordSaved = (result: IRecordSaveOperationResult) => {
            if (!result.success) {
                telemetry.track('saveRefused', { recordId: result.recordId })
            }
        }
        grid.services.observe('gridApi', () => {
            return provider.addEventListener('onAfterRecordSaved', onRecordSaved)
        })
    },
}
\`\`\`

What the \`observe\` callback returns is taken as its cleanup: see *Services* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

## Share what your module builds

What \`onLoad\` returns is registered under the module's \`name\`. Other modules reach it with \`grid.modules.find(name)\`, and anything the grid draws with \`useGridModule(name)\`. An instance does not redraw anything by itself: when its state changes, tell whoever draws it, as the bar's \`subscribe\` does.

Add the name to \`IGridModuleMap\` once in your project, next to the module, and the instance is typed wherever you reach it:

\`\`\`tsx
export interface IUnsavedChanges {
    getCount(): number
    subscribe(listener: (count: number) => void): () => void
}

declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        unsavedChanges: IUnsavedChanges
    }
}
\`\`\`

The file has to import or export something, as this one exports \`IUnsavedChanges\`; otherwise \`declare module\` replaces the package's types instead of adding to them. A module whose \`onLoad\` returns nothing still needs an entry, typed \`void\`. A grid may not have your module, so \`find\` returns \`IUnsavedChanges | undefined\`, and \`get\` and \`useGridModule\` throw without it.

## Draw inside the grid

\`grid.services.get('surfaces').registerSurface(hook, priority?)\` adds something to what the grid draws inside its own element, after the rows. The hook pushes \`{ key, onRender }\`, and \`onRender\` returns what to draw, or \`null\` while there is nothing to show. A surface is inside the grid's React tree and theme, so it can call \`useGridService\` and \`useGridModule\`.

The list is read each time \`<Grid />\` renders, so a surface follows its own state, as the bar subscribes to its module. A surface that draws a block, such as the bar, makes a grid without \`height\` taller; callouts, panels and dialogs take no room. Surfaces are drawn in ascending priority, beside the built-in ones:

| Key | Drawn by |
|---|---|
| \`'filterCallout'\` | The filtering module, for a column's filter |
| \`'groupSelectionLimit'\` | The grouping module, when a selection would load too many groups |
| \`'notificationCallout'\` | The legacy client API module |
`

const meta = {
    title: 'Controls/Grid/Extending/Write a module',
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
                story: `A buyer updates prices across the catalogue, then saves once: the module returns an \`unsavedChanges\` instance, follows the provider's save events, and draws a bar through \`registerSurface\` that reads it with \`useGridModule\`. Try: change a few prices, then press *Save all* or *Discard*.`,
            },
        },
    },
}
