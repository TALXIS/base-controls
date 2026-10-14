import React from 'react'
import { XrmForm, XrmMemoryStrategy } from '@talxis/base-controls/components/Form'
import { PcfContextProvider, usePcfContext } from '@talxis/base-controls/utils'
import { formMetadata, getFormColumns } from '../../../form/shared/formModel'
import { loadPublishedPcf, IPublishedPcfAssets, IPublishedPcfInputs, PublishedControlName } from './publishedPcfAssets'
import { createPublishedPcfResources, createStoryPcfFactory } from './storyPcfFactory'

const FIELD = 'text'
const ID_FIELD = 'id'

type PublishedPcfContext = ComponentFramework.Context<IPublishedPcfInputs>
export type PublishedPcfData = Pick<PublishedPcfContext, 'webAPI'> & Partial<Pick<PublishedPcfContext, 'utils'>>

export interface IPublishedPcfFormProps {
    name: PublishedControlName
    xml: string
    controlName: string
    parameter: string
    initialValue: string
    createData?: (parent: PublishedPcfContext) => PublishedPcfData
}
interface ILoadedPcfFormProps extends IPublishedPcfFormProps { assets: IPublishedPcfAssets }

const LoadedPcfForm = ({ assets, xml, controlName, parameter, initialValue, createData }: ILoadedPcfFormProps) => {
    const parent = usePcfContext()
    const parentRef = React.useRef(parent)
    parentRef.current = parent
    const [error, setError] = React.useState<string>()
    const [strategy] = React.useState(() => {
        const record = { [ID_FIELD]: '20000000-0000-4000-8000-000000000002', [FIELD]: initialValue }
        return new XrmMemoryStrategy({
            onGetData: () => record,
            onGetColumns: () => getFormColumns().filter(column => column.name === FIELD || column.name === ID_FIELD),
            onGetMetadata: () => formMetadata,
            onGetFormXml: () => xml,
        })
    })
    const [host] = React.useState(() => createStoryPcfFactory({
        assets, controlName, parameter,
        getParent: () => parentRef.current,
        onError: error => setError(String(error)),
    }))
    const [context] = React.useState(() => {
        const data = createData?.(parent) ?? { webAPI: parent.webAPI }
        return {
            ...parent,
            ...data,
            // The form context, not the child one, is what NestedControl hands to the control's updateView
            resources: createPublishedPcfResources(assets, parent.userSettings.languageId),
            factory: host.factory,
            webAPI: {
                ...data.webAPI,
                retrieveMultipleRecords: (entity: string, options?: string, pageSize?: number) => entity === 'customcontrol'
                    && options?.includes(`name eq '${controlName}'`)
                    ? Promise.resolve({ entities: [{ name: controlName, manifest: assets.manifest }], nextLink: '' })
                    : data.webAPI.retrieveMultipleRecords(entity, options, pageSize),
            },
        }
    })
    parentRef.current = context
    React.useEffect(() => () => host.dispose(), [host])
    if (error) return <div role="alert">{error}</div>
    return <PcfContextProvider context={context}>
        <div style={{ maxWidth: 640, padding: 24 }}><XrmForm strategy={strategy} /></div>
    </PcfContextProvider>
}

export const PublishedPcfForm = (props: IPublishedPcfFormProps) => {
    const [assets, setAssets] = React.useState<IPublishedPcfAssets>()
    const [error, setError] = React.useState<string>()
    React.useEffect(() => {
        let active = true
        setAssets(undefined)
        setError(undefined)
        loadPublishedPcf(props.name).then(value => { if (active) setAssets(value) })
            .catch(error => { if (active) setError(String(error)) })
        return () => { active = false }
    }, [props.name])
    if (error) return <div role="alert">{error}</div>
    if (!assets) return <div role="status">Loading {props.name}...</div>
    return <LoadedPcfForm key={props.name} {...props} assets={assets} />
}