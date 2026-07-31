# XrmForm

`XrmForm` builds on top of the base `Form` runtime and adds a curated Xrm-like form context plus FormXml-driven layout.

It provides:

- the base React Form runtime
- an Xrm-shaped runtime surface (`formContext`, `data`, `ui`, attributes, tabs, controls, save hooks)
- FormXml-driven layout behavior
- a public `IXrmFormContext`
- `onFormReady({ formContext, api })`
- `strategy.onGetFormXml()`

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

## Loading lifecycle note

This runtime differs slightly from the usual Xrm mental model around form-load timing.

When `onFormReady({ formContext, api })` fires in form, the form is already fully loaded together with its data. That means the exposed `formContext` is ready for data access, attribute access, UI work, and event subscription immediately.

In practice, this makes `onFormReady` the main point where you can start working with the Xrm-like runtime surface.

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

### Available top-level members

- `formContext.data`
  - entity save hooks
  - attribute collection
  - dirty/valid checks
  - refresh/save forwarding
- `formContext.ui`
  - tabs and controls
  - form notifications
- `formContext.getAttribute(...)`
- `formContext.getControl(...)`

The documented interfaces in `interfaces.ts` are the public contract. The context also exposes reserved surfaces such as `process`, `navigation`, `quickForms`, `formSelector`, and `footerSection` where those runtime shapes are part of the current API.

## Relationship to Microsoft documentation

The API shape is inspired by the Microsoft model-driven app Client API, especially the form context model:

- [formContext reference](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext)
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
