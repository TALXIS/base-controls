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
| User queries | The columns' layout, captured by the module; the rest is whatever each \`saveWithView\` getter returns, such as sorting, filter and search | Each \`saveWithView\` applier, as the user view resolves |
| \`TaskRuntime\` | Sorting, filtering, quick find columns and search, through \`saveWithView\`; the flat list through \`TaskTree\` | The \`saveWithView\` appliers; the flat list from \`getView().data\` |

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
| \`TaskDataProvider\` | The values the user sent, then whatever its store's \`synchronize\` reports changed since its last read. The provider asks after every write. \`DataverseTaskStore\` reads back every grid task whose \`modifiedon\` moved, the saved one included. |

### What every provider should do

- **Read the record back after every successful save,** through the provider's own query filtered to that record, so linked columns, aliases and formatted values come back as they loaded.
- **Merge it into the record:** what comes back replaces the record's data, and an edit the user made while the save ran is kept on top, still unsaved.
- **Once per save,** not per column: a record saving several columns is read back once, after the last of them is sent.
- **A failed read-back doesn't fail the save:** the record keeps the values it sent.

### What would use it

- **Locks:** a row closed through its status locks as soon as the save returns. The \`statecode\` write-back in \`SaveHandler\` then goes.
- **The task grid:** its synchronize after every write already covers this. It moves into the provider it builds on, and \`DataverseTaskStore.synchronize\` keeps only the other tasks a write changed.
- **Every grid:** a column a plugin or business rule sets, and a calculated column, show their new value right after a save.

## 5. Ask for the definitions of named columns only

\`onGetAvailableColumns\` is the one place a column's definition comes from: its label, type and metadata. Most callers need only a few of them, the columns a view shows, but every call returns all of them.

### Today

| Provider | What \`onGetAvailableColumns\` reads |
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

## 7. Create a new record through the provider

A provider can make a new record: \`newRecord()\` marks it new, and saving it creates it instead of updating it. That save goes through the same conversion as any edit, so dates, lookups and option sets reach the Web API in its own shape. Code that creates records should use it rather than call the Web API with its own conversion.

### Today

- **\`FetchXmlDataProvider\` refuses most new records before sending them.**
  - A save first validates the record's fields, and on a new record that covers every column the provider knows, not only the ones that were set.
  - So columns Dataverse fills in itself on create, such as \`statecode\` and \`ownerid\`, fail as required (*value is required*). So does any required column the creator leaves to the server, such as a task's name.
- **What works around it:** \`DataverseTaskStore.createTask\` creates through \`Xrm.WebApi.createRecord\` with its own payload.
  - It has its own lookup binds through the navigation properties.
  - It has its own date conversion: a date-only column must get a bare date, or the Web API rejects the create.
  - Both repeat what the provider's \`SaveHandler\` already does for edits.

### What every provider should do

- **Columns the server fills on create are never required on a new record:** \`statecode\`, \`statuscode\`, \`ownerid\` and the other owner columns, and \`createdon\`. A value set for one is still sent.
- **Only the columns set are validated.** The creator decides what a new record starts with. A required column left empty is the server's to refuse, and its message comes back in the save result.
- **The save result carries the server's message** when a create fails, the same way it does for an update.
- **The record keeps the ID it was given,** so a row shown before the create finished, such as the task grid's pending row, is the same record afterwards.

### What would use it

- **The task grid's Dataverse store:**
  - It creates through \`newRecord\` and \`save\` on its FetchXML provider, after defining any column the new task needs but the view doesn't show, such as the project lookup.
  - Its \`_toWebApiPayload\`, \`_toServerDate\` and \`_getNavigationPropertyName\` go.
- **Templates and other modules** that create records get the same conversion for free.

## 8. Take expressions as hooks

A record's expressions decide how its columns behave: validation, required level, disabled, value, formatting, notifications. Several parts can have a say about the same record at once: the grid, a form opened over its row, a script. Each should add its rule and take it back without touching the others'.

### Today

- **One slot per column, last writer wins.** \`record.expressions.setValidationExpression(column, fn)\` and the others replace whatever was set. Nothing can be read back from the record, and nothing can be removed.
- **The grid takes the validation slot on every record** (\`GridValidation._setValidation\`). A form or a script that sets a validator on the same record replaces the grid's, and the grid replaces theirs.
- **Nothing is taken back.** A rule set by a part that has since unmounted stays on the record and keeps running.
- **What works around it:** the Form keeps its own validation and required-level rules and combines them with the record's when it reads them, instead of setting them on a record it may share with a grid (\`FormRuntime.getFieldValidation\`, \`getFieldRequiredLevel\`).

### What every provider should do

- **Register an expression as a hook** that returns a function removing it, for validation, required level, disabled and the rest.
- **Hooks chain in order:** each gets the result so far and can change or keep it; the column's own metadata gives the first result.
- **Removing one leaves the others,** and the record evaluates again when one is added or removed.

### What would use it

- **The Form** adds its rules as hooks on the record it is given and removes them when it unmounts; its own combining code goes.
- **The grid's validation** adds a hook instead of taking the slot.
- **Xrm scripts** (\`setValidation\`, \`setRequiredLevel\`) add hooks for the form's lifetime.

## 9. Take filters as hooks

A provider's filter is the user's: what a view sets, what quick find and the grid's column filters add, and what the user clears. Some parts need a filter of their own that holds whatever the user does, such as a map loading only the records in its box, or a task grid hiding inactive tasks. Each should add its filter and take it back without touching the user's or anyone else's.

### Today

- **One filter, last writer wins.** \`setFiltering\` replaces the whole filter, so a part that wants to keep a condition of its own has to read the filter, edit it and set it back, and the next view switch or quick find replaces it again.
- **A part's conditions show as the user's.** Whatever is merged into the filter comes back from \`getFiltering()\`, so the grid's filter callouts and anything that clears the filter see it, and can show it or remove it as if the user had set it.
- **What works around it:** \`TaskDataProvider.setInactiveTasksHidden\` drops its state-code condition from the filter's top level, adds it back, and sets the edited filter. A view or quick find that sets a filter of its own loses the condition until it is set again.
- **What it holds back:** a map that loads only the records in the box it shows would have to wrap the user's filter beside its box on every pan and zoom, recognise its own box again after someone else changed the filter, and refresh a second time.

### What every provider should do

- **Register a filter as a hook,** \`provider.hooks.filtering.add(hook, priority?)\`, that returns a function removing it. The hook returns a \`FilterExpression\`, or \`null\` while it has nothing to add.
- **Called on every load,** so a hook returns its current filter, such as the box the map shows now, and changing it is only a \`refresh()\`.
- **ANDed with the user's filter when the query is built:** the FetchXML provider adds each as its own filter element, the memory provider applies each after the user's. The user's filter is never edited, whatever its operator or nesting.
- **Kept apart from the user's filter:** \`getFiltering()\` and \`setFiltering()\` stay the user's, so the filtering UI never shows or clears a hooked filter. \`getEffectiveFiltering()\` returns both together, for anything that needs what was really queried, such as an export.
- **Removing one leaves the others,** and the provider loads again only when asked, as after any filter change.

### What would use it

- **The task grid:** hiding inactive tasks becomes a hook that returns the state-code condition while they are hidden; \`setInactiveTasksHidden\` only refreshes.
- **The map:** a hook that returns the box it shows, added as the map loads and removed as it unmounts. The map refreshes after each pan or zoom, and the user's filter, a view's and quick find's stay as they are.
- **Security or scope filters** a consumer wants on every query, such as records of one business unit, without a view or the user being able to clear them.

## 10. Set grouping and totals on the columns only

A column already says how it is grouped and totalled: \`grouping\` and \`aggregation\` are fields of \`IColumn\`. The provider also has \`grouping\` and \`aggregation\` APIs that write those same fields, so there are two ways to set one thing, and only one of them survives the columns being set.

### Today

- **The APIs write onto the current columns.** \`addAggregation\` and \`addGroupBy\` map over \`getColumns()\` and set the field on the matching column (\`_setColumnsProperty\`). A column that is not there yet is skipped, so on a provider with no columns the call does nothing.
- **The next setColumns drops them.** Whatever was added is lost when the columns are replaced, as a DatasetControl does with a view's columns right after its \`resolve\` runs. A \`resolve\` that calls \`addAggregation\` shows no totals.
- **What works around it:** the DatasetControl docs tell a view to return its totals and grouping on its columns, \`{ name: 'value', aggregation: { aggregationFunction: 'sum' } }\`, and not to call the APIs in \`resolve\`.

### What every provider should do

- **Read grouping and totals from the columns only:** a column's \`grouping\` and \`aggregation\` are what the provider groups and totals by.
- **Drop \`provider.grouping\` and \`provider.aggregation\`:** no \`addGroupBy\`, \`removeGroupBy\`, \`addAggregation\` or \`removeAggregation\`. Changing them is a \`setColumns\` with the changed columns.
- **Read back from the columns:** read-only \`getGroupBys()\` and \`getAggregations()\` on the provider, derived from the columns, so they can never disagree with them.

### What would use it

- **A view's \`resolve\`** returns its totals and grouping with its columns, and nothing set beside them is lost.
- **The grid:** \`TotalRow\`, behind the aggregation module's column menu, sets the columns instead of calling \`provider.aggregation.addAggregation\`; the grouping module and the client-side row model read \`getGroupBys()\` as they do now. What the user groups or totals is kept with the columns in a view's state.
- **User views** save grouping and totals with the column layout they already save.

## 11. Read a column the view does not have without throwing

A part often names a column by itself, such as a map popup's or a Gantt tooltip's field row, and the view the user opens may not have it. Reading a record should answer for any column name, with nothing for one the provider does not have.

### Today

- **Two answers to one question.** \`record.getValue(columnName)\` returns \`null\` for a column the provider does not have, but \`record.getField(columnName)\` and \`record.getFormattedValue(columnName)\` throw \`ColumnDoesNotExists\` (client-libraries \`Record._getField\`).
- **The throw changes the provider.** It is a \`DataProviderError\`, whose constructor puts the provider into an error state, so even a caught read can leave the provider failed.
- **What it breaks:** \`Map.Popup.FieldRow\` and \`TaskTooltip.FieldRow\` call \`getFormattedValue\` with the column they are given, so naming one the open view lacks throws instead of drawing nothing.

### What every provider should do

- **Answer for any column name:** \`getFormattedValue\` returns \`null\`, as \`getValue\` does, and \`getField\` returns \`undefined\` for a column the provider does not have.
- **Never fail the provider from a read:** reading a record raises no provider error, whatever column it names.

### What would use it

- **The map popup's and the Gantt tooltip's field rows** draw nothing for a column the view lacks, with no guard of their own.
- **Anything that reads an optional column**, such as a module's own column, asks the record directly instead of checking the columns map first.
`

const meta = {
    title: 'Dev/DatasetControl/Provider rework',
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
