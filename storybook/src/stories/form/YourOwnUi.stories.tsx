import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnControlExample, RibbonAndNotificationsExample, StepTabsExample } from '../../form/react-form/yourOwnUiExamples'
import { FluentV9Example } from '../../form/react-form/fluentV9Examples'

const DESCRIPTION = `
The form draws each field with the Base Controls field for its data type, and its tabs, ribbon and notifications in Fluent UI; you can draw any of the four your own way. The form underneath stays the same, so binding, validation and saving keep working. Try it below: rate the account and watch *Unsaved changes* appear.

{{canvas: Your own control}}

## Your own control

\`onRenderControl\` of \`Form.Control\` draws the field in place of the Base Controls one. Inside it, \`useField()\` returns the field it sits in, with \`getValue()\`, \`setValue(value)\`, \`getColumn()\` and \`getFormattedValue()\`, and draws again when the value changes. \`Form.Control\` still shows the error under the control after a save, and the lock by the label when it is \`disabled\`.

A \`Form.Cell\` outside a \`Form.Field\` holds content of your own beside its \`label\`, as *Last contact* does in the example.

## Your own tabs

\`onRenderTabs\` of \`Form.Tabs\` draws the headers and the open tab. It gets the \`Form.Tab\` elements as \`children\`, with \`expandedTab\` and \`onTabChange\`: draw the child whose \`id\` is \`expandedTab\`, and call \`onTabChange\` with a tab's \`id\` to open it.

{{story: Tabs as steps}}

## The ribbon and the notifications

\`onRenderCommandBar\` of \`Form.Ribbon\` gets the props of Fluent's \`CommandBar\`: \`items\` holds **Save**, and \`farItems\` holds *Unsaved changes* while there are any, so spread them and add commands of your own. \`onRenderNotifications\` of \`Form.Notifications\` gets the \`messages\`, the validation summary included; the default draws them with the exported \`NotificationMessageBar\`.

A slot is called as its part renders, so a slot that needs hooks returns a component of your own, as both slots in the example do. The ribbon's wording comes from \`FORM_LABELS\`: see [**Localization**](?path=/docs/concepts-localization--overview).

{{story: Commands and messages of your own}}

## A whole design system

Every slot gets the props its default would, so another design system can draw the form. The example draws the inputs, the tab headers, the ribbon and the notifications in Fluent UI v9, and leaves the sections, the cells' labels and required marks, the error under a control and the loading placeholder as they are.

{{story: Everything in Fluent UI v9}}

## Form UI without a record

\`FormUi\` holds \`Tabs\`, \`Tab\`, \`Section\`, \`Column\`, \`Cell\` and \`Skeleton\` as plain UI with no record behind them, for a screen of your own that looks like a form.

## Changing how it looks

\`Form.Control\`, \`Form.Tabs\`, \`Form.Ribbon\` and \`Form.Notifications\` each take \`components\`, and the change is live. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`Form.Control\` | Top level | \`onRenderControl\`, with \`{ id, disabled }\` | \`ControlComponents\` | The field's control |
| \`Form.Tabs\` | Top level | \`onRenderTabs\`, with \`{ children, expandedTab, onTabChange }\` | \`FormUiTabComponents\` | The tab headers and the open tab |
| \`Form.Ribbon\` | Top level | \`onRenderCommandBar\`, with \`ICommandBarProps\` | | **Save** and *Unsaved changes* |
| \`Form.Notifications\` | Top level | \`onRenderNotifications\`, with \`INotificationMessageBarProps\` | | Your messages and the validation summary |

A blank default is not exported.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the form', iconName: 'Plug', href: '?path=/docs/controls-form-talking-to-the-form--overview', text: 'Follow every change and save, and read, set and save values from your own code.' },
    { title: 'Fluent UI', iconName: 'Color', href: '?path=/docs/concepts-fluent-ui--overview', text: 'Which Fluent UI and Base Controls components to build your own parts with.' },
    { title: 'Pieces and slots', iconName: 'Puzzle', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'How slots work, and how to draw a default from your own.' },
]

const meta = {
    title: 'Controls/Form/Your own UI',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const YourOwnControl: Story = {
    name: 'Your own control',
    render: () => renderStory(<OwnControlExample />),
}

export const TabsAsSteps: Story = {
    name: 'Tabs as steps',
    render: () => renderStory(<StepTabsExample />),
    parameters: {
        docs: {
            description: {
                story: `The tabs drawn as numbered steps, with **Back** and **Next** under the open one. Try: press **Next** twice.`,
            },
        },
    },
}

export const CommandsAndMessagesOfYourOwn: Story = {
    name: 'Commands and messages of your own',
    render: () => renderStory(<RibbonAndNotificationsExample />),
    parameters: {
        docs: {
            description: {
                story: `A **Deactivate** command beside **Save**, and every message in a bar of its own. Try: clear *Account name*, then press **Save**.`,
            },
        },
    },
}

export const EverythingInFluentV9: Story = {
    name: 'Everything in Fluent UI v9',
    render: () => renderStory(<FluentV9Example />),
    parameters: {
        docs: {
            description: {
                story: `The form drawn in Fluent UI v9, through the slots in the example's \`v9.tsx\`. Try: clear *Account name* and press **Save**.`,
            },
        },
    },
}
