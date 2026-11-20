import { IconButton } from '@fluentui/react';
import { useMemo, useState } from 'react';
import { ITheme } from '@legacy';
import { IMapLegendLabels } from '../labels';
import { getMapLegendStyles } from './styles';

export interface IMapLegendProps {
    /** Markup to show. Already cleaned by the control - a provider never sanitizes. */
    html: string;
    labels: IMapLegendLabels;
    theme: ITheme;
}

/**
 * The legend, over the map.
 *
 * The markup is whatever the host handed the legend module, or the web resource it names, cleaned before it
 * gets here. Its button stays beside the provider picker whether the legend is open or shut, and the panel
 * drops below that row - a legend explains a map rather than replaces it.
 */
export const MapLegend = (props: IMapLegendProps) => {
    const styles = useMemo(() => getMapLegendStyles(props.theme), [props.theme]);
    //shut until asked for - a legend that opens itself covers the pins it explains
    const [isOpen, setIsOpen] = useState(false);

    if (!props.html) {
        return null;
    }

    const label = isOpen ? props.labels.legendCollapse() : props.labels.legend();
    return (
        <div className={styles.root}>
            <IconButton
                className={styles.button}
                iconProps={{ iconName: 'Info' }}
                checked={isOpen}
                aria-expanded={isOpen}
                title={label}
                ariaLabel={label}
                onClick={() => setIsOpen((current) => !current)} />
            {isOpen &&
                <div className={styles.content} dangerouslySetInnerHTML={{ __html: props.html }} />}
        </div>
    );
};
