import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IColumn, IDataset, IInternalDataProvider } from '@talxis/client-libraries';
import { IMapGeocoder, IMapPlace } from '../../core/geocoding';

/** How long typing has to pause before a service that takes type-ahead is asked about it. */
const SUGGESTION_DEBOUNCE_MS = 350;

/** Shortest query worth sending to a geo-coding service. */
const MINIMUM_SUGGESTION_LENGTH = 3;

/** Places offered under the box. Enough to choose from, few enough to read. */
const SUGGESTION_LIMIT = 5;

export interface IUseSearch {
    dataset?: IDataset;
    /** Geocoder used for the place suggestions. Without one the box only searches the dataset. */
    geocoder?: IMapGeocoder;
    /** Whether the box also offers places from the geo-coding service. */
    enableAddressSearch: boolean;
    language?: string;
}

export interface ISearchState {
    /** What is currently typed. */
    query: string;
    onQueryChange: (query: string) => void;
    /** Runs the entity's quick find over the bound dataset. */
    onSearch: (query?: string) => void;
    /** Places the geo-coding service matched, for the suggestion list. */
    suggestions: IMapPlace[];
    isSuggesting: boolean;
    /** Columns the entity's quick find searches, so the box can say what it actually looks at. */
    quickFindColumns: IColumn[];
}

/**
 * Owns the map's search box.
 *
 * Two searches share one input: committing a query runs the entity's quick find, which filters the records
 * and so the pins; the geo-coding service also offers places, which move the map without touching the
 * dataset.
 *
 * When the service takes type-ahead the places follow the typing; when it does not - the public Nominatim
 * instance forbids an auto-complete built on it - they follow a submit, the same Enter or search button the
 * quick find already runs on.
 */
export const useSearch = (props: IUseSearch): ISearchState => {
    const { dataset, geocoder, enableAddressSearch, language } = props;
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<IMapPlace[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const datasetQuery = dataset?.getSearchQuery?.() ?? '';
    const suggestionIdRef = useRef(0);
    const suggestionAbortRef = useRef<AbortController>();
    const canSuggest = enableAddressSearch && !!geocoder;
    const suggestsOnType = canSuggest && geocoder?.allowsTypeAhead !== false;

    //a host clearing the query, or another control searching the same dataset, is reflected in the box
    useEffect(() => {
        setQuery(datasetQuery);
    }, [datasetQuery]);

    /** Drops whatever the service was asked, and the answer it already gave. */
    const cancelSuggestions = useCallback(() => {
        //a later answer must not land on an older query, so the id moves whether or not a call is in flight
        ++suggestionIdRef.current;
        suggestionAbortRef.current?.abort();
        suggestionAbortRef.current = undefined;
        setSuggestions((current) => (current.length ? [] : current));
        setIsSuggesting(false);
    }, []);

    const suggestPlaces = useCallback((searched: string) => {
        cancelSuggestions();
        if (!enableAddressSearch || !geocoder || searched.trim().length < MINIMUM_SUGGESTION_LENGTH) {
            return;
        }
        const suggestionId = suggestionIdRef.current;
        const controller = new AbortController();
        suggestionAbortRef.current = controller;
        setIsSuggesting(true);
        geocoder.geocode(searched, { language, limit: SUGGESTION_LIMIT, signal: controller.signal })
            .then((places) => {
                if (suggestionIdRef.current === suggestionId) {
                    setSuggestions(places);
                }
            })
            .catch((error) => {
                //a superseded query aborts its own fetch, which is not a failure worth logging
                if ((error as Error)?.name !== 'AbortError') {
                    console.warn('Map: the address search failed:', error);
                }
            })
            .finally(() => {
                if (suggestionIdRef.current === suggestionId) {
                    setIsSuggesting(false);
                }
            });
    }, [cancelSuggestions, enableAddressSearch, geocoder, language]);

    const onQueryChange = useCallback((next: string) => {
        setQuery(next);
        //places found for a submitted query say nothing about the one being typed over it
        if (!suggestsOnType) {
            cancelSuggestions();
        }
    }, [suggestsOnType, cancelSuggestions]);

    const onSearch = useCallback((searched?: string) => {
        const next = searched ?? '';
        setQuery(next);
        //a service that refuses type-ahead is asked here instead, which is the only place it is asked at all
        if (suggestsOnType) {
            cancelSuggestions();
        } else {
            suggestPlaces(next);
        }
        if (!dataset) {
            return;
        }
        const provider = dataset.getDataProvider() as IInternalDataProvider;
        const run = () => {
            dataset.setSearchQuery?.(next);
            void dataset.refresh();
        };
        //the same guard the dataset control's quick find uses, so unsaved edits are not silently discarded
        if (typeof provider?.executeWithUnsavedChangesBlocker === 'function') {
            provider.executeWithUnsavedChangesBlocker(run);
            return;
        }
        run();
    }, [dataset, suggestsOnType, cancelSuggestions, suggestPlaces]);

    useEffect(() => {
        if (!suggestsOnType) {
            //turning the address search off, or swapping in a service that refuses type-ahead, takes the list away
            if (!canSuggest) {
                cancelSuggestions();
            }
            return;
        }
        const debounce = setTimeout(() => suggestPlaces(query), SUGGESTION_DEBOUNCE_MS);
        return () => clearTimeout(debounce);
    }, [query, canSuggest, suggestsOnType, suggestPlaces, cancelSuggestions]);

    //an unmount must not leave a call running against a service that counts them
    useEffect(() => () => suggestionAbortRef.current?.abort(), []);

    const quickFindColumns = useMemo(() => {
        const provider = dataset?.getDataProvider();
        return typeof provider?.getQuickFindColumns === 'function' ? provider.getQuickFindColumns() : [];
    }, [dataset]);

    return { query, onQueryChange, onSearch, suggestions, isSuggesting, quickFindColumns };
};
