//a Fluent layer leaves an empty span where it renders, which the region's gap would make room for
export const HIDDEN_LAYER_HOSTS = {
    '& > .ms-layer': {
        display: 'none',
    },
};

//the height of the header's parts, as tall as a text field
export const HEADER_PART_HEIGHT = 32;
