import { Liquid } from "liquidjs";

export interface ILocalizationService<T> {
    getLocalizedString: (key: keyof T, variables?: {[key: string]: string}) => string;
}

export class LocalizationService<T extends { [K in keyof T]: string }> implements ILocalizationService<T> {
    private _labels: T;
    private _liquidEngine: Liquid;

    constructor(labels: T) {
        this._labels = labels;
        this._liquidEngine = new Liquid();
    }

    public getLocalizedString(key: keyof T, variables?: {[key: string]: string}): string {
        if(variables) {
            return this._liquidEngine.parseAndRenderSync(this._labels[key] as unknown as string, variables);
        }
        return this._labels[key];
    }
}