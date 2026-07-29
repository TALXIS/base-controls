import { CommandBar } from "@components/DatasetControl/EditColumns/CommandBar/CommandBar";
import { useMemo } from "react";
import { getSortableItemCommandBarStyles } from "./styles";
import { ISortableItemCommandBarProps } from "@components/DatasetControl/EditColumns/components";


export const SortableItemCommandBar = (props: ISortableItemCommandBarProps) => {
    const styles = useMemo(() => getSortableItemCommandBarStyles(), []);
    return <CommandBar styles={{
        root: styles.commandBar
    }} {...props} />
}