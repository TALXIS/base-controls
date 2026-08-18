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

Most of what looks like a subclass is a constructor callback — new-task defaults, what counts as active, what happens on open, and the grid customizer are all parameters on \`MemoryTaskGridDescriptor\`. See [**Before you subclass anything**](?path=/story/task-grid-custom-strategies--overview).

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

This is the most useful of the three, because a descriptor hook is what decides *which strategy serves which feature*. Overriding one swaps a feature's implementation without touching anything else — return \`undefined\` to switch the feature off, a shipped strategy from the other extension, or one of your own. The Dataverse page uses exactly this to drop the \`talxis_attributedefinition\` and \`talxis_userquery\` dependencies: [**Swapping a default strategy**](?path=/story/task-grid-strategies-dataverse--overview).

Adding an optional hook the shipped descriptor does not implement is the same move. Giving the Dataverse descriptor a [**Customizer**](?path=/story/task-grid-customizations-customizer--overview):

\`\`\`ts
class MyDataverseDescriptor extends DataverseTaskGridDescriptor {
    //the base descriptor keeps its params private, so hold your own copy of anything you need
    constructor(private _params: IDataverseTaskGridDescriptorParams) {
        super({ onInitialize: async () => _params, height: '600px' })
    }

    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy {
        return new MyCustomizerStrategy()
    }
}
\`\`\`

Adding a hook is safe because nothing in the base class reads it. Overriding one that already exists is where the traps are.

## What is actually overridable

- **All strategy state is private.** Across \`extensions/\`, the only \`protected\` members are \`onCreateTemplateFromTask\` on the two template providers — the one member designed to be overridden. Everything else is either the public hook surface or private fields you cannot reach.
- **\`MemorySavedQueryStrategy\` cannot be subclassed at all in the usual way.** Its five interface members are arrow-function class *fields*, not prototype methods. A subclass that declares \`onGetUserQueries()\` as a method is silently shadowed by the base's instance field, and \`super.onGetUserQueries\` is \`undefined\` — a \`TypeError\` at call time, not a compile error. To change one, re-declare it as a field, and accept that you cannot delegate to the original.
- **\`MemoryTaskGridDescriptor.onCreateUserQueryDataProvider\` depends on \`onCreateSavedQueryStrategy\` having run**, through a private field. Override the latter without calling \`super\` and the former throws *"cannot create the user-query data provider before onCreateSavedQueryStrategy"*.
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
