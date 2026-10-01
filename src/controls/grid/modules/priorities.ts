/** Where each module's hooks run. */
export const GRID_MODULE_PRIORITY = {
    //what a legacy script set is the default every other module builds on
    legacyClientApiCompatibility: 0,
    rowModel: 10,
    //its checkbox column is the first column
    rowSelection: 20,
    cellSelection: 30,
    sorting: 40,
    filtering: 50,
    grouping: 60,
    aggregation: 70,
    clipboard: 80,
} as const;
