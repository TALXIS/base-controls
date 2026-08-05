import React from "react"
import { Form } from "@talxis/base-controls/components/Form"
import { getMemoryStrategy } from "../../form/shared/formModel"

export const ReactComposeOverviewFormPreview = () => {
    const strategy = React.useMemo(() => getMemoryStrategy(), [])
    const [activeTab, setActiveTab] = React.useState("general")

    return (
        <Form.Root strategy={strategy}>
            <Form.Notifications />
            <Form.Ribbon />
            <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                <Form.Tab id="general" label="General">
                    <Form.Column>
                        <Form.Section label="Primary details" layout={{ lg: 2 }}>
                            <Form.Field name="text"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="url"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="multilinetext"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Status" layout={{ lg: 1 }}>
                            <Form.Field name="optionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="twooptionscolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="choices" label="Choices">
                    <Form.Column>
                        <Form.Section label="Primary selections" layout={{ lg: 2 }}>
                            <Form.Field name="optionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="twooptions"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Multi-select fields" layout={{ lg: 1 }}>
                            <Form.Field name="multiselectoptionset"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="multiselectoptionsetcolorful"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="metrics" label="Metrics">
                    <Form.Column>
                        <Form.Section label="Numeric review" layout={{ lg: 2 }}>
                            <Form.Field name="currency"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="decimal"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="duration"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="number"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="schedule" label="Schedule">
                    <Form.Column>
                        <Form.Section label="Timing" layout={{ lg: 2 }}>
                            <Form.Field name="dateonly"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="datetime"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="References" layout={{ lg: 1 }} cellLabelPosition="Top" />
                    </Form.Column>
                </Form.Tab>
            </Form.Tabs>
        </Form.Root>
    )
}
