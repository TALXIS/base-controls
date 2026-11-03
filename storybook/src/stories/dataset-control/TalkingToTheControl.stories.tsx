import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DriveTheControlExample, ModuleExample, WatchTheControlExample } from '../../dataset-control/examples/talkingExamples'

const DESCRIPTION = `
The user works the control through its parts, but your code can do the same: switch the view, reload, search or open the column editor, from a button of your own or from a module. It does so through one object, the \`IDatasetControl\`, which every mount of the control creates and hands to you. Try the toolbar in the footer below: it is your own, and it switches and reloads views, searches and opens the column editor through the control.

{{canvas: Drive the control from a toolbar}}

## Get the control

Inside the control, any component gets it from \`useDatasetControl()\`, as the toolbar in the first example does.

Outside it, \`onMounted\`, \`onReady\` and \`onDestroyed\` hand it to you, at the steps under *Lifecycle* on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview). Add your listeners in \`onMounted\`: every load is a new mount with a new \`IDatasetControl\`.

{{story: Watch the control load}}

## Views and loading

| Member | Description |
|---|---|
| \`loadView(viewId)\` | Mounts the control anew on the view, as picking it in the view switcher does. |
| \`reload()\` | Mounts the control anew on the view shown. |
| \`retry()\` | Mounts the control anew on the view that failed to load. |
| \`getViews()\` | The views of this mount. See [**Views**](?path=/docs/controls-datasetcontrol-views--overview). |
| \`getViewId()\`, \`getView()\` | The view shown, and the same view as it was resolved, with its columns and \`data\`. |
| \`getProvider()\` | The provider shown; \`undefined\` until the load succeeds. Inside the control, \`useDataProvider()\` returns it too. |
| \`getDependencies<T>()\` | What \`onLoadDependencies\` loaded for this mount. |
| \`isLoadingView()\` | Whether the load is running, behind the placeholder. |
| \`getError()\` | What the load threw. |

\`loadView()\` and \`reload()\` ask the user first when the records have unsaved changes, and do nothing if they keep them. \`retry()\` does not ask.

## Events

| Event | Arguments | When it fires |
|---|---|---|
| \`onLoadStarted\` | None | The mount's load starts. |
| \`onLoaded\` | \`provider\` | The load succeeded, and the parts are drawn on \`provider\`. |
| \`onLoadFailed\` | \`error\` | The load failed. See [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview). |
| \`onDestroyed\` | None | The mount goes. |

Each fires at most once per \`IDatasetControl\`. \`addEventListener\` returns its own unsubscribe.

## Reach the parts

Every part on the page registers itself on the control under its own key, for as long as it is rendered. \`control.parts\` finds it:

| Call | Returns |
|---|---|
| \`get(key)\` | The part; throws when it isn't rendered. |
| \`find(key)\` | The part, or \`undefined\` when it isn't rendered. |
| \`observe(key, callback)\` | Calls back with the part each time it is rendered, and returns the function that stops observing. What the callback returns runs before the next call. |

| Key | Part | What you do with it |
|---|---|---|
| \`viewSwitcher\` | [**Views**](?path=/docs/controls-datasetcontrol-views--overview) | List the views, pick one, add to the menu. |
| \`ribbon\` | [**Ribbon**](?path=/docs/controls-datasetcontrol-parts-ribbon--overview) | Load the commands again, add commands. |
| \`quickFind\` | [**Quick find**](?path=/docs/controls-datasetcontrol-parts-quick-find--overview) | Set the query and search. |
| \`editColumns\` | [**Edit columns**](?path=/docs/controls-datasetcontrol-parts-edit-columns--overview) | Open, save and close the column editor, add commands. |
| \`pagination\`, \`pageSizeSwitcher\` | [**Paging**](?path=/docs/controls-datasetcontrol-parts-paging--overview) | Move between pages, change the page size. |
| \`notifications\` | [**Notifications and empty records**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-records--overview) | Read the provider's load error. |
| \`grid\` | [**Grid**](?path=/docs/controls-grid-get-started--overview) | Reach the grid in the body and its modules. |
| \`loadingOverlay\` | Always there | Cover the whole control: \`show(message?)\` returns the function that hides it again, and it stays until every caller has hidden it. |

The parts are drawn once the load succeeds, so outside a part's own render use \`observe\` or \`find\`. Each part's page lists its members under *From your code*.

## Modules

A module adds a feature to the control, such as the user's own views. Pass modules in \`modules\`: each mount loads them anew, as *Lifecycle* on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview) shows. \`control.modules\` finds them by name with \`get\`, \`find\` and \`observe\`, and \`useDatasetControlModule(name)\` does inside the control.

{{story: Add a view from a module}}

Declare what a module's \`onLoad\` returns, so \`control.modules.get\` is typed:

\`\`\`ts
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        dealAlerts: DealAlerts
    }
}
\`\`\`

| Member | Description |
|---|---|
| \`name\` | Unique within the control; two modules of one name throw "registered twice". What \`onLoad\` returns is registered under it. |
| \`onLoad(control)\` | Can be async. A throw fails the load. |
| \`onDestroy(instance)\` | Optional. Called as the mount goes, before the provider is released. |

The control a module's \`onLoad\` gets also has:

| Member | Description |
|---|---|
| \`registerViews(hook, priority?)\` | Adds to or changes the views \`onLoadViews\` returned: \`hook(views)\` changes them in place. |
| \`getViewStateStore()\` | The open view's entry in the state store. |
| \`surfaces.registerSurface(hook, priority?)\` | Draws something in the control, such as a dialog: \`hook(surfaces)\` pushes \`{ key, onRender }\`, and \`onRender\` returns \`null\` while there is nothing to show. |

Each \`register…\` returns its unregistration.

## Labels and theme

| Member | Description |
|---|---|
| \`getLabels(set)\` | A label set as the control's \`LabelsProvider\` gives it, such as \`control.getLabels(QUICK_FIND_LABELS).get('quickFind.defaultCollectionName')\`. See [**Localization**](?path=/docs/concepts-localization--overview). |
| \`getTheme()\` | The Fluent theme the control is drawn in. See [**Theming**](?path=/docs/concepts-theming--overview). |

A dialog a module draws is a surface over the application, so draw it in the theme \`useApplicationTheme()\` returns.
`

const meta = {
    title: 'Controls/DatasetControl/Talking to the control',
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

export const DriveTheControl: Story = {
    name: 'Drive the control from a toolbar',
    render: () => renderStory(<DriveTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `A toolbar of your own in the footer: it switches and reloads views through the control, and searches and opens the column editor through \`control.parts\`. Try: press each button, then open **Code**.`,
            },
        },
    },
}

export const WatchTheControl: Story = {
    name: 'Watch the control load',
    render: () => renderStory(<WatchTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `The control's events and its \`onMounted\`, \`onReady\` and \`onDestroyed\`, newest first. Try: switch the view and watch the old mount go and a new one start, press *Show won deals*, which calls \`loadView('won')\`, then *Remount*.`,
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
                story: `A module of your own adds *Closing soon* to the views \`onLoadViews\` lists, through \`registerViews\`. Try: pick *Closing soon* under *Reports* in the view switcher, then rename it in the module's code.`,
            },
        },
    },
}
