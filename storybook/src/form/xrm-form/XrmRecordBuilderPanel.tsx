import { ChangeEvent } from 'react'
import { DatePicker, Dropdown, IDropdownOption, SpinButton, Stack, Text, TextField, Toggle, getTheme, mergeStyleSets } from '@fluentui/react'
import { DataTypes, IColumn } from '@talxis/client-libraries'

interface IXrmRecordBuilderPanelProps {
    columns: IColumn[]
    record: { [key: string]: any }
    onChange: (nextRecord: { [key: string]: any }) => void
}

const theme = getTheme()

const styles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 0,
    },
    intro: {
        color: theme.palette.neutralSecondary,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 16,
        '@media (max-width: 960px)': {
            gridTemplateColumns: '1fr',
        },
    },
    field: {
        minWidth: 0,
    },
    fullWidth: {
        gridColumn: '1 / -1',
        '@media (max-width: 960px)': {
            gridColumn: 'auto',
        },
    },
})

const toDateValue = (value: unknown) => {
    if (!value) {
        return null
    }

    const next = value instanceof Date ? value : new Date(String(value))
    return Number.isNaN(next.getTime()) ? null : next
}

const getLookupText = (record: { [key: string]: any }, name: string) => {
    return String(record[`_${name}_value@OData.Community.Display.V1.FormattedValue`] ?? '')
}

const getLookupEntity = (record: { [key: string]: any }, name: string) => {
    return String(record[`_${name}_value@Microsoft.Dynamics.CRM.lookuplogicalname`] ?? 'customLookup')
}

const getLookupId = (record: { [key: string]: any }, name: string) => {
    return String(record[`_${name}_value`] ?? '')
}

export const XrmRecordBuilderPanel = (props: IXrmRecordBuilderPanelProps) => {
    const { columns, record, onChange } = props

    const visibleColumns = columns.filter((column) => {
        if (!column || column.isHidden || column.name === 'id') {
            return false
        }

        return column.name !== 'RibbonButtons'
    })

    const updateValue = (name: string, value: unknown) => {
        onChange({
            ...record,
            [name]: value,
        })
    }

    const updateLookupValue = (name: string, field: 'id' | 'text' | 'entity', value: string) => {
        const nextRecord = { ...record }

        if (field === 'id') {
            nextRecord[`_${name}_value`] = value
        }

        if (field === 'text') {
            nextRecord[`_${name}_value@OData.Community.Display.V1.FormattedValue`] = value
        }

        if (field === 'entity') {
            nextRecord[`_${name}_value@Microsoft.Dynamics.CRM.lookuplogicalname`] = value
        }

        onChange(nextRecord)
    }

    const renderOptionSet = (column: IColumn) => {
        const options = ((column.metadata as any)?.OptionSet ?? []).map((option: any) => ({
            key: option.Value,
            text: option.Label,
        })) as IDropdownOption[]

        return <Dropdown
            className={styles.field}
            label={column.displayName}
            selectedKey={record[column.name] ?? undefined}
            options={options}
            onChange={(_event, option) => updateValue(column.name, option?.key ?? null)}
        />
    }

    const renderMultiSelectOptionSet = (column: IColumn) => {
        const options = ((column.metadata as any)?.OptionSet ?? []).map((option: any) => ({
            key: option.Value,
            text: option.Label,
        })) as IDropdownOption[]

        const selectedKeys = Array.isArray(record[column.name]) ? record[column.name] : []

        return <Dropdown
            className={styles.field}
            label={column.displayName}
            selectedKeys={selectedKeys}
            multiSelect
            options={options}
            onChange={(_event, option) => {
                if (!option) {
                    return
                }

                const nextSelectedKeys = option.selected
                    ? [...selectedKeys, option.key]
                    : selectedKeys.filter((key) => key !== option.key)

                updateValue(column.name, nextSelectedKeys)
            }}
        />
    }

    const renderLookup = (column: IColumn) => {
        const baseName = column.name

        return <Stack tokens={{ childrenGap: 8 }} className={`${styles.field} ${styles.fullWidth}`.trim()}>
            <Text variant="medium">{column.displayName}</Text>
            <TextField
                label="Lookup text"
                value={getLookupText(record, baseName)}
                onChange={(_event, value) => updateLookupValue(baseName, 'text', value ?? '')}
            />
            <TextField
                label="Lookup id"
                value={getLookupId(record, baseName)}
                onChange={(_event, value) => updateLookupValue(baseName, 'id', value ?? '')}
            />
            <TextField
                label="Lookup entity"
                value={getLookupEntity(record, baseName)}
                onChange={(_event, value) => updateLookupValue(baseName, 'entity', value ?? '')}
            />
        </Stack>
    }

    const renderField = (column: IColumn) => {
        const fieldClassName = column.dataType === DataTypes.Multiple ? `${styles.field} ${styles.fullWidth}`.trim() : styles.field

        if (column.dataType === DataTypes.SingleLineText || column.dataType === DataTypes.SingleLinePhone || column.dataType === DataTypes.SingleLineUrl) {
            return <TextField
                key={column.name}
                className={fieldClassName}
                label={column.displayName}
                value={String(record[column.name] ?? '')}
                onChange={(_event, value) => updateValue(column.name, value ?? '')}
            />
        }

        if (column.dataType === DataTypes.Multiple) {
            return <TextField
                key={column.name}
                className={fieldClassName}
                label={column.displayName}
                value={String(record[column.name] ?? '')}
                multiline
                autoAdjustHeight
                onChange={(_event, value) => updateValue(column.name, value ?? '')}
            />
        }

        if (column.dataType === DataTypes.TwoOptions) {
            return <Toggle
                key={column.name}
                className={fieldClassName}
                label={column.displayName}
                checked={!!record[column.name]}
                onChange={(_event, checked) => updateValue(column.name, !!checked)}
            />
        }

        if (column.dataType === DataTypes.OptionSet) {
            return <div key={column.name} className={fieldClassName}>{renderOptionSet(column)}</div>
        }

        if (column.dataType === DataTypes.MultiSelectOptionSet) {
            return <div key={column.name} className={fieldClassName}>{renderMultiSelectOptionSet(column)}</div>
        }

        if (column.dataType === DataTypes.LookupSimple) {
            return <div key={column.name}>{renderLookup(column)}</div>
        }

        if (column.dataType === DataTypes.WholeNone || column.dataType === DataTypes.Decimal || column.dataType === DataTypes.Currency || column.dataType === DataTypes.WholeDuration) {
            return <SpinButton
                key={column.name}
                className={fieldClassName}
                label={column.displayName}
                value={String(record[column.name] ?? 0)}
                onChange={(_event: ChangeEvent<HTMLInputElement> | undefined, value) => updateValue(column.name, Number(value ?? 0))}
                onIncrement={(value) => String(Number(value ?? 0) + 1)}
                onDecrement={(value) => String(Number(value ?? 0) - 1)}
            />
        }

        if (column.dataType === DataTypes.DateAndTimeDateOnly || column.dataType === DataTypes.DateAndTimeDateAndTime) {
            return <DatePicker
                key={column.name}
                className={fieldClassName}
                label={column.displayName}
                value={toDateValue(record[column.name])}
                onSelectDate={(date) => updateValue(column.name, date ? date.toISOString() : null)}
            />
        }

        return <TextField
            key={column.name}
            className={fieldClassName}
            label={column.displayName}
            value={String(record[column.name] ?? '')}
            onChange={(_event, value) => updateValue(column.name, value ?? '')}
        />
    }

    return <Stack className={styles.root}>
        <Text variant="medium" className={styles.intro}>
            Edit the current record through a guided UI. These values are shared with the Xrm builder preview and FormXml stories.
        </Text>
        <div className={styles.grid}>
            {visibleColumns.map((column) => renderField(column))}
        </div>
    </Stack>
}
