import { DataTypes, IColumn } from "@talxis/client-libraries";

/** A read-only virtual column of references a module fills. */
export const createReadOnlyLookupColumn = (name: string, displayName: string): IColumn => ({
    name,
    displayName,
    dataType: DataTypes.LookupSimple,
    isVirtual: true,
    visualSizeFactor: 100,
    disableSorting: true,
    metadata: { IsValidForUpdate: false, SupportedFilterConditionOperators: [] },
});
