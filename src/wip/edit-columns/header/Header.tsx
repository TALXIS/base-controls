import { useMemo, useState } from "react"
import { Label, useTheme } from "@fluentui/react";
import { ScopeSelector } from "../scope-selector/ScopeSelector";
import { ColumnSelector } from "../column-selector/ColumnSelector";
import { useEditColumns } from "../useEditColumns";
import { useRerender } from "@talxis/react-components";
import { getHeaderStyles } from "./styles";
import { useShouldRemount } from "../../../hooks/useShouldRemount";
import { IEditColumnsEvents } from "../../../utils/edit-columns";
import { useEventEmitter } from "../../../hooks";


export const Header = () => {
    const theme = useTheme();
    const styles = useMemo(() => getHeaderStyles(theme), []);
    const labels = useEditColumns().functions.getLabels();
    const [shouldRemountColumnSelector, remountColumnSelector] = useShouldRemount();
    const [openColumnSelectorOnMount, setOpenColumnSelectorOnMount] = useState(false);
    const {model, components, showScopeSelector} = useEditColumns();
    const rerender = useRerender();

    useEventEmitter<IEditColumnsEvents>(model, 'onColumnsChanged', rerender);
    useEventEmitter<IEditColumnsEvents>(model, 'onRelatedEntityColumnChanged', () => {
        remountColumnSelector();
        setOpenColumnSelectorOnMount(true);
    });

    return <div className={styles.header}>
        <components.CommandBar items={[]} />
        <div className={styles.selectors}>
            {showScopeSelector && (
                <div>
                    <Label>{labels["column-source"]}</Label>
                    <ScopeSelector />
                </div>
            )}
            <div style={{ height: 38 }}>
                {!shouldRemountColumnSelector && <ColumnSelector
                    openMenuOnMount={openColumnSelectorOnMount} />}
            </div>
        </div>
    </div>
}