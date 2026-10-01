import { useMemo, useState } from "react";
import { IControlNotificationAction } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { Callout, NotificationCard } from "@ui";
import type { IGridLegacyClientApiCompatibility, IGridLegacyClientApiCompatibilityEvents } from "../../GridLegacyClientApiCompatibility";
import { getNotificationCalloutHostStyles } from "./styles";

export interface INotificationCalloutHostProps {
    compatibility: IGridLegacyClientApiCompatibility;
}

/** Shows the notification a cell has open, with what can be done about it. */
export const NotificationCalloutHost = (props: INotificationCalloutHostProps) => {
    const { compatibility } = props;
    const styles = useMemo(() => getNotificationCalloutHostStyles(), []);
    const [notification, setNotification] = useState(compatibility.getOpenNotification());

    useEventEmitter<IGridLegacyClientApiCompatibilityEvents>(compatibility.events, ['onNotificationOpened', 'onNotificationClosed'], (() => setNotification(compatibility.getOpenNotification())) as IGridLegacyClientApiCompatibilityEvents['onNotificationOpened']);

    if (!notification) {
        return null;
    }

    const runAction = (action: IControlNotificationAction) => {
        compatibility.closeNotification();
        action.actions.forEach(callback => callback());
    };

    return <Callout
        target={compatibility.getOpenTarget()}
        className={styles.callout}
        calloutMaxWidth={360}
        onDismiss={() => compatibility.closeNotification()}>
        <NotificationCard
            title={notification.text}
            message={notification.messages?.[0]}
            actions={(notification.actions ?? []).map((action, index) => ({
                key: `${index}`,
                text: action.message ?? '',
                iconName: action.iconName,
                onClick: () => runAction(action),
            }))} />
    </Callout>;
};
