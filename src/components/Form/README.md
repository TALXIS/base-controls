# Form

`Form` is the React-composed form runtime for building record-driven forms from layout components and a load/save strategy.

It gives you:

- a declarative component model: `Form.Root`, `Form.Tabs`, `Form.Tab`, `Form.Section`, `Form.Field`, `Form.Control`, ...
- built-in record binding through `Form.Field`
- built-in save flow, notifications, validation summary, and dirty tracking
- public events and an imperative `IFormApi` for external React orchestration

It does **not** give you:

- host-specific integration rules
- full Xrm form-context compatibility
- a ready-made persistence layer by itself; saving/loading comes from your strategy

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

These UI pieces do **not** provide field binding, save behavior, validation orchestration, or form events by themselves.

## What this runtime can and cannot do

### Good fit

- record-driven React forms
- strategy-based load/save pipelines
- custom field validation layered on top of the built-in runtime
- reacting to dirty state, validation summary, and save lifecycle in React

### Not the goal

- full Microsoft Xrm compatibility
- host/bootstrap documentation
- non-record-oriented freeform state management
- replacing your data source contract; the strategy still defines load/save behavior
