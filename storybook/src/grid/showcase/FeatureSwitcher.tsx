import React from 'react'
import { DefaultButton, Icon, mergeStyleSets, TooltipHost } from '@fluentui/react'

const styles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '12px 14px',
        marginBottom: 12,
        border: '1px solid #edebe9',
        borderRadius: 8,
        background: '#faf9f8',
    },
    presets: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    caption: {
        color: '#605e5c',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
    },
    groups: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px 28px',
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },
    pills: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
    },
    pill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 28,
        padding: '0 12px',
        border: '1px solid #c8c6c4',
        borderRadius: 14,
        background: '#ffffff',
        color: '#323130',
        fontSize: 13,
        cursor: 'pointer',
        selectors: {
            ':hover': { borderColor: '#5B5FC7', color: '#5B5FC7' },
            ':focus-visible': { outline: '2px solid #5B5FC7', outlineOffset: 1 },
        },
    },
    pillOn: {
        borderColor: '#5B5FC7',
        background: '#5B5FC7',
        color: '#ffffff',
        selectors: {
            ':hover': { borderColor: '#444791', background: '#444791', color: '#ffffff' },
        },
    },
    preset: {
        height: 28,
        minWidth: 0,
        borderRadius: 14,
        padding: '0 12px',
    },
    enterprise: {
        padding: '0 6px',
        borderRadius: 8,
        background: '#fff4ce',
        color: '#8a6100',
        fontSize: 10,
        fontWeight: 600,
        lineHeight: '16px',
    },
})

export interface IShowcaseFeature {
    key: string
    label: string
    /** What to try once the feature is on. */
    hint: string
    /** Whether the feature needs an AG Grid Enterprise licence. */
    isEnterprise?: boolean
}

export interface IShowcaseFeatureGroup {
    title: string
    features: IShowcaseFeature[]
}

export interface IShowcasePreset {
    key: string
    label: string
    iconName: string
    /** What the preset is for. */
    description: string
    features: string[]
}

export type IShowcaseFeatureValues = { [feature: string]: boolean }

interface IFeatureSwitcherProps {
    groups: IShowcaseFeatureGroup[]
    presets: IShowcasePreset[]
    values: IShowcaseFeatureValues
    onChange: (values: IShowcaseFeatureValues) => void
}

/** Switches the showcase grid's features on and off, one at a time or a preset at a time. */
export const FeatureSwitcher = (props: IFeatureSwitcherProps) => {
    const features = props.groups.flatMap(group => group.features)
    //a preset may switch on features no group shows, and picking another one switches them off again
    const featureKeys = [...new Set([...features.map(feature => feature.key), ...props.presets.flatMap(preset => preset.features)])]

    const toggle = (feature: IShowcaseFeature) => {
        const isOn = !props.values[feature.key]
        props.onChange({ ...props.values, [feature.key]: isOn })
    }

    const applyPreset = (preset: IShowcasePreset) => {
        props.onChange(Object.fromEntries(featureKeys.map(key => [key, preset.features.includes(key)])))
    }

    return <div className={styles.root}>
        <div className={styles.presets}>
            <span className={styles.caption}>Presets</span>
            {props.presets.map(preset => <DefaultButton key={preset.key} className={styles.preset} iconProps={{ iconName: preset.iconName }} text={preset.label} title={preset.description} onClick={() => applyPreset(preset)} />)}
        </div>
        <div className={styles.groups}>
            {props.groups.map(group => <div key={group.title} className={styles.group}>
                <span className={styles.caption}>{group.title}</span>
                <div className={styles.pills}>
                    {group.features.map(feature => {
                        const isOn = !!props.values[feature.key]
                        const tooltip = feature.isEnterprise ? feature.hint + ' Needs an AG Grid Enterprise licence.' : feature.hint
                        return <TooltipHost key={feature.key} content={tooltip}>
                            <button type='button' role='switch' aria-checked={isOn} className={isOn ? `${styles.pill} ${styles.pillOn}` : styles.pill} onClick={() => toggle(feature)}>
                                <Icon iconName={isOn ? 'CheckMark' : 'Add'} />
                                {feature.label}
                                {feature.isEnterprise && <span className={styles.enterprise}>Enterprise</span>}
                            </button>
                        </TooltipHost>
                    })}
                </div>
            </div>)}
        </div>
    </div>
}
