import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderUi, IColumnHeaderUiContainerComponents } from "../ui";

export interface IColumnHeaderContainerProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiContainerComponents>;
}

/** What the header is drawn in: wrap it around the name and the adornments. */
export const ColumnHeaderContainer = (props: IColumnHeaderContainerProps) => {
    const header = useGridColumnHeader();

    return <ColumnHeaderUi.Container
        title={header.getTitle()}
        onClick={() => header.openMenu()}
        //needs to be called on a touch as well since AG Grid cancels the click event on them
        onTouchEnd={() => header.openMenu()}
        components={props.components}>
        {props.children}
    </ColumnHeaderUi.Container>;
};
