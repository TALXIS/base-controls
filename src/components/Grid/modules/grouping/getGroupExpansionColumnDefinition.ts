import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/** The key the expansion column takes. Its own: the dataset reserves none for it. */
export const GROUP_EXPANSION_COLUMN_KEY = 'groupExpansion';

/**
 * The column whose header opens and closes the groups a level at a time.
 *
 * Pinned and unmovable, like the checkbox column: what it holds is about the rows rather than about any one
 * of them. The header is the whole of it — the cells carry no value, which is why the getter and the
 * formatter answer nothing.
 */
export const getGroupExpansionColumnDefinition = (onRenderHeader: () => JSX.Element): ColDef<IRecord> => ({
    colId: GROUP_EXPANSION_COLUMN_KEY,
    headerName: '',
    width: 60,
    lockPinned: true,
    //locked, not just pinned: the grouped columns are sorted to the front, and this must be neither sorted
    //along with them nor pushed out of the leading position by a module that reorders the definitions
    lockPosition: 'left',
    resizable: false,
    sortable: false,
    pinned: 'left',
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    headerComponent: onRenderHeader,
});
