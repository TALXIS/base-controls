import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Extending/Extend a shipped strategy',
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
Every shipped strategy and descriptor is exported, so \`class Mine extends Theirs\` compiles. Be clear about what that buys you: their state is \`private\`, so a subclass can wrap a hook — do something before, after, or instead of \`super\` — but it cannot reimplement one. Anything that needs their FetchXML, their record array or their resolved parameters has to keep its own copy.

Read this page second. Both task strategies take **a hook per operation** on their constructor argument, and each hook receives the parameters of the matching \`MemoryTaskActions\` / \`DataverseTaskActions\` method — so wrapping one behaviour no longer needs a class at all:

\`\`\`ts
new DataverseTaskStrategy({
    services,
    onInitialize: async () => ({ fetchXml, sourceRecord, editFormId }),
    onCreateTask: async params => {
        const task = await DataverseTaskActions.createTask(params)
        //…post-process
        return task
    },
})
\`\`\`

Subclass when you want to change several operations at once, hold state of your own between them, or override a hook that has no parameter — otherwise prefer the hook.

## Start with the params

Most of what looks like a subclass is a constructor callback. New-task defaults, what counts as active, what happens on open, the grid customizer — and every optional feature: personal views, templates, task dependencies and lookup-many candidates are all **modules** on both shipped descriptors — see [**Modules**](?path=/story/task-grid-modules--overview). Switching a feature on or answering it with a strategy of your own needs no subclass at all. See [**Before you subclass anything**](?path=/story/task-grid-extending--overview).

## Subclassing a task strategy

The same post-processing as a class, when you would rather hold state on \`this\`:

\`\`\`ts
class MyTaskStrategy extends DataverseTaskStrategy {
    public async onCreateTask(parentTaskId?: string) {
        const task = await super.onCreateTask(parentTaskId)
        // …post-process
        return task
    }
}
\`\`\`

The subclass takes the same single params object as the original — \`{ onInitialize, services }\` — and you return it from the \`onCreateTaskStrategy\` your \`onInitialize\` resolves, no descriptor subclass required:

\`\`\`ts
onCreateTaskStrategy: ({ services, fetchXml, projectRecord, sourceRecord }) => new MyTaskStrategy({
    onInitialize: async () => ({ fetchXml, projectRecord, sourceRecord, editFormId }),
    services,
}),
\`\`\`

## Subclassing a descriptor

Every optional feature — the strategies included — is already part of what \`onInitialize\` resolves, so the reason to subclass a descriptor is narrow: you want to change a hook the parameters do not cover, or answer one from state only the subclass has. \`onGetFieldMapping\` and \`onLoadDependencies\` are the realistic candidates.

\`\`\`ts
class MyDataverseDescriptor extends DataverseTaskGridDescriptor {
    //the base descriptor keeps the resolved data private, so hold your own copy of anything you need
    constructor(private _data: IDataverseTaskGridDescriptorInitializeResult) {
        super({ onInitialize: async () => _data, height: '600px' })
    }

    public onGetFieldMapping() {
        return { ...super.onGetFieldMapping(), stackRank: this._resolveRankColumn() }
    }
}
\`\`\`

Overriding a hook the base class does not read is safe. Overriding one it does is where the traps are.

## What is actually overridable

- **All strategy state is private.** Across the shipped strategies and providers, the only \`protected\` members are \`onCreateTemplateFromTask\` and \`onCreateTasksFromTemplate\` on the template providers — the two designed to be overridden. Everything else is either the public hook surface or private fields you cannot reach.
- **The user-query and template strategies are the ones you replace by parameter, not by subclass.** \`MemoryUserQueryStrategy\`, \`TalxisUserQueryStrategy\` and \`MemoryTemplateDataProvider\` all use prototype methods, so subclassing them works normally — but registering your own implementation as a module is usually less work than inheriting one.
- **Neither descriptor exposes its resolved data.** What \`onInitialize\` returns is private in both, so a subclass that needs \`fetchXml\`, \`records\` or \`fieldMapping\` must keep the object it handed back, as in the snippet above.
- **\`DataverseTaskStrategy\` takes a hook per operation, so most extensions are not a subclass at all**: \`onGetFormParameters\` rewrites the page input and navigation options for the create, edit, bulk-edit and open dialogs, and every other hook receives the parameters of the matching \`DataverseTaskActions\` method — forward them to keep the shipped behaviour.

## When to stop

If you find yourself overriding more than two hooks, or copying private logic to work around what you cannot reach, write the strategy instead — it is a smaller surface than it looks. [**Write your own**](?path=/story/task-grid-extending-write-your-own--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
