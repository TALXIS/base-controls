import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withRecord } from './shared'

const VALIDATION_CODE = `import { createAccount } from './record'

const account = createAccount()

const validatePhone = (phone: string | null) => phone && !phone.startsWith('+')
    ? { error: true, errorMessage: 'Start with the country code, such as +420.' }
    : { error: false, errorMessage: '' }

const GridExample = () => {
    const [phoneValidation, setPhoneValidation] = React.useState(validatePhone(account.getValue('telephone1')))

    //checks the phone again on each change of it
    const onFieldValueChanged = (fieldName: string, value: any) => {
        if (fieldName === 'telephone1') {
            setPhoneValidation(validatePhone(value))
        }
    }

    return <Form.Root onLoad={async () => ({ record: account })} onFieldValueChanged={onFieldValueChanged}>
        <Form.Ribbon />
        {/* your messages first, then what stopped the last save */}
        <Form.Notifications messages={[{ text: 'Changes are visible to the whole sales team.', level: 'INFO' }]} />
        <Form.Section label='Account' layout={{ lg: 2 }}>
            {/* required by its column */}
            <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            <Form.Field name='telephone1' validation={phoneValidation}><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            {/* 2 is RequiredLevelEnum.ApplicationRequired: required on this form */}
            <Form.Field name='emailaddress1' requiredLevel={2}><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            {/* 3 is RequiredLevelEnum.Recommended: a mark that never stops a save */}
            <Form.Field name='websiteurl' requiredLevel={3}><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            {/* read-only, with a lock by the label */}
            <Form.Field name='customersince'><Form.Cell><Form.Control disabled /></Form.Cell></Form.Field>
        </Form.Section>
    </Form.Root>
}
`

export const ValidationExample = () => <GridExampleRunner seedCode={withRecord(VALIDATION_CODE)} tabs={['preview', 'code']} />
