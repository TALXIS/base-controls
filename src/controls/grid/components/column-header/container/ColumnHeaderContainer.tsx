import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderContainerComponents, IColumnHeaderContainerComponents } from "./components";

export interface IColumnHeaderContainerProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderContainerComponents>;
}

/** What the header is drawn in: wrap it around the name and the adornments. */
export const ColumnHeaderContainer = (props: IColumnHeaderContainerProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderContainerComponents, ...props.components };

    return components.onRenderContainer({
        title: header.getTitle(),
        onClick: () => header.openMenu(),
        //needs to be called on a touch as well since AG Grid cancels the click event on them
        onTouchEnd: () => header.openMenu(),
        children: props.children,
    });
};
