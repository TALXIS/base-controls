import { Column, Tab } from "../../../../../components";
import { ITab } from "../../../Form";
import { XrmColumn } from "../xrm-column/XrmColumn";

export const XrmTab = ({ tab, id, label }: { tab: ITab, id: string, label?: string }) => {
    const columns = tab.getColumns();
    
    const getTabLayoutStyle = () => {
        const colWidths = columns.map(c => c.width);

    }

    return <Tab style={{}} key={tab.id} id={tab.id} label={label}>
        {tab.getColumns().map((col, i) => <XrmColumn key={i} column={col} />)}
    </Tab>
}