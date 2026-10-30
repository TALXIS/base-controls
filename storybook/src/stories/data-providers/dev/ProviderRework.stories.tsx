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

## 4. Read the record back after saving

Saving a record can change more than the user edited. Dataverse moves a record to the state its status belongs to, plugins and business rules set other columns, calculated and rollup columns recompute, and \`modifiedon\` moves on. The record in the grid should show what the server stored, without a full reload.

### Today

| Provider | What a saved record shows |
|---|---|
| \`FetchXmlDataProvider\` | The values the user sent and nothing else. \`SaveHandler\` writes back only the \`statecode\` it worked out from a saved \`statuscode\`, so the row's lock follows a status change. |
| \`MemoryDataProvider\` | The values the user sent, which is all there is. |
| \`TaskDataProvider\` | The values the user sent, then whatever its store's \`onSynchronize\` reports changed since its last read. The provider asks after every write. \`DataverseTaskStore\` reads back every grid task whose \`modifiedon\` moved, the saved one included. |

### What every provider should do

- **Read the record back after every successful save,** through the provider's own query filtered to that record, so linked columns, aliases and formatted values come back as they loaded.
- **Merge it into the record:** what comes back replaces the record's data, and an edit the user made while the save ran is kept on top, still unsaved.
- **Once per save,** not per column: a record saving several columns is read back once, after the last of them is sent.
- **A failed read-back doesn't fail the save:** the record keeps the values it sent.

### What would use it

- **Locks:** a row closed through its status locks as soon as the save returns. The \`statecode\` write-back in \`SaveHandler\` then goes.
- **The task grid:** its synchronize after every write already covers this. It moves into the provider it builds on, and \`DataverseTaskStore.onSynchronize\` keeps only the other tasks a write changed.
- **Every grid:** a column a plugin or business rule sets, and a calculated column, show their new value right after a save.

## 5. Ask for the definitions of named columns only

\`getAvailableColumns\` is the one place a column's definition comes from: its label, type and metadata. Most callers need only a few of them, the columns a view shows, but every call returns all of them.

### Today

| Provider | What \`getAvailableColumns\` reads |
|---|---|
| \`FetchXmlDataProvider\` | Every attribute of the entity: \`Xrm.Utility.getEntityMetadata\` for the attribute names, then again with all of them, so each call carries the metadata of the whole table, option sets included. |
| \`MemoryDataProvider\` | The columns it was created with. |
| \`TaskDataProvider\` | Its store's available columns, plus the columns its modules add. |

The callers that need only some:

- **The dataset control** completes a view's columns before setting them, on every load, for the handful of columns the view lists.
- **The task provider** looks up the definitions of the columns it adds itself, such as the parent and the stack rank.

### What every provider should do

- **Take the names asked for:** \`IAvailableColumnOptions\` gets \`columnNames?: string[]\`, and a provider returns only those. Left out, it returns all of them, as Edit columns needs.
- **Fetch only those:** the FetchXML provider asks Dataverse for the metadata of the named attributes alone.
- **Same definition either way:** a column asked for by name is defined exactly as it is in the full list, the hooks a provider runs included.
- **A name it does not know is left out,** rather than returned as a bare column.

### What would use it

- **The dataset control:** completing a view asks only for the view's columns, and for its related columns by the link they come through.
- **The task provider:** its own columns' definitions come from one call naming them.
- **Edit columns** keeps asking for everything, as it lists them all.

## 6. Tell the user before a save overwrites a newer change

A record loads, the user edits it, and meanwhile someone else saves the same record: another user, a plugin, a flow. When the user then saves, they write over data they never saw. That shouldn't happen silently. The user should be told the record changed since they opened it, and decide.

### Today

| Provider | When the record changed on the server since it loaded |
|---|---|
| \`FetchXmlDataProvider\` | \`SaveHandler\` sends the dirty columns with \`Xrm.WebApi.updateRecord\`, which can't send an \`If-Match\` header. The last save wins. Columns only the other change touched keep their value, columns both touched get the user's value, and nobody is told. |
| \`MemoryDataProvider\` | Nothing outside the provider changes its records. |
| \`TaskDataProvider\` | Its store's save, which for \`DataverseTaskStore\` is the FetchXML provider's. The synchronize after the write then shows the overwritten result, without saying what it replaced. |

### What every provider should do

- **Remember the version each record was read at.** Every Dataverse row comes with an \`@odata.etag\` (its \`versionnumber\`). The provider keeps it per record, from the load and from every read-back (requirement 4).
- **Save only if the record is still that version.**
  - The update goes with \`If-Match: <etag>\`, so Dataverse answers \`412 Precondition Failed\` when the row changed since.
  - \`Xrm.WebApi\` can't send that header, so the FetchXML provider calls the Web API itself, as \`PATCH /api/data/v9.2/<entity set>(<id>)\`.
- **Only the user's columns count.**
  - On a \`412\`, the provider reads the record again and compares the columns the user changed with the values it loaded them with.
  - If none of them changed on the server, it isn't a conflict: the provider saves again with the new etag, and the user sees nothing.
- **A conflict is a result of its own, not a generic error.** The save result says the record is stale, and for each conflicting column carries:
  - the value the user loaded;
  - the value the server has now;
  - the value the user is saving.
- **The user decides:**
  - **Overwrite:** save again without the condition.
  - **Take theirs:** drop the user's edits to those columns and show the server's values.

  Until then the edits stay unsaved, as after any failed save.
- **A record read back after the user's own save gets the new etag,** so the user's next save doesn't conflict with their last one.

### What would use it

- **Every grid with autosave:** the record save indicator shows a conflict apart from an error. Its callout lists the columns with both values and offers *Overwrite* and *Take theirs*.
- **The task grid:**
  - Its synchronize refreshes the etags of the tasks it reads back.
  - Editing a task the server just rescheduled asks the user, instead of quietly undoing the reschedule.
- **Forms:** a form saving through the provider asks the same way.
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
