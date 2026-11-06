import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { EmptyValuePlaceholdersExample, StockScriptExample, TicketRecommendationsExample } from '../../../grid/examples/legacyClientApiExamples'

const DESCRIPTION = `
The dataset client API is what Power Apps client scripts use to change how a view's records are drawn: they set *record expressions* per record and column to flag records, colour cells, lock fields and show a cell as loading. The legacy client API compatibility module makes the grid draw what those expressions set, so such scripts keep working. Try it below: hover an overdue ticket and click *Overdue*.

{{canvas: Recommend next steps on tickets}}

## Register expressions

A record drops its expressions every time it loads again, so register them on \`provider.getRecords()\` for the records already loaded, and in the provider's \`onRecordLoaded\` for every record loaded or saved after that. Run the script from a module of your own, as every example on this page does, and stop listening when the grid goes (see *Clean up* on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview)).

An expression that reads anything besides its own record's values, such as the time or another record, needs \`provider.requestRender()\` when that changes, as the stock sync below does. An expression for a column the provider does not have is ignored with a console warning.

{{story: Colour, lock and load cells from a script}}

## Expressions with and without the module

Every expression takes the column's logical name first. The ones the record reads itself, such as validation, the value and the formatted value, work with or without the module; the ones that draw, such as colours, locks, loading, notifications and controls, need it. Every expression is under *Reference* below.

{{story: Say why a value is empty}}

## Notifications

Each notification \`ui.setNotificationsExpression\` returns is an \`IAddControlNotificationOptions\`, drawn as a button among the cell's commands; its options are under *Reference* below.

| The notification has | A click |
|---|---|
| Exactly one action | Runs its callbacks at once; no callout opens, so the messages are never shown |
| Several actions, or none, and a \`text\` or a message | Opens a callout with the title, the first message and the actions. An action closes the callout, then runs its callbacks. |
| No actions and no content | Runs only \`buttonProps.onClick\` |

Notifications show only while their row is hovered, holds the focused cell or is selected, and not while the cell is being edited or loading; buttons that do not fit move into the **…** menu. The expression runs each time such a cell draws, so keep it cheap. The grid shows one callout at a time, and it cannot be restyled. A \`cellRenderer\` of your own shows notifications only if it draws \`Grid.Cell.Commands\` (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)).

## With the rest of the grid

The module registers its hooks at \`GRID_MODULE_PRIORITY.legacyClientApiCompatibility\`, which is \`0\`: ahead of every other built-in module, and level with any hook you register without a priority. Hooks at a higher priority can change its locks, loading and colours (see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)).

The grid's validation replaces a script's \`setValidationExpression\` on a column with \`context.cell.validationHook\`, and on every column once a \`addValidationHook\` hook exists. Move such a check into the grid's validation (see *Validation* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview)).

| When | What happens |
|---|---|
| There is no editing module, the column is locked, or the record is locked as a whole | A disabled expression cannot open the cell |
| A column has \`context: { isLocked: false }\` and metadata \`IsValidForUpdate: false\` | Its cells stay locked: return \`false\` from a \`setDisabledExpression\` on it too, or unlock them in \`context.cell.lockHook\` |
| Rows are grouped | A script's background is repainted with the grid's; its text colour stays |
| A group row or the totals row has expressions | They apply too: see *Summary rows* on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) |

## Options

The module takes no options and needs no AG Grid Enterprise licence.

## Reference

### Expressions

| Expression | With the module | Without it |
|---|---|---|
| \`setDisabledExpression(column, () => boolean)\` | \`true\` locks the cell and shows its lock icon, in a grid with the editing module. \`false\` cannot open what the grid, the column or the record locks. | Ignored |
| \`ui.setNotificationsExpression(column, () => IAddControlNotificationOptions[])\` | Buttons in the cell: see *Notifications*. | Ignored |
| \`ui.setCustomFormattingExpression(column, cellTheme => ({ backgroundColor?, textColor?, primaryColor? }))\` | Colours the cell. A new background without a text or primary colour gets a readable one. \`cellTheme\` is a Fluent theme of the cell's current colours; \`undefined\` leaves the cell as it is. \`className\` and \`themeOverride\` are ignored. | Ignored |
| \`ui.setLoadingExpression(column, () => boolean)\` | \`true\` draws a shimmer in place of the cell's value, lock icon, notifications and error. | Ignored |
| \`ui.setControlParametersExpression(column, parameters => parameters)\` | Adds to or overrides the parameters the cell's control gets, such as \`Placeholder\`, both while it shows the value and while it is edited. It cannot remove one. | Ignored |
| \`ui.setCustomControlsExpression(column, controls => controls)\` | Picks the control that draws or edits the cell: the first one returned whose \`appliesTo\` matches (\`'renderer'\`, \`'editor'\` or \`'both'\`). The list starts with the grid's own control, so put yours first. | Ignored |
| \`IColumn.controls\` | Custom controls for the whole column, used where no expression returns any. | Ignored |
| \`provider.requestRender()\` | Redraws every cell and column header. | Redraws nothing in the grid |
| \`setValidationExpression(column, () => IFieldValidationResult)\` | Marks the cell invalid with the message and refuses the save. | The same |
| \`setRequiredLevelExpression(column, () => level)\` | \`'required'\` makes an empty value invalid. The header's asterisk still follows the column's metadata. | The same |
| \`setValueExpression(column, () => any)\` | The value the cell shows until the user changes it; \`undefined\` keeps the stored value. | The same |
| \`setFormattedValueExpression(column, formattedValue => text)\` | The text the cell shows. Lookup links, files and coloured option sets are drawn from the value instead. | The same |
| \`setCurrencySymbolExpression(column, () => string)\` | The symbol a money cell shows. | The same |
| \`ui.setCustomControlComponentExpression\` | Not read by the grid. | Not read |

### Notification options

| Option | Description |
|---|---|
| \`uniqueId\` | Required. Tells the cell's notifications apart. |
| \`iconName\` | The Fluent icon on the button. |
| \`text\` | The button's label, and the title of the callout. |
| \`messages\` | Required. The first message is the callout's text; the others are not shown. |
| \`actions\` | What the user can do about it: \`{ message, iconName, actions }\`, where \`message\` is the label and \`actions\` are the callbacks that run. |
| \`buttonProps\` | Spread onto the button, a Fluent \`ICommandBarItemProps\`: \`iconOnly: true\` draws the icon alone, and its \`onClick\` runs before the grid's own. |
| \`buttonProps.renderedInOverflow\` | \`true\` puts the notification in the cell's **…** menu. |
| \`notificationLevel\` | Ignored: every level looks the same. |

### Members

The module is \`grid.modules.find('legacyClientApiCompatibility')\`, or \`useGridModule('legacyClientApiCompatibility')\` inside what the grid draws. Its members are about the notification callout:

| Member | Description |
|---|---|
| \`openNotification(notification, target?)\` | Opens the callout for a notification, pointed at \`target\`. |
| \`closeNotification()\` | Closes it. |
| \`getOpenNotification()\`, \`getOpenTarget()\` | The notification the callout shows, and what it points at. |
| \`events\` | \`onNotificationOpened(notification)\` and \`onNotificationClosed()\`. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Colour, lock and validate cells the grid\'s own way.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Run a script from a module, and clean up after it.' },
    { title: 'Editing', iconName: 'Edit', href: '?path=/docs/controls-grid-modules-editing--overview', text: 'Locks and validation, and how they meet a script\'s.' },
]

const meta = {
    title: 'Controls/Grid/Modules/Legacy client API',
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

export const RecommendNextStepsOnTickets: Story = {
    name: 'Recommend next steps on tickets',
    render: () => renderStory(<TicketRecommendationsExample />),
}

export const ColoursLocksAndLoadingFromScripts: Story = {
    name: 'Colour, lock and load cells from a script',
    render: () => renderStory(<StockScriptExample />),
    parameters: {
        docs: {
            description: {
                story: `An inventory script that colours, locks and shimmers cells through record expressions. Try: press *Sync stock*.`,
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
                story: `A triage script gives an empty *Assigned to* a placeholder that says why. Try: set a New ticket's *Status* to In progress.`,
            },
        },
    },
}
