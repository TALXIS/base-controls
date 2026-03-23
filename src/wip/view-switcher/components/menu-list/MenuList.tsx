import { IContextualMenuListProps } from "@fluentui/react";
import { useMemo } from "react";
import { getMenuListStyles } from "./styles";
import { useViewSwitcherLabels } from "../../context";
import { MenuSection } from "../menu-section/MenuSection";

const USER_VIEW_GROUP_KEY = 'userViews';
const SYSTEM_VIEW_GROUP_KEY = 'systemViews';
const ACTION_GROUP_KEY = 'actions';

export const MenuList = (props: IContextualMenuListProps | undefined) => {
    const myViewItems = props?.items.filter(item => item['data-group-key'] === USER_VIEW_GROUP_KEY) ?? [];
    const systemViewItems = props?.items.filter(item => item['data-group-key'] === SYSTEM_VIEW_GROUP_KEY) ?? [];
    const actionItems = props?.items.filter(item => item['data-group-key'] === ACTION_GROUP_KEY) ?? [];
    const styles = useMemo(() => getMenuListStyles(), []);
    const labels = useViewSwitcherLabels();

    return <div className={styles.menuCallout}>
        {myViewItems.length > 0 && <MenuSection label={labels.userViews} items={myViewItems} iconName="Contact" itemRenderer={props?.defaultMenuItemRenderer as any} />}
        {systemViewItems.length > 0 && <MenuSection label={labels.systemViews} items={systemViewItems} iconName="ViewList" itemRenderer={props?.defaultMenuItemRenderer as any} />}
        {actionItems.length > 0 && <MenuSection items={actionItems} itemRenderer={props?.defaultMenuItemRenderer as any} />}
    </div>
}