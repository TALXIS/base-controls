import { ColumnHeaderContainer } from './container';
import { ColumnHeaderContent } from './content';
import { ColumnHeaderLabel } from './label';
import { ColumnHeaderMenu } from './menu';
import { ColumnHeaderPrefix } from './prefix';
import { ColumnHeaderRequiredMarker } from './required-marker';
import { ColumnHeaderSuffix } from './suffix';

export * from './container';
export * from './content';
export * from './label';
export * from './menu';
export * from './prefix';
export * from './required-marker';
export * from './suffix';

/** What draws a column header, and nothing that knows which column. */
export interface IColumnHeaderUi {
    /** What the header is drawn in. */
    Container: typeof ColumnHeaderContainer;
    /** What the header says the column is, drawn in. */
    Content: typeof ColumnHeaderContent;
    /** What the column is called. */
    Label: typeof ColumnHeaderLabel;
    /** What says the column asks for a value. */
    RequiredMarker: typeof ColumnHeaderRequiredMarker;
    /** What is drawn before the content. */
    Prefix: typeof ColumnHeaderPrefix;
    /** What is drawn after it, the uneditable icon included. */
    Suffix: typeof ColumnHeaderSuffix;
    /** The menu the header opens. */
    Menu: typeof ColumnHeaderMenu;
}

export const ColumnHeaderUi: IColumnHeaderUi = {
    Container: ColumnHeaderContainer,
    Content: ColumnHeaderContent,
    Label: ColumnHeaderLabel,
    RequiredMarker: ColumnHeaderRequiredMarker,
    Prefix: ColumnHeaderPrefix,
    Suffix: ColumnHeaderSuffix,
    Menu: ColumnHeaderMenu,
};
