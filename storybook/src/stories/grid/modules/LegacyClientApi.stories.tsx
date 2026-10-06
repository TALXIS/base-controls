import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyValuePlaceholdersExample, StockScriptExample, TicketRecommendationsExample } from '../../../grid/examples/legacyClientApiExamples'

const DESCRIPTION = `
Client scripts written against the dataset client API flag the records that need attention, colour cells, lock fields and show a cell as loading. They do it with *record expressions*, set per record and column: \`record.expressions.setDisabledExpression\`, \`record.expressions.ui.setNotificationsExpression\` and the others listed below. The legacy client API compatibility module makes \`<Grid.Root />\` draw what they set, so those scripts keep working.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
    }} />
\`\`\`

The module takes no options and needs no AG Grid Enterprise licence. Like every module, it is read once, at mount: see [**Modules**](?path=/docs/grid-modules--overview).

{{story: Recommend next steps on tickets}}

## Registering expressions

An expression is set on one record for one column, and setting it again replaces it. A record drops its expressions every time it loads again, and a successful save loads it again. So register them twice:

- on \`provider.getRecords()\`, for the records already loaded;
- on the provider's \`onRecordLoaded\` event, for every record loaded or saved after that.

The provider outlives the grid, so remove the listener on the runtime's \`onDestroyed\` event. Run the script from a module of your own in \`modules.custom\`, as every example on this page does: its \`onRegister\` runs before the first row is drawn. See [**Write a module**](?path=/docs/grid-extending-write-a-module--overview). An expression for a column the provider does not have is ignored, with a console warning.

An expression that reads only its own record's values redraws when they change. One that reads anything else, such as the time, another record or a flag of your own, does not: call \`provider.requestRender()\` once that changes, as the stock sync below does.

{{story: Colours, locks and loading from scripts}}

{{story: Say why a value is empty}}

## Expressions with and without the module

Every expression takes the column's logical name first. Some are answered by the record itself, so they work with or without the module.

| Expression | With the module | Without it |
|---|---|---|
| \`setDisabledExpression(column, () => boolean)\` | \`true\` locks the cell and shows its lock icon, in a grid with the editing module. \`false\` cannot open what the grid, the column or the record locks: see *With the rest of the grid*. | Ignored |
| \`ui.setNotificationsExpression(column, () => IAddControlNotificationOptions[])\` | Buttons in the cell: see *Notifications*. | Ignored |
| \`ui.setCustomFormattingExpression(column, cellTheme => ({ backgroundColor?, textColor?, primaryColor? }))\` | Colours the cell. A new background without a text or primary colour gets a readable one. \`cellTheme\` is a Fluent theme of the cell's current colours, and \`undefined\` leaves the cell as it is. \`className\` and \`themeOverride\` are ignored. | Ignored |
| \`ui.setLoadingExpression(column, () => boolean)\` | \`true\` draws a shimmer in place of the cell's value, lock icon, notifications and error. | Ignored |
| \`ui.setControlParametersExpression(column, parameters => parameters)\` | Adds to or overrides the parameters the cell's control gets, such as \`Placeholder\`, both while it shows the value and while it is edited. It cannot remove one. | Ignored |
| \`ui.setCustomControlsExpression(column, controls => controls)\` | Picks the control that draws or edits the cell, merged over the grid's own: the first one returned whose \`appliesTo\` is \`'both'\`, or \`'editor'\` while the cell takes input (one-click columns included) and \`'renderer'\` otherwise. The list you get starts with the grid's own control, which applies to both, so put yours first. An empty list falls back to the column's \`controls\`. | Ignored |
| \`IColumn.controls\` | Custom controls for the whole column, used where no expression returns any. | Ignored |
| \`provider.requestRender()\` | Redraws every cell and column header. | Redraws nothing in the grid |
| \`setValidationExpression(column, () => IFieldValidationResult)\` | Marks the cell invalid with the message and refuses the save. | The same |
| \`setRequiredLevelExpression(column, () => level)\` | \`'required'\` makes an empty value invalid; \`'none'\` and \`'recommended'\` do not. The header's required marker still follows the column's metadata. | The same |
| \`setValueExpression(column, () => any)\` | The value the cell shows until the user changes it. \`undefined\` keeps the stored value. | The same |
| \`setFormattedValueExpression(column, formattedValue => text)\` | The text the cell shows, handed the text it would show. Lookup links, files and coloured option sets are drawn from the value instead. | The same |
| \`setCurrencySymbolExpression(column, () => string)\` | The symbol a money cell shows. | The same |
| \`ui.setCustomControlComponentExpression\` | Not read by the grid. | Not read |

How validation and locks work in general is on [**Editing**](?path=/docs/grid-editing--overview).

## Notifications

Each notification an expression returns is an \`IAddControlNotificationOptions\`, drawn as a button in the cell, next to the value.

| Option | What the grid does with it |
|---|---|
| \`uniqueId\` | Required. Tells the cell's notifications apart, so keep it unique within the cell. |
| \`iconName\` | The Fluent icon on the button. |
| \`text\` | The button's label, and the title of the callout. |
| \`messages\` | Required. The first message is the callout's text; the others are not shown. |
| \`actions\` | What the user can do about it: \`{ message, iconName, actions }\`, where \`message\` is the label and \`actions\` are the callbacks that run. |
| \`buttonProps\` | Spread onto the button, a Fluent \`ICommandBarItemProps\`. \`iconOnly: true\` draws the icon alone, with \`text\` as its tooltip. Style it through \`buttonStyles\`. An \`iconProps\` here replaces the icon \`iconName\` gives. Its \`onClick\` runs before the grid's own. |
| \`buttonProps.renderedInOverflow\` | \`true\` puts the notification in the cell's **…** menu. |
| \`notificationLevel\` | Optional and ignored: \`'ERROR'\` and \`'RECOMMENDATION'\` look the same. |

What a click does:

- With exactly one action, its callbacks run at once and no callout opens, so the messages are never shown.
- Otherwise, if the notification has a \`text\` or a message, a callout opens with the title, the first message and the actions: two as buttons, the first one primary, and three or more as links. An action closes the callout, then runs its callbacks in order. Esc or a click outside closes it too.
- With neither actions nor content, a click runs only \`buttonProps.onClick\`.
- The grid shows one callout at a time: opening another notification replaces it.

When a notification shows:

- Only while its row is hovered, holds the focused cell or is selected. No setting keeps it visible.
- Not while the cell is open in an editor, and not while the cell is loading.
- Buttons that do not fit the cell move into its **…** menu by themselves.
- The expression runs each time a highlighted cell draws, so keep it cheap.
- A custom \`cellRenderer\` shows them only if it draws \`Grid.Cell.Commands\`: see [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview).

## With the rest of the grid

- Every hook the module registers runs at priority 0, \`GRID_MODULE_PRIORITY.legacyClientApiCompatibility\`, before every other built-in module. A hook of yours at the default priority runs after the module's, and a column's \`settings.cell\` callbacks run after both. The module's lock and loading hooks set the answer rather than add to it, so they overrule a hook with a negative priority. Priorities are on [**Extending**](?path=/docs/grid-extending--overview).
- The grid's validation replaces a script's \`setValidationExpression\`. A column with \`settings.cell.onGetValidation\`, or every column once a \`registerValidationHook\` is registered, gets the grid's own validation expression on every record, and the script's never runs. Move such a check into the grid's validation.
- A disabled expression cannot open a grid without the editing module, a column locked by its metadata or by \`settings.isLocked\`, or a record locked as a whole.
- With the module on, \`settings: { isLocked: false }\` in \`colDefs\` no longer opens a column whose metadata has \`IsValidForUpdate: false\`: the module still locks its cells. To open them, also return \`false\` from a \`setDisabledExpression\` on that column, or unlock them in \`settings.cell.onGetLock\`.
- While rows are grouped, the grouping module repaints record cells with the grid's background after this module runs. A script's background colour is lost, but the text colour picked to contrast with it stays.
- Group rows and the totals row are records too, and can carry expressions. Guard a script with \`record.getDataProvider().getSummarizationType() !== 'none'\`: see [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).
`

const meta = {
    title: 'Grid/Modules/Legacy client API',
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

export const RecommendNextStepsOnTickets: Story = {
    name: 'Recommend next steps on tickets',
    render: () => renderStory(<TicketRecommendationsExample />),
    parameters: {
        docs: {
            description: {
                story: `A support desk's script tells agents what to do about each ticket, through \`ui.setNotificationsExpression\` on the Subject column. Hover an overdue ticket and click *Overdue* for three ways out; the *Assign to me* icon on an unassigned ticket acts at once, and an escalated ticket keeps its notification under **…**.`,
            },
        },
    },
}

export const ColoursLocksAndLoadingFromScripts: Story = {
    name: 'Colours, locks and loading from scripts',
    render: () => renderStory(<StockScriptExample />),
    parameters: {
        docs: {
            description: {
                story: `An inventory script colours In stock with \`ui.setCustomFormattingExpression\` (amber at or below the reorder level, red when sold out), locks the price, stock, reorder level and supplier of discontinued products with \`setDisabledExpression\`, and shimmers In stock during a sync with \`ui.setLoadingExpression\` and \`provider.requestRender()\`. Bookshelf and Bar stool start locked: turn another product's Discontinued on to lock it too, or press **Sync stock**.`,
            },
        },
    },
}

export const SayWhyAValueIsEmpty: Story = {
    name: 'Say why a value is empty',
    render: () => renderStory(<EmptyValuePlaceholdersExample />),
    parameters: {
        docs: {
            description: {
                story: `A triage script gives an empty Assigned to a placeholder that says why, through \`ui.setControlParametersExpression\`. New tickets read *Waiting for triage*. Set one's Status to *In progress* and it reads *Unassigned*; so does a ticket in progress once you clear its Assigned to.`,
            },
        },
    },
}
