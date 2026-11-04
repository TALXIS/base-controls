import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnControlExample, RibbonCommandExample } from '../../form/xrm-form/examples/yourOwnUiExamples'

const DESCRIPTION = `
\`XrmForm\` draws the ribbon, the notifications, the tabs and every control with the parts of \`Form\`. Its \`components\` prop hands any of them a slot of your own, while the FormXml still places the fields and \`formContext\` still drives them. Try it below: pick another industry.

{{canvas: Your own control}}

## The pieces

Each key of \`components\` is a piece, holding the slot of one part of \`Form\`. How pieces and slots work is on DatasetControl's [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview), and what each of these slots gets is on the form's [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview).

| Piece | Part | Slot |
|---|---|---|
| \`control\` | \`Form.Control\` | \`onRenderControl\` |
| \`tabs\` | \`Form.Tabs\` | \`onRenderTabs\` |
| \`ribbon\` | \`Form.Ribbon\` | \`onRenderCommandBar\` |
| \`notifications\` | \`Form.Notifications\` | \`onRenderNotifications\` |

## What XrmForm hands the slots

- \`control\`: the slot is called for every control, with its \`id\` in the FormXml as \`props.id\`, and \`props.disabled\` following the FormXml and \`setDisabled()\`. Draw the controls you pick by \`id\`, and hand the rest to \`ControlComponents.onRenderControl(props)\`.
- \`tabs\`: \`children\` holds the FormXml's visible tabs, each with its \`id\`, or its \`name\` when it has none, and its \`label\`. A tab's \`setFocus()\` and \`setVisible()\` keep working.
- \`ribbon\`: **Save** calls \`formContext.data.save()\`. A command of your own reaches the form through \`formContext\`.
- \`notifications\`: \`messages\` holds what \`setFormNotification()\` raised, then the validation errors.

{{story: A command of your own}}

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
