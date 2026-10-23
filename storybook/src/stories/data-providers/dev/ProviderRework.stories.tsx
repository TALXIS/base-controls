import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { NameOnlyColumnsExample } from '../../../data-providers/dev/providerReworkExamples'

const DESCRIPTION = `
What the next provider implementation has to do, so the controls stop working around each provider on their own. Each section is one requirement: what happens today, what every provider should do instead, and what depends on it.

## 1. Fill in column metadata after setColumns

A provider is often handed columns that carry little more than a name: a view's columns, a user view's saved layout, the state a view comes back with. Every provider should complete those columns the same way, from whatever it knows about its data, as soon as they are set.

### Today

| Provider | What a column given by name alone becomes |
|---|---|
| \`FetchXmlDataProvider\` | Completed, but only on its first preload: \`FetchXmlParser.parse\` resolves every column name as an attribute and lays the given column over what Dataverse's metadata says. Columns set after that preload stay as they were given. An attribute that no longer exists comes back \`isVirtual\`, with no label. |
| \`MemoryDataProvider\` | Nothing fills it in: no label, no type, no option set. The consumer has to complete it in the \`columns\` interceptor, which runs after the provider has already given the bare column metadata of its own, so the interceptor has to merge \`metadata\` itself. |
| \`TaskDataProvider\` | Completed from its column catalogue, once, as it loads. |

{{story: Name-only columns in a memory provider}}

### What every provider should do

- **One place to complete columns:** a method every provider implements, given the columns as they were set and returning them completed, for example \`onResolveColumns(columns: IColumn[]): IColumn[] | Promise<IColumn[]>\`.
- **Called on every setColumns,** not only on the first load, so columns set later are completed too.
- **Before anything is derived from a column:** sorting, grouping, aggregation and filter support are worked out from the completed column, never from the bare one.
- **The given column wins** over what the provider knows, metadata merged key by key, so a saved layout keeps its order, width and visibility.
- **A column the provider cannot resolve is left out,** rather than shown as a bare, unlabelled column.
- **A way to wait for it,** since a lookup like FetchXML's is async: the next load waits for the columns to be resolved.

### Per provider

| Provider | Resolves a column from |
|---|---|
| \`FetchXmlDataProvider\` | Dataverse attribute metadata, related columns through the linking. |
| \`MemoryDataProvider\` | The columns it was created with, and whatever \`onGetAvailableColumns\` offers. |
| \`TaskDataProvider\` | Its column catalogue, as \`_withDefinition\` does today. |

### What works around it today

- **User queries:** a user view completes each saved column from the provider's available columns as it resolves, related ones through its saved links, and drops one the provider no longer offers.
- **Views docs and dev stories:** a memory provider completes name-only columns in its \`columns\` interceptor, merging \`metadata\` by hand.
- **Task grid:** \`TaskDataProvider._load\` merges its catalogue into the columns it was given.

## 2. Say what a view keeps, and take it back

A view is a provider set up a certain way: its columns, its sorting and filter, its search, and whatever else the provider is set up with. Only the provider knows all of that. So the provider should say what a view has to keep, and take that back when the view loads, instead of every consumer picking the parts it knows about.

### Today

Three places each decide what a view keeps, and each picks a different set:

| Where | Keeps | Takes back through |
|---|---|---|
| \`DatasetControlState\`, the state each view comes back with | Columns, linking, sorting, filtering, page size, page, search, selection | \`restore\`, which calls the setters one by one |
| User queries | The columns' layout, captured by the module; the rest is whatever the consumer's \`onGetViewData\` returns, such as sorting, filter and search | The consumer's own \`onLoad\`, reading \`view.data\` |
| \`TaskRuntime\` | \`getCurrentViewData\`: sorting, filtering, quick find columns, search, flat list; the columns and linking go with the user view | \`_applyView\` |

So anything a provider adds is lost unless every one of these knows about it. For example, the task provider's quick find columns are kept by the task runtime but not by the native state, and a provider's search is kept by the native state but not by a user view unless the consumer's \`onGetViewData\` returns it.

### What every provider should do

- **Say what a view keeps:** a method returning the provider's setup as plain, serializable data, for example \`getViewState(): IDataProviderViewState\`.
- **Take it back:** a method that sets the provider up from that data before it loads, for example \`applyViewState(state: IDataProviderViewState): void\`.
- **The base provider covers what every provider has:** the columns' layout, completed on the way back as in requirement 1, plus sorting, filtering, linking, search and quick find columns. A provider extends both methods with what it adds.
- **Old data still loads:** a key it doesn't know is ignored, and a key that's missing keeps the provider's default.
- **The view and the session stay apart:** a view keeps the provider's setup. Page and selection belong to the session, which the native state keeps on top.

### What would use it

- **User queries:** a user view keeps \`provider.getViewState()\` and loads through \`applyViewState\`. Then \`onGetViewData\` is only for data of the consumer's own, and completing the saved columns moves into \`applyViewState\`. This is the \`TODO\` above \`createUserQueriesModule\`.
- **The native state:** \`DatasetControlState.save\` and \`restore\` keep the view state, plus page and selection.
- **The task grid:** \`getCurrentViewData\` and \`_applyView\` become the task provider's own extension of the two methods.

## 3. Declare custom columns in the FetchXML

A custom column is one Dataverse doesn't have: a value the consumer computes or fills in. A FetchXML view can only name Dataverse attributes, so it has no way to carry a custom column.

### Today

- **Parsing:** \`FetchXmlParser.parse\` looks every \`<attribute>\` up in Dataverse metadata. One it doesn't find comes back \`isVirtual\`, with no label and no type.
- **Building:** \`FetchXmlFactory._createAttributes\` leaves virtual columns out of the query, so the FetchXML the provider writes back has lost them.
- **Everything else:** \`_onAfterColumnsSet\` turns off sorting, grouping, aggregation and filtering on a virtual column, and \`SaveHandler\` skips it.

So a custom column only exists in code, added through \`setColumns\` or a \`columns\` interceptor, and a view can't declare it.

### What the FetchXML provider should do

- **Read custom attributes from the FetchXML:** an \`<attribute>\` marked as custom, carrying what Dataverse would otherwise say about it, such as its label and type.
- **Complete them as in requirement 1:** a custom attribute comes back as a labelled, typed virtual column, never sent to Dataverse.
- **Write them back:** the FetchXML the provider builds keeps its custom attributes, so a view saved from it declares them again.
- **In a module, not in the provider:** the parser and the factory each offer a hook a module plugs into, for example a \`DataProviderExtension\` registered on the provider, so \`FetchXmlParser\`, \`FetchXmlFactory\` and \`FetchXmlDataProvider\` stay free of custom-attribute code.

### What would use it

- **Views:** a system or user view declares its custom columns in its FetchXML, instead of every consumer adding them in code.
- **User queries:** a user view saved as FetchXML keeps its custom columns, which the provider's available columns don't offer.
`

const meta = {
    title: 'Data providers/Dev/Provider rework',
    tags: ['autodocs', 'dev-only'],
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

export const NameOnlyColumns: Story = {
    name: 'Name-only columns in a memory provider',
    render: () => renderStory(<NameOnlyColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `Four deal columns given by name and place alone. The headers are the raw names, the stage is a bare number, and the value and close date are unformatted: nothing filled them in.`,
            },
        },
    },
}
