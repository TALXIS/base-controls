import { KeyboardEvent, useMemo } from 'react';
import { ITheme, TextField } from '@legacy';
import { IMapPlace } from '../../../core/geocoding';
import { IMapSearchLabels } from '../labels';
import { getMapSearchBoxStyles } from './styles';

export interface IMapSearchBoxProps {
    query: string;
    /** Places matching what is typed, offered under the box. */
    suggestions: IMapPlace[];
    isSuggesting: boolean;
    /** Names of the columns the entity's quick find searches, for the placeholder. */
    searchedColumnNames: string[];
    labels: IMapSearchLabels;
    theme: ITheme;
    onQueryChange: (query: string) => void;
    /** Runs the entity's quick find over the dataset. */
    onSearch: (query?: string) => void;
    /** Moves the map to a place the geo-coding service offered, without touching the dataset. */
    onSelectPlace: (place: IMapPlace) => void;
}

/**
 * The search box over the map.
 *
 * Committing what is typed filters the records through the entity's quick find; picking one of the offered
 * places moves the map there instead. Both are the same input, because to the person using it "find Brno" is
 * one question whether the answer is a record or a location.
 */
export const MapSearchBox = (props: IMapSearchBoxProps) => {
    const styles = useMemo(() => getMapSearchBoxStyles(props.theme), [props.theme]);

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            props.onSearch(props.query);
        }
    };

    const placeholder = props.searchedColumnNames.length
        ? props.labels.searchPlaceholder({ columns: props.searchedColumnNames.join(', ') })
        : props.labels.searchPlaceholderNoColumns();

    return (
        <div className={styles.root}>
            <TextField
                value={props.query}
                placeholder={placeholder}
                ariaLabel={placeholder}
                styles={{ fieldGroup: styles.fieldGroup }}
                onChange={(event, value) => props.onQueryChange(value ?? '')}
                onKeyUp={onKeyUp}
                {...(props.query ? {
                    deleteButtonProps: {
                        key: 'clear',
                        iconProps: { iconName: 'Cancel' },
                        title: props.labels.searchClear(),
                        onClick: () => props.onSearch('')
                    }
                } : {})}
                suffixItems={[{
                    key: 'search',
                    iconProps: { iconName: 'Search' },
                    title: props.labels.searchRecords(),
                    onClick: () => props.onSearch(props.query)
                }]}
            />
            {(props.suggestions.length > 0 || props.isSuggesting) &&
                <div className={styles.suggestions}>
                    <span className={styles.hint}>{props.labels.searchPlaces()}</span>
                    {props.suggestions.map((place) => (
                        <button
                            key={`${place.label}|${place.coordinates.latitude},${place.coordinates.longitude}`}
                            type='button'
                            className={styles.suggestion}
                            onClick={() => props.onSelectPlace(place)}>
                            {place.label}
                        </button>
                    ))}
                    {props.isSuggesting && !props.suggestions.length &&
                        <span className={styles.hint}>{props.labels.searchLooking()}</span>}
                </div>}
        </div>
    );
};
