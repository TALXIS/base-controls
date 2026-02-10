# Usage

Rendering a Base Control in your PCF is as simple as using any other component. After you install the [@talxis/base-controls](https://www.npmjs.com/package/@talxis/base-controls?activeTab=versions) package, you can import a Base Control and use it as standard React component:

<details>
<summary>Code Example</summary>


```typescript

const [value, setValue] = React.useState<number | null>(3000);

return <Decimal 
    context={context}
    onNotifyOutputChanged={(outputs) => setValue(outputs.value ?? null)}
    parameters={{
        value: {
            raw: value,
            type: 'Decimal'
        }
    }} />

```
</details>
<br />

This piece of code will render a Decimal component showcasing the number you have inputted. Notice that you always need to pass it a PCF `context` and a parameters object with binding parameter. 


<!-- TODO: add screenshot of Decimal component rendering "3,000.00" with default precision -->

## So? What's the big deal, can't I just use a classic TextField?

Power of Base Controls relies in their full implementation of various repeating business logic. Since Base Control has access to PCF `context`, it can leverage it's methods in various ways. Let's say we would want to change the precision of the value displayed to `1`, we can simply do that by changing the Precision prop to `1`:

<details>
<summary>Code Example</summary>

```typescript
 return <Decimal 
    context={context}
    onNotifyOutputChanged={(outputs) => setValue(outputs.value ?? null)}
    parameters={{
        value: {
            raw: value,
            type: 'Decimal',
            attributes: {
                Precision: 1
            }
        }
    }} />

```
</details>

<!-- TODO: add screenshot of Decimal component displaying "3,000.0" with precision set to 1 -->

This might not seem like much, but let's think about it. Why was the precision set to `2` in the first place? Well it was se to that because if no precision is provided, a User Settings precision is used. How does it know which characters to use as number and decimal separator? Again, it comes from User Settings. 

Apart from number formatting (which can be access directly through `formatting` of PCF Context), the Base Control also takes care of parsing these strings for you, so you receive back a nice non-formatted number. If you think about it, there are **countless** of little things like this across various field types that we often don't think about during implementation. However, not implementing these things leads to **incoherent user experience**, which is a thing we can avoid by **leveraging Base Controls** wherever we can.

## PCF Plug-and-play

You might have noticed that the prop structure of a Base Control is very similar to the prop structure you receive from PCF Context. This is by design, as Base Controls are meant to seamlessly plug into the PCF pipeline. You can see this in Portal, where we use Base Controls for every native PCF:

<details>
<summary>Code Example</summary>

```typescript
 export class Decimal implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _container: HTMLDivElement;
    private _outputs: IOutputs = {};

    constructor() { }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
    }
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        ReactDOM.render(React.createElement(DecimalComponent, {
            context: context,
            parameters: {
                value: context.parameters.value,
                EnableDeleteButton: {
                    raw: context.parameters.enableDeleteButton?.raw === 'true'
                },
                EnableCopyButton: {
                    raw: context.parameters.enableCopyButton?.raw === 'true'
                },
                ForceDisable: {
                    raw: context.parameters.ForceDisable?.raw === 'true'
                },
                EnableSpinButton: {
                    raw: context.parameters.EnableSpinButton?.raw === 'true'
                }

            },
            onNotifyOutputChanged: (outputs) => {
                this._outputs = outputs;
                this._notifyOutputChanged();
            }
        } as IDecimal), this._container);
    }

    public getOutputs(): IOutputs {
        return this._outputs;
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
    }
}

```
</details>

<br />
The code above is all that is required for Portal to have a fully working PCF for not only Decimal fields, but Number and Currency as well.

## Error handling

You can set the Base Control error message by passing the `errorMessage` prop with binding parameter. By default, the error is presented only by red outline around the control, if you would like it to display the error as well, you need to set the `ShowErrorMessage` parameter to true.

<details>
<summary>Code Example</summary>

```typescript
return <Decimal
    context={context}
    onNotifyOutputChanged={(outputs) => {setValue(outputs.value ?? null)}}
    parameters={{
        value: {
            raw: value,
            type: 'Decimal',
            errorMessage: 'Error Message'
        },
        ShowErrorMessage: {
            raw: true
        }
    }} />
```
</details>

<!-- TODO: add screenshot of Decimal component with red error outline and error message text -->
## Extensibility

### Translations
Every Base Control exposes any translatable strings through a `translations` props. This means that you can target any of these and replace it with your own string if the situation desires. Base Controls always include both Czech and English translations by default.

### Overriding component props

In more advanced scenarios, you can access the underlying component props directly through the `onOverrideComponentProps` method:

<details>
<summary>Code Example</summary>

```typescript
onOverrideComponentProps={(props) => {
    return {
        ...props,
        label: 'Custom Label',
        onClick: (e) => {
            props.onClick?.(e);
            alert('My Custom onClick logic');
        }
    }
}}
```
</details>

<br />

In case of Decimal, the component used is our [`TextField`](https://talxis.github.io/docs-int0015-sharedcomponents/) from Shared Components, so the props parameter corresponds to the `ITextFieldProps` object. If you are using this method, you always need to return your overriden props by **spreading the original props object**! If you are overriding a method, you should call the original method as well:

###Overriding context methods

It is possible to override the behavior of context methods to achieve additional features. For example, let's say that we would like the control to append the string 'Beers' after every number. We can achieve that by overriding the `formatDecimal` method like this:

<details>
<summary>Code Example</summary>

```typescript
context={{
    ...context, 
    formatting: {
        ...context.formatting,
        formatDecimal: (value, precision) => {
            return `${context.formatting.formatDecimal(value, precision)} Beers`;
        }
    }
}}

```
</details>
<br />

Example above replaces the `formatDecimal` method with it's own that simple calls the original method and always appends the word 'Beers' on the end giving us the following result:
<!-- TODO: add screenshot of Decimal component displaying "3,000.00 Beers" -->

You can see that we are never assigning anything to the original context method, we are simply spreading it and overriding things in the new object. You **should never** assign anything to PCF context and nothing like `context.whateverProp = newProp` should be part of a PR. If so, you will be punished.

### Example

Let's take what we now know and make a bit more advanced example. Let's stay we stick with the Beers, but we would like to have a Beer counter. This counter will contain a spin button which will allow the user to either increase or decrease the amount of beers by one. We will also have an additional Button with Beer icon that will allow us to bind some custom function to it. Because our user can be drunk, we should not allow him to input any text and keep the `TextField` component read only, so only the spin button will affect the value.

<details>
<summary>Code Example</summary>

```typescript
 return <Decimal
    context={{
        ...context, 
        formatting: {
            ...context.formatting,
            formatInteger: (value) => {
                return `${context.formatting.formatInteger(value)} Beers`;
            }
        }
    }}
    onNotifyOutputChanged={(outputs) => {setValue(outputs.value ?? null)}}
    onOverrideComponentProps={(props) => {
        return {
            ...props,
            label: 'Beer Spinner',
            readOnly: true,
            suffixItems: [{
                key: 'beer',
                onClick: () => {
                    console.log('Beer Action!')
                },
                iconProps: {
                    iconName: 'BeerMug'
                }
            }, ...props.suffixItems ?? []]
        }
    }}
    parameters={{
        value: {
            raw: value,
            type: 'Whole.None'
        },
        EnableSpinButton: {
            raw: true,
        }
    }} />
```

</details>
<br />

To explain the above code example: We have switched the Base Control to `Whole.None`, because Beer is usually counted by whole pieces. Because of that, we had the override the `formatInteger` method instead of the `formatDecimal` method. After that, we have overriden the component props by adding a custom button with action and setting the component `readOnly`. Notice how we are still using the original `suffixItems` from props. If we wouldn't do that, the control would lost all of its native buttons, including the spin button. Last, we have enabled the spin button using the `EnableSpinButton` parameter. 

<!-- TODO: add animated GIF of Beer Spinner with spin button and beer icon action -->

Because we are using a Base Control, we can also turn on other common features if needed through parameters. For example, a copy button:

<!-- TODO: add animated GIF of Beer Spinner with copy button enabled -->

## Source code is your friend

We have provided typings and description for every Base Control to help you understand what you need to do to make them work and do what you want. If you are lost or something weird is happening, look into their [source code](https://github.com/TALXIS/base-controls) to see what might be wrong. Base Controls are relatively new addition, so some bugs/weird behavior is to be expected. If any of these occur, please reach out to @<Dominik Brych> and we will sort it out.