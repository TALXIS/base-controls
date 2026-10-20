import { useMemo, useState } from 'react'
import {
    DefaultButton,
    Link,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    Stack,
    Text,
    TextField,
    getTheme,
    mergeStyleSets
} from '@fluentui/react'
import {
    clearMapApiKeys,
    getMapApiKeys,
    IMapApiKeys,
    IMapApiKeyProvider,
    isReaderProvidedKey,
    MAP_API_KEY_PROVIDERS,
    setMapApiKeys,
    useMapApiKeys
} from './mapApiKeys'

const getMapApiKeyPanelStyles = (theme: ReturnType<typeof getTheme>, isFramed: boolean) => mergeStyleSets({
    root: {
        padding: isFramed ? 20 : 16,
        maxWidth: 680,
        ...(isFramed ? {
            border: `1px solid ${theme.palette.neutralLight}`,
            borderRadius: 8,
            background: theme.palette.white
        } : {})
    },
    status: {
        color: theme.palette.neutralSecondary
    }
})

/** Where this provider's key came from, so a reader can tell their own from the build's. */
const describeKey = (provider: IMapApiKeyProvider, key: string) => {
    if (!key) {
        return 'not configured'
    }
    return isReaderProvidedKey(provider) ? 'saved in this browser' : 'from this build'
}

export interface IMapApiKeyPanelProps {
    /** Draws the panel as a card of its own, for when it sits on a page rather than inside a callout. */
    isFramed?: boolean
    /** Called once the reader is done, so a callout can close itself. */
    onDismiss?: () => void
}

/**
 * Lets a reader hand the demo their own api keys.
 *
 * The published Storybook is built without keys on purpose - one committed into a public bundle is a key
 * somebody else pays for - and nobody is going to clone the repository to fill in an env file. So this is how
 * anyone but the author gets past the keyless OpenStreetMap provider. Keys are kept in this browser's local
 * storage and never sent anywhere but the map provider itself.
 *
 * @param props Whether to frame it, and what to do when the reader is done.
 * @returns One field per provider, with save and clear.
 */
export const MapApiKeyPanel = (props: IMapApiKeyPanelProps) => {
    const theme = getTheme()
    const styles = useMemo(() => getMapApiKeyPanelStyles(theme, !!props.isFramed), [theme, props.isFramed])
    const keys = useMapApiKeys()
    const [draft, setDraft] = useState<IMapApiKeys>(keys)
    const [saved, setSaved] = useState(false)

    const configured = MAP_API_KEY_PROVIDERS.filter((provider) => !!keys[provider.id]).length

    const onSave = () => {
        setMapApiKeys(draft)
        setSaved(true)
    }

    const onClear = () => {
        clearMapApiKeys()
        //back to whatever the build itself carries, which on a published one is nothing
        setDraft(getMapApiKeys())
        setSaved(true)
    }

    return (
        <Stack tokens={{ childrenGap: 12 }} className={styles.root}>
            <Stack tokens={{ childrenGap: 4 }}>
                <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Use your own map provider keys</Text>
                <Text variant='small' className={styles.status}>
                    OpenStreetMap draws every page here without a key. {configured
                        ? `${configured} of ${MAP_API_KEY_PROVIDERS.length} other providers configured.`
                        : 'The other three need one each.'}
                </Text>
            </Stack>
            <Text variant='small'>
                Paste a key below to see that provider&rsquo;s map, its geo-coding and its routing on every page.
                Keys are kept in this browser and sent only to the provider they belong to &mdash; nothing reaches
                this site or anybody else.
            </Text>
            {MAP_API_KEY_PROVIDERS.map((provider) => (
                <TextField
                    key={provider.id}
                    label={provider.label}
                    description={describeKey(provider.id, keys[provider.id])}
                    type='password'
                    canRevealPassword
                    revealPasswordAriaLabel={`Show the ${provider.label} key`}
                    value={draft[provider.id]}
                    placeholder={`Paste a ${provider.label} key`}
                    onChange={(_event, value) => {
                        setSaved(false)
                        setDraft((current) => ({ ...current, [provider.id]: value ?? '' }))
                    }}
                    onRenderSuffix={() => (
                        <Link href={provider.signupUrl} target='_blank' rel='noopener noreferrer'>Get one</Link>
                    )}
                />
            ))}
            {saved &&
                <MessageBar messageBarType={MessageBarType.success} isMultiline={false}>
                    Saved. Every map on the page has been redrawn with them.
                </MessageBar>}
            <Stack horizontal tokens={{ childrenGap: 8 }}>
                <PrimaryButton text='Save keys' onClick={onSave} />
                <DefaultButton text='Clear' onClick={onClear} />
                {props.onDismiss && <DefaultButton text='Close' onClick={props.onDismiss} />}
            </Stack>
        </Stack>
    )
}
