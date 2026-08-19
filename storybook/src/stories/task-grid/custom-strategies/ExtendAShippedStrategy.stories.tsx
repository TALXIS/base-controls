import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Custom strategies/Extend a shipped strategy',
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

## Start with the params

Most of what looks like a subclass is a constructor callback. New-task defaults, what counts as active, what happens on open, the grid customizer — and every optional feature: personal views, templates, custom columns and lookup-many candidates are all \`onCreate*\` parameters on **both** shipped descriptors. Switching a feature on or answering it with a strategy of your own needs no subclass at all. See [**Before you subclass anything**](?path=/story/task-grid-custom-strategies--overview).

## Subclassing a task strategy

The common case, and the one that works cleanly, is post-processing an operation:

\`\`\`ts
class MyTaskStrategy extends DataverseTaskStrategy {
    public async onCreateTask(parentTaskId?: string) {
        const task = await super.onCreateTask(parentTaskId)
        // …post-process
        return task
    }
}
\`\`\`

The subclass still needs both constructor arguments, so return it from your descriptor's \`onCreateTaskStrategy(deps)\` with the params you would have passed to the original. That means you also need a descriptor — either your own, or a subclass of the shipped one.

## Subclassing a descriptor

Since every optional feature is already a parameter, the reason to subclass a descriptor is narrower than it used to be: you want to change something the parameters cannot express — the FetchXML the task strategy gets, the field mapping, or a hook's answer computed from state only the subclass has.

\`\`\`ts
class MyDataverseDescriptor extends DataverseTaskGridDescriptor {
    //the base descriptor keeps its params private, so hold your own copy of anything you need
    constructor(private _params: IDataverseTaskGridDescriptorParams) {
        super({ onInitialize: async () => _params, height: '600px' })
    }

    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        return new MyTaskStrategy({ fetchXml: this._rewriteFetchXml(this._params.baseFetchXml) }, deps)
    }
}
\`\`\`

Overriding a hook the base class does not read is safe. Overriding one it does is where the traps are.

## What is actually overridable

- **All strategy state is private.** Across \`extensions/\`, the only \`protected\` members are \`onCreateTemplateFromTask\` on the two template providers — the one member designed to be overridden. Everything else is either the public hook surface or private fields you cannot reach.
- **The user-query and template strategies are the ones you replace by parameter, not by subclass.** \`MemoryUserQueryStrategy\`, \`DataverseUserQueryStrategy\` and \`MemoryTemplateDataProvider\` all use prototype methods, so subclassing them works normally — but returning your own implementation from the descriptor's \`onCreate*\` callback is usually less work than inheriting one.
- **Neither descriptor exposes its resolved params.** \`_params\` is private in both, so a subclass that needs \`fetchXml\`, \`records\` or \`fieldMapping\` must keep the object it passed to \`onInitialize\`, as in the snippet above.
- **\`DataverseTaskStrategy\` has one built-in extension point that is not a subclass**: the \`form\` param's \`onGetFormParameters\`, which lets you rewrite the page input and navigation options for the create, edit, bulk-edit and open dialogs.

## When to stop

If you find yourself overriding more than two hooks, or copying private logic to work around what you cannot reach, write the strategy instead — it is a smaller surface than it looks. [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
