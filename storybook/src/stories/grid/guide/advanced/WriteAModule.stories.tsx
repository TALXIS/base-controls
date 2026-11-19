import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { ReopenTheLastOpenedDealExample, WriteAModuleExample } from '../../../../grid/guide/advanced/writeAModuleExamples'

const STEP = 'Write a module'

const DESCRIPTION = `
{{block: progress}}

The closed-deal lock and an unsaved changes bar become modules that any deal grid takes with one line in its \`modules\`. This step writes both, and a module that keeps the last deal the user opened.

{{canvas: Write a module}}

## How it works

Like [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview), this step starts from *the deal grid*. In **Code**, the new lines carry \`//new:\`.

**A module of your own** is an object in the grid's \`modules\`, beside the built-in ones; what a module is, for every control, is on the Concepts guide's [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview).

| Member | Description |
|---|---|
| \`name\` | Unique within the grid; two modules of one name fail the mount. What \`onLoad\` returns is provided under it. |
| \`onLoad(grid, { signal })\` | Runs on every mount, before AG Grid exists, and may return a promise, which the grid awaits. A throw shows the error in the grid with *Try again*. \`signal\` is aborted when the mount goes or another module fails. |
| \`onDestroy(instance)\` | Optional. Called with what \`onLoad\` returned as the grid unmounts, the last loaded first. |
| \`priority\` | Optional, \`0\` by default, as on every built-in module. Lower loads first, and modules of one priority load at the same time. |
| \`agGridModules\` | Optional. The AG Grid modules the feature needs: see [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview). |

In \`onLoad\`, \`grid.modules\` finds only the modules of a lower priority, so \`closedDealsModule\` waits for the editing module with \`observe\`; \`priority: 1\` would load it after the built-in ones instead. When each step of a mount runs is on [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview). Take what a module works on from \`grid.services\`, such as the \`provider\`, and it works in any grid. \`modules\` is read at mount, so a module that takes parameters is a function that builds one, such as \`createLastOpenedDealModule(onOpened)\` below, and reads what changes through a getter or a ref.

**Clean up.** What a module adds to the grid goes with the grid; what outlives it keeps the module alive until you unsubscribe:

| You subscribed to | Clean up |
|---|---|
| Hooks, \`grid.events\`, the events of the grid's services and modules, AG Grid's api | Nothing: they go with the grid |
| The provider, \`window\`, a timer or anything else outside the grid | Subscribe inside \`grid.services.observe('gridApi', …)\` and return the unsubscribe, as \`unsavedChangesModule\` does: it runs as AG Grid goes |
| Something outside the grid that must be followed from \`onLoad\` on | Unsubscribe on \`grid.lifecycle.events\`' \`onDestroyed\`, or keep the unsubscribe in the instance and call it in \`onDestroy\` |

**Share what \`onLoad\` returns.** What \`onLoad\` returns is the module's instance: other modules reach it with \`grid.modules.find(name)\`, and what the grid draws with \`useGridModule(name)\`, as the bar does. An instance draws nothing again by itself, so when its state changes, tell whoever draws it, as \`subscribe\` tells the bar. *types.ts* adds each module to \`IGridModuleMap\`, \`void\` for a module whose \`onLoad\` returns nothing, so \`modules.get\` and \`useGridModule\` are typed. The file has to import or export something, or \`declare module\` replaces the package's types instead of adding to them. It does not run on this page, so it sits in **Code** beside the example.

**Draw inside the grid.** The \`surfaces\` service holds what the grid draws inside its own element, after the rows. A \`surfaces.hooks.surfaces\` hook pushes \`{ key, onRender }\`, and \`onRender\` returns what to draw, or \`null\` while there is nothing to show; it draws inside the grid, so it can call \`useGridService\` and \`useGridModule\`. A block, such as the bar, takes room under the rows, while a callout, a panel or a dialog takes none: draw those with Base Controls' \`Callout\`, \`Panel\` or \`Dialog\`, which follow the app theme, as on [**Fluent UI**](?path=/docs/concepts-fluent-ui--overview). Surfaces are drawn in ascending priority, beside the built-in ones, such as the filter callout; their keys are under *Hooks* on [**Reference**](?path=/docs/controls-grid-reference--overview).

## Keep a module's state

The \`state\` service is the store under the grid's \`stateKey\`, where the grid keeps its scroll, focus and open groups, as on [**Back where they left off**](?path=/docs/controls-grid-guide-features-back-where-they-left-off--overview). A module keeps what it should remember under a key of its own with \`get\`, \`set\` and \`delete\`, reads it once AG Grid is ready, and writes it when it changes. Without a \`stateKey\`, the store starts empty on every mount.

{{canvas: Reopen the last opened deal}}

## Try it

- Change the values of two deals: the bar under the rows says *2 deals have unsaved changes.* Press **Save all**: the bar goes once the CRM has saved them.
- Double-click the *Value* of a won deal: no editor opens, as on [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview), and the rule now loads as a module.
- In **Code**, remove \`closedDealsModule\` from \`modules\`: the won deals open.
- In *Reopen the last opened deal*, click a deal, then turn *Show the deals* off and on: the bar names that deal again.

## Remember

- A module is a \`name\` and an \`onLoad\`, listed in \`modules\` beside the built-in ones.
- Clean up what outlives the grid, such as the provider's listeners.
- Share what \`onLoad\` returns, draw inside the grid with \`surfaces\`, and keep state under a key of your own.

You have seen the whole Grid. Every prop, event, module, hook, service key and slot is on [**Reference**](?path=/docs/controls-grid-reference--overview).

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Advanced/Write a module',
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

export const WriteAModule: Story = {
    name: 'Write a module',
    tags: ['!dev'],
    render: () => renderStory(<WriteAModuleExample />),
}

export const ReopenTheLastOpenedDeal: Story = {
    name: 'Reopen the last opened deal',
    tags: ['!dev'],
    render: () => renderStory(<ReopenTheLastOpenedDealExample />),
}
