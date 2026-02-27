import { IColumn } from "@talxis/client-libraries";
import { useMemo } from "react";
import { GroupBase, OptionProps } from "react-select";
import { getOptionTextStyles } from "./styles";
import { Text } from "@fluentui/react";

export const OptionText = (props: React.PropsWithChildren<OptionProps<IColumn, boolean, GroupBase<IColumn>>>) => {
    const styles = useMemo(() => getOptionTextStyles(), []);
    
    return <Text className={styles.optionText}>{props.children}</Text>
}