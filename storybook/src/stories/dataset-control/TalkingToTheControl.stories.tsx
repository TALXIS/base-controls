import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DriveTheControlExample, ModuleExample, WatchTheControlExample } from '../../dataset-control/examples/talkingExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Your code can do what the user does through the parts: switch the view, reload, search or open the column editor, from a button of your own or from a module. It does so through the \`IDatasetControl\`, which every mount of the control creates and hands to you. Try it below: press **Search Contoso** in the footer.

{{canvas: Drive the control from a toolbar}}

## Get the control

Inside the control, any component gets it from \`useDatasetControl()\`, as the toolbar above does. Outside it, \`onSetup\` hands it to you as each mount starts, so add your listeners there: every load is a new mount with a new \`IDatasetControl\`, as [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) explains.

{{story: Watch the control load}}

## Switch and reload views

\`loadView(viewId)\` opens a view as picking it does, \`reload()\` opens the current one again, and \`lifecycle.remount()\` the one that failed. Each mounts the control anew; all but \`lifecycle.remount()\` first ask about unsaved changes, as on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).

## Follow the load

\`control.lifecycle.events\` raises the events every runtime has, described on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). For the control:

| Event | Raised when |
|---|---|
| \`onReady\` | The load succeeded, and the parts are drawn on \`getProvider()\`. |
| \`onInitFailed(error)\` | The load failed: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview). |
| \`onRemountRequested\` | The control is about to mount anew, by \`loadView\`, \`reload\` or \`lifecycle.remount\`. |
| \`onDestroyed\` | The mount goes, before its modules and provider are destroyed. |

## Reach the parts

Every part on the page registers itself on the control under its own key, for as long as it is rendered, and \`control.parts\` finds it. The parts are drawn once the load succeeds, so outside a part's own render use \`observe\` or \`find\`. Each part's own page lists its members.

| Member | Does |
|---|---|
| \`get(key)\` | Returns the part; throws when it is not rendered. |
| \`find(key)\` | Returns the part, or \`undefined\` when it is not rendered. |
| \`observe(key, callback)\` | Calls back with the part each time it is rendered, and returns the function that stops observing. What the callback returns runs before the next call. |

## Add a module

A module adds a feature to the control, such as the user's own views. Pass modules in \`modules\`: each mount loads them anew, before the control's \`onLoad\`. \`control.modules\` finds them by name with \`get\`, \`find\` and \`observe\`, and \`useDatasetControlModule(name)\` does inside the control.

{{story: Add a view from a module}}

| Member | Description |
|---|---|
| \`name\` | Unique within the control; two modules of one name throw "registered twice". What \`onLoad\` returns is registered under it. |
| \`onLoad(control)\` | Can be async. A throw fails the load. |
| \`onDestroy(instance)\` | Optional. Called as the mount goes, before the provider is released. |

Declare what a module's \`onLoad\` returns, so \`control.modules.get\` is typed, as the example's \`types.ts\` does. The control a module's \`onLoad\` gets can also add views, with \`registerViews\`, as the example does, and a module draws its own dialogs or panels with \`surfaces.registerSurface\`.

## Reference

### The control

| Member | Description |
|---|---|
| \`loadView(viewId)\` | Mounts the control anew on the view, as picking it in the view switcher does. |
| \`reload()\` | Mounts the control anew on the view shown. |
| \`getViews()\` | The views of this mount. See [**Views**](?path=/docs/controls-datasetcontrol-views--overview). |
| \`getViewId()\`, \`getView()\` | The view shown, and the same view as it was resolved, with its columns and \`data\`. |
| \`getProvider()\` | The provider shown; \`undefined\` until the load succeeds. Inside the control, \`useDataProvider()\` returns it too. |
| \`parts\`, \`modules\` | The parts and the modules, under *Reach the parts* and *Add a module*. |
| \`surfaces.registerSurface(hook, priority?)\` | Draws a dialog or panel of your own in the control: \`hook(items)\` pushes \`{ key, onRender }\`, and \`onRender\` returns \`null\` while there is nothing to show. |
| \`lifecycle\` | The status, the error and the lifecycle events, and \`remount()\` for the view that failed to load. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`getLabels(set)\` | A label set as the control's \`LabelsProvider\` gives it: see [**Localization**](?path=/docs/concepts-localization--overview). |
| \`getTheme()\` | The Fluent theme the control is drawn in: see [**Theming**](?path=/docs/concepts-theming--overview). |

### Part keys

| Key | Part |
|---|---|
| \`viewSwitcher\` | [**Views**](?path=/docs/controls-datasetcontrol-views--overview) |
| \`ribbon\` | [**Ribbon**](?path=/docs/controls-datasetcontrol-parts-ribbon--overview) |
| \`quickFind\` | [**Quick find**](?path=/docs/controls-datasetcontrol-parts-quick-find--overview) |
| \`editColumns\` | [**Edit columns**](?path=/docs/controls-datasetcontrol-parts-edit-columns--overview) |
| \`pagination\`, \`pageSizeSwitcher\` | [**Paging**](?path=/docs/controls-datasetcontrol-parts-paging--overview) |
| \`notifications\` | [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview) |
| \`grid\` | The grid in the body: [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview) |
| \`loadingOverlay\` | Always there. \`show(message?)\` covers the whole control and returns the function that hides it; it stays until every caller has hidden it. |

### What a module's control adds

| Member | Description |
|---|---|
| \`registerViews(hook, priority?)\` | Adds to or changes the views \`onLoad\` returned: \`hook(views)\` changes them in place. |
| \`getViewStateStore()\` | The open view's entry in the state store. |

Each \`register…\` returns its unregistration, and a higher \`priority\` runs later.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/controls-datasetcontrol-loading-data--overview', text: 'The steps each mount runs, and when its lifecycle events are raised.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'The first of the parts, and what your code can do with it.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Parts of your own, registered on the control like the built-in ones.' },
]

const meta = {
    title: 'Controls/DatasetControl/Talking to the control',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const DriveTheControl: Story = {
    name: 'Drive the control from a toolbar',
    render: () => renderStory(<DriveTheControlExample />),
}

export const WatchTheControl: Story = {
    name: 'Watch the control load',
    render: () => renderStory(<WatchTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onSetup\` and the lifecycle events of every mount, newest first. Try: press **Reload** and watch the old mount go and a new one start.`,
            },
        },
    },
}

export const AddAViewFromAModule: Story = {
    name: 'Add a view from a module',
    render: () => renderStory(<ModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `A module of your own adds *Closing soon* to the views \`onLoad\` returns, through \`registerViews\`. Try: pick *Closing soon* under *Reports* in the view switcher.`,
            },
        },
    },
}
