import { useMemo } from "react";
import { Icon, Text, useTheme } from "@fluentui/react";
import type { IEntityReference } from "@talxis/client-libraries";
import type { IChecklistItemData } from "../../../Checklist";
import { getChecklistProgressStyles } from "./styles";

export interface IChecklistProgressProps {
    items: IEntityReference<IChecklistItemData>[];
}

/** How far a checklist has got, as `done/total`; nothing for no items. */
export const ChecklistProgress = (props: IChecklistProgressProps) => {
    const { items } = props;
    const theme = useTheme();
    const styles = useMemo(() => getChecklistProgressStyles(theme), [theme]);

    if (items.length === 0) {
        return null;
    }
    const completedCount = items.filter(item => item.data?.isCompleted).length;
    return <div className={styles.root}>
        <Icon iconName='Completed' className={completedCount === items.length ? styles.completedIcon : styles.icon} />
        <Text>{completedCount}/{items.length}</Text>
    </div>;
};
