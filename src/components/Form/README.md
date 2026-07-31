# Form

`Form` is the React-composed form runtime for building record-driven forms from layout components and a load/save strategy.

It provides:

- a declarative component model: `Form.Root`, `Form.Tabs`, `Form.Tab`, `Form.Section`, `Form.Field`, `Form.Control`, ...
- built-in record binding through `Form.Field`
- built-in save flow, notifications, validation summary, and dirty tracking
- public events and an imperative `IFormApi` for external React orchestration

## Default usage model

The intended entry point is the composed `Form` object.

```tsx
import { Form } from "@talxis/base-controls/components/Form";
import { MemoryStrategy } from "@talxis/base-controls/components/Form";

const strategy = new MemoryStrategy({
  onGetData: () => ({ id: "1", name: "Contoso", phone: "+420123456789" }),
  onGetColumns: () => columns,
  onGetMetadata: () => ({
    PrimaryIdAttribute: "id",
    PrimaryNameAttribute: "name",
  }),
});

export const AccountForm = () => {
  return (
    <Form.Root strategy={strategy}>
      <Form.Notifications />
      <Form.Ribbon />
      <Form.Tabs>
        <Form.Tab id="general" label="General">
          <Form.Column>
            <Form.Section label="Details" layout={{ lg: 2 }}>
              <Form.Field name="name">
                <Form.Cell>
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
              <Form.Field name="phone">
                <Form.Cell>
                  <Form.Control />
                </Form.Cell>
              </Form.Field>
            </Form.Section>
          </Form.Column>
        </Form.Tab>
      </Form.Tabs>
    </Form.Root>
  );
};
```

## Record contract: columns, metadata, and data

The form runtime is driven by three related inputs from the strategy:

- `columns`
- `metadata`
- `data`

### `columns`

`columns` is the field-definition array for the record. Each item describes one field that the form can bind to, including its logical name, display name, and data type.

In practice, this should follow the same field/column shape you already use elsewhere in the Base Controls ecosystem through `IColumn[]`.

Example:

```ts
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
```

### `metadata`

`metadata` is the minimal record-level metadata object:

```ts
{
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
}
```

`PrimaryIdAttribute` identifies the record id field and `PrimaryNameAttribute` identifies the primary text field for the record.

### `data`

`data` is the actual record payload for the current row. Its structure should match what you typically get back from Dataverse when retrieving a record.

That means:

- regular scalar fields are stored under their logical names
- lookups use the Dataverse lookup payload shape, for example:
  - `_primarycontactid_value`
  - `_primarycontactid_value@OData.Community.Display.V1.FormattedValue`
  - `_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname`
- option sets and formatted values can follow the same Dataverse conventions if you already have them available

So the form runtime should be treated as consuming a Dataverse-like record object, not a custom remapped view model.

Example:

```ts
const data = {
  accountid: "11111111-1111-1111-1111-111111111111",
  name: "Contoso Ltd.",
  telephone1: "+420 123 456 789",
  "_primarycontactid_value": "22222222-2222-2222-2222-222222222222",
  "_primarycontactid_value@OData.Community.Display.V1.FormattedValue": "Adele Vance",
  "_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname": "contact",
};
```

## Layout and responsiveness

The runtime is built around a small layout hierarchy:

- `Form.Tabs` chooses the active tab
- `Form.Tab` defines a responsive grid of columns
- `Form.Column` represents one grid column and can span multiple responsive columns
- `Form.Section` defines a responsive grid of cells within a column
- `Form.Cell` is the per-field visual container

### Tab layout

`Form.Tab` uses width-based breakpoints to decide how many columns are rendered per row.

Available breakpoints:

- `lg`
- `md`
- `sm`
- `xs`

If you provide only `lg`, the remaining breakpoints are derived automatically:

- `md` defaults to at most `3`
- `sm` defaults to at most `2`
- `xs` defaults to `1`

Example:

```tsx
<Form.Tab id="general" label="General" layout={{ lg: 3, md: 2 }}>
  <Form.Column>
    {/* ... */}
  </Form.Column>
  <Form.Column colspan={2}>
    {/* spans two columns when the active breakpoint allows it */}
  </Form.Column>
</Form.Tab>
```

### Section layout

`Form.Section` uses the same breakpoint model for its inner cell grid.

```tsx
<Form.Section label="Details" layout={{ lg: 2, sm: 1 }}>
  <Form.Field name="name">
    <Form.Cell>
      <Form.Control />
    </Form.Cell>
  </Form.Field>
  <Form.Field name="phone">
    <Form.Cell>
      <Form.Control />
    </Form.Cell>
  </Form.Field>
</Form.Section>
```

The number of rendered cells per row is recalculated from the current rendered width, so the same form can collapse naturally as its container gets narrower.

### Tabs are controlled

`Form.Tabs` is a controlled component. You provide the active tab id and handle tab changes yourself.

```tsx
const Example = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
      <Form.Tab id="general" label="General">
        {/* ... */}
      </Form.Tab>
      <Form.Tab id="details" label="Details">
        {/* ... */}
      </Form.Tab>
    </Form.Tabs>
  );
};
```

## Host note

`Form` uses the shared PCF-context abstraction internally.

- In **non-PCF hosts**, wrap usage in `PcfContextProvider`.
- In **PCF hosts**, pass the host `context` into `PcfContextProvider`.

```tsx
import { PcfContextProvider } from "@talxis/base-controls";

<PcfContextProvider context={context}>
  <AccountForm />
</PcfContextProvider>
```

When you are not inside a PCF host, omit `context` and optionally provide fallback user settings through the provider.

## Public runtime API

### `Form.Root`

`Form.Root` owns the runtime:

- loads the record through `strategy.onLoad()`
- binds fields to the record model
- validates before save
- saves through `strategy.onSave()`
- exposes lifecycle callbacks through `IFormProps`

Useful callbacks:

- `onFormReady(api)`
- `onBeforeSave()`
- `onAfterSave({ success })`
- `onFieldValueChanged(fieldName, newValue)`
- `onValidationSummaryChanged(validationSummary)`
- `onDirtyStateChanged(isDirty)`
- `onError(error, message)`

### `Form.Control`

`Form.Control` is the default bound field renderer.

When used inside a `Form.Field`, it currently resolves a matching Base Control from the bound field data type and connects that control to the field value, formatted value, validation state, and disabled state.

In practice, that means `Form.Control` is the runtime bridge between:

- the field data type
- the in-memory form field value
- the matching Base Control implementation used to edit that field

It is intended for the standard “pick the correct control for this field” path, while custom rendering can still be done by composing your own field content instead of using `Form.Control`.

### `Form.Ribbon`

`Form.Ribbon` renders the built-in command bar for save interactions.

It:

- triggers `form.save()` by default
- reflects save lifecycle states such as saving and saved
- shows the built-in unsaved-changes indicator when the form is dirty
- can be overridden with a custom `onSave`

```tsx
<Form.Ribbon />
```

### `Form.Notifications`

`Form.Notifications` renders form-level notifications.

It merges:

- messages passed directly through its `messages` prop
- validation-summary messages produced by the form runtime

That makes it the default place to surface validation problems discovered during save or from custom validation fed through `Form.Field`.

```tsx
<Form.Notifications
  messages={[
    {
      text: "This form is in review mode.",
      level: "INFO",
    },
  ]}
/>
```

### `IFormApi`

The imperative API surfaced by `onFormReady` currently allows you to:

- `refresh()` the runtime
- `getData()` for current in-memory values
- `getField(name)` for a minimal imperative field handle

Example:

```tsx
const Example = () => {
  const formApiRef = React.useRef<IFormApi | null>(null);

  return (
    <Form.Root
      strategy={strategy}
      onFormReady={(api) => {
        formApiRef.current = api;
      }}
      onDirtyStateChanged={(isDirty) => {
        console.log("dirty", isDirty);
      }}
      onAfterSave={({ success }) => {
        console.log("save result", success, formApiRef.current?.getData());
      }}
    >
      {/* layout */}
    </Form.Root>
  );
};
```

## Custom validation

External React code can react to public events and feed validation back through `Form.Field`.

```tsx
const Example = () => {
  const [phoneValidation, setPhoneValidation] = React.useState({
    error: false,
    errorMessage: "",
  });

  return (
    <Form.Root
      strategy={strategy}
      onFieldValueChanged={(fieldName, newValue) => {
        if (fieldName !== "phone") {
          return;
        }

        const phone = String(newValue ?? "").trim();
        setPhoneValidation(
          phone && !phone.startsWith("+420")
            ? { error: true, errorMessage: 'Phone must start with "+420".' }
            : { error: false, errorMessage: "" },
        );
      }}
    >
      <Form.Field name="phone" validation={phoneValidation}>
        <Form.Cell>
          <Form.Control />
        </Form.Cell>
      </Form.Field>
    </Form.Root>
  );
};
```

## UI-only usage

The main workflow is the composed `Form` runtime above.

If you intentionally want the presentational layout pieces without binding to the form model, import them from the UI subtree instead of from the composed `Form` entry point:

```tsx
import { FormUi } from "@talxis/base-controls/components/Form/components/ui";
```

This is useful for:

- matching the layout look-and-feel
- rendering placeholders or skeleton structures
- composing custom screens that should not depend on the form model

The UI layer is presentational. Form binding, save behavior, validation orchestration, and runtime events come from `Form.Root` and the adapter components.
