import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ExampleRunner, renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { ReactComposeLivePreview } from './ReactComposeLivePreview'
import { gridDocsPage } from '../../grid/gridDocsPage'

const loadRecordCode = `const record = createMemoryRecord({
  //every field the form can bind to, as IColumn
  columns: [
    { name: "name", alias: "name", displayName: "Name", dataType: "SingleLine.Text" },
    { name: "telephone1", alias: "telephone1", displayName: "Phone", dataType: "SingleLine.Phone" },
  ],
  //Dataverse-shaped values by logical name
  data: {
    accountid: "11111111-1111-1111-1111-111111111111",
    name: "Contoso Ltd.",
    telephone1: "+420 123 456 789",
  },
  metadata: { PrimaryIdAttribute: "accountid", PrimaryNameAttribute: "name" },
  //runs on every save; the change is committed in memory once it succeeds
  onSave: async (record) => {
    const fields = record.getColumns().map((column) => column.name).filter((name) => record.isDirty(name));
    console.log("Saving", record.getRecordId(), record.toRawData());
    return { success: true, fields, recordId: record.getRecordId() };
  },
});

const FormExample = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    //called on mount and on refresh
    <Form.Root onLoad={async () => ({ record })}>
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

const switchRecordsCode = `const columns = [
  { name: "name", alias: "name", displayName: "Name", dataType: "SingleLine.Text" },
  { name: "telephone1", alias: "telephone1", displayName: "Phone", dataType: "SingleLine.Phone" },
];
const metadata = { PrimaryIdAttribute: "accountid", PrimaryNameAttribute: "name" };

//stand-ins for the records a grid already holds
const accounts = [
  { accountid: "11111111-1111-1111-1111-111111111111", name: "Contoso Ltd.", telephone1: "+420 123 456 789" },
  { accountid: "22222222-2222-2222-2222-222222222222", name: "Fabrikam Inc.", telephone1: "+420 987 654 321" },
].map((data) => createMemoryRecord({ columns, data, metadata }));

const FormExample = () => {
  const [index, setIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("general");
  const record = accounts[index];

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <ComboBox
        label="Account"
        selectedKey={index}
        options={accounts.map((account, key) => ({ key, text: account.getValue("name") }))}
        onChange={(_, option) => setIndex(option.key)}
      />
      {/* a new key remounts the form, which loads the other record */}
      <Form.Root key={record.getRecordId()} onLoad={async () => ({ record })}>
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
    </Stack>
  );
};`

const LiveExample = (props: { seedCode: string }) => {
    const [code, setCode] = React.useState(props.seedCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)

    return (
        <ExampleRunner
            code={code}
            seedCode={props.seedCode}
            onCodeChange={setCode}
            error={compileError}
            renderPreview={() => <ReactComposeLivePreview code={code} onError={setCompileError} />}
            renderCode={() => <FormCodeEditor value={code} onChange={setCode} />}
        />
    )
}

const DESCRIPTION = `
A form edits one record: an \`IRecord\`, the same object a grid row or any data provider holds. \`Form.Root\` and \`XrmForm\` ask for it through \`onLoad\`, which resolves \`{ record }\`. The form binds its fields to the record's columns, edits it in place, and saves by calling \`record.save()\`.

{{story: Load a record}}

## Load from memory

\`createMemoryRecord\` makes a record from \`columns\`, \`data\` and \`metadata\` when there is no data provider behind the form, as in the example above.

## Save somewhere

\`onSave\` gets the record on every save and returns \`{ recordId, success, fields, errors? }\`. When it succeeds the change is committed in memory; when it fails nothing is. Without \`onSave\` a save only commits in memory.

## Pass a record you already have

A record from a grid or any other data provider goes to \`onLoad\` as is, and saving runs through that provider. \`onLoad\` runs on mount and on refresh; to show another record, remount the form with a new \`key\`.

{{story: Switch records}}
`

const meta = {
    title: 'Controls/Form/Get started/Loading a record',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const LoadARecord: Story = {
    name: 'Load a record',
    render: () => renderStory(<LiveExample seedCode={loadRecordCode} />),
    parameters: {
        docs: {
            description: {
                story: 'One account held in memory. Try: change the phone, save, and check the console.',
            },
        },
    },
}

export const SwitchRecords: Story = {
    name: 'Switch records',
    render: () => renderStory(<LiveExample seedCode={switchRecordsCode} />),
    parameters: {
        docs: {
            description: {
                story: 'Two records picked from a list, the way a grid hands its rows to a form. Try: edit Contoso, save, then switch away and back.',
            },
        },
    },
}
