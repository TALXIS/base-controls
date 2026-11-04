import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { withAccount } from './shared'

const START_QUALIFICATION_CODE = `import { XrmForm } from '@talxis/base-controls'
import type { IXrmFormContext } from '@talxis/base-controls'
import { PrimaryButton, Stack } from '@fluentui/react'
import { loadAccount } from './account'

//a form script, written as it would be for Dataverse
const startQualification = (formContext: IXrmFormContext) => {
    const summary = formContext.ui.tabs.get('summary')
    summary.setFocus()
    summary.sections.get('account_information').setLabel('Qualification details')
    formContext.getAttribute('websiteurl').setRequiredLevel('required')
    formContext.ui.setFormNotification('Qualification has started: add the website, then save.', 'INFO', 'qualification')
}

const GridExample = () => {
    const [formContext, setFormContext] = React.useState<IXrmFormContext>()
    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal>
            <PrimaryButton text='Start qualification' disabled={!formContext} onClick={() => startQualification(formContext!)} />
        </Stack>
        {/* called once the record and the FormXml are loaded */}
        <XrmForm onLoad={loadAccount} onFormReady={params => setFormContext(params.formContext)} />
    </Stack>
}
`

const CHECK_WEBSITE_CODE = `import { XrmForm } from '@talxis/base-controls'
import type { IXrmFormContext } from '@talxis/base-controls'
import { loadAccount } from './account'

const checkWebsite = (formContext: IXrmFormContext) => {
    const website = formContext.getAttribute('websiteurl')
    const value: string = website.getValue() ?? ''
    //its message shows once the user has tried to save
    website.setIsValid(value === '' || value.startsWith('https://'), 'Use a secure address, one that starts with https://.')
}

const GridExample = () => <XrmForm onLoad={loadAccount} onFormReady={({ formContext }) => {
    //runs after each change the user makes
    formContext.getAttribute('websiteurl').addOnChange(() => checkWebsite(formContext))
    checkWebsite(formContext)
}} />
`

const DIGITAL_ONLY_CODE = `import { XrmForm } from '@talxis/base-controls'
import type { IXrmFormContext } from '@talxis/base-controls'
import { Stack, Toggle } from '@fluentui/react'
import { loadAccount } from './account'

//one script switches both ways
const setDigitalOnly = (formContext: IXrmFormContext, isDigitalOnly: boolean) => {
    formContext.getControl('telephone1').setVisible(!isDigitalOnly)
    formContext.getControl('websiteurl').setLabel(isDigitalOnly ? 'Primary web address' : 'Website')
    formContext.getAttribute('websiteurl').setRequiredLevel(isDigitalOnly ? 'required' : 'none')
    formContext.ui.tabs.get('summary').sections.get('status').setVisible(!isDigitalOnly)
    formContext.ui.tabs.get('details').setVisible(!isDigitalOnly)
}

const GridExample = () => {
    const [formContext, setFormContext] = React.useState<IXrmFormContext>()
    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Digital only' inlineLabel disabled={!formContext} onChange={(_, checked) => setDigitalOnly(formContext!, !!checked)} />
        <XrmForm onLoad={loadAccount} onFormReady={params => setFormContext(params.formContext)} />
    </Stack>
}
`

const CANCEL_SAVE_CODE = `import { XrmForm } from '@talxis/base-controls'
import { loadAccount } from './account'

const GridExample = () => <XrmForm onLoad={loadAccount} onFormReady={({ formContext }) => {
    //runs before every save, whoever starts it
    formContext.data.entity.addOnSave(context => {
        const isOnHold = formContext.getAttribute('creditonhold').getValue()
        const reason = formContext.getAttribute('description').getValue()
        if (isOnHold && !reason) {
            //cancels this save only
            context.getEventArgs().preventDefault()
            formContext.ui.setFormNotification('Say in Description why the account is on credit hold.', 'ERROR', 'creditHold')
            return
        }
        formContext.ui.clearFormNotification('creditHold')
    })
}} />
`

export const StartQualificationExample = () => <GridExampleRunner seedCode={withAccount(START_QUALIFICATION_CODE)} tabs={['preview', 'code']} />

export const CheckWebsiteExample = () => <GridExampleRunner seedCode={withAccount(CHECK_WEBSITE_CODE)} tabs={['preview', 'code']} />

export const DigitalOnlyExample = () => <GridExampleRunner seedCode={withAccount(DIGITAL_ONLY_CODE)} tabs={['preview', 'code']} />

export const CancelSaveExample = () => <GridExampleRunner seedCode={withAccount(CANCEL_SAVE_CODE)} tabs={['preview', 'code']} />
