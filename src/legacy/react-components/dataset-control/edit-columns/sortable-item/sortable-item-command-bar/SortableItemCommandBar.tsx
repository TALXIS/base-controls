import { CommandBar } from "@controls/dataset-control/edit-columns/command-bar/CommandBar";
import { useMemo } from "react";
import { getSortableItemCommandBarStyles } from "./styles";
import { ISortableItemCommandBarProps } from "@controls/dataset-control/edit-columns/components";


export const SortableItemCommandBar = (props: ISortableItemCommandBarProps) => {
    const styles = useMemo(() => getSortableItemCommandBarStyles(), []);
    return <CommandBar styles={{
        root: styles.commandBar
    }} {...props} />
}