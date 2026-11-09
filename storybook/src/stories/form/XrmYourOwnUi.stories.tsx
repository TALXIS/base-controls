import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnControlExample, RibbonCommandExample } from '../../form/xrm-form/examples/yourOwnUiExamples'

const DESCRIPTION = `
> **Coming soon:** \`Form\` will move to the shared runtime that \`Map\`, \`Grid\` and \`DatasetControl\` run on, and \`XrmForm\` will become a wrapper over it. Expect \`Form.Root\`, \`onFormReady\` and \`IFormApi\` to change.

\`XrmForm\` draws the ribbon, the notifications, the tabs and every control with the same parts as \`Form\`, and each of them can be drawn your own way. The FormXml still places the fields and \`formContext\` still drives them, so your scripts keep working on what you draw. Try it below: pick another industry.

{{canvas: Your own control}}

## What XrmForm hands the slots

Each slot gets what the same slot of \`Form\` gets, as [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview) describes, filled in from the FormXml and \`formContext\`:

| Key | What the slot gets |
|---|---|
| \`control\` | Every control, with its \`id\` in the FormXml as \`props.id\`, and \`props.disabled\` following the FormXml and \`setDisabled()\`. Draw the controls you pick by \`id\`, and hand the rest to \`ControlComponents.onRenderControl(props)\`. |
| \`tabs\` | The FormXml's visible tabs as \`children\`, each with its \`id\`, or its \`name\` when it has none, and its \`label\`. A tab's \`setFocus()\` and \`setVisible()\` keep working. |
| \`ribbon\` | **Save**, which calls \`formContext.data.save()\`. A command of your own reaches the form through \`formContext\`. |
| \`notifications\` | What \`setFormNotification()\` raised, then the validation errors. |

{{story: A command of your own}}

## Changing how it looks

\`XrmForm\` takes \`components\`, and the change is live. Each key holds the slot of one part of \`Form\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`control\` | \`onRenderControl\` | \`ControlComponents\` | Each control |
| \`tabs\` | \`onRenderTabs\` | \`FormUiTabComponents\` | The tab headers and the open tab |
| \`ribbon\` | \`onRenderCommandBar\` | | **Save** and *Unsaved changes* |
| \`notifications\` | \`onRenderNotifications\` | | The notifications and the validation errors |

A blank default is not exported.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Form context', iconName: 'Code', href: '?path=/docs/controls-form-xrm-form-context--overview', text: 'Read and change values, show and hide parts of the form, and check a save from your scripts.' },
    { title: 'Fluent UI', iconName: 'Color', href: '?path=/docs/concepts-fluent-ui--overview', text: 'Which Fluent UI and Base Controls components to draw your own pieces with.' },
    { title: 'Xrm', iconName: 'TextDocument', href: '?path=/docs/controls-form-xrm-overview--overview', text: 'What XrmForm draws from the FormXml, and the props it takes.' },
]

const meta = {
    title: 'Controls/Form/Xrm/Your own UI',
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

export const ACommandOfYourOwn: Story = {
    name: 'A command of your own',
    render: () => renderStory(<RibbonCommandExample />),
    parameters: {
        docs: {
            description: {
                story: `The ribbon keeps **Save** and gets a command that sets a value through \`formContext\`. Try: press **Release credit hold**.`,
            },
        },
    },
}
