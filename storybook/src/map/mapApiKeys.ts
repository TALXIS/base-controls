import { useEffect, useState } from 'react'

/** Providers whose api key the demo can hold. OpenStreetMap needs none, so it is not one of them. */
export type IMapApiKeyProvider = 'here' | 'mapy' | 'google'

export type IMapApiKeys = { [provider in IMapApiKeyProvider]: string }

export interface IMapApiKeyProviderInfo {
    id: IMapApiKeyProvider
    label: string
    /** Manifest property the control reads this key from. */
    parameterName: string
    /** Where a reader gets one of their own. */
    signupUrl: string
}

export const MAP_API_KEY_PROVIDERS: IMapApiKeyProviderInfo[] = [
    { id: 'here', label: 'HERE', parameterName: 'HereApiKey', signupUrl: 'https://platform.here.com/' },
    { id: 'mapy', label: 'Mapy.com', parameterName: 'MapyApiKey', signupUrl: 'https://developer.mapy.com/' },
    { id: 'google', label: 'Google Maps', parameterName: 'GoogleApiKey', signupUrl: 'https://console.cloud.google.com/google/maps-apis' }
]

const STORAGE_KEY = 'talxis.base-controls.storybook.mapApiKeys'

const EMPTY_KEYS: IMapApiKeys = { here: '', mapy: '', google: '' }

/**
 * Keys baked in at build time from a gitignored `storybook/.env.local`.
 *
 * The published Storybook is built without them on purpose - a key in a public bundle is a key someone else
 * is paying for - so on that build these are all empty and the ones below take over.
 */
const ENV_KEYS: IMapApiKeys = {
    here: import.meta.env.VITE_MAP_HERE_API_KEY ?? '',
    mapy: import.meta.env.VITE_MAP_MAPY_API_KEY ?? '',
    google: import.meta.env.VITE_MAP_GOOGLE_API_KEY ?? ''
}

const readStoredKeys = (): Partial<IMapApiKeys> => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch {
        //a private window, or storage the browser refuses - the env keys are still a usable answer
        return {}
    }
}

let keys: IMapApiKeys = { ...EMPTY_KEYS, ...ENV_KEYS, ...readStoredKeys() }
const listeners = new Set<() => void>()

/**
 * The keys the demo hands the control right now: whatever the reader typed, falling back to the build's own.
 *
 * @returns One key per provider, empty where there is none.
 */
export const getMapApiKeys = (): IMapApiKeys => keys

/**
 * Replaces the keys the reader typed and tells every mounted map to redraw with them.
 *
 * @param changed Keys to set. An empty string clears that provider back to the build's own key.
 */
export const setMapApiKeys = (changed: Partial<IMapApiKeys>) => {
    const stored = { ...readStoredKeys(), ...changed }
    //an empty entry means "use whatever the build has", which is not the same as storing an empty key
    const kept = Object.fromEntries(Object.entries(stored).filter(([, value]) => !!value))
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kept))
    } catch {
        //storing is a convenience; the session still gets the keys from the value below
    }
    keys = { ...EMPTY_KEYS, ...ENV_KEYS, ...kept }
    listeners.forEach((listener) => listener())
}

/** Forgets every key the reader typed, leaving the build's own. */
export const clearMapApiKeys = () => {
    try {
        window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        //nothing was stored, so nothing needs removing
    }
    keys = { ...EMPTY_KEYS, ...ENV_KEYS }
    listeners.forEach((listener) => listener())
}

/** Whether this provider's key came from the reader rather than from the build. */
export const isReaderProvidedKey = (provider: IMapApiKeyProvider): boolean => {
    const stored = readStoredKeys()
    return !!stored[provider] && stored[provider] !== ENV_KEYS[provider]
}

/**
 * The current keys, re-rendering the caller whenever they change.
 *
 * @returns One key per provider, empty where there is none.
 */
export const useMapApiKeys = (): IMapApiKeys => {
    const [current, setCurrent] = useState(keys)
    useEffect(() => {
        const listener = () => setCurrent(getMapApiKeys())
        listeners.add(listener)
        listener()
        return () => { listeners.delete(listener) }
    }, [])
    return current
}

/**
 * The first of these providers that has a key, for a story that is best shown on a particular one.
 *
 * @param candidates Provider ids in order of preference.
 * @returns The first configured candidate, or `leaflet` - which needs no key and always renders.
 */
export const preferredProvider = (...candidates: IMapApiKeyProvider[]): string =>
    candidates.find((provider) => !!getMapApiKeys()[provider]) ?? 'osm'
