import { useMemo } from 'react';
import { useTheme } from '@fluentui/react';
import { getMarkerStyles } from './styles';
import { Formatting } from '@talxis/client-libraries';
import { IMarkerComponents, MarkerComponents } from './components';
import { IGanttMarker } from '../../../gantt-markers';

export interface IMarkerProps extends IGanttMarker {
    innerProps?: React.HtmlHTMLAttributes<HTMLDivElement>;
    components?: Partial<IMarkerComponents>;
}

export const Marker = (props: IMarkerProps) => {
    const { text, start_date, type, innerProps } = props;
    const theme = useTheme();
    const color = props.color ?? theme.palette.themePrimary;
    const styles = useMemo(() => getMarkerStyles(theme, color), [theme, color]);
    const components = { ...MarkerComponents, ...props.components };
    const formatting = Formatting.Get();
    const id = useMemo(() => `gantt_marker_${props.id}`, [props.id]);
    const tooltipContent = formatting.formatDateShort(start_date) ?? '';

    return components.onRenderContainer({
        ...innerProps,
        children: components.onRenderTooltipHost({
            id: id,
            content: tooltipContent,
            children: components.onRenderContent({ className: styles.root, children: text })
        })
    });
};
