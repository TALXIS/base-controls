import { createContext, useContext } from "react";
import { IAlignment } from "@utils";
import { IColumnHeaderComponents } from "./components";
import { IColumnHeaderProps } from "./ColumnHeader";
import { getColumnHeaderStyles } from "./styles";

export interface IColumnHeaderContext extends Omit<IColumnHeaderProps, 'components'> {
    alignment: IAlignment;
    /** Merged with the defaults. */
    components: IColumnHeaderComponents;
    styles: ReturnType<typeof getColumnHeaderStyles>;
}

export const ColumnHeaderContext = createContext<IColumnHeaderContext | undefined>(undefined);
ColumnHeaderContext.displayName = 'ColumnHeader';

/** What the header this is drawn in was given, throwing where nothing is drawing one. */
export const useColumnHeader = (): IColumnHeaderContext => {
    const context = useContext(ColumnHeaderContext);
    if (!context) {
        throw new Error('This has to be drawn inside Grid.Ui.ColumnHeader.');
    }
    return context;
};
