import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { FilterIconExample, SortArrowsExample } from '../../../grid/examples/moduleComponentsExamples'
import { OpenOnWhatMattersExample, SavedViewsExample, TailoredFiltersExample, TriageQueueExample } from '../../../grid/examples/sortingFilteringExamples'

const DESCRIPTION = `
Sorting and filtering let users order a long list and narrow it down from each column's menu. Neither needs AG Grid Enterprise, and both keep their state on the provider, so what you set there is what the grid opens with.

\`\`\`tsx
<DatasetControl onLoad={loadTickets}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createSortingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Triage the support queue}}

## The column menu

Clicking a column's header opens its menu; it never sorts by itself. Each module adds a section:

| Section | Offers | The header shows |
|---|---|---|
| Sorting | The two directions, worded by the column's data type: *Sort A to Z*, *Sort older to newer*, *Sort smaller to larger*, or a yes/no column's own labels such as *No to Yes*. Shift+click adds the column as a further sort level. *Clear* while the column is sorted. | An arrow after the name |
| Filtering | *Filter By*, which opens a callout under the header: pick an operator, enter a value and press *Apply*. *Clear* while the column is filtered. | A funnel after the name |

A column's callout sets one condition, and the conditions of all filtered columns apply together. Every change reloads the provider. To change the menu texts, see [**Localization**](?path=/docs/concepts-localization--overview).

## What a column needs

| Feature | A column offers it when | To take it off one column |
|---|---|---|
| Sorting | \`disableSorting\` is not set; the provider sets it on multi-select option sets | \`colDefs={{ title: { sortable: false } }}\`, or \`disableSorting: true\` on the column |
| Filtering | \`metadata.SupportedFilterConditionOperators\` holds at least one operator | \`SupportedFilterConditionOperators: []\` on the column |

The provider's defaults are on [**Data**](?path=/docs/controls-grid-data--overview). To drop a whole section from one column's menu, remove its \`'sorting'\` or \`'filtering'\` section in \`context.header.onGetMenuSections\`: see *Extend the header* on [**Columns**](?path=/docs/controls-grid-columns--overview).

## Open the grid sorted and filtered

Call \`provider.setSorting()\` and \`provider.setFiltering()\` before \`refresh()\`, and the grid opens sorted and filtered, with the menus, arrows and funnels to match. Their shapes are under *Sort, filter, search and page* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

{{story: Open on the tickets that matter}}

Write condition values the way the filter callout does, or it opens with nothing picked:

| Value | Write it as |
|---|---|
| An option set value | A string, \`'4'\`; an array of them for \`In\` and \`NotIn\` |
| A date | \`'YYYY-MM-DD'\`; two of them for \`Between\` |
| *Contains* text | \`Like\` with \`'%invoice%'\` |
| An operator with no value, such as \`Today\` | \`''\` |

Once someone applies or clears a column filter, the provider's filter becomes the column conditions, all required: an OR becomes an AND, and nested filters or conditions on anything that is not a column are dropped. Keep a fixed scope, such as *only my team's tickets*, in the data source or the query rather than in \`setFiltering\`.

Neither module raises an event when the sort or the filter changes: read \`provider.getSorting()\` and \`provider.getFiltering()\` in \`onDataLoaded\`. Saved views, each with its own sort and filter, belong to the DatasetControl: see [**DatasetControl › Views**](?path=/docs/controls-datasetcontrol-views--overview).

{{story: Switch between saved views}}

## Narrow what a filter offers

\`SupportedFilterConditionOperators\` lists the operators a column's callout offers, in your order, as the \`Value\` of each \`Operators\` entry. Left out, a column offers every operator of its data type, which is what \`Operators.GetOperatorsForDataType(dataType)\` returns:

| Data type | Operators |
|---|---|
| Text, email, phone, URL, text area, multiline, lookup, two options, option set | \`Equal\`, \`DoesNotEqual\`, \`Like\` (*Contains*), \`NotLike\`, \`BeginsWith\`, \`DoesNotBeginWith\`, \`EndsWith\`, \`DoesNotEndWith\`, \`ContainsData\`, \`DoesNotContainData\` |
| Whole number, duration, decimal, currency | \`Equal\`, \`DoesNotEqual\`, \`GreaterThan\`, \`GreaterThanOrEqual\`, \`LessThan\`, \`LessThanOrEqual\`, \`Between\`, \`NotBetween\`, \`ContainsData\`, \`DoesNotContainData\` |
| Date, date and time | \`On\`, \`OnOrAfter\`, \`OnOrBefore\`, \`Between\`, \`NotBetween\`, \`Today\`, \`Yesterday\`, \`Tomorrow\`, \`ThisWeek\`, \`ThisMonth\`, \`ThisYear\`, \`Next7Days\`, \`NextXDays\`, \`LastWeek\`, \`Last7Days\`, \`LastMonth\`, \`LastYear\`, \`LastXDays\`, \`LastXMonths\`, \`ContainsData\`, \`DoesNotContainData\` |
| Multi-select option set | \`Equal\`, \`DoesNotEqual\`, \`ContainValues\`, \`DoesNotContainValues\`, \`ContainsData\`, \`DoesNotContainData\` |
| File, image | \`ContainsData\`, \`DoesNotContainData\` |

An unfiltered column's callout opens on its data type's own operator, whatever the list holds: *Contains* for text, *On* for dates, *Contains data* for files and images, and *Equals* for the rest. Keep that operator in a narrowed list, or the callout opens with nothing picked. On an option set or a yes/no column, *Equals* and *Does not equal* take several options and reach the provider as \`In\` and \`NotIn\`, so leave \`In\` and \`NotIn\` out of their lists. Dates are compared by day.

\`filtering.registerFilterControlParameters(hook, priority?)\` changes the parameters the callout passes its controls, such as a text box's \`Placeholder\`. The hook gets \`(result, { column, control, index })\`: \`control\` is \`'operator'\` or \`'value'\`, and \`index\` is \`1\` for the second value of *Between*. It runs after the grid's own parameters, so it can change those too: value controls get \`EnableOptionSetColors\` from the grid's \`enableOptionSetColors\`, and a lookup cannot create a record from the callout.

{{story: Offer only the filters that make sense}}

## From your code

The modules are \`grid.modules.find('sorting')\` and \`grid.modules.find('filtering')\`, or \`useGridModule\` inside what the grid draws.

| \`sorting\` member | Description |
|---|---|
| \`sortColumn(columnName, descending?, appendToExisting?)\` | Sorts by the column and reloads. \`appendToExisting: true\` adds a sort level, as Shift+click does. |
| \`clearColumnSorting(columnName)\` | Takes the column out of the sort and reloads. |
| \`isSorted(column)\`, \`isSortedDescending(column)\` | Whether the provider sorts by the column, and in which direction. |
| \`isColumnSortable(column)\` | Whether the column does not set \`disableSorting\`. It does not look at \`colDefs\`. |
| \`getSortingLabel(columnName, descending?)\` | The text of the column's sort item, such as *Sort older to newer*. |
| \`getSorting()\` | The \`Sorting\` helper from \`@talxis/client-libraries\` the module writes the provider's sort through. |
| \`components\` | The \`components\` the module was given. |

| \`filtering\` member | Description |
|---|---|
| \`openFilter(columnName, target?)\` | Opens the column's callout, pointed at \`target\`. Pass the column's header element: without one the callout has nothing to point at. |
| \`closeFilter()\` | Closes the callout. |
| \`getOpenColumnName()\`, \`getOpenTarget()\` | The column whose callout is open, and the element it points at. |
| \`isColumnFilterable(column)\` | Whether \`SupportedFilterConditionOperators\` holds an operator. |
| \`isFiltered(column)\` | Whether a condition on the column is applied to the provider. |
| \`getColumnFilter(columnName)\` | The column's \`ColumnFilter\`, applied or not. |
| \`removeColumnFilter(columnName, saveToDataset?)\` | With \`saveToDataset: true\`, takes the column's condition out of the provider's filter and reloads, as *Clear* does. Without it, only a condition not yet applied is dropped. |
| \`getFiltering()\` | The \`Filtering\` helper from \`@talxis/client-libraries\` that holds every column's filter. |
| \`registerFilterControlParameters(hook, priority?)\` | See *Narrow what a filter offers*. |
| \`getFilterControlParameters(parameters, { column, control, index })\` | The parameters a callout control gets: yours, the grid's defaults, then the hooks. |
| \`components\` | The \`components\` the module was given. |
| \`events\` | \`onFilterOpened(columnName)\` and \`onFilterClosed()\`, which *Apply* fires too. No event says what was applied. |

## Changing how it looks

Both modules take \`components\`, read at mount. How slots work is under *Changing how it looks* on [**Appearance**](?path=/docs/controls-grid-appearance--overview).

\`\`\`tsx
createSortingModule({ components: { sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} className={styles.arrow} /> } } })
createFilteringModule({ components: { filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' /> } } })
\`\`\`

| Module | Key | Slots | Default | Draws |
|---|---|---|---|---|
| Sorting | \`sortIcon\` | \`onRenderIcon\` (with \`descending\`) | \`GridSortingIconComponents\` | The arrow of a sorted column |
| Filtering | \`filterIcon\` | \`onRenderIcon\` | \`GridFilteringIconComponents\` | The funnel of a filtered column |
| | \`filterCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderTitle\`, \`onRenderCloseButton\` | \`FilteringUiCalloutComponents\` | The frame of the callout a filter is set in |

What the callout holds, the operator and value controls and the *Apply* and *Clear* buttons, has no slots; change the controls' parameters with \`registerFilterControlParameters\`. To change the arrow or the funnel on one column only, replace or remove the header adornment keyed \`'sort'\` or \`'filter'\` in that column's \`context.header.onGetAdornments\`.

{{story: Draw your own sort arrows}}

{{story: Make a filter stand out}}
`

const meta = {
    title: 'Controls/Grid/Modules/Sorting and filtering',
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
                story: `This week's support tickets, with a *Sorting* and a *Filtering* section in every column's menu. Try: filter *Status* to New, sort by *Customer*, then Shift+click *Sort older to newer* under *Opened*.`,
            },
        },
    },
}

export const OpenOnWhatMatters: Story = {
    name: 'Open on the tickets that matter',
    render: () => renderStory(<OpenOnWhatMattersExample />),
    parameters: {
        docs: {
            description: {
                story: `The queue opens on the tickets still to resolve, unassigned first, through \`provider.setSorting\` and \`provider.setFiltering\` before \`refresh()\`. Try: open the *Status* or *Assigned to* menu to see the preset.`,
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
                story: `Each view loads a provider of its own, sorted and filtered in \`onLoad\`. Try: on *Open tickets*, filter *Priority* to High, switch to another view and back; the control's \`stateKey\` keeps your filter.`,
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
                story: `\`SupportedFilterConditionOperators\` narrows each column's operators, *Time spent* gets none, and \`registerFilterControlParameters\` puts a hint in the text boxes. Try: filter *Subject* to see the hint.`,
            },
        },
    },
}

export const ArrowsOfYourOwn: Story = {
    name: 'Draw your own sort arrows',
    render: () => renderStory(<SortArrowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`sortIcon\` draws the arrow as a blue glyph that turns with the direction. Try: sort another column from its menu.`,
            },
        },
    },
}

export const AFilterThatStandsOut: Story = {
    name: 'Make a filter stand out',
    render: () => renderStory(<FilterIconExample />),
    parameters: {
        docs: {
            description: {
                story: `\`filterIcon\` marks the filtered In stock column with a solid blue icon, and \`filterCallout.onRenderTitle\` heads the callout with what it filters by. Try: open the In stock filter from its menu.`,
            },
        },
    },
}
