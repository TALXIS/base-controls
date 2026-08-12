import { Icon } from "@fluentui/react";
import React from "react";
import { getColorfulOptionStyles } from "./styles";
import { Text } from "@fluentui/react";

export interface IColorfulOption {
    label: string;
    color?: string;
}

export const ColorfulOption = (props: IColorfulOption) => {
    const styles = React.useMemo(() => getColorfulOptionStyles(), []);
    const color = props.color ?? 'transparent';
    return (
        <div className={styles.colorfulOptionWrapper}>
            <Icon
                className={styles.cicrleIconStyle}
                styles={{ root: { color: color } }}
                iconName={'CircleFill'}
                aria-hidden="true" />
            <Text className={styles.optionText}>{props.label}</Text>
        </div>
    )
};