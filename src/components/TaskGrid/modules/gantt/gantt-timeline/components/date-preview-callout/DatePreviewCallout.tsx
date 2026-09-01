import { Callout, DirectionalHint, ICalloutProps, useTheme } from '@fluentui/react';
import { useMemo } from 'react';
import { getDatePreviewCalloutStyles } from './styles';

export interface IDatePreviewCalloutProps {
    target: ICalloutProps['target'];
    date: string;
}

export const DatePreviewCallout = (props: IDatePreviewCalloutProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getDatePreviewCalloutStyles(theme), [theme]);

    return (
        <Callout
            target={props.target}
            directionalHint={DirectionalHint.bottomLeftEdge}
            directionalHintFixed={false}
            isBeakVisible={false}
            gapSpace={8}
        >
            <div className={styles.root}>{props.date}</div>
        </Callout>
    );
};
