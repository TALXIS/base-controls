import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../grid/gridDocsPage'

const DESCRIPTION = `The reference for \`<DatasetControl />\`, and for the control it hands you. How to use them is in the guides each row links to.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`(params: IDatasetControlLoadParameters) => Promise<IDatasetControlLoadResult>\` | Required | Returns the provider for a view. Called at mount, on every view switch, and on \`loadView()\` and \`reload()\`. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview). |
| \`children\` | \`ReactNode\` | Required | The parts, in \`Header\`, \`Body\` and \`Footer\`. See [**Layout**](?path=/docs/datasetcontrol-get-started-layout--overview). |
| \`height\` | \`string\` | None | \`'100%'\` fills the parent; the content's height when left out. See [**Layout**](?path=/docs/datasetcontrol-get-started-layout--overview). |
| \`className\` | \`string\` | None | Added to the control's box. |
| \`stateKey\` | \`string\` | None | The key the control keeps the user's views under, so they come back on the next mount. Read once, at mount. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview). |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | Whether the control destroys the providers it lets go of. Set \`false\` for a provider shared with the rest of the page. |
| \`labels\` | \`Partial<IDatasetControlLabels>\` | \`DATASET_CONTROL_LABELS\` | The control's own strings. Read once, at mount. See [**Localization**](?path=/docs/datasetcontrol-customization-localization--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | Replacements for the box, the placeholder and the error. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). |
| \`onReady\` | \`(control: IDatasetControl) => void\` | None | Hands you the control once it exists, before the first load. |
| \`onDestroyed\` | \`(control: IDatasetControl) => void\` | None | Hands you the control as it unmounts, while its provider still holds its data. |

## IDatasetControl

The control as your code drives it. \`onReady\` and \`onDestroyed\` hand it to you, and \`useDatasetControl()\` returns it inside the control. See [**Your own parts**](?path=/docs/datasetcontrol-customization-your-own-parts--overview).

| Member | Type | Description |
|---|---|---|
| \`loadView(viewId)\` | \`(viewId: string) => Promise<void>\` | Loads the view through \`onLoad\`, on a new provider. Asks first when there are unsaved changes. |
| \`reload()\` | \`() => Promise<void>\` | Loads the view shown again, the same way. |
| \`retry()\` | \`() => Promise<void>\` | Runs the load that failed again. |
| \`getViewId()\` | \`() => string \\| undefined\` | The view the provider shown is for. |
| \`getProvider()\` | \`() => IDataProvider \\| undefined\` | The provider shown, from the last load that succeeded. |
| \`isLoading()\` | \`() => boolean\` | Whether a load is running. |
| \`getError()\` | \`() => unknown\` | What the last load threw, until the next one starts. |
| \`events\` | \`IEventSubscriber<IDatasetControlEvents>\` | The events below. |
| \`parts\` | \`IDatasetControlPartLocator\` | The parts rendered inside the control. See below. |

## Events

Subscribe with \`control.events.addEventListener(event, listener)\`.

| Event | Arguments | When it fires |
|---|---|---|
| \`onLoadStarted\` | None | A load starts: the first one, a view switch, \`loadView()\` or \`reload()\`. |
| \`onLoaded\` | \`provider: IDataProvider\` | A load is done, and its provider is now the one shown. |
| \`onLoadFailed\` | \`error: unknown\` | A load failed. The provider shown before, if any, stays. |
| \`onDestroyed\` | None | The control is unmounting. |

## Parts

\`control.parts\` finds a part by its key. A part is there only while it is rendered.

| Member | Description |
|---|---|
| \`get(key)\` | Returns the part; throws when it isn't rendered. |
| \`find(key)\` | Returns the part, or \`undefined\` when it isn't rendered. |
| \`whenAvailable(key, callback)\` | Calls back once the part is rendered. |

| Key | Part | Type |
|---|---|---|
| \`viewSwitcher\` | \`ViewSwitcher\` | \`IDatasetControlViewSwitcher\` |
| \`quickFind\` | \`QuickFind\` | \`IDatasetControlQuickFind\` |
| \`editColumns\` | \`EditColumns\` | \`IDatasetControlEditColumns\` |
| \`pagination\` | \`Pagination\` | \`IDatasetControlPagination\` |
| \`pageSizeSwitcher\` | \`PageSizeSwitcher\` | \`IDatasetControlPageSizeSwitcher\` |
| \`notifications\` | \`Notifications\` | \`IDatasetControlNotifications\` |

What each one offers is on [**Parts**](?path=/docs/datasetcontrol-api-parts--overview).
`

const meta = {
    title: 'DatasetControl/API/DatasetControl',
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

//a docs page needs a story to render on
export const Overview: Story = {
    name: 'Overview',
    render: () => null,
}
