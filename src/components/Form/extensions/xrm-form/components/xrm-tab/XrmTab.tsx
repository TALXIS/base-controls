import React from "react";
import { Form } from "@components/Form/components/Form";
import { IFormXmlTab } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
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

    return <Form.Tab onColumnsPerRowChanged={onColumnsPerRowChanged} style={{ gridTemplateColumns: gridTemplateColumnsOverride }} key={tab.id} id={tab.id} label={tab.getLabel() ?? undefined}>
        {columns.map((col, i) => <Form.Column key={i} dataId={`column-${tab.id ?? id}-${i}`}>
            {col.getVisibleSections().map((section, i) => <XrmSection key={section.id ?? i} section={section} />)}
        </Form.Column>)}
    </Form.Tab>
}