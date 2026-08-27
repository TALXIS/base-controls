import { Liquid } from "liquidjs";

export interface ILocalizationService<T> {
    getLocalizedString: (key: keyof T, variables?: {[key: string]: string}) => string;
}

const LIQUID = new Liquid();

export class LocalizationService<T extends { [K in keyof T]: string }> implements ILocalizationService<T> {
    private _labels: T;

    constructor(labels: T) {
        this._labels = labels;
    }

    public getLocalizedString(key: keyof T, variables?: {[key: string]: string}): string {
        if(variables) {
            return LIQUID.parseAndRenderSync(this._labels[key] as unknown as string, variables);
        }
        return this._labels[key];
    }
}