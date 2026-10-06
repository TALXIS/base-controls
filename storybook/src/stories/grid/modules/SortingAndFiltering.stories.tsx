import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { OpenOnWhatMattersExample, SavedViewsExample, TailoredFiltersExample, TriageQueueExample } from '../../../grid/examples/sortingFilteringExamples'

const DESCRIPTION = `
Sorting and filtering let users order a long list and narrow it down from each column's menu. Both are modules you add to \`modules\`, neither needs AG Grid Enterprise, and both keep their state on the provider, so what you set there is what the grid opens with.

{{story: Triage the support queue}}

## The column menu

Clicking a column's header opens its menu; it never sorts by itself. With both modules on, the menu has two sections:

- **Sorting** offers the two directions, worded by the column's data type: *Sort A to Z*, *Sort older to newer*, *Sort smaller to larger*, or a yes/no column's own labels, such as *No to Yes*. Shift+click on one adds the column as a further sort level instead of replacing the sort. *Clear* appears while the column is sorted, and a sorted column shows an arrow after its name.
- **Filtering** offers *Filter By*, which opens a callout under the header: pick an operator, enter a value and press *Apply*. *Clear* appears while the column is filtered, and a filtered column shows a funnel after its name.

A column's callout sets one condition, and the conditions of all filtered columns apply together. Every change reloads the provider.

## What a column needs

| | A column offers it when | To take it off one column |
|---|---|---|
| Sorting | \`disableSorting\` is not set; the provider sets it on multi-select option sets | \`colDefs={{ title: { sortable: false } }}\`, or \`disableSorting: true\` on the column |
| Filtering | \`metadata.SupportedFilterConditionOperators\` holds at least one operator | \`SupportedFilterConditionOperators: []\` on the column |

The provider's defaults are on [**Data**](?path=/docs/grid-get-started-data--overview). \`colDefs\` has no say over filtering: \`filter: false\` leaves *Filter By* in the menu. To drop a whole section from one column's menu, remove its \`'sorting'\` or \`'filtering'\` section in \`settings.header.onGetMenuSections\`, on [**Columns**](?path=/docs/grid-columns-overview--overview).

## Open the grid sorted and filtered

{{story: Open on what matters}}

The provider holds the sort and the filter, and both modules read them from it. Set them with \`provider.setSorting([{ name, sortDirection }])\` and \`provider.setFiltering({ filterOperator, conditions: [{ attributeName, conditionOperator, value }] })\` before \`refresh()\`, and the grid opens sorted and filtered, with the menus, arrows and funnels to match. Later on, set them again and call \`refresh()\`. The grid's \`state\` prop does not carry the sort: see *Remembering the layout* on [**Columns**](?path=/docs/grid-columns-overview--overview).

| Field | What goes in it |
|---|---|
| \`name\`, \`sortDirection\` | The column, and \`0\` for ascending or \`1\` for descending. The array's order is the order of the sort levels. |
| \`filterOperator\` | \`Type.And.Value\` to require every condition, \`Type.Or.Value\` for any of them. |
| \`attributeName\` | The column. |
| \`conditionOperator\` | An operator's \`Value\`, such as \`Operators.DoesNotEqual.Value\`. |
| \`value\` | What the filter callout writes: option set values as strings (\`'4'\`) and an array of them for \`In\` and \`NotIn\`, dates as \`'YYYY-MM-DD'\` and two of them for \`Between\`, \`'%invoice%'\` for \`Like\` (*Contains*), and \`''\` for an operator that takes no value, such as \`Today\`. |

\`provider.setFiltering(null)\` and \`provider.setSorting([])\` clear them. An option set value given as a number filters the rows, but the callout then opens with nothing picked.

The first time someone applies or clears a column filter, the module rebuilds the provider's filter from the conditions on its columns and requires all of them. An OR becomes an AND, and nested filters and conditions on anything that is not a column are dropped, so keep a fixed scope, such as *only my team's tickets*, in the data source or the query rather than in \`setFiltering\`.

## Saved views

{{story: Switch between saved views}}

A view is a sort and a filter applied together. The column menus write to the same provider state, so a view and the user's own changes mix, and the next view replaces both. Neither module raises an event when the sort or the filter changes: to remember what someone set, read \`provider.getSorting()\` and \`provider.getFiltering()\` in \`onDataLoaded\`.

## Narrow what a filter offers

{{story: Offer only the filters that make sense}}

\`SupportedFilterConditionOperators\` lists the operators a column's callout offers, in the order you give them, as the \`Value\` of each \`Operators\` entry. Left out, a column offers every operator of its data type, which is what \`Operators.GetOperatorsForDataType(dataType)\` returns:

| Data type | Operators |
|---|---|
| Text, email, phone, URL, text area, multiline, lookup, two options, option set | \`Equal\`, \`DoesNotEqual\`, \`Like\` (*Contains*), \`NotLike\`, \`BeginsWith\`, \`DoesNotBeginWith\`, \`EndsWith\`, \`DoesNotEndWith\`, \`ContainsData\`, \`DoesNotContainData\` |
| Whole number, duration, decimal, currency | \`Equal\`, \`DoesNotEqual\`, \`GreaterThan\`, \`GreaterThanOrEqual\`, \`LessThan\`, \`LessThanOrEqual\`, \`Between\`, \`NotBetween\`, \`ContainsData\`, \`DoesNotContainData\` |
| Date, date and time | \`On\`, \`OnOrAfter\`, \`OnOrBefore\`, \`Between\`, \`NotBetween\`, \`Today\`, \`Yesterday\`, \`Tomorrow\`, \`ThisWeek\`, \`ThisMonth\`, \`ThisYear\`, \`Next7Days\`, \`NextXDays\`, \`LastWeek\`, \`Last7Days\`, \`LastMonth\`, \`LastYear\`, \`LastXDays\`, \`LastXMonths\`, \`ContainsData\`, \`DoesNotContainData\` |
| Multi-select option set | \`Equal\`, \`DoesNotEqual\`, \`ContainValues\`, \`DoesNotContainValues\`, \`ContainsData\`, \`DoesNotContainData\` |
| File, image | \`ContainsData\`, \`DoesNotContainData\` |

- An unfiltered column's callout opens on its data type's own operator, whatever the list holds: *Contains* for text, *On* for dates, *Contains data* for files and images, and *Equals* for the rest. Keep that operator in a narrowed list, or the callout opens with no operator picked and still filters by it.
- On an option set or a yes/no column, *Equals* and *Does not equal* take several options, and reach the provider as \`In\` and \`NotIn\` once more than one is picked. Leave \`In\` and \`NotIn\` out of their lists.
- Dates are compared by day.

\`filtering.registerFilterControlParameters(hook, priority?)\` changes the parameters the callout hands its controls, here a text box's \`Placeholder\`. The hook gets \`{ column, control, index }\`: \`control\` is \`'operator'\` for the operator picker and \`'value'\` for a value control, and \`index\` is \`0\`, or \`1\` for the second value of *Between*. It runs on every render of the callout, after the grid's own parameters: value controls get \`EnableOptionSetColors\` from the grid's \`enableOptionSetColors\`, and a lookup cannot create a record from the callout. Hooks run by ascending \`priority\`, and the call returns a function that unregisters the hook.

## The sorting and filtering services

Reach them with \`runtime.services.get('sorting')\` and \`runtime.services.get('filtering')\` from \`onGridReady\` or a module of your own, or with \`useGridService\` inside anything the grid draws. \`services.get\` throws when the grid has no such module, and \`services.find\` returns \`undefined\`.

| \`sorting\` | What it does |
|---|---|
| \`sortColumn(columnName, descending?, appendToExisting?)\` | Sorts by the column and reloads. \`descending\` defaults to \`false\`. \`appendToExisting: true\` adds a sort level, as Shift+click does. |
| \`clearColumnSorting(columnName)\` | Takes the column out of the sort and reloads. |
| \`isSorted(column)\`, \`isSortedDescending(column)\` | Read the provider's sort. |
| \`isColumnSortable(column)\` | Whether the column does not set \`disableSorting\`. It does not look at \`colDefs\`. |
| \`getSortingLabel(columnName, descending?)\` | The text of the column's sort item, such as *Sort older to newer*. |

| \`filtering\` | What it does |
|---|---|
| \`openFilter(columnName, target?)\` | Opens the column's callout, pointed at \`target\`. Pass the column's header element: without one the callout has nothing to point at. |
| \`closeFilter()\` | Closes the callout. |
| \`getOpenColumnName()\` | The column whose callout is open, if any. |
| \`isColumnFilterable(column)\` | Whether \`SupportedFilterConditionOperators\` holds an operator. |
| \`isFiltered(column)\` | Whether a condition on the column is applied to the provider. |
| \`removeColumnFilter(columnName, saveToDataset?)\` | With \`saveToDataset: true\`, takes the column's condition out of the provider's filter and reloads, as *Clear* does. Without it, only a condition not yet applied is dropped. |
| \`registerFilterControlParameters(hook, priority?)\` | See above. |
| \`events\` | \`onFilterOpened(columnName)\` and \`onFilterClosed()\`, which *Apply* fires too. No event says what was applied. |

## Labels

Pass any of these keys as the module's \`labels\`. They are read once, at mount, and the grid's own \`labels\` prop does not cover them; localization as a whole is on [**Localization**](?path=/docs/grid-localization-overview--overview).

| \`createSortingModule({ labels })\` | Default | Where it shows |
|---|---|---|
| \`sortTextAscending\`, \`sortTextDescending\` | Sort A to Z, Sort Z to A | The sort items of text, option set, lookup and any column not listed below |
| \`sortDateAscending\`, \`sortDateDescending\` | Sort older to newer, Sort newer to older | Date and date-and-time columns |
| \`sortNumberAscending\`, \`sortNumberDescending\` | Sort smaller to larger, Sort larger to smaller | Whole number, decimal, duration and currency columns |
| \`sortTwoOptionsJoint\` | to | Between a yes/no column's two labels: *No to Yes* |
| \`clear\` | Clear | The item that takes the column out of the sort |
| \`menuSection\` | Sorting | The section's heading |

| \`createFilteringModule({ labels })\` | Default | Where it shows |
|---|---|---|
| \`filterMenuFilterBy\` | Filter By | The menu item, and the callout's title |
| \`clear\` | Clear | The menu item that removes the column's filter |
| \`menuSection\` | Filtering | The section's heading |

Inside the callout, the operator names follow the user's language, and the *Apply* and *Clear* buttons are always in English.

## Components

Each module's \`components\` option replaces what it draws, by piece. How to write a replacement is on [**Sorting**](?path=/docs/grid-appearance-modules-sorting--overview) and [**Filtering**](?path=/docs/grid-appearance-modules-filtering--overview).

| \`createSortingModule({ components })\` | Replaces |
|---|---|
| \`sortIcon.onRenderIcon\` | The arrow after a sorted column's name. Its props carry \`descending\` and the \`iconName\` (\`SortUp\` or \`SortDown\`). |

| \`createFilteringModule({ components })\` | Replaces |
|---|---|
| \`filterIcon.onRenderIcon\` | The funnel after a filtered column's name. |
| \`filterCallout.onRenderCallout\`, \`onRenderHeader\`, \`onRenderTitle\`, \`onRenderCloseButton\` | The callout's frame. The operator picker and the value controls inside take their parameters from the hook above, and the *Apply* and *Clear* buttons cannot be changed. |

To hide the arrow or the funnel on one column, remove the header adornment keyed \`'sort'\` or \`'filter'\` in \`settings.header.onGetAdornments\`.
`

const meta = {
    title: 'Grid/Modules/Sorting and filtering',
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

export const TriageTheSupportQueue: Story = {
    name: 'Triage the support queue',
    render: () => renderStory(<TriageQueueExample />),
    parameters: {
        docs: {
            description: {
                story: `A support lead works through this week's tickets. \`createSortingModule()\` and \`createFilteringModule()\` put a *Sorting* and a *Filtering* section in every column's menu. Filter *Status* to New and In progress, sort by *Customer*, then Shift+click *Sort older to newer* under *Opened* to order each customer's tickets by age.`,
            },
        },
    },
}

export const OpenOnWhatMatters: Story = {
    name: 'Open on what matters',
    render: () => renderStory(<OpenOnWhatMattersExample />),
    parameters: {
        docs: {
            description: {
                story: `The support queue opens on the tickets still to resolve: unassigned ones first, then each agent's by how soon they are due. The snippet calls \`provider.setSorting\` and \`provider.setFiltering\` on its own provider before \`refresh()\`. Open the *Status* or *Assigned to* menu to see the preset.`,
            },
        },
    },
}

export const SwitchBetweenSavedViews: Story = {
    name: 'Switch between saved views',
    render: () => renderStory(<SavedViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `The support desk keeps a few views of its queue. Each button applies a sort and a filter through \`provider.setSorting\` and \`provider.setFiltering\`, then calls \`refresh()\`. On *Open tickets*, filter *Priority* to High from its menu: your filter joins the view's, and the next view you pick replaces both.`,
            },
        },
    },
}

export const OfferOnlyTheFiltersThatMakeSense: Story = {
    name: 'Offer only the filters that make sense',
    render: () => renderStory(<TailoredFiltersExample />),
    parameters: {
        docs: {
            description: {
                story: `The support desk trims each filter to what the team uses: \`metadata.SupportedFilterConditionOperators\` narrows the operators of most columns, and *Time spent* gets none, so it cannot be filtered. A module of its own puts a hint in the text boxes through \`filtering.registerFilterControlParameters\`. Filter *Respond by* and pick *Between*, or filter *Subject* to see the hint.`,
            },
        },
    },
}
