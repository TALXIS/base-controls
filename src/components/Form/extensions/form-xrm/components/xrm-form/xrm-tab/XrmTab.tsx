import React from "react";
import { Column, Section, Tab } from "../../../../../components";
import { ITab } from "../../../Form";
import { getXrmTabGridTemplateColumns } from "./getXrmTabGridTemplateColumns";

export const XrmTab = ({ tab, id, label }: { tab: ITab, id: string, label?: string }) => {
    const columns = tab.getColumns();
    const [gridTemplateColumnsOverride, setGridTemplateColumnsOverride] = React.useState<string>();

    const onColumnsPerRowChanged = React.useCallback((newColumnsPerRow: number) => {
        setGridTemplateColumnsOverride(getXrmTabGridTemplateColumns(columns, newColumnsPerRow));
    }, [columns]);

    return <Tab onColumnsPerRowChanged={onColumnsPerRowChanged} style={{ gridTemplateColumns: gridTemplateColumnsOverride }} key={tab.id} id={tab.id} label={label}>
        {columns.map((col, i) => <Column key={i}>
            {col.getSections().map((section, i) => <Section key={i}
                cellLabelPosition={section.celllabelposition}
                showLabel={section.showlabel}
                labelWidth={section.labelwidth}
                label={section.getLocalizedLabel() ?? undefined} />)
            }
        </Column>)}
    </Tab>
}