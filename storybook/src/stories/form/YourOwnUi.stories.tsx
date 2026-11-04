import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnControlExample, RibbonAndNotificationsExample, StepTabsExample } from '../../form/react-form/yourOwnUiExamples'
import { FluentV9Example } from '../../form/react-form/fluentV9Examples'

const DESCRIPTION = `
Four parts of the form draw through slots you can replace: the control of a field, the tabs, the ribbon and the notifications. The form underneath stays the same, so binding, validation and saving keep working. Try it below: rate the account and watch *Unsaved changes* appear.

{{canvas: Your own control}}

## Your own control

- \`components.onRenderControl\` of \`Form.Control\` draws the field in place of the Base Controls one, and gets \`{ disabled }\`.
- Inside it, \`useField()\` returns the field it sits in, with \`getValue()\`, \`setValue(value)\`, \`getColumn()\` and \`getFormattedValue()\`, and draws again when the value changes.
- \`Form.Control\` still shows the error under the control after a save, and the lock by the label.
- A \`Form.Cell\` outside a \`Form.Field\` holds content of your own under its \`label\`, as *Last contact* does.
- \`FormUi\` holds \`Tabs\`, \`Tab\`, \`Section\`, \`Column\`, \`Cell\` and \`Skeleton\` as plain UI with no record behind them, for a screen that looks like a form.

How slots work, such as wrapping a default or returning \`null\`, is on [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview) of DatasetControl.

## Your own tabs

- \`components.onRenderTabs\` of \`Form.Tabs\` draws the headers and the open tab. It gets the \`Form.Tab\` elements as \`children\`, with \`expandedTab\` and \`onTabChange\`.
- Draw the child whose \`id\` is \`expandedTab\`, and call \`onTabChange\` with a tab's \`id\` to open it.

{{story: Tabs as steps}}

## The ribbon and the notifications

- \`components.onRenderCommandBar\` of \`Form.Ribbon\` gets the props of Fluent's \`CommandBar\`: \`items\` holds **Save**, and \`farItems\` holds *Unsaved changes* while there are any. Spread them and add commands of your own.
- \`components.onRenderNotifications\` of \`Form.Notifications\` gets the \`messages\`, the validation summary included. The default draws them with the exported \`NotificationMessageBar\`.
- A slot is called as its part renders, so a slot that needs hooks returns a component of your own, as both slots in the example do.
- The ribbon's wording is \`FORM_LABELS\`: see [**Localization**](?path=/docs/concepts-localization--overview).

{{story: Commands and messages of your own}}

## A whole design system

Every slot gets the props its default would, so another design system can draw the form. The example draws it with Fluent UI v9:

- In v9: the inputs, the tab headers, the ribbon and the notifications.
- Left as they are: the sections, the labels and required marks of the cells, the error under a control and the loading placeholder.
- v9 components need a \`FluentProvider\` around them, light or dark to match the Fluent v8 theme.

{{story: Everything in Fluent UI v9}}

## Every slot

| Part | Slot | Gets | Default |
|---|---|---|---|
| \`Form.Control\` | \`onRenderControl\` | \`{ id, disabled }\` | \`ControlComponents\` |
| \`Form.Tabs\` | \`onRenderTabs\` | \`{ children, expandedTab, onTabChange }\` | \`TabComponents\` |
| \`Form.Ribbon\` | \`onRenderCommandBar\` | \`ICommandBarProps\` | Fluent's \`CommandBar\` |
| \`Form.Notifications\` | \`onRenderNotifications\` | \`INotificationMessageBarProps\` | \`NotificationMessageBar\` |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the form', iconName: 'Plug', href: '?path=/docs/controls-form-talking-to-the-form--overview', text: 'Follow every change and save, and read, set and save values from your own code.' },
    { title: 'Fluent UI', iconName: 'Color', href: '?path=/docs/concepts-fluent-ui--overview', text: 'Which Fluent UI and Base Controls components to build your own parts with.' },
    { title: 'Theming', iconName: 'Brush', href: '?path=/docs/concepts-theming--overview', text: 'The colours every part of the form is drawn in.' },
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
                story: `A *Deactivate* command beside **Save**, and every message in a bar of its own. Try: clear *Account name*, then press **Save**.`,
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
                story: `The inputs, tabs, ribbon and notifications drawn with Fluent UI v9; open *v9.tsx*.`,
            },
        },
    },
}
