import { useTheme, Text } from "@fluentui/react";
import { useMemo } from "react";
import { getErrorMessageStyles } from "./styles";

export const InputErrorMessage = (props: {value?: string}) => {
    const {value} = {...props};
    const theme = useTheme();
    const styles = useMemo(() => getErrorMessageStyles(theme), [])
    if(!value) {
        return <></>
    }
    return <Text className={`TALXIS__errorMessage ${styles.root}`}>{props.value}</Text>
};
