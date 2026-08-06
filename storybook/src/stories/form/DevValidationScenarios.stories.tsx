import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MessageBar, MessageBarType, Stack, Text } from '@fluentui/react'
import { RequiredLevelEnum } from '@talxis/client-metadata'
import { Form, MemoryStrategy } from '@talxis/base-controls/components/Form'
import { renderStory } from './storyHelpers'
import { getDemoRecord, getFormColumns, formMetadata } from '../../form/shared/formModel'

const strategy = new MemoryStrategy({
    onGetData: () => getDemoRecord(),
    onGetColumns: () => getFormColumns(),
    onGetMetadata: () => formMetadata,
})

const HiddenTabValidationRegistrationScenario = () => {
    const [activeTab, setActiveTab] = React.useState('main')
    const [validationSummary, setValidationSummary] = React.useState<{ fieldName?: string; errorMessage?: string }[]>([])

    const hiddenFieldValidation = React.useMemo(() => ({
        error: true,
        errorMessage: 'Hidden validation should block save before the hidden tab is opened.',
    }), [])

    return (
        <Form.Root strategy={strategy} onValidationSummaryChanged={setValidationSummary}>
            <Stack tokens={{ childrenGap: 12 }}>
                <MessageBar messageBarType={MessageBarType.info} isMultiline>
                    <Stack tokens={{ childrenGap: 6 }}>
                        <Text variant="mediumPlus">Scenario: hidden-tab validation registration</Text>
                        <Text variant="small">
                            Start on the <strong>Main</strong> tab and click save without opening <strong>Hidden validation</strong>.
                            Save should be blocked immediately because the hidden field config is registered from <strong>Form.Root</strong>.
                        </Text>
                    </Stack>
                </MessageBar>

                {validationSummary.length > 0 && (
                    <MessageBar messageBarType={MessageBarType.warning} isMultiline>
                        <Stack tokens={{ childrenGap: 4 }}>
                            <Text variant="smallPlus">Current validation summary</Text>
                            {validationSummary.map((validation, index) => (
                                <Text key={`${validation.fieldName ?? 'form'}-${index}`} variant="small">
                                    {validation.fieldName ?? 'form'}: {validation.errorMessage ?? 'Validation error'}
                                </Text>
                            ))}
                        </Stack>
                    </MessageBar>
                )}

                <Form.Notifications />
                <Form.Ribbon />
                <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                    <Form.Tab id="main" label="Main">
                        <Form.Column>
                            <Form.Section label="Visible fields" layout={{ lg: 1 }}>
                                <Form.Field name="text">
                                    <Form.Cell>
                                        <Form.Control />
                                    </Form.Cell>
                                </Form.Field>
                            </Form.Section>
                        </Form.Column>
                    </Form.Tab>
                    <Form.Tab id="hidden-validation" label="Hidden validation">
                        <Form.Column>
                            <Form.Section label="Hidden field config" layout={{ lg: 1 }}>
                                <Form.Field
                                    name="phone"
                                    requiredLevel={RequiredLevelEnum.ApplicationRequired}
                                    validation={hiddenFieldValidation}
                                >
                                    <Form.Cell>
                                        <Form.Control />
                                    </Form.Cell>
                                </Form.Field>
                            </Form.Section>
                        </Form.Column>
                    </Form.Tab>
                </Form.Tabs>
            </Stack>
        </Form.Root>
    )
}

const meta = {
    title: 'Form/Dev/Validation scenarios',
    tags: ['dev-only'],
    parameters: {
        controls: { disable: true },
        docs: {
            disable: true,
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const HiddenTabValidationRegistration: Story = {
    name: 'Hidden-tab validation registration',
    render: () => renderStory(<HiddenTabValidationRegistrationScenario />),
}
