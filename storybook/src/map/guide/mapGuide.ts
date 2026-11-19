import { createGuide } from '../../grid/showcase/Guide'

type MapStage = 'Basics' | 'Make it yours' | 'Your data' | 'Advanced'

export const { GuideProgress, GuideNavigation, GuideMap } = createGuide<MapStage>({
    name: 'Map guide',
    idPrefix: 'controls-map-guide',
    stages: [
        { name: 'Basics', iconName: 'Education', promise: 'Put a map of the capitals on your page that fits its space, over the tiles you pick.' },
        { name: 'Make it yours', iconName: 'Color', promise: 'Draw pins and popups that tell the trip: colours, a postcard and a boarding pass.' },
        { name: 'Your data', iconName: 'Database', promise: 'Let your records decide the pins, filtered by your code or by a DatasetControl.' },
        { name: 'Advanced', iconName: 'Code', promise: 'Drive the map from your code, and draw it with a library of your own.' },
    ],
    steps: [
        { stage: 'Basics', title: 'Your first map', text: 'The capitals as pins: a provider, the columns that hold each position, and where the map looks.' },
        { stage: 'Basics', title: 'Make it fit', text: 'A map that fills the space its parent gives it, or takes a height of its own.' },
        { stage: 'Basics', title: 'Pick the tiles', text: 'Leaflet over the tiles you choose, or Google Maps under your key.' },
        { stage: 'Make it yours', title: 'Pins coloured by region', text: 'Pins of your own that read their record: a colour per region, a star on the largest capitals.' },
        { stage: 'Make it yours', title: 'A postcard for each capital', text: 'A popup composed from the popup parts and the shared field parts.' },
        { stage: 'Make it yours', title: 'A boarding pass from Prague', text: 'A popup all your own, drawn from the pin\'s record and the map.' },
        { stage: 'Your data', title: 'The EU through the years', text: 'Filter the provider to change the pins, and draw your own components in the map\'s box.' },
        { stage: 'Your data', title: 'A trip planner', text: 'The map as the body of a DatasetControl, with views, search, a ribbon and Edit columns.' },
        { stage: 'Advanced', title: 'A tour from west to east', text: 'Reach the map from your code: move its view, and use the library\'s own map.' },
        { stage: 'Advanced', title: 'A library of your own', text: 'Draw the map with another library, through Map and a library module.' },
    ],
    reference: { title: 'Reference', text: 'Every prop, member, React hook and slot of the map.', iconName: 'Table', href: '?path=/docs/controls-map-reference--overview' },
})
