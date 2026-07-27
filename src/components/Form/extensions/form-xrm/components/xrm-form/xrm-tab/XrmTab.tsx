import React from "react";
import { Column, Tab } from "../../../../../components";
import { IFormXmlTab } from "../../../FormXmlForm";
import { getXrmTabGridTemplateColumns } from "./getXrmTabGridTemplateColumns";
import { XrmSection } from "../xrm-section";
import { useTab } from "./useTab";


export const XrmTab = ({ tab, id, label }: { tab: IFormXmlTab, id: string, label?: string }) => {
    tab = useTab(tab);
    const columns = tab.getColumns();
    const [gridTemplateColumnsOverride, setGridTemplateColumnsOverride] = React.useState<string>();

    const onColumnsPerRowChanged = React.useCallback((newColumnsPerRow: number) => {
        setGridTemplateColumnsOverride(getXrmTabGridTemplateColumns(columns, newColumnsPerRow));
    }, [columns]);

    return <Tab onColumnsPerRowChanged={onColumnsPerRowChanged} style={{ gridTemplateColumns: gridTemplateColumnsOverride }} key={tab.id} id={tab.id} label={tab.getLabel() ?? undefined}>
        {columns.map((col, i) => <Column key={i}>
            {col.getVisibleSections().map((section, i) => <XrmSection key={section.id ?? i} section={section} />)}
        </Column>)}
    </Tab>
}