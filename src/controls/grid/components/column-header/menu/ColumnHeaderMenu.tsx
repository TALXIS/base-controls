import { useEffect, useState } from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridColumnHeaderEvents } from "../../../services/column-header";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderMenuComponents, IColumnHeaderMenuComponents } from "./components";

export interface IColumnHeaderMenuProps {
    components?: Partial<IColumnHeaderMenuComponents>;
}

/** What a column header opens over the grid: everything the modules offer for its column. */
export const ColumnHeaderMenu = (props: IColumnHeaderMenuProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderMenuComponents, ...props.components };
    //worked out when the menu opens, not for every header the grid draws
    const [items, setItems] = useState<IContextualMenuItem[]>();

    useEventEmitter<IGridColumnHeaderEvents>(header, 'onMenuVisibilityChanged', isOpen => {
        setItems(isOpen ? header.getMenuItems() : undefined);
    });

    //AG Grid keeps the focus on the element it draws the header in
    useEffect(() => {
        const element = header.getElement();
        const onKeyDown = (event: KeyboardEvent) => {
            //keys pressed in descendants such as the button bubble up to that element
            if (event.key !== 'Enter' || event.target !== element) {
                return;
            }
            event.preventDefault();
            header.openMenu();
        };
        element?.addEventListener('keydown', onKeyDown);
        return () => element?.removeEventListener('keydown', onKeyDown);
    }, [header]);

    //the menu belongs to the whole element AG Grid draws the header in
    return components.onRenderMenu({ items: items, target: header.getElement(), onDismiss: () => header.closeMenu() });
};
