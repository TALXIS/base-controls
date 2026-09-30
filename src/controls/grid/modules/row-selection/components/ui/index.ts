import { RowSelectionUiCheckbox } from './checkbox';
import { RowSelectionUiHeaderCheckbox } from './header-checkbox';

export * from './checkbox';
export * from './header-checkbox';

/** What draws row selection, and nothing that knows which row. */
export interface IRowSelectionUi {
    Checkbox: typeof RowSelectionUiCheckbox;
    HeaderCheckbox: typeof RowSelectionUiHeaderCheckbox;
}

export const RowSelectionUi: IRowSelectionUi = {
    Checkbox: RowSelectionUiCheckbox,
    HeaderCheckbox: RowSelectionUiHeaderCheckbox,
};
