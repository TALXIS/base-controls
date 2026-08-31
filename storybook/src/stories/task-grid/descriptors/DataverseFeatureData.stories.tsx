import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Dataverse/Feature data',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
Each optional feature reads its data from its own implementation. Registering the module is what turns the
feature on — see [**Modules**](?path=/story/task-grid-modules--overview) — and this page is where that
module's data comes from on Dataverse.

Several are backed by TALXIS models with a ready-made strategy:
[**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview).

## Saved views

System views come from \`systemQueries\` and are never written to. Personal views are a module: register
\`onGetUserQueriesModule\` and the *My views* group, the save commands and the view manager appear.

Their three options — \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` — belong to
\`createUserQueryModule\` rather than to \`gridParameters\`, because the commands they gate arrive with the
module. Not registering it keeps the view manager and both dialogs out of your bundle.

On TALXIS, \`TalxisUserQueryStrategy\` persists them for you:
[**Talxis platform → Personal views**](?path=/story/task-grid-descriptors-talxis-platform--overview).

## Lookup-many columns

A lookup-many column surfaces a 1:N or N:N relationship as a single cell. Two distinct pieces of column metadata drive it:

\`\`\`ts
{
    name: 'tags',
    isVirtual: true,
    dataType: 'Lookup.Simple',
    metadata: {
        Targets: ['talxis_tag'],
        LookupMany: {
            // identifies the relationship - drives $expand and associate/disassociate
            ReferencedEntityNavigationPropertyName: 'talxis_projecttask_talxis_Tag_talxis_Tag',
        },
    },
    controls: [{
        appliesTo: 'both',
        name: 'ColorfulLookupMany',
        bindings: {
            // loads the picker's candidate records
            FetchXml: { value: '<fetch><entity name="talxis_tag">…</entity></fetch>', type: 'SingleLine.Text' },
            ColorPropertyName: { value: 'talxis_color', type: 'SingleLine.Text' },
        },
    }],
}
\`\`\`

- **\`metadata.LookupMany\`** identifies the relationship. The strategy resolves the OData expand clause from it and handles associate/disassociate on save. It is also what makes the column render as a picker — see [**Customizations**](?path=/story/task-grid-customizations--overview), under *Column metadata*.
- **\`controls[0].bindings.FetchXml\`** is the candidate query. \`DataverseLookupManyDataProviderFactory\` reads it and renders its Liquid per row, so \`{{ task.id }}\` and \`{{ task.<attribute> }}\` scope the picker to the cell it sits on, while \`{{ project.* }}\` and \`{{ currentRecord.* }}\` come from the descriptor's records.
- **\`controls[0].name\`** picks the variant: \`LookupMany\`, \`PeopleLookupMany\`, or \`ColorfulLookupMany\`.

The column name itself is arbitrary — the relationship is identified by the navigation property, not the name.

Feeding the picker is the \`lookupMany\` [**module**](?path=/story/task-grid-modules--overview); the factory does the work:

\`\`\`ts
modules: {
    onGetLookupManyModule: ({ services, projectRecord, sourceRecord }) => createLookupManyModule({
        createDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create({
            ...parameters,
            projectRecord,
            sourceRecord,
        }),
        services,
    }),
},
\`\`\`

The parameters carry everything the factory needs: the cell's record and column from the call, the project and source records from the builder's own params. It returns \`undefined\` for a column with no \`FetchXml\` binding, and the grid then reports that the column has no candidates.

## Templates

No Dataverse implementation ships: \`DataverseTemplateDataProvider\` lists templates through FetchXML but implements neither capturing one from a task nor expanding one into tasks. The \`templates\` module is there for a provider of your own; without one the template commands stay out of the ribbon. See [**Extending**](?path=/story/task-grid-extending--overview) for the contract to implement, and [**Memory → Feature data**](?path=/story/task-grid-descriptors-memory-feature-data--overview) for a working example.

## Task dependencies

\`DataverseTaskDependencyStrategy\` reads dependency rows through the Web API. It knows nothing about your schema: the table, its two task lookups, its option set and what that option set's values mean are all arguments, so it serves any table shaped like a dependency.

\`\`\`ts
import { createDependenciesModule, DataverseTaskDependencyStrategy } from '@talxis/base-controls'

//returned from onInitialize
modules: {
    onGetDependenciesModule: ({ services }) => createDependenciesModule({
        services,
        strategy: new DataverseTaskDependencyStrategy({
            services,
            entityName: 'talxis_taskdependency',
            primaryIdAttribute: 'talxis_taskdependencyid',
            predecessorAttribute: 'talxis_predecessortaskid',
            successorAttribute: 'talxis_successortaskid',
            typeAttribute: 'talxis_dependencytypecode',
            //the grid works in link types, not option-set values, so the map is yours to state
            dependencyTypeCodes: {
                742070000: 'finishToStart',
                742070001: 'startToStart',
                742070002: 'finishToFinish',
                742070003: 'startToFinish',
            },
        }),
    }),
},
\`\`\`

Every parameter is required, the map included: the grid works in link types, so nothing can be inferred from a bare option-set value. Name every value the attribute can hold — an unmapped value falls back to finish-to-start and warns.

On the TALXIS platform this schema is already filled in: use \`TalxisTaskDependencyStrategy\` and pass nothing but the locator. See [**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview).

Two things worth knowing about the read. It is **scoped by the tasks the grid loaded**, in batches of 800 ids, and a dependency counts when either of its ends is one of them — so a link pointing at a task outside the current view still arrives, and widening the view widens the read. And it filters on nothing else: a **deactivated** dependency row is still counted, so a solution that deactivates rather than deletes them needs a strategy of its own.

Registering the module is what creates the two columns — see [**Modules → Task dependencies**](?path=/story/task-grid-modules--dependencies).

## Task checklists

No generic Dataverse implementation ships. On the TALXIS platform, \`TalxisChecklistStrategy\` reads each
task's checklist from a JSON column on the task record — see
[**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview). Elsewhere, implement
\`IChecklistStrategy\` yourself: it is one method returning the items for the tasks the grid has loaded.

Registering the module is what creates the **Checklist** column — see
[**Modules → Task checklists**](?path=/story/task-grid-modules--checklist).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
