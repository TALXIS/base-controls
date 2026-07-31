# XrmForm

`XrmForm` builds on top of the base `Form` runtime, exposes a Microsoft form-context-compatible `formContext`, and is meant to be manipulated in the same fashion as an MDA form while using FormXml-driven layout.

## What `XrmForm` adds

The layout is driven from FormXml, while persistence still comes from the base Form strategy contract.

## Host note

`XrmForm` also relies on the shared PCF-context abstraction.

- In **non-PCF hosts**, wrap usage in `PcfContextProvider`.
- In **PCF hosts**, pass the host `context` into `PcfContextProvider`.

```tsx
import { PcfContextProvider } from "@talxis/base-controls";

<PcfContextProvider context={context}>
  <XrmForm strategy={strategy} />
</PcfContextProvider>
```

## Basic usage

```tsx
import { XrmForm, XrmMemoryStrategy } from "@talxis/base-controls/components/Form";

const strategy = new XrmMemoryStrategy({
  onGetData: () => record,
  onGetColumns: () => columns,
  onGetMetadata: () => ({
    PrimaryIdAttribute: "accountid",
    PrimaryNameAttribute: "name",
  }),
  onGetFormXml: () => formXml,
});

export const AccountXrmForm = () => {
  return (
    <XrmForm
      strategy={strategy}
      onFormReady={({ formContext, api }) => {
        console.log(formContext.data.entity.getId());
        console.log(api.getData());
      }}
    />
  );
};
```

## Record contract: columns, metadata, and data

The strategy behind the form is still driven by:

- `columns`
- `metadata`
- `data`

### `columns`

`columns` is the field-definition array for the record. Each item describes one available field, its logical name, display name, and data type.

This should follow the same `IColumn[]` field shape used across the Base Controls ecosystem.

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
    name: "ownerid",
    alias: "ownerid",
    displayName: "Owner",
    dataType: "Lookup.Owner",
    metadata: {
      IsValidForUpdate: true,
      Targets: ["systemuser", "team"],
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

`PrimaryIdAttribute` identifies the record id field and `PrimaryNameAttribute` identifies the primary text field.

### `data`

`data` is the current record payload. Its structure should match the Dataverse record shape you normally get from a retrieve operation.

That means:

- direct field values are stored under their logical names
- lookup values use the usual Dataverse lookup conventions, for example:
  - `_primarycontactid_value`
  - `_primarycontactid_value@OData.Community.Display.V1.FormattedValue`
  - `_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname`
- formatted values and option-set values can stay in their Dataverse-style structure

So even though the layout is FormXml-driven, the underlying record payload should still be treated as a Dataverse-shaped record object.

Example:

```ts
const data = {
  accountid: "11111111-1111-1111-1111-111111111111",
  name: "Contoso Ltd.",
  "_ownerid_value": "33333333-3333-3333-3333-333333333333",
  "_ownerid_value@OData.Community.Display.V1.FormattedValue": "Local Demo User",
  "_ownerid_value@Microsoft.Dynamics.CRM.lookuplogicalname": "systemuser",
};
```

## Loading lifecycle note

This runtime differs slightly from the usual Xrm mental model around form-load timing.

When `onFormReady({ formContext, api })` fires in form, the form is already fully loaded together with its data. That means the exposed `formContext` is ready for data access, attribute access, UI work, and event subscription immediately.

In practice, this makes `onFormReady` the main point where you can start working with the form context runtime surface.

## Public form context surface

The main public handle is `IXrmFormContext`.

```tsx
onFormReady={({ formContext }) => {
  formContext.ui.setFormNotification("Loaded", "INFO", "loaded");

  const phone = formContext.getAttribute("telephone1");
  phone?.addOnChange(() => {
    console.log("phone changed", phone.getValue());
  });

  formContext.data.entity.addOnSave((executionContext) => {
    const eventArgs = executionContext.getEventArgs();
    if (!formContext.data.isValid()) {
      eventArgs.preventDefault();
    }
  });
}}
```

`formContext` exposes the expected top-level entry points such as `data`, `ui`, `getAttribute(...)`, and `getControl(...)`.

The documented interfaces in `interfaces.ts` are the public contract. The context also exposes reserved surfaces such as `process`, `navigation`, `quickForms`, `formSelector`, and `footerSection` where those runtime shapes are part of the current API.

Execution-context support is currently very limited. In most handlers it is effectively an empty object. The main meaningful execution-context behavior today is in entity save handlers, where you can call `executionContext.getEventArgs().preventDefault()` to stop the save.

## Relationship to Microsoft documentation

The exported API is meant to work in the same way as the Microsoft model-driven app form context for the documented surface, especially around the form context model:

- [formContext reference](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/clientapi-form-context)
- [formContext.data](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data)
- [formContext.ui](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-ui)
- [attribute methods](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/attributes)
- [control methods](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/controls)

Use those Microsoft docs as conceptual background, but treat this package’s exported interfaces as the authoritative list of what is actually available here.

## Public React events

`XrmForm` forwards the same public React events as the base `Form` runtime:

- `onBeforeSave`
- `onAfterSave`
- `onFieldValueChanged`
- `onValidationSummaryChanged`
- `onDirtyStateChanged`
- `onError`

That means you can combine:

- React event-driven orchestration from the base Form runtime
- Xrm-style runtime interactions from `formContext`
