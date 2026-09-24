/** Where each module's hooks run: ascending, so a later module has the last word. */
export const GRID_MODULE_PRIORITY = {
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
