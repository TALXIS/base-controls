import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { ModuleWithServiceExample } from '../../../grid/examples/writeModuleExamples'

const DESCRIPTION = `
A module is an object with an \`onRegister\` function. The grid calls it once, as it is created, with the runtime.

\`\`\`ts
interface IGridModule {
    /** Registers what the module adds to the grid. */
    onRegister?: (runtime: IGridRuntime) => void;
    /** AG Grid modules the feature needs. */
    agGridModules?: Module[];
}
\`\`\`

Pass your modules in \`modules.custom\`:

\`\`\`tsx
<Grid.Root provider={provider} modules={{ rowModel: createClientSideRowModelModule(), custom: [createMyModule()] }} />
\`\`\`

In \`onRegister\` a module can:

- register hooks on the grid's services, listed on [**Extending**](?path=/story/grid-extending--overview);
- listen to their events;
- register a service of its own, for what it draws to read;
- draw around the grid with \`registerSurfaceHook\`.

## A service of your own

Register it on \`runtime.services\`, and declare it once so \`services.get\` and \`useGridService\` know its type:

\`\`\`ts
declare module '@talxis/base-controls' {
    interface IGridOptionalServiceMap {
        clickCounter: IClickCounter;
    }
}

runtime.services.register('clickCounter', () => counter)
\`\`\`

\`useGridService('clickCounter')\` returns it, or \`undefined\` in a grid without the module.

## Cleaning up

A listener on something that outlives the grid, such as the provider, is removed on \`runtime.events\` \`onDestroyed\`.
`

const meta = {
    title: 'Grid/Extending/Write a module',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AModuleWithItsOwnService: Story = {
    name: 'A module with its own service',
    render: () => renderStory(<ModuleWithServiceExample />),
    parameters: {
        docs: {
            description: {
                story: `The module counts row clicks in a service of its own, and draws the count under the rows. Click a few rows.`,
            },
        },
    },
}
