import { ComponentType } from 'react';

export interface IMapLocation {
    id: string;
    latitude: number;
    longitude: number;
}

export interface IMapProviderProps {
    locations: IMapLocation[];
}

export type IMapProvider = ComponentType<IMapProviderProps>;
