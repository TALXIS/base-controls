import { DataTypes, type IColumn } from '@talxis/client-libraries'
import { createModelColumn as createBaseModelColumn } from './modelDefinition'

export const formMetadata = {
    PrimaryIdAttribute: 'id',
    PrimaryNameAttribute: 'company',
}

export const createModelColumn = (
    dataType:
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
        | typeof DataTypes.WholeDuration,
    overrides?: Partial<IColumn>,
) => createBaseModelColumn(dataType, overrides)
