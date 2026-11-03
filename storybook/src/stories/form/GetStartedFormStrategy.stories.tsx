import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ExampleRunner, renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { ReactComposeLivePreview } from './ReactComposeLivePreview'

const strategyCode = `const strategy: IFormStrategy = {
  //called once when the form mounts
  onLoad: async () => ({
    //every field the form can bind to, as IColumn
    columns: [
      { name: "name", alias: "name", displayName: "Name", dataType: "SingleLine.Text" },
      { name: "telephone1", alias: "telephone1", displayName: "Phone", dataType: "SingleLine.Phone" },
    ],
    //Dataverse-shaped record: scalars by logical name, lookups as lookup payloads
    data: {
      accountid: "11111111-1111-1111-1111-111111111111",
      name: "Contoso Ltd.",
      telephone1: "+420 123 456 789",
    },
    metadata: { PrimaryIdAttribute: "accountid", PrimaryNameAttribute: "name" },
  }),
  //receives only the changed fields
  onSave: async ({ updatedData, recordId }) => {
    console.log("Saving", recordId, updatedData);
    return { success: true, fields: Object.keys(updatedData), recordId };
  },
};

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <Form.Root strategy={strategy}>
      <Form.Ribbon />
      <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Account">
              <Form.Field name="name"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
              <Form.Field name="telephone1"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};`

const StrategyExample = () => {
    const [code, setCode] = React.useState(strategyCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)

    return (
        <ExampleRunner
            error={compileError}
            renderPreview={() => <ReactComposeLivePreview code={code} onError={setCompileError} />}
            renderCode={() => <FormCodeEditor value={code} onChange={setCode} />}
        />
    )
}

const meta = {
    title: 'Controls/Form/Get started/Form strategy',
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
Both authoring paths take an \`IFormStrategy\`: it loads the record with \`onLoad()\` and persists changes with \`onSave()\`. The same strategy output drives either path:

- **React compose** passes it to \`Form.Root\` and lays fields out in JSX — see [**React compose Overview**](?path=/story/controls-form-react-compose--overview).
- **Xrm** passes it to \`XrmForm\`, lays fields out in FormXml and adds \`formContext\` — see [**Xrm Overview**](?path=/story/controls-form-xrm-overview--overview).

The example below loads one account by hand. Try: switch \`telephone1\` to \`SingleLine.Email\`, or edit a field, save, and check the console.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const WriteAStrategy: Story = {
    name: 'Write a strategy',
    render: () => renderStory(<StrategyExample />),
}
