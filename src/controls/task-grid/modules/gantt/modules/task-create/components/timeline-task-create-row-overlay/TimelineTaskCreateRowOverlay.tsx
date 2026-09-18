import { useMemo } from 'react';
import { Overlay, useTheme } from '@fluentui/react';
import { getTimelineTaskCreateRowOverlayStyles } from './styles';

export interface ITimelineTaskCreateRowOverlayProps {
    top: number;
    height: number;
}

export const TimelineTaskCreateRowOverlay = (props: ITimelineTaskCreateRowOverlayProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getTimelineTaskCreateRowOverlayStyles(theme), [theme]);
    
    const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    };

    return (
        <Overlay
            className={styles.root}
            style={{ top: props.top, height: props.height }}
            onContextMenu={onContextMenu}
        />
    );
};
