import React from 'react'
import { mergeStyleSets, Panel, PanelType, Text } from '@fluentui/react'
import { CommandBar, Form, MemoryStrategy } from '@talxis/base-controls'
import { DataTypes, IColumn } from '@talxis/client-libraries'
import { RequiredLevelEnum } from '@talxis/client-metadata'
import { metadataFor } from '../data/metadata'

const styles = mergeStyleSets({
    root: {
        marginBottom: 12,
        borderBottom: '1px solid #edebe9',
    },
    hint: {
        display: 'block',
        marginTop: 4,
        color: '#605e5c',
    },
})

export interface IShowcaseFeatureOption {
    key: string
    label: string
}

export interface IShowcaseFeature {
    key: string
    label: string
    /** What to try once the feature is on. */
    hint: string
    /** Whether the feature needs an AG Grid Enterprise licence. */
    isEnterprise?: boolean
    /** The ways the feature can be on, the first being the one a preset picks. */
    options?: IShowcaseFeatureOption[]
}

export interface IShowcaseFeatureGroup {
    title: string
    /** Shown under Core rather than Modules: a prop of the grid, not a module. */
    isCore?: boolean
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

/** A feature is off when false, and holds the key of its option when it has options. */
export type IShowcaseFeatureValues = { [feature: string]: boolean | string }

interface IFeatureSwitcherProps {
    groups: IShowcaseFeatureGroup[]
    presets: IShowcasePreset[]
    values: IShowcaseFeatureValues
    onChange: (values: IShowcaseFeatureValues) => void
}

const OFF = 0

const toColumn = (feature: IShowcaseFeature): IColumn => {
    const displayName = feature.isEnterprise ? `${feature.label} (Enterprise)` : feature.label
    if (feature.options) {
        const optionSet = [{ Value: OFF, Label: 'Off', Color: '' }, ...feature.options.map((option, index) => ({ Value: index + 1, Label: option.label, Color: '' }))]
        return { name: feature.key, displayName, dataType: DataTypes.OptionSet, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: optionSet } }
    }
    return { name: feature.key, displayName, dataType: DataTypes.TwoOptions, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: [{ Value: 0, Label: 'Off', Color: '' }, { Value: 1, Label: 'On', Color: '' }] } }
}

const toFieldValue = (feature: IShowcaseFeature, value: boolean | string | undefined) => {
    if (feature.options) {
        return feature.options.findIndex(option => option.key === value) + 1
    }
    return !!value
}

const fromFieldValue = (feature: IShowcaseFeature, value: unknown): boolean | string => {
    if (feature.options) {
        return feature.options[Number(value ?? OFF) - 1]?.key ?? false
    }
    //a two-options control hands its value over as '1' or '0'
    return value === true || Number(value) === 1
}

/** Switches the showcase grid's features on and off, a preset at a time or one by one in a panel. */
/** Every feature as a preset sets it: off unless the preset has it, and on in its first option when it has options. */
export const getPresetValues = (groups: IShowcaseFeatureGroup[], presets: IShowcasePreset[], preset: IShowcasePreset): IShowcaseFeatureValues => {
    const features = groups.flatMap(group => group.features)
    //a preset may switch on features no group shows, and picking another one switches them off again
    const featureKeys = [...new Set([...features.map(feature => feature.key), ...presets.flatMap(candidate => candidate.features)])]
    return Object.fromEntries(featureKeys.map(key => {
        const isOn = preset.features.includes(key)
        const options = features.find(feature => feature.key === key)?.options
        return [key, isOn && options ? options[0].key : isOn]
    }))
}

export const FeatureSwitcher = (props: IFeatureSwitcherProps) => {
    const [isPanelOpen, setIsPanelOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState('core')
    const features = props.groups.flatMap(group => group.features)
    const getValues = (preset: IShowcasePreset) => getPresetValues(props.groups, props.presets, preset)

    const isActive = (preset: IShowcasePreset) => Object.entries(getValues(preset)).every(([key, value]) => (props.values[key] ?? false) === value)

    //recreated on open to load the current features
    const strategy = React.useMemo(() => new MemoryStrategy({
        onGetColumns: () => features.map(toColumn),
        onGetData: () => ({ id: 'features', ...Object.fromEntries(features.map(feature => [feature.key, toFieldValue(feature, props.values[feature.key])])) }),
        onGetMetadata: () => ({ PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'id' }),
    }), [isPanelOpen])

    const onFieldValueChanged = (fieldName: string, newValue: unknown) => {
        const feature = features.find(feature => feature.key === fieldName)
        if (feature) {
            props.onChange({ ...props.values, [fieldName]: fromFieldValue(feature, newValue) })
        }
    }

    const renderGroup = (group: IShowcaseFeatureGroup) => <Form.Section key={group.title} label={group.title} layout={{ lg: 1 }}>
        {group.features.map(feature => <Form.Field key={feature.key} name={feature.key}>
            {/* the recommended mark flags what needs an Enterprise licence */}
            <Form.Cell requiredLevel={feature.isEnterprise ? RequiredLevelEnum.Recommended : undefined}>
                <Form.Control />
                <Text variant='small' className={styles.hint}>{feature.isEnterprise ? feature.hint + ' Needs an AG Grid Enterprise licence.' : feature.hint}</Text>
            </Form.Cell>
        </Form.Field>)}
    </Form.Section>

    return <div className={styles.root}>
        <CommandBar
            items={props.presets.map(preset => ({ key: preset.key, text: preset.label, title: preset.description, iconProps: { iconName: preset.iconName }, canCheck: true, checked: isActive(preset), buttonStyles: { labelChecked: { fontWeight: 600 } }, onClick: () => props.onChange(getValues(preset)) }))}
            farItems={[{ key: 'features', text: 'Features & Modules', iconProps: { iconName: 'Settings' }, onClick: () => setIsPanelOpen(true) }]} />
        <Panel isOpen={isPanelOpen} isLightDismiss type={PanelType.medium} onDismiss={() => setIsPanelOpen(false)}>
            <Form.Root strategy={strategy} onFieldValueChanged={onFieldValueChanged}>
                <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                    <Form.Tab id='core' label='Core'>
                        <Form.Column>{props.groups.filter(group => group.isCore).map(renderGroup)}</Form.Column>
                    </Form.Tab>
                    <Form.Tab id='modules' label='Modules'>
                        <Form.Column>{props.groups.filter(group => !group.isCore).map(renderGroup)}</Form.Column>
                    </Form.Tab>
                </Form.Tabs>
            </Form.Root>
        </Panel>
    </div>
}
