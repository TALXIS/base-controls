import { Liquid } from "liquidjs";
import type { ILabelSet } from "./defineLabels";
import type { ILabels, Labels } from "./types";

const LIQUID = new Liquid();

/** Resolves every component's strings from one set of labels. */
export class LocalizationService {
    private _labels: Labels;

    constructor(labels: Labels = {}) {
        this._labels = labels;
    }

    /** The strings of one set, falling back to its defaults. */
    public getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T> {
        return {
            get: (key: string, variables?: Record<string, string | number>) => {
                const template = this._labels[key] ?? set.defaults[key];
                return variables ? LIQUID.parseAndRenderSync(template, variables) : template;
            },
        } as ILabels<T>;
    }

    /** A service with `labels` laid over these. */
    public merge(labels: Labels): LocalizationService {
        return new LocalizationService({ ...this._labels, ...labels });
    }
}
