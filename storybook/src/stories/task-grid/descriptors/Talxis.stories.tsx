import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Talxis platform',
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
Four strategies ship pre-configured for the TALXIS models. Each one is the generic Dataverse strategy with
the schema already filled in, so on that platform you register the module and pass the locator — there is no
table, attribute or option-set value left to state.

They are ordinary strategies: use one, three, or none. Everything on this page sits on top of
[**Dataverse**](?path=/story/task-grid-descriptors-dataverse--overview), which is where task loading, saving
and the FetchXML come from.

| Strategy | Module | Needs |
|---|---|---|
| \`TalxisUserQueryStrategy\` | \`onGetUserQueriesModule\` | \`talxis_userquery\` |
| \`TalxisTaskDependencyStrategy\` | \`onGetDependenciesModule\` | \`talxis_taskdependency\` |
| \`TalxisChecklistStrategy\` | \`onGetChecklistModule\` | a \`talxis_checklist\` column on the task table |
| \`TalxisCustomColumnsStrategy\` | \`onGetCustomColumnsModule\` | \`talxis_attributedefinition\`, \`talxis_attributevalue\` |

> Register a module whose table is **not** deployed and the grid stays on its loading skeleton: the read
> happens before the first provider is created, outside the grid's error handling. If a table is missing,
> leave its builder out.

## All four at once

\`\`\`ts
import {
    DataverseTaskGridDescriptor,
    createUserQueryModule, TalxisUserQueryStrategy,
    createDependenciesModule, TalxisTaskDependencyStrategy,
    createChecklistModule, TalxisChecklistStrategy,
    createCustomColumnsModule, TalxisCustomColumnsStrategy,
} from '@talxis/base-controls'

const descriptor = new DataverseTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        baseFetchXml: myFetchXml,
        fieldMapping: FIELD_MAPPING,
        systemQueries: [allTasksView],
        userId: userId,
        gridParameters: { enableTaskEditing: true, enableViewSwitcher: true },
        modules: {
            onGetUserQueriesModule: ({ services, entityName, recordId, userId }) => createUserQueryModule({
                strategy: new TalxisUserQueryStrategy({ services, entityName, recordId, ownerId: userId }),
                services,
                enableQueryManager: true,
            }),
            onGetDependenciesModule: ({ services }) => createDependenciesModule({
                strategy: new TalxisTaskDependencyStrategy({ services }),
                services,
            }),
            onGetChecklistModule: ({ services }) => createChecklistModule({
                strategy: new TalxisChecklistStrategy({ services }),
                services,
            }),
            onGetCustomColumnsModule: ({ services, entityName, recordId }) => createCustomColumnsModule({
                strategy: new TalxisCustomColumnsStrategy({ services, entityName, recordId }),
                services,
                enableCustomColumnCreation: true,
            }),
        },
    }),
})
\`\`\`

Each builder is handed the slice of context its strategy needs — \`entityName\` comes from your FetchXML,
\`recordId\` from \`projectRecord\`, \`userId\` from the parameter of the same name.

## Personal views

\`TalxisUserQueryStrategy\` persists each personal view as a \`talxis_userquery\` row, with its columns,
filters and sorting serialized into \`talxis_layoutjson\`.

| Parameter | Required | Description |
|---|:--------:|---|
| \`services\` | ✅ | The locator the builder was handed. |
| \`entityName\` | ✅ | Written as \`talxis_returnedtypecode\`, so views are scoped to the task table. |
| \`recordId?\` | — | Scopes views to a parent record (\`talxis_recordid\`). Omit and only unscoped views are returned. |
| \`ownerId?\` | — | Filters by \`ownerid\`. Omit and views are shared across the environment. |

The table needs \`talxis_userqueryid\`, \`talxis_name\`, \`talxis_description\`, \`talxis_layoutjson\`,
\`talxis_returnedtypecode\`, \`talxis_recordid\` and \`ownerid\`. System views still come from
\`systemQueries\` and are never written.

## Task dependencies

\`TalxisTaskDependencyStrategy\` is \`DataverseTaskDependencyStrategy\` with the \`talxis_taskdependency\`
schema and its option-set values already mapped, so \`{ services }\` is the whole constructor.

It also reloads a task's dependencies when that task's form closes, because on this platform the form is
where dependencies are edited.

Everything the generic strategy does it does — reads scoped to the loaded tasks, either end counting, a
deleted task's dependencies leaving the grid — and everything it does not: no dependency row is ever written
or deleted here, so a deactivated row still counts. See
[**Dataverse → Task dependencies**](?path=/story/task-grid-descriptors-dataverse--overview) for the generic
version and what the columns look like.

## Checklists

\`TalxisChecklistStrategy\` reads each task's checklist from a \`talxis_checklist\` column on the task record
itself — a JSON array, so there is no second query. Registering the module adds that column to every view,
hidden, which is what makes the value arrive.

\`\`\`json
[
    { "id": "9f0c…", "name": "Draft the brief", "stackrank": "0|100000:", "status": "complete" },
    { "id": "3a41…", "name": "Review with client", "stackrank": "0|100001:" }
]
\`\`\`

\`status\` is optional and absent means \`active\`. An empty column means the task has no checklist, and the
cell stays blank. The **Checklist** column the module creates shows \`done/total\` — see
[**Modules → Task checklists**](?path=/story/task-grid-modules--checklist).

## Custom columns

\`TalxisCustomColumnsStrategy\` surfaces user-defined columns: definitions live in
\`talxis_attributedefinition\`, values in \`talxis_attributevalue\` rows linked to the task.

| Parameter | Required | Description |
|---|:--------:|---|
| \`services\` | ✅ | The locator the builder was handed. |
| \`entityName\` | ✅ | The entity whose attribute definitions are read. |
| \`recordId?\` | — | Scopes definitions to a parent record. |
| \`navigationPropertyName?\` | — | Only to disambiguate. The strategy finds the relationship itself when Dataverse reports exactly one between the two tables. |

The module's \`enableCustomColumnCreation\`, \`enableCustomColumnEditing\` and
\`enableCustomColumnDeletion\` options gate the commands in *Edit columns*. This is the only implementation of
the custom-columns contract that ships — see [**Modules**](?path=/story/task-grid-modules--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
