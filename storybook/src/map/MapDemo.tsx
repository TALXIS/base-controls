import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Callout, DefaultButton, DirectionalHint, getTheme, mergeStyleSets } from '@fluentui/react'
import type { IDataProviderEventListeners, IDataset } from '@talxis/client-libraries'
import { IMap, IMapOutputs, IMapParameters, IMapViewport, Map } from '@talxis/base-controls/components/Map'
import { googleMapsProvider } from '@talxis/base-controls/components/Map/providers/google-maps'
import { useEventEmitter } from '@talxis/base-controls/hooks'
import { usePcfContext } from '@talxis/base-controls/utils'
import { MapApiKeyPanel } from './MapApiKeyPanel'
import { MAP_API_KEY_PROVIDERS, useMapApiKeys } from './mapApiKeys'

const theme = getTheme()

const styles = mergeStyleSets({
    root: {
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        paddingBottom: 8,
        borderBottom: `1px solid ${theme.palette.neutralLighter}`
    },
    readout: {
        fontFamily: 'monospace',
        fontSize: 12,
        margin: 0,
        opacity: 0.8
    }
})

//the one provider a wrapper must name in code: importing it is what pulls in the optional Google Maps peer
const PROVIDERS = [googleMapsProvider]

export interface IMapDemoProps {
    dataset: IDataset
    /** Core parameters this story exercises, on top of the api keys every story gets. */
    parameters?: Partial<IMapParameters>
    /** The modules this story runs the map with. Build them once, outside the render, or in a `useMemo`. */
    modules?: IMap['modules']
    /** Code hooks the story demonstrates, passed straight through to the control. */
    onResolvePin?: IMap['onResolvePin']
    viewportOptions?: IMap['viewportOptions']
    /** Height of the box the control is given, since a map fills whatever it is handed. */
    height?: number
    /** Whether the readout under the map is shown. */
    showReadout?: boolean
    /** Extra readout of the story's own. */
    children?: ReactNode
    /** Told which provider the reader picked, for a story that wants to react to the switch. */
    onProviderChange?: (providerId: string) => void
}

const formatViewport = (viewport: IMapViewport) =>
    `${viewport.center.latitude.toFixed(3)}, ${viewport.center.longitude.toFixed(3)} @ zoom ${viewport.zoom}`

/** How many providers currently have a key, for the label on the button that opens the panel. */
const useConfiguredKeyCount = () => {
    const keys = useMapApiKeys()
    return MAP_API_KEY_PROVIDERS.filter((provider) => !!keys[provider.id]).length
}

/**
 * Hosts the Map control the way a PCF wrapper would: parameters in, outputs out, api keys resolved from
 * whatever the reader or the build supplied, Google Maps passed as a provider, and the modules the story
 * asks for.
 */
export const MapDemo = (props: IMapDemoProps) => {
    const context = usePcfContext()
    const apiKeys = useMapApiKeys()
    const configuredKeyCount = useConfiguredKeyCount()
    const [outputs, setOutputs] = useState<IMapOutputs>({})
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [showKeys, setShowKeys] = useState(false)
    const [providerId, setProviderId] = useState<string | undefined>(props.parameters?.DefaultProvider?.raw ?? undefined)

    useEventEmitter<IDataProviderEventListeners>(props.dataset, 'onRecordsSelected', (ids: string[]) => setSelectedIds(ids ?? []))
    useEffect(() => setSelectedIds(props.dataset.getSelectedRecordIds()), [props.dataset])

    const parameters = useMemo(() => ({
        Dataset: props.dataset,
        HereApiKey: { raw: apiKeys.here },
        MapyApiKey: { raw: apiKeys.mapy },
        GoogleApiKey: { raw: apiKeys.google },
        MapProvider: { raw: providerId ?? null },
        ...props.parameters
    } as IMapParameters), [props.dataset, props.parameters, apiKeys, providerId])

    const height = props.height ?? 520

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <DefaultButton
                    id='map-demo-keys'
                    iconProps={{ iconName: configuredKeyCount ? 'Permissions' : 'Warning' }}
                    text={configuredKeyCount
                        ? `Api keys: ${configuredKeyCount} of ${MAP_API_KEY_PROVIDERS.length} providers set`
                        : 'Add api keys to see HERE, Mapy.com and Google Maps'}
                    aria-expanded={showKeys}
                    onClick={() => setShowKeys((current) => !current)} />
            </div>
            {showKeys &&
                <Callout
                    target='#map-demo-keys'
                    directionalHint={DirectionalHint.bottomLeftEdge}
                    onDismiss={() => setShowKeys(false)}
                    setInitialFocus>
                    <MapApiKeyPanel onDismiss={() => setShowKeys(false)} />
                </Callout>}
            <div style={{ height, display: 'flex', flexDirection: 'column' }}>
                <Map
                    context={context}
                    parameters={parameters}
                    providers={PROVIDERS}
                    modules={props.modules}
                    onResolvePin={props.onResolvePin}
                    viewportOptions={props.viewportOptions}
                    onNotifyOutputChanged={(changed: IMapOutputs) => {
                        setOutputs((current) => ({ ...current, ...changed }))
                        if (changed.MapProvider) {
                            setProviderId(changed.MapProvider)
                            props.onProviderChange?.(changed.MapProvider)
                        }
                    }}
                />
            </div>
            {props.children}
            {props.showReadout !== false &&
                <p className={styles.readout}>
                    provider: {outputs.MapProvider ?? providerId ?? 'default'}
                    {' | '}
                    selected: {selectedIds.join(', ') || 'nothing'}
                    {' | '}
                    {outputs.Viewport ? formatViewport(outputs.Viewport) : 'viewport not reported yet'}
                </p>}
        </div>
    )
}
