import { DataProvider, DataTypes, IColumn } from "@talxis/client-libraries"

export type TSupportedModelDataType =
    | typeof DataTypes.SingleLineText
    | typeof DataTypes.Multiple
    | typeof DataTypes.SingleLinePhone
    | typeof DataTypes.SingleLineUrl
    | typeof DataTypes.LookupSimple
    | typeof DataTypes.TwoOptions
    | typeof DataTypes.OptionSet
    | typeof DataTypes.MultiSelectOptionSet
    | typeof DataTypes.WholeNone
    | typeof DataTypes.Decimal
    | typeof DataTypes.Currency
    | typeof DataTypes.DateAndTimeDateOnly
    | typeof DataTypes.DateAndTimeDateAndTime
    | typeof DataTypes.WholeDuration

export interface IModelOption {
    Label: string
    Value: number
    Color: string
}

export interface IModelTypeDefinition {
    key: TSupportedModelDataType
    label: string
    description: string
    defaultDisplayName: string
    defaultName: string
    defaultValue: unknown
    supportsOptionSet?: boolean
    supportsLookupTargets?: boolean
}

const optionSetDefaults: IModelOption[] = [
    { Label: "Option 1", Value: 1, Color: "" },
    { Label: "Option 2", Value: 2, Color: "" },
]

const twoOptionsDefaults: IModelOption[] = [
    { Label: "Yes", Value: 1, Color: "" },
    { Label: "No", Value: 0, Color: "" },
]

export const modelTypeDefinitions: IModelTypeDefinition[] = [
    {
        key: DataTypes.SingleLineText,
        label: "Single line text",
        description: "Basic text input.",
        defaultDisplayName: "Text",
        defaultName: "text",
        defaultValue: "",
    },
    {
        key: DataTypes.Multiple,
        label: "Multiline text",
        description: "Long-form text area.",
        defaultDisplayName: "Multiline Text",
        defaultName: "multilinetext",
        defaultValue: "",
    },
    {
        key: DataTypes.SingleLinePhone,
        label: "Phone",
        description: "Phone number input.",
        defaultDisplayName: "Phone",
        defaultName: "phone",
        defaultValue: "",
    },
    {
        key: DataTypes.SingleLineUrl,
        label: "URL",
        description: "Link/URL input.",
        defaultDisplayName: "Url",
        defaultName: "url",
        defaultValue: "",
    },
    {
        key: DataTypes.LookupSimple,
        label: "Lookup",
        description: "Single-target lookup field.",
        defaultDisplayName: "Lookup",
        defaultName: "lookup",
        defaultValue: null,
        supportsLookupTargets: true,
    },
    {
        key: DataTypes.TwoOptions,
        label: "Two options",
        description: "Boolean/two-state choice.",
        defaultDisplayName: "Two Options",
        defaultName: "twooptions",
        defaultValue: false,
        supportsOptionSet: true,
    },
    {
        key: DataTypes.OptionSet,
        label: "Option set",
        description: "Single-select choice list.",
        defaultDisplayName: "OptionSet",
        defaultName: "optionset",
        defaultValue: null,
        supportsOptionSet: true,
    },
    {
        key: DataTypes.MultiSelectOptionSet,
        label: "Multi-select option set",
        description: "Multi-select choice list.",
        defaultDisplayName: "MultiSelectOptionSet",
        defaultName: "multiselectoptionset",
        defaultValue: null,
        supportsOptionSet: true,
    },
    {
        key: DataTypes.WholeNone,
        label: "Whole number",
        description: "Integer number field.",
        defaultDisplayName: "Number",
        defaultName: "number",
        defaultValue: 0,
    },
    {
        key: DataTypes.Decimal,
        label: "Decimal",
        description: "Decimal number field.",
        defaultDisplayName: "Decimal",
        defaultName: "decimal",
        defaultValue: 0,
    },
    {
        key: DataTypes.Currency,
        label: "Currency",
        description: "Currency number field.",
        defaultDisplayName: "Currency",
        defaultName: "currency",
        defaultValue: 0,
    },
    {
        key: DataTypes.DateAndTimeDateOnly,
        label: "Date only",
        description: "Date picker without time.",
        defaultDisplayName: "Date Only",
        defaultName: "dateonly",
        defaultValue: null,
    },
    {
        key: DataTypes.DateAndTimeDateAndTime,
        label: "Date and time",
        description: "Date and time picker.",
        defaultDisplayName: "Date Time",
        defaultName: "datetime",
        defaultValue: null,
    },
    {
        key: DataTypes.WholeDuration,
        label: "Duration",
        description: "Duration in minutes.",
        defaultDisplayName: "Duration",
        defaultName: "duration",
        defaultValue: 0,
    },
]

export const modelTypeDefinitionMap = new Map(modelTypeDefinitions.map((definition) => [definition.key, definition]))

export const ribbonColumn: IColumn = {
    name: DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME,
    dataType: DataTypes.SingleLineText,
}

export const getModelTypeDefinition = (dataType: string | undefined) => {
    return dataType ? modelTypeDefinitionMap.get(dataType as TSupportedModelDataType) : undefined
}

export const getDefaultMetadataForType = (dataType: TSupportedModelDataType) => {
    if (dataType === DataTypes.LookupSimple) {
        return {
            IsValidForUpdate: true,
            Targets: ["customLookup"],
        }
    }

    if (dataType === DataTypes.TwoOptions) {
        return {
            IsValidForUpdate: true,
            OptionSet: twoOptionsDefaults.map((option) => ({ ...option })),
        }
    }

    if (dataType === DataTypes.OptionSet || dataType === DataTypes.MultiSelectOptionSet) {
        return {
            IsValidForUpdate: true,
            OptionSet: optionSetDefaults.map((option) => ({ ...option })),
        }
    }

    return {
        IsValidForUpdate: true,
    }
}

export const createModelColumn = (dataType: TSupportedModelDataType, overrides?: Partial<IColumn>): IColumn => {
    const definition = getModelTypeDefinition(dataType)

    return {
        name: definition?.defaultName ?? "field",
        alias: definition?.defaultName ?? "field",
        dataType,
        displayName: definition?.defaultDisplayName ?? "Field",
        order: 0,
        visualSizeFactor: 150,
        metadata: getDefaultMetadataForType(dataType),
        ...overrides,
    }
}

export const initialModelColumns: IColumn[] = [
    {
        name: "id",
        alias: "id",
        isHidden: true,
        displayName: "ID",
        dataType: DataTypes.SingleLineText,
    },
    createModelColumn(DataTypes.SingleLineText, {
        name: "text",
        alias: "text",
        displayName: "Text",
        isPrimary: true,
    }),
    createModelColumn(DataTypes.Multiple, {
        name: "multilinetext",
        alias: "multilinetext",
        displayName: "Multiline Text",
    }),
    createModelColumn(DataTypes.SingleLinePhone, {
        name: "phone",
        alias: "phone",
        displayName: "Phone",
    }),
    createModelColumn(DataTypes.SingleLineUrl, {
        name: "url",
        alias: "url",
        displayName: "Url",
    }),
    createModelColumn(DataTypes.TwoOptions, {
        name: "twooptions",
        alias: "twooptions",
        displayName: "Two Options",
    }),
    createModelColumn(DataTypes.TwoOptions, {
        name: "twooptionscolorful",
        alias: "twooptionscolorful",
        displayName: "Two Options Colorful",
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: "Yes", Value: 1, Color: "#059669" },
                { Label: "No", Value: 0, Color: "#DC2626" },
            ],
        },
    }),
    createModelColumn(DataTypes.OptionSet, {
        name: "optionset",
        alias: "optionset",
        displayName: "OptionSet",
    }),
    createModelColumn(DataTypes.OptionSet, {
        name: "optionsetcolorful",
        alias: "optionsetcolorful",
        displayName: "OptionSet Colorful",
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: "Option 1", Value: 1, Color: "#059669" },
                { Label: "Option 2", Value: 2, Color: "#2563EB" },
            ],
        },
    }),
    createModelColumn(DataTypes.MultiSelectOptionSet, {
        name: "multiselectoptionset",
        alias: "multiselectoptionset",
        displayName: "MultiSelectOptionSet",
    }),
    createModelColumn(DataTypes.MultiSelectOptionSet, {
        name: "multiselectoptionsetcolorful",
        alias: "multiselectoptionsetcolorful",
        displayName: "MultiSelectOptionSet Colorful",
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: "Option 1", Value: 1, Color: "#7C3AED" },
                { Label: "Option 2", Value: 2, Color: "#0891B2" },
            ],
        },
    }),
    createModelColumn(DataTypes.WholeNone, {
        name: "number",
        alias: "number",
        displayName: "Number",
    }),
    createModelColumn(DataTypes.Decimal, {
        name: "decimal",
        alias: "decimal",
        displayName: "Decimal",
    }),
    createModelColumn(DataTypes.Currency, {
        name: "currency",
        alias: "currency",
        displayName: "Currency",
    }),
    createModelColumn(DataTypes.DateAndTimeDateOnly, {
        name: "dateonly",
        alias: "dateonly",
        displayName: "Date Only",
    }),
    createModelColumn(DataTypes.DateAndTimeDateAndTime, {
        name: "datetime",
        alias: "datetime",
        displayName: "Date Time",
    }),
    createModelColumn(DataTypes.WholeDuration, {
        name: "duration",
        alias: "duration",
        displayName: "Duration",
    }),
]
