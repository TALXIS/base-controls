import { useComponentProps } from "../useComponentProps";
import { Text } from '@fluentui/react';

export const DefaultContentRenderer = () => {
    const componentProps = useComponentProps();
    return <Text {...componentProps.textProps}>
        {componentProps.textProps.children}
    </Text>
}