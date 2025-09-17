Base Controls is a set of React components that are made specifically to work with PCF. Each supported PCF binding datatype has its own React component. For example, before, if you wanted to include a nested `Lookup` control in your PCF, you would have to use the [Nested PCF API](https://dev.azure.com/thenetworg/INT0015/_wiki/wikis/INT0015.wiki/4325/Nested-controls-(PCF-from-PCF)). This came with its own set of problems since the API does not support binding updates. Working with native Power Apps controls in this way could also be quite cumbersome. With the base controls package, you can now just do this:
```JSX 
<Lookup 
    context={context}
    parameters={{
        value: {
        raw: [
            {
            entityType: 'account',
            id: '000',
            name: 'Account 1'
            }
        ],
        attributes: {
            Targets: ['account']
        },
        getAllViews: async (entityName: string) => {
            return [{
            viewId: '000',
            viewName: 'View 1',
            isDefault: true,
            }]
        }
        }
    }} />
```

This will render the same Lookup PCF in both Portal and Power Apps and since it's a React component, you can update the value prop to trigger rerender, unlike in the Nested PCF API where you need to remount the entire component.


More sophisticated controls like `Lookup` or `DateTime` have their business logic encapsulated in a custom hook. If needed, you can use these hooks in your PCF and create the presentation layer yourself. We will also be slowly moving all of native Portal controls to the ones from the base controls package. You can find the base controls package [here](https://www.npmjs.com/package/@talxis/base-controls).