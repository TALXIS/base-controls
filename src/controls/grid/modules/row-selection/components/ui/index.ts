import { RowSelectionUiCheckbox } from './checkbox';

export * from './checkbox';

/** What draws row selection, and nothing that knows which row. */
export interface IRowSelectionUi {
    Checkbox: typeof RowSelectionUiCheckbox;
}

export const RowSelectionUi: IRowSelectionUi = {
    Checkbox: RowSelectionUiCheckbox,
};
