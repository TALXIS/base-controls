import { IPublishedPcfAssets, IPublishedPcfInputs, PublishedPcfControl } from './publishedPcfAssets'

interface IFactoryProperties {
    controlstates: { isControlDisabled?: boolean }
    parameters: Record<string, { Value: string | null | undefined; Callback(value: string | undefined): void }>
    childeventlisteners: { eventname: string; eventhandler(instance: PublishedPcfControl): void }[]
}
interface IComponent {
    id: string
    properties: IFactoryProperties
    control: PublishedPcfControl
    initialized: boolean
    mount?: HTMLDivElement
    timer?: ReturnType<typeof setTimeout>
}
interface ISampleFactory extends ComponentFramework.Factory {
    createComponent(name: string, id: string, properties: IFactoryProperties): IComponent
    bindDOMElement(component: IComponent, container: HTMLDivElement): void
    unbindDOMComponent(id: string): void
}
interface IFactoryOptions {
    assets: IPublishedPcfAssets
    controlName: string
    parameter: string
    getParent(): ComponentFramework.Context<IPublishedPcfInputs>
    onError(error: unknown): void
}

export function createStoryPcfFactory({ assets, controlName, parameter, getParent, onError }: IFactoryOptions) {
    const components = new Map<string, IComponent>()
    const factory: ISampleFactory = {
        ...getParent().factory,
        createComponent: (name, id, properties) => {
            if (name !== controlName) throw new Error(`Unsupported sample control: ${name}`)
            factory.unbindDOMComponent(id)
            const component: IComponent = {
                id, properties, initialized: false,
                control: new assets.constructor(),
            }
            components.set(id, component)
            return component
        },
        bindDOMElement: (component, container) => {
            if (component.mount || component.timer !== undefined) return
            component.timer = setTimeout(() => {
                component.timer = undefined
                if (components.get(component.id) !== component) return
                try {
                    const { properties, control } = component
                    const current = getParent()
                    let instanceExposed = false
                    const child = {
                        ...current,
                        factory: {
                            ...current.factory,
                            requestRender: () => {
                                if (components.get(component.id) !== component) return
                                try {
                                    control.updateView(child)
                                } catch (error) {
                                    onError(error)
                                    factory.unbindDOMComponent(component.id)
                                }
                            },
                            fireEvent: (eventname: string, instance: PublishedPcfControl) => {
                                if (eventname === 'onInit' && instance === control) instanceExposed = true
                                properties.childeventlisteners.filter(listener => listener.eventname === eventname)
                                    .forEach(listener => listener.eventhandler(instance))
                            },
                        },
                        parameters: Object.fromEntries(Object.entries(properties.parameters)
                            .map(([name, property]) => [name, { raw: property.Value ?? null }])),
                        mode: Object.create(current.mode, {
                            isControlDisabled: { value: properties.controlstates.isControlDisabled ?? false },
                        }),
                    } as unknown as ComponentFramework.Context<IPublishedPcfInputs>
                    component.mount = document.createElement('div')
                    container.appendChild(component.mount)
                    control.init(child, () => properties.parameters[parameter].Callback(control.getOutputs()[parameter]), {}, component.mount)
                    component.initialized = true
                    if (!instanceExposed) throw new Error(`Custom control ${controlName} must emit onInit from init().`)
                } catch (error) {
                    onError(error)
                    factory.unbindDOMComponent(component.id)
                }
            }, 0)
        },
        unbindDOMComponent: id => {
            const component = components.get(id)
            if (!component) return
            clearTimeout(component.timer)
            components.delete(id)
            try {
                if (component.initialized) component.control.destroy()
            } catch (error) {
                onError(error)
            } finally {
                component.mount?.remove()
            }
        },
    }
    return { factory, dispose: () => { for (const id of components.keys()) factory.unbindDOMComponent(id) } }
}