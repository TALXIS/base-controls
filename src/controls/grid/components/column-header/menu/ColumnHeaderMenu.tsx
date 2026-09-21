import { useEffect, useState } from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridColumnHeaderEvents } from "../../../services/column-header";
import { useGridColumnHeader } from "../root/context";
import { ColumnHeaderMenuComponents, IGridColumnHeaderMenuComponents } from "./components";

export interface IGridColumnHeaderMenuProps {
    components?: Partial<IGridColumnHeaderMenuComponents>;
}

/** What a column header opens over the grid: everything the modules offer for its column. */
export const ColumnHeaderMenu = (props: IGridColumnHeaderMenuProps) => {
    const header = useGridColumnHeader();
    const components = { ...ColumnHeaderMenuComponents, ...props.components };
    //what it offers is worked out when it is asked for, rather than for every header the grid draws
    const [items, setItems] = useState<IContextualMenuItem[]>();

    useEventEmitter<IGridColumnHeaderEvents>(header, 'onMenuVisibilityChanged', isOpen => {
        setItems(isOpen ? header.getMenuItems() : undefined);
    });

    //AG Grid keeps the focus on the element it draws the header in rather than on what the header draws
    useEffect(() => {
        const element = header.getElement();
        const onKeyDown = (event: KeyboardEvent) => {
            //that element is an ancestor of everything here: a key pressed in the button is the button's
            if (event.key !== 'Enter' || event.target !== element) {
                return;
            }
            event.preventDefault();
            header.openMenu();
        };
        element?.addEventListener('keydown', onKeyDown);
        return () => element?.removeEventListener('keydown', onKeyDown);
    }, [header]);

    //the element AG Grid draws the header in, which is the whole of what the menu belongs to
    return components.onRenderMenu({ items: items, target: header.getElement(), onDismiss: () => header.closeMenu() });
};
