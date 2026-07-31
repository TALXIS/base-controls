# XrmForm

`XrmForm` builds on top of the base `Form` runtime and adds a curated Xrm-like form context plus FormXml-driven layout.

It is for consumers who want:

- the base React Form runtime
- an Xrm-shaped runtime surface (`formContext`, `data`, `ui`, attributes, tabs, controls, save hooks)
- FormXml-driven layout behavior

It does **not** aim to provide full parity with the Microsoft model-driven app client API.

## What `XrmForm` adds

Compared with `Form.Root`, `XrmForm` additionally provides:

- `strategy.onGetFormXml()`
- `onFormReady({ formContext, api })`
- an exposed `IXrmFormContext`
- Xrm-shaped `data`, `ui`, `entity`, `attribute`, `tab`, `section`, and `control` APIs

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
});

strategy.onGetFormXml = () => formXml;

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
  - ribbon refresh
  - viewport information
- `formContext.getAttribute(...)`
- `formContext.getControl(...)`

### Supported subset expectations

The exposed context is intentionally **subset-based**:

- the documented interfaces in `interfaces.ts` are the contract
- some Microsoft Xrm surfaces are present only as reserved `any` placeholders (`process`, `navigation`, `quickForms`, `formSelector`, `footerSection`)
- behavior is implemented only where the runtime currently supports it

If something is not represented in the exported public interfaces, do not assume it is supported.

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

## What this runtime can and cannot do

### Good fit

- form experiences that want an Xrm-like programming surface
- code that needs tabs, controls, attributes, and entity save hooks
- FormXml-driven layout with React hosting

### Not the goal

- full Microsoft platform parity
- undocumented compatibility with every Xrm client API member
- host-specific application bootstrapping
- bypassing the base Form strategy contract for load/save
