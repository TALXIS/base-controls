import { useMemo } from "react"
import { Label, useTheme } from "@fluentui/react";
import { ScopeSelector } from "../scope-selector/ScopeSelector";
import { ColumnSelector } from "../column-selector/ColumnSelector";
import { getHeaderStyles } from "./styles";
import { useEditColumnsLabels, useEditColumnsProps } from "../../context";


export const Header = () => {
    const theme = useTheme();
    const styles = useMemo(() => getHeaderStyles(theme), []);
    const labels = useEditColumnsLabels();
    const { isScopeSelectorVisible } = useEditColumnsProps();

    return <div className={styles.header}>
        <div className={styles.selectors}>
            {isScopeSelectorVisible &&
                <div>
                    <Label>{labels.columnSource}</Label>
                    <ScopeSelector />
                </div>
            }
            <div >
                <ColumnSelector />
            </div>
        </div>
    </div>
}