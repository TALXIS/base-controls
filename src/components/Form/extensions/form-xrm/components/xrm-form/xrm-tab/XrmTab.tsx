import { Column, Tab } from "../../../../../components";
import { ITab } from "../../../Form";

export const XrmTab = ({ tab }: { tab: ITab }) => {
    return <Tab layout={{

    }} key={tab.id} id={tab.id} label={tab.getLocalizedLabel() ?? undefined}>
        {tab.getColumns().map(col => <Column colspan={col.getColspan()}>
            Column
        </Column>)}
    </Tab>
}