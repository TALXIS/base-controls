import { useMemo, useState } from "react"
import { getHeaderStyles } from "./styles";
import { Label, useTheme } from "@fluentui/react";
import { ScopeSelector } from "../ScopeSelector/ScopeSelector";
import { useModel } from "../../useModel";
import { ColumnSelector } from "../ColumnSelector/ColumnSelector";
import { useEditColumns } from "../useEditColumns";
import { useShouldRemount } from "../../../../hooks/useShouldRemount";
import { useEventEmitter } from "../../../../hooks";
import { IEditColumnsEvents } from "../../../../utils/dataset-control/EditColumns";
import { useRerender } from "@talxis/react-components";


export const Header = () => {
    const theme = useTheme();
    const styles = useMemo(() => getHeaderStyles(theme), []);
    const labels = useModel().getLabels();
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
                    <Label>{labels["column-source"]()}</Label>
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