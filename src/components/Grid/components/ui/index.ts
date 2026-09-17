import { ColumnHeader } from './column-header';
import { ColumnHeaderMenu } from './column-header-menu';

export * from './column-header';
export * from './column-header-menu';

/** What draws the grid's own parts, and nothing that knows why. */
export interface IGridUi {
    /** A column's header, given what it draws. */
    ColumnHeader: typeof ColumnHeader;
    /** The menu a column header opens. */
    ColumnHeaderMenu: typeof ColumnHeaderMenu;
}

export const GridUi: IGridUi = {
    ColumnHeader: ColumnHeader,
    ColumnHeaderMenu: ColumnHeaderMenu,
};
