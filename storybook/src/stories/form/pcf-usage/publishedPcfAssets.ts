export interface IPublishedPcfInputs {
    [name: string]: ComponentFramework.PropertyTypes.StringProperty
}
export interface IPublishedPcfOutputs { [name: string]: string | undefined }
export interface PublishedPcfControl extends ComponentFramework.StandardControl<IPublishedPcfInputs, IPublishedPcfOutputs> {
    getOutputs(): IPublishedPcfOutputs
}
export type PublishedPcfConstructor = new () => PublishedPcfControl
export interface IPublishedPcfAssets {
    constructor: PublishedPcfConstructor
    manifest: string
    /** Base URL the manifest resource paths are relative to. */
    base: string
    /** Paths of all resources declared in the manifest. */
    resources: string[]
    /** Strings from the manifest resx files, keyed by LCID. */
    translations: Record<number, Record<string, string>>
}

interface IRegistrationHost {
    registerControl?: (name: string, constructor: PublishedPcfConstructor) => void
}
interface IBundleWindow extends Window {
    ComponentFramework?: IRegistrationHost
    TALXIS?: { PCF?: Partial<Record<PublishedControlName, PublishedPcfConstructor>> }
}

export type PublishedControlName = 'TagPicker'
const pending: Partial<Record<PublishedControlName, Promise<IPublishedPcfAssets>>> = {}
let loading: Promise<void> = Promise.resolve()

async function loadManifestResources(name: PublishedControlName, base: string, manifest: string) {
    const resources = new DOMParser().parseFromString(manifest, 'text/xml').querySelector('control > resources')
    const unsupported = resources?.querySelector('platform-library, library')
    if (unsupported) {
        throw new Error(`${name} requires ${unsupported.tagName} "${unsupported.getAttribute('name')}", which the Storybook host does not provide.`)
    }
    const getPaths = (selector: string) => [...resources?.querySelectorAll(selector) ?? []]
        .map(element => element.getAttribute('path')).filter((path): path is string => !!path)
    await Promise.all(getPaths('css').map(path => new Promise<void>((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `${base}${path}`
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Could not load ${name} stylesheet ${path}.`))
        document.head.appendChild(link)
    })))
    const translations: Record<number, Record<string, string>> = {}
    await Promise.all(getPaths('resx').map(async path => {
        const response = await fetch(`${base}${path}`)
        if (!response.ok) throw new Error(`${name} ${path}: HTTP ${response.status}`)
        const resx = new DOMParser().parseFromString(await response.text(), 'text/xml')
        // Same file naming as Dataverse uses to pick the user's language, e.g. translations.1033.resx
        const lcid = Number(/\.(\d+)\.resx$/.exec(path)?.[1] ?? 0)
        translations[lcid] = Object.fromEntries([...resx.querySelectorAll('root > data')]
            .map(data => [data.getAttribute('name') ?? '', data.querySelector('value')?.textContent ?? '']))
    }))
    return { resources: getPaths('*'), translations }
}

export function loadPublishedPcf(name: PublishedControlName): Promise<IPublishedPcfAssets> {
    const existing = pending[name]
    if (existing) return existing
    const request = loading.then(async () => {
        const base = `${import.meta.env.BASE_URL}pcf/${name.toLowerCase()}/`
        const response = await fetch(`${base}ControlManifest.xml`)
        if (!response.ok) throw new Error(`${name} manifest: HTTP ${response.status}`)
        const manifest = await response.text()
        const { resources, translations } = await loadManifestResources(name, base, manifest)
        const constructor = await new Promise<PublishedPcfConstructor>((resolve, reject) => {
            const host = window as IBundleWindow
            const framework = Object.getOwnPropertyDescriptor(host, 'ComponentFramework')
            const namespace = Object.getOwnPropertyDescriptor(host, 'TALXIS')
            const previous = host.ComponentFramework
            let registered: PublishedPcfConstructor | undefined
            const script = document.createElement('script')
            const restore = () => {
                for (const [name, descriptor] of [['ComponentFramework', framework], ['TALXIS', namespace]] as const) {
                    if (descriptor) Object.defineProperty(host, name, descriptor)
                    else Reflect.deleteProperty(host, name)
                }
                script.remove()
            }
            host.ComponentFramework = {
                ...previous,
                registerControl: (registeredName, constructor) => {
                    if (registeredName === `TALXIS.PCF.${name}`) registered = constructor
                    else previous?.registerControl?.(registeredName, constructor)
                },
            }
            host.TALXIS = { ...host.TALXIS, PCF: { ...host.TALXIS?.PCF } }
            script.src = `${base}bundle.js`
            script.onload = () => {
                const constructor = registered ?? host.TALXIS?.PCF?.[name]
                restore()
                if (constructor) resolve(constructor)
                else reject(new Error(`Published ${name} did not register its constructor.`))
            }
            script.onerror = () => {
                restore()
                reject(new Error(`Could not load published ${name} bundle. Run npm run prepare:pcf in storybook.`))
            }
            document.head.appendChild(script)
        })
        return { constructor, manifest, base, resources, translations }
    }).catch(error => {
        delete pending[name]
        throw error
    })
    loading = request.then(() => undefined, () => undefined)
    pending[name] = request
    return request
}