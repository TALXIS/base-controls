import { useMemo } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { useGridModule } from "../../../grid/useGridModule";
import { ICellRendererComponents } from "../../../grid/adapters/cells/cell-renderer/components";
import { CellFieldRenderer } from "../../../grid/adapters/cells/field-cell-renderer/CellFieldRenderer";
import { GridValueRenderer, IGridValueRenderer } from "@fields/value-renderer";
import { getNameCellStyles } from "./styles";

const NameValue = (props: IGridValueRenderer) => {
    const checkList = useGridModule('checkList');
    const styles = useMemo(() => getNameCellStyles(), []);
    const isCompleted = checkList.isCompleted(props.parameters.Record.raw);

    return <GridValueRenderer {...props} className={isCompleted ? styles.completed : undefined} />;
};

const COMPONENTS: ICellRendererComponents = {
    columnControl: { onRenderControl: props => <NameValue {...props} /> },
};

/** The cell of an item's name, struck through once the item is finished. */
export const NameCell = (props: ICellRendererParams) => <CellFieldRenderer {...props} components={COMPONENTS} />;
