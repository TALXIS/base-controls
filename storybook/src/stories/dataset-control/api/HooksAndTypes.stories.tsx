import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../grid/gridDocsPage'

const DESCRIPTION = `The hooks for components inside a DatasetControl, and the types the props and the parts use.

## Hooks

| Hook | Returns | Description |
|---|---|---|
| \`useDatasetControl()\` | \`IDatasetControl\` | The control the component is inside of; throws outside one. See [**DatasetControl**](?path=/docs/datasetcontrol-api-datasetcontrol--overview). |
| \`useDataProvider()\` | \`IDataProvider\` | The provider \`onLoad\` returned; throws outside a loaded control. |
| \`useDataProviderEvents(events)\` | \`IDataProvider\` | The provider, and draws the component again on each of the provider's \`events\`, such as \`['onRecordsSelected']\`. Read once, at mount. See [**Your own parts**](?path=/docs/datasetcontrol-customization-your-own-parts--overview). |
| \`useControlStateStore(stateKey)\` | \`IStateStore\` | Where a component of your own keeps its state, per view. Without a \`stateKey\`, it keeps nothing. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview). |
| \`useDatasetControlRegion()\` | \`'start' \\| 'end' \\| undefined\` | Which side of the header or footer the component is in. |

## IDatasetControlLoadParameters

What \`onLoad\` is called with. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview).

| Field | Type | Description |
|---|---|---|
| \`viewId\` | \`string \\| undefined\` | The view to load: the one picked, or on the first load the one the control kept. \`undefined\` when there is none, for \`onLoad\` to pick the default. |

## IDatasetControlLoadResult

What \`onLoad\` returns.

| Field | Type | Default | Description |
|---|---|---|---|
| \`provider\` | \`IDataProvider\` | Required | The provider every part works on. |
| \`viewId\` | \`string\` | The \`viewId\` \`onLoad\` was called with | The view \`provider\` shows, when \`onLoad\` picked the default. |

## IDatasetControlView

A view the view switcher lists. See [**Views**](?path=/docs/datasetcontrol-parts-views--overview).

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string\` | The id \`onLoad\` is called with. |
| \`name\` | \`string\` | Shown in the switcher. |
| \`group\` | \`string\` | The header the view is listed under; *System views* when left out. |

## IRibbonCommand

A command the ribbon draws as a button. See [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview).

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string\` | Identifies the command across loads. Required. |
| \`label\` | \`string\` | The button's text. Required. |
| \`tooltip\` | \`string\` | Shown on hover. |
| \`iconName\` | \`string\` | A Fluent icon name. |
| \`isDisabled\` | \`boolean\` | Shows the button disabled. |
| \`onExecute\` | \`() => Promise<void> \\| void\` | Runs when the button is clicked. The button is disabled until it settles. Required. |

## IDatasetControlRecordRange

Which records of how many the page shows. See [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview).

| Field | Type | Description |
|---|---|---|
| \`first\` | \`number\` | The first record on the page, counted from 1; \`0\` when the page is empty. |
| \`last\` | \`string\` | The last record on the page, with a \`+\` when there are more pages but no total. |
| \`total\` | \`string \\| undefined\` | How many records there are; \`'5000+'\` past the provider's count limit, \`undefined\` when it does not count. |

## INotificationMessage

A message of the notification bar. See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview).

| Field | Type | Description |
|---|---|---|
| \`text\` | \`string\` | What the message says. |
| \`level\` | \`'ERROR' \\| 'WARNING' \\| 'INFO'\` | How it is drawn; the most severe one sets the bar's look. |

## IDatasetControlProviderState

What the control keeps of a view's provider in the state store. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview).

| Field | Type |
|---|---|
| \`columns\` | \`IColumn[]\` |
| \`linking\` | \`ILinkEntityExposedExpression[]\` |
| \`sorting\` | \`SortStatus[]\` |
| \`filtering\` | \`FilterExpression \\| null\` |
| \`pageSize\`, \`pageNumber\` | \`number\` |
| \`searchQuery\` | \`string\` |
| \`selectedRecordIds\` | \`string[]\` |

## IEventSubscriber

What every \`events\` member is: \`addEventListener(event, listener)\` and \`removeEventListener(event, listener)\`. Remove a listener with the same function you added.
`

const meta = {
    title: 'DatasetControl/API/Hooks and types',
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
