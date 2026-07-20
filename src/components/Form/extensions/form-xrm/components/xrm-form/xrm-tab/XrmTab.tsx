import React from "react";
import { Column, Tab } from "../../../../../components";
import { ITab } from "../../../Form";
import { getXrmTabGridTemplateColumns } from "./getXrmTabGridTemplateColumns";
import { XrmSection } from "../xrm-section";
import { useEventEmitter } from "../../../../../../../hooks";
import { useRerender } from "@talxis/react-components";

export const XrmTab = ({ tab, id, label }: { tab: ITab, id: string, label?: string }) => {
    const columns = tab.getColumns();
    const [gridTemplateColumnsOverride, setGridTemplateColumnsOverride] = React.useState<string>();
    const rerender = useRerender();
    useEventEmitter(tab.events, ['onSectionSetVisible', 'onLabelSet'], rerender)

    const onColumnsPerRowChanged = React.useCallback((newColumnsPerRow: number) => {
        setGridTemplateColumnsOverride(getXrmTabGridTemplateColumns(columns, newColumnsPerRow));
    }, [columns]);

    return <Tab onColumnsPerRowChanged={onColumnsPerRowChanged} style={{ gridTemplateColumns: gridTemplateColumnsOverride }} key={tab.id} id={tab.id} label={label}>
        {columns.map((col, i) => <Column key={i}>
            {col.getVisibleSections().map((section, i) => <XrmSection key={section.id ?? i} section={section} />)}
        </Column>)}
    </Tab>
}