import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { CancelSaveExample, CheckWebsiteExample, DigitalOnlyExample, StartQualificationExample } from '../../form/xrm-form/examples/formContextExamples'

const DESCRIPTION = `
\`formContext\` is the object Dataverse hands a form script, and \`XrmForm\` hands the same object to your code. Scripts written for a model-driven app read and change values, show and hide parts of the form, raise notifications and check saves through it, here as there. Try it below: press **Start qualification**.

{{canvas: Start qualification}}

## Get the form context

\`onFormReady({ formContext, api })\` is called once the record and the FormXml are loaded, so register there what a form's OnLoad would. To call \`formContext\` from buttons of your own, keep it in state, as the example does.

- \`getAttribute(name)\` takes the column's logical name; \`getControl(name)\` takes the control's \`id\` in the FormXml.
- \`ui.tabs.get(name)\` and a tab's \`sections.get(name)\` take the \`name\` of the tab or section.
- \`data.refresh()\` loads the record again: \`onFormReady\` is called once more with a new \`formContext\`, and the old one's handlers are gone.
- \`api\` is the handle \`Form.Root\` gives: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Values and validation

An attribute holds the value of one column: \`getValue()\`, \`setValue(value)\` and \`getIsDirty()\`.

- \`addOnChange(handler)\` runs the handler after each change the user makes. As in Dataverse, \`setValue\` does not run it; call \`fireOnChange()\` after it when it should.
- \`setRequiredLevel(level)\` makes the field \`'required'\`, \`'recommended'\` or \`'none'\`.
- \`setIsValid(isValid, message)\` marks the value invalid, or valid again.
- A required field left empty and an invalid value stop the save, and show as [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview) describes.

{{story: Check the website}}

## Tabs, sections and controls

Tabs, sections and controls each have \`getLabel()\`, \`setLabel(label)\`, \`getVisible()\` and \`setVisible(visible)\`. A control also has \`getDisabled()\` and \`setDisabled(disabled)\`, and a tab \`setFocus()\`, which opens it.

{{story: Digital-only accounts}}

## Notifications

\`ui.setFormNotification(message, level, uniqueId)\` shows a message above the tabs, at the level \`'INFO'\`, \`'WARNING'\` or \`'ERROR'\`. Another message with the same \`uniqueId\` replaces it, and \`ui.clearFormNotification(uniqueId)\` removes it. The validation errors show with them; to draw them all your own way, see [**Your own UI**](?path=/docs/controls-form-xrm-your-own-ui--overview).

## Saving

- \`data.save()\` saves as the ribbon's **Save** does, and \`data.getIsDirty()\` says whether there is anything to save.
- \`data.entity.addOnSave(handler)\` runs the handler before every save, whoever starts it: **Save**, \`autoSave\` or \`data.save()\`. It runs only when every value is valid.
- \`context.getEventArgs().preventDefault()\` in the handler cancels the save. A handler that returns a promise is waited for.

{{story: Cancel a save}}

## Reference

The members \`formContext\` has, as Microsoft's [client API reference](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference) describes them:

- \`formContext\`: \`data\`, \`ui\`, \`getAttribute(name)\`, \`getControl(name)\`.
- \`data\`: \`entity\`, \`attributes\`, \`getIsDirty()\`, \`isValid()\`, \`save()\`, \`refresh()\`, \`addOnLoad()\`, \`removeOnLoad()\`.
- \`data.entity\`: \`attributes\`, \`getId()\`, \`getEntityName()\`, \`getEntityReference()\`, \`getPrimaryAttributeValue()\`, \`isValid()\`, \`save()\`, \`addOnSave()\`, \`removeOnSave()\`.
- An attribute: \`controls\`, \`getName()\`, \`getAttributeType()\`, \`getValue()\`, \`setValue()\`, \`getIsDirty()\`, \`getRequiredLevel()\`, \`setRequiredLevel()\`, \`isValid()\`, \`setIsValid()\`, \`getSubmitMode()\`, \`getUserPrivilege()\`, \`addOnChange()\`, \`removeOnChange()\`, \`fireOnChange()\`.
- \`ui\`: \`tabs\`, \`controls\`, \`getFormType()\`, \`setFormNotification()\`, \`clearFormNotification()\`, \`addOnLoad()\`, \`removeOnLoad()\`.
- A tab: \`sections\`, \`getName()\`, \`getLabel()\`, \`setLabel()\`, \`getVisible()\`, \`setVisible()\`, \`getDisplayState()\`, \`setFocus()\`, \`addTabStateChange()\`, \`removeTabStateChange()\`.
- A section: \`controls\`, \`getName()\`, \`getLabel()\`, \`setLabel()\`, \`getVisible()\`, \`setVisible()\`.
- A control: \`getName()\`, \`getControlType()\`, \`getAttribute()\`, \`getLabel()\`, \`setLabel()\`, \`getVisible()\`, \`setVisible()\`, \`getDisabled()\`, \`setDisabled()\`.

Where it differs from Dataverse:

- Only an OnSave handler gets an execution context; the other handlers get an empty object.
- \`getFormType()\` always returns 2, the Update form type; \`save()\` and \`refresh()\` ignore their arguments.
- \`tab.setDisplayState()\` throws: use \`setFocus()\`.
- \`control.focus()\`, \`control.addNotification()\`, \`attribute.addOption()\`, \`ui.refreshRibbon()\` and \`ui.close()\` throw "is not implemented".
- \`process\`, \`navigation\`, \`formSelector\`, \`quickForms\` and \`footerSection\` hold nothing.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-form-xrm-your-own-ui--overview', text: 'Draw the controls, the tabs, the ribbon or the notifications your own way, still driven by formContext.' },
    { title: 'Xrm', iconName: 'TextDocument', href: '?path=/docs/controls-form-xrm-overview--overview', text: 'What XrmForm draws from the FormXml, and the props it takes.' },
    { title: 'Fields and validation', iconName: 'CheckList', href: '?path=/docs/controls-form-fields-and-validation--overview', text: 'How required fields and invalid values stop a save, and how the form shows them.' },
]

const meta = {
    title: 'Controls/Form/Xrm/Form context',
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

export const StartQualification: Story = {
    name: 'Start qualification',
    render: () => renderStory(<StartQualificationExample />),
}

export const CheckTheWebsite: Story = {
    name: 'Check the website',
    render: () => renderStory(<CheckWebsiteExample />),
    parameters: {
        docs: {
            description: {
                story: `The website is checked when the form loads and after every change, and an address without https:// stops the save. Try: save with *http://contoso.example* in *Website*.`,
            },
        },
    },
}

export const DigitalOnlyAccounts: Story = {
    name: 'Digital-only accounts',
    render: () => renderStory(<DigitalOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `One script hides *Phone*, the *Status* section and the *Details* tab, relabels and requires *Website*, and undoes it all when switched off. Try: switch on *Digital only*.`,
            },
        },
    },
}

export const CancelASave: Story = {
    name: 'Cancel a save',
    render: () => renderStory(<CancelSaveExample />),
    parameters: {
        docs: {
            description: {
                story: `An OnSave handler cancels the save of an account on credit hold until *Description* says why. Try: press **Save**.`,
            },
        },
    },
}
