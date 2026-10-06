import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";
import { CELL_CONTAINER_CLASS_NAME } from "../../components/cells/ui/container/styles";

export const getGridRowSelectionStyles = (theme: ITheme): IStyle => ({
    //drawn as an overlay over the cells
    '.ag-root-wrapper': {
        '--ag-selected-row-background-color': 'transparent',
    },
    //in the grid's accent
    [`.ag-row-selected .${CELL_CONTAINER_CLASS_NAME}::after`]: {
        backgroundColor: `color-mix(in srgb, ${theme.palette.themePrimary}, transparent 80%)`,
    },
});
