import { ColumnHeaderUiContainer } from './container';
import { ColumnHeaderUiContent } from './content';
import { ColumnHeaderUiLabel } from './label';
import { ColumnHeaderUiMenu } from './menu';
import { ColumnHeaderUiPrefix } from './prefix';
import { ColumnHeaderUiRequiredMarker } from './required-marker';
import { ColumnHeaderUiSuffix } from './suffix';

export * from './container';
export * from './content';
export * from './label';
export * from './menu';
export * from './prefix';
export * from './required-marker';
export * from './suffix';

/** What draws a column header, and nothing that knows which column. */
export interface IColumnHeaderUi {
    Container: typeof ColumnHeaderUiContainer;
    Content: typeof ColumnHeaderUiContent;
    Label: typeof ColumnHeaderUiLabel;
    RequiredMarker: typeof ColumnHeaderUiRequiredMarker;
    Prefix: typeof ColumnHeaderUiPrefix;
    Suffix: typeof ColumnHeaderUiSuffix;
    Menu: typeof ColumnHeaderUiMenu;
}

export const ColumnHeaderUi: IColumnHeaderUi = {
    Container: ColumnHeaderUiContainer,
    Content: ColumnHeaderUiContent,
    Label: ColumnHeaderUiLabel,
    RequiredMarker: ColumnHeaderUiRequiredMarker,
    Prefix: ColumnHeaderUiPrefix,
    Suffix: ColumnHeaderUiSuffix,
    Menu: ColumnHeaderUiMenu,
};
