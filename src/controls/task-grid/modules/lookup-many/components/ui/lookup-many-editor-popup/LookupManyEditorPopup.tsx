import { useMemo, useRef } from "react";
import { useTheme } from "@fluentui/react";
import { useResizeEffect } from "@utils";
import { ILookupManyEditorPopupComponents, LookupManyEditorPopupComponents } from "./components";
import { getLookupManyEditorPopupStyles, LOOKUP_MANY_EDITOR_POPUP_MIN_WIDTH } from "./styles";

export interface ILookupManyEditorPopupProps {
    /** The width of the cell it pops out over. */
    cellWidth: number;
    children?: React.ReactNode;
    components?: Partial<ILookupManyEditorPopupComponents>;
}

/** A popup cell editor's box, kept inside the grid. */
export const LookupManyEditorPopup = (props: ILookupManyEditorPopupProps) => {
    const components = { ...LookupManyEditorPopupComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getLookupManyEditorPopupStyles(theme), [theme]);
    const rootRef = useRef<HTMLDivElement>(null);
    const shiftRef = useRef({ x: 0, y: 0 });

    //AG Grid places the popup before it is drawn
    useResizeEffect(rootRef, () => {
        const popup = rootRef.current?.closest<HTMLElement>('.ag-popup-editor');
        const grid = popup?.closest('.ag-root-wrapper')?.getBoundingClientRect();
        if (!popup || !grid) {
            return;
        }
        popup.style.width = `${Math.max(LOOKUP_MANY_EDITOR_POPUP_MIN_WIDTH, props.cellWidth)}px`;
        const rect = popup.getBoundingClientRect();
        const shift = shiftRef.current;
        shift.x = Math.min(0, grid.right - (rect.right - shift.x));
        shift.y = Math.min(0, grid.bottom - (rect.bottom - shift.y));
        popup.style.transform = `translate(${shift.x}px, ${shift.y}px)`;
    });

    return components.onRenderContainer({ ref: rootRef, className: styles.root, children: props.children });
};
