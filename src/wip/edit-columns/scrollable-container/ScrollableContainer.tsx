import { useMemo } from "react";
import { useEditColumns } from "../useEditColumns";
import { IEditColumnsEvents } from "../../../utils/edit-columns";
import { useEventEmitter } from "../../../hooks";
import { ScrollableContainer as ScrollableContainerBase } from "../../panel/components/ScrollableContainer/ScrollableContainer";

export const ScrollableContainer = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    const { model } = useEditColumns();
    const containerId = useMemo(() => `scrollable_container_${crypto.randomUUID()}`, []);

    useEventEmitter<IEditColumnsEvents>(model, 'onColumnAdded', () => {
        const containerElement = document.getElementById(containerId);
        containerElement?.scrollTo({ top: 0 })
    });

    return <ScrollableContainerBase id={containerId} {...props} />
}
