import { useMemo, useState } from "react"
import { Label, useTheme } from "@fluentui/react";
import { ScopeSelector } from "../scope-selector/ScopeSelector";
import { ColumnSelector } from "../column-selector/ColumnSelector";
import { useRerender } from "@talxis/react-components";
import { getHeaderStyles } from "./styles";
import { useShouldRemount } from "../../../hooks/useShouldRemount";
import { IEditColumnsEvents } from "../../../utils/edit-columns";
import { useEventEmitter } from "../../../hooks";
import { useEditColumns, useEditColumnsComponents, useEditColumnsLabels } from "../context";


export const Header = () => {
    const theme = useTheme();
    const styles = useMemo(() => getHeaderStyles(theme), []);
    const labels = useEditColumnsLabels();
    const components = useEditColumnsComponents();
    const model = useEditColumns();
    const [shouldRemountColumnSelector, remountColumnSelector] = useShouldRemount();
    const [openColumnSelectorOnMount, setOpenColumnSelectorOnMount] = useState(false);

    const rerender = useRerender();

    useEventEmitter<IEditColumnsEvents>(model, 'onColumnsChanged', rerender);
    useEventEmitter<IEditColumnsEvents>(model, 'onRelatedEntityColumnChanged', () => {
        remountColumnSelector();
        setOpenColumnSelectorOnMount(true);
    });

    return <div className={styles.header}>
        <components.CommandBar items={[]} />
        <div className={styles.selectors}>
            <div>
                <Label>{labels.columnSource}</Label>
                <ScopeSelector />
            </div>
            <div style={{ height: 38 }}>
                {!shouldRemountColumnSelector && <ColumnSelector
                    openMenuOnMount={openColumnSelectorOnMount} />}
            </div>
        </div>
    </div>
}