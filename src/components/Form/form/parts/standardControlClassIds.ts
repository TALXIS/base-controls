/**
 * Well-known Dataverse "out of the box" control classids. Any control whose
 * classid is in this set is treated as a standard datafield-bound control
 * for MVP rendering (label + placeholder). Anything else throws.
 */
export const SINGLE_LINE_TEXT_CLASSID = "{4273edbd-ac1d-40d3-9fb2-095c621b552d}";
export const MULTILINE_TEXT_CLASSID = "{e0dece4b-6fc8-4a8f-a065-082708572369}";
export const BOOLEAN_CLASSID = "{c3efe0c3-0ec6-42be-8349-cbd9079dfd8e}";
export const PICKLIST_CLASSID = "{3ef39988-22bb-4f0b-bbbe-64b5a3748aee}";
export const MULTISELECT_PICKLIST_CLASSID = "{f9a8a302-114e-466a-b582-6771b2ae0d92}";
export const LOOKUP_CLASSID = "{270bd3db-d9af-4782-9025-509e298dec0a}";
export const DATETIME_CLASSID = "{5b773807-9fb2-42db-97c3-7a91eff8adff}";
export const INTEGER_CLASSID = "{c6d124ca-7eda-4a60-aea9-7fb8d318b68f}";
export const DECIMAL_CLASSID = "{0d2c745a-e5a8-4c8f-ba63-c6d3bb604660}";
export const MONEY_CLASSID = "{533b9e00-756b-4312-95a0-dc888637ac78}";
export const STATUSREASON_CLASSID = "{f3015350-44a2-4aa0-97b5-00166532b5e9}";
export const STATUS_CLASSID = "{5d68b988-0661-4db2-bc3e-17598ad3be6c}";

export const STANDARD_CONTROL_CLASSIDS: ReadonlySet<string> = new Set([
    SINGLE_LINE_TEXT_CLASSID,
    MULTILINE_TEXT_CLASSID,
    BOOLEAN_CLASSID,
    PICKLIST_CLASSID,
    MULTISELECT_PICKLIST_CLASSID,
    LOOKUP_CLASSID,
    DATETIME_CLASSID,
    INTEGER_CLASSID,
    DECIMAL_CLASSID,
    MONEY_CLASSID,
    STATUSREASON_CLASSID,
    STATUS_CLASSID,
]);

export const isStandardControlClassId = (classid: string | undefined): boolean => {
    if (!classid) {
        return false;
    }
    return STANDARD_CONTROL_CLASSIDS.has(classid.toLowerCase());
};
