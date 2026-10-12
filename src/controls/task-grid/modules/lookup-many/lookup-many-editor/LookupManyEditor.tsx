import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { EditingCell, Grid, IEditingCellEditorComponents, IGridCellParams } from "@controls/grid";
import { LookupManyControl } from "../lookup-many-control";
import { getLookupManyEditorStyles } from "./styles";

const COMPONENTS: IEditingCellEditorComponents = {
    columnControl: { onRenderControl: props => <LookupManyControl {...props} /> },
};

/** A lookup-many column's cell while it is being edited: the picker, over the cell. */
export const LookupManyEditor = (props: IGridCellParams) => {
    const theme = useTheme();
    const width = props.column?.getActualWidth() ?? 0;
    const styles = useMemo(() => getLookupManyEditorStyles(theme, width), [theme, width]);

    return <div className={styles.root}>
        <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
            <EditingCell.Editor {...props} components={COMPONENTS} />
        </Grid.Cell.Field>
    </div>;
};
