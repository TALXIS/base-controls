# @talxis/base-controls

[![npm](https://img.shields.io/npm/v/@talxis/base-controls)](https://www.npmjs.com/package/@talxis/base-controls)

A set of React components made specifically to work with the [Power Apps Component Framework (PCF)](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview). Each supported PCF binding datatype has its own React component, so you can render fully functional Power Apps controls—like Lookups, DateTimes, and Decimals—as standard React components in both Portal and Power Apps.

## Why Base Controls?

Before this package, embedding a nested `Lookup` or other native control inside your PCF required the Nested PCF API, which didn't support binding updates and was cumbersome to work with. With Base Controls you simply render a React component and update its props to trigger a rerender:

```jsx
<Lookup
    context={context}
    parameters={{
        value: {
            raw: [{ entityType: 'account', id: '000', name: 'Account 1' }],
            attributes: { Targets: ['account'] },
            getAllViews: async (entityName) => {
                return [{ viewId: '000', viewName: 'View 1', isDefault: true }];
            }
        }
    }}
/>
```

More sophisticated controls like `Lookup` or `DateTime` also expose custom hooks, so you can use the business logic while building your own presentation layer.

Base Controls handle the many small details that are easy to overlook—number formatting from User Settings, decimal/group separators, precision, error states, translations, and more—so every control behaves consistently without extra effort.

## Available Controls

| Control | Description |
|---|---|
| `Decimal` | Decimal, currency and whole number fields |
| `DateTime` | Date and time picker |
| `Lookup` | Entity lookup field |
| `OptionSet` | Single-select option set |
| `MultiSelectOptionSet` | Multi-select option set |
| `TwoOptions` | Boolean / two-option toggle |
| `TextField` | Single-line and multi-line text |
| `Duration` | Duration field |
| `Grid` | Data grid |
| `DatasetControl` | Dataset-based control |

## Quick Start

Install the package:

```bash
npm install @talxis/base-controls
```

Then import and use a control:

```tsx
import { Decimal } from '@talxis/base-controls';

const [value, setValue] = React.useState<number | null>(3000);

return (
    <Decimal
        context={context}
        onNotifyOutputChanged={(outputs) => setValue(outputs.value ?? null)}
        parameters={{
            value: { raw: value, type: 'Decimal' }
        }}
    />
);
```

See the [Usage Guide](./docs/usage.md) for detailed examples covering precision, error handling, translations, component prop overrides, and context method overrides.

## Documentation

- [**Usage Guide**](./docs/usage.md) — How to use Base Controls in your PCF, including extensibility and advanced examples
- [**Developing**](./docs/developing.md) — Running a local build in PCF or Portal, and troubleshooting
- [**Releasing**](./docs/releasing.md) — How to create a new release and publish to NPM

## License

See [LICENSE.md](./LICENSE.md) for details.