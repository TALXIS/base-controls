import { BaseControls } from "@talxis/base-controls"
import { DataTypes, IColumn } from "@talxis/client-libraries"

export const CONTROL_CLASSIDS = {
    text: "{4273EDBD-AC1D-40D3-9FB2-095C621B552D}",
    multiline: "{E0DECE4B-6FC8-4A8F-A065-082708572369}",
    boolean: "{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}",
    optionSet: "{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}",
    integer: "{C6D124CA-7EDA-4A60-AEA9-7FB8D318B68F}",
    decimal: "{533B9E00-756B-4312-95A0-DC888637AC78}",
    dateTime: "{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}",
    lookup: "{270BD3DB-D9AF-4782-9025-509D92B5BFC0}",
} as const

const CONTROL_CLASSIDS_BY_BASE_CONTROL: Record<string, string> = {
    [BaseControls.TextField]: CONTROL_CLASSIDS.text,
    [BaseControls.OptionSet]: CONTROL_CLASSIDS.optionSet,
    [BaseControls.MultiSelectOptionSet]: CONTROL_CLASSIDS.optionSet,
    [BaseControls.DateTime]: CONTROL_CLASSIDS.dateTime,
    [BaseControls.Decimal]: CONTROL_CLASSIDS.decimal,
    [BaseControls.Duration]: CONTROL_CLASSIDS.integer,
    [BaseControls.Lookup]: CONTROL_CLASSIDS.lookup,
    [BaseControls.TwoOptions]: CONTROL_CLASSIDS.boolean,
}

const CONTROL_CLASSIDS_BY_DATA_TYPE: Record<string, string> = {
    [DataTypes.Multiple]: CONTROL_CLASSIDS.multiline,
    [DataTypes.LookupSimple]: CONTROL_CLASSIDS.lookup,
    [DataTypes.TwoOptions]: CONTROL_CLASSIDS.boolean,
    [DataTypes.OptionSet]: CONTROL_CLASSIDS.optionSet,
    [DataTypes.MultiSelectOptionSet]: CONTROL_CLASSIDS.optionSet,
    [DataTypes.WholeNone]: CONTROL_CLASSIDS.integer,
    [DataTypes.Decimal]: CONTROL_CLASSIDS.decimal,
    [DataTypes.Currency]: CONTROL_CLASSIDS.decimal,
    [DataTypes.DateAndTimeDateOnly]: CONTROL_CLASSIDS.dateTime,
    [DataTypes.DateAndTimeDateAndTime]: CONTROL_CLASSIDS.dateTime,
    [DataTypes.WholeDuration]: CONTROL_CLASSIDS.integer,
}

export const DEFAULT_CLASSID = CONTROL_CLASSIDS.text
export const DEFAULT_LANGUAGE_CODE = 1033

export const getClassIdForColumn = (column: IColumn | undefined) => {
    if (!column) {
        return DEFAULT_CLASSID
    }

    return (
        CONTROL_CLASSIDS_BY_DATA_TYPE[column.dataType] ??
        CONTROL_CLASSIDS_BY_BASE_CONTROL[BaseControls.GetControlNameForDataType(column.dataType)] ??
        DEFAULT_CLASSID
    )
}
