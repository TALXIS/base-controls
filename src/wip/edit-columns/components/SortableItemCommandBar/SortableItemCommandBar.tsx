import { CommandBar } from "../../components/CommandBar/CommandBar";
import { useMemo } from "react";
import { getSortableItemCommandBarStyles } from "./styles";
import { ISortableItemCommandBarProps } from "../components";


export const SortableItemCommandBar = (props: ISortableItemCommandBarProps) => {
    const styles = useMemo(() => getSortableItemCommandBarStyles(), []);
    return <CommandBar styles={{
        root: styles.commandBar
    }} {...props} />
}