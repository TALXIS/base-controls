import { Checkbox, IconButton } from '@fluentui/react';
import { useMemo, useState } from 'react';
import { ITheme } from '@legacy';
import { IMapFilterFacet, IMapFilterSelection, isMapFilterSelectionEmpty } from '../mapFilters';
import { IMapFilterLabels } from '../labels';
import { getMapFilterPanelStyles } from './styles';

export interface IMapFilterPanelProps {
    facets: IMapFilterFacet[];
    selection: IMapFilterSelection;
    labels: IMapFilterLabels;
    theme: ITheme;
    /** Adds or removes one value from the selection. */
    onToggle: (attribute: string, value: string) => void;
    onClear: () => void;
}

/**
 * Filters the pins by the values their records actually hold.
 *
 * Values within one attribute widen the result and attributes narrow it, which is what clicking through
 * facets on a map is for: "depots or stores, in Brno". Each value carries how many records have it.
 */
export const MapFilterPanel = (props: IMapFilterPanelProps) => {
    const styles = useMemo(() => getMapFilterPanelStyles(props.theme), [props.theme]);
    const [isOpen, setIsOpen] = useState(false);
    const pickedCount = Object.values(props.selection).reduce((total, values) => total + values.length, 0);

    if (!props.facets.length) {
        return null;
    }

    if (!isOpen) {
        return (
            <IconButton
                iconProps={{ iconName: 'Filter' }}
                title={props.labels.filters()}
                ariaLabel={props.labels.filters()}
                checked={pickedCount > 0}
                styles={{
                    root: {
                        borderRadius: props.theme.effects.roundedCorner4,
                        boxShadow: props.theme.effects.elevation8,
                        backgroundColor: props.theme.semanticColors.bodyBackground
                    }
                }}
                onClick={() => setIsOpen(true)} />
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <span>{pickedCount ? props.labels.filtersActive({ count: `${pickedCount}` }) : props.labels.filters()}</span>
                <span>
                    {!isMapFilterSelectionEmpty(props.selection) &&
                        <IconButton
                            iconProps={{ iconName: 'ClearFilter' }}
                            title={props.labels.filtersClear()}
                            ariaLabel={props.labels.filtersClear()}
                            onClick={props.onClear} />}
                    <IconButton
                        iconProps={{ iconName: 'ChromeClose' }}
                        title={props.labels.filtersClose()}
                        ariaLabel={props.labels.filtersClose()}
                        onClick={() => setIsOpen(false)} />
                </span>
            </div>
            <div className={styles.body}>
                {props.facets.map((facet) => (
                    <div key={facet.attribute} className={styles.facet}>
                        <span className={styles.facetLabel}>{facet.label}</span>
                        {facet.options.map((option) => (
                            <div key={option.value} className={styles.option}>
                                <Checkbox
                                    label={option.label}
                                    checked={(props.selection[facet.attribute] ?? []).includes(option.value)}
                                    onChange={() => props.onToggle(facet.attribute, option.value)} />
                                <span className={styles.count}>{option.count}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
