import type { Meta, StoryObj } from '@storybook/react'

const meta = {
    title: 'Form/Shared contract',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
Both authoring paths, **React compose** and **Xrm**, depend on the same underlying record contract.

No matter whether the layout is authored in JSX or driven from FormXml, the runtime expects the same core inputs from the strategy:

- \`columns\`
- \`metadata\`
- \`data\`

## What is shared

The layout model differs between the two paths:

- **React compose** defines the layout directly in JSX
- **Xrm** defines the layout through FormXml

But both still bind to the same record definition and record payload underneath.

## \`columns\`

\`columns\` is the field-definition array for the record. Each item describes one field the form can bind to, including its logical name, display name, and data type.

In practice, this should follow the same \`IColumn[]\` shape used across the Base Controls ecosystem.

\`\`\`ts
const columns = [
  {
    name: "name",
    alias: "name",
    displayName: "Name",
    dataType: "SingleLine.Text",
    metadata: { IsValidForUpdate: true },
  },
  {
    name: "primarycontactid",
    alias: "primarycontactid",
    displayName: "Primary Contact",
    dataType: "Lookup.Simple",
    metadata: {
      IsValidForUpdate: true,
      Targets: ["contact"],
    },
  },
];
\`\`\`

For Xrm-style forms, the same idea applies. The only difference is that the field definitions are consumed together with FormXml instead of JSX-authored layout.

## \`metadata\`

\`metadata\` is the minimal record-level metadata object:

\`\`\`ts
{
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
}
\`\`\`

\`PrimaryIdAttribute\` identifies the record id field and \`PrimaryNameAttribute\` identifies the primary text field.

This shape is shared between React compose and Xrm.

## \`data\`

\`data\` is the current record payload. Its structure should match a Dataverse-style record object.

That means:

- direct scalar fields are stored under their logical names
- lookup values use the Dataverse lookup shape
- formatted values and option-set values can stay in their Dataverse-style form

\`\`\`ts
const data = {
  accountid: "11111111-1111-1111-1111-111111111111",
  name: "Contoso Ltd.",
  telephone1: "+420 123 456 789",
  "_primarycontactid_value": "22222222-2222-2222-2222-222222222222",
  "_primarycontactid_value@OData.Community.Display.V1.FormattedValue": "Adele Vance",
  "_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname": "contact",
};
\`\`\`

For Xrm specifically, this remains true even though the layout is FormXml-driven. The runtime still expects the same Dataverse-shaped payload.

## What differs between the two paths

### React compose

React compose uses:

- shared \`columns\`
- shared \`metadata\`
- shared \`data\`
- JSX-authored layout through \`Form.Root\`, \`Form.Tabs\`, \`Form.Section\`, \`Form.Field\`, and related components

### Xrm

Xrm uses:

- shared \`columns\`
- shared \`metadata\`
- shared \`data\`
- FormXml-authored layout through \`XrmForm\`
- Microsoft form-context-compatible runtime APIs on top of the same base form runtime

## In practice

If the form does not bind correctly, the first thing to verify is usually not the layout layer but the shared record contract:

1. are the fields present in \`columns\`
2. does \`metadata\` point to the correct primary id and primary name fields
3. does \`data\` use the expected Dataverse-style shape, especially for lookups

Once those three inputs are correct, the same record model can drive either authoring path.

Go to [**Get started**](?path=/docs/form-get-started--docs), [**React compose Playground**](?path=/docs/form-react-compose-playground--docs), or [**Xrm Playground**](?path=/docs/form-xrm-playground--docs).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {}
