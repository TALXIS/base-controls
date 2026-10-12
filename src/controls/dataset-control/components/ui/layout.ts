export const HEADER_CONTAINER = 'datasetControlHeader';
//below this width of the header, the search fills its line
export const COMPACT_WIDTH = 480;

export const compactQuery = (container: string) => `@container ${container} (max-width: ${COMPACT_WIDTH}px)`;

//a Fluent layer leaves an empty span where it renders, which the region's gap would make room for
export const HIDDEN_LAYER_HOSTS = {
    '& > .ms-layer': {
        display: 'none',
    },
};
