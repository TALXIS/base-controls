import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ColourLockAndLoadExample, RecommendNextStepsExample, SayWhyAValueIsEmptyExample } from '../../grid/examples/legacyClientApiExamples'

const DESCRIPTION = `
The dataset client API is what Power Apps client scripts use to change how a view's records are drawn: they set *record expressions* per record and column to flag records, colour cells, lock fields and show a cell as loading. The legacy client API compatibility module makes the grid draw what those expressions set, so such scripts keep working. Try it below: hover the second deal's *Next step*, click the clock and pick **Push a week**.

{{canvas: Recommend next steps}}

## Register expressions

A record drops its expressions every time it loads again, so register them on \`provider.getRecords()\` for the records already loaded, and in the provider's \`onRecordLoaded\` for every record loaded or saved after that. The examples on this page do it in the grid's \`onSetup\` (see [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview)); a module of your own does it in its \`onLoad\` (see Grid's [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview)). The provider outlives the grid, so stop listening when the grid's \`onDestroyed\` fires.

An expression that reads anything besides its own record's values, such as the time or another record, needs \`provider.requestRender()\` when that changes, as **Sync from the CRM** below does. An expression for a column the provider does not have is ignored with a console warning.

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

Notifications show only while their row is hovered, holds the focused cell or is selected, and not while the cell is being edited or loading; buttons that do not fit move into the **…** menu. The expression runs each time such a cell draws, so keep it cheap. The grid shows one callout at a time, and it cannot be restyled. A \`cellRenderer\` of your own shows notifications only if it draws \`Grid.Cell.Commands\` (see [**Cells and headers of your own**](?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview)).

## With the rest of the grid

The module adds its hooks at \`GRID_MODULE_PRIORITY.legacyClientApiCompatibility\`, which is \`-10\`: ahead of every other built-in module and of any hook you add without a priority, so what a script set is the starting point the rest build on. Your hooks can change its locks, loading and colours; how priorities work is on [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview).

Once a validation hook exists, the grid's validation replaces a script's \`setValidationExpression\` on every provider column, so move such a check into a validation hook (see [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview)).

| When | What happens |
|---|---|
| There is no editing module, or the column, row or a cell hook locks the cell | A disabled expression cannot open the cell |
| A column hook opens a column with metadata \`IsValidForUpdate: false\` | Its cells stay locked: return \`false\` from a \`setDisabledExpression\` on it too |
| Rows are grouped | A script's background is repainted with the grid's; its text colour stays |
| A group row or the totals row has expressions | They apply too, since both are summary rows: see [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview) |

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
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-guide-advanced-hooks--overview', text: 'Colour, lock and validate cells the grid\'s own way.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-guide-advanced-write-a-module--overview', text: 'Run a script from a module, and clean up after it.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-grid-reference--overview', text: 'Every prop, event, module, hook, service and slot of the Grid.' },
]

const meta = {
    title: 'Controls/Grid/Legacy client API',
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

export const RecommendNextSteps: Story = {
    name: 'Recommend next steps',
    render: () => renderStory(<RecommendNextStepsExample />),
}

export const ColourLockAndLoadCellsFromAScript: Story = {
    name: 'Colour, lock and load cells from a script',
    render: () => renderStory(<ColourLockAndLoadExample />),
    parameters: {
        docs: {
            description: {
                story: `A script colours probabilities, locks won and lost deals and shimmers while it syncs, all through record expressions. Try: press **Sync from the CRM**.`,
            },
        },
    },
}

export const SayWhyAValueIsEmpty: Story = {
    name: 'Say why a value is empty',
    render: () => renderStory(<SayWhyAValueIsEmptyExample />),
    parameters: {
        docs: {
            description: {
                story: `A script gives an empty *Close date* a placeholder that says why it is empty. Try: set the first deal's *Stage* to *Propose*.`,
            },
        },
    },
}
