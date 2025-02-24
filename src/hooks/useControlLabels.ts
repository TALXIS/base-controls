import { Liquid } from "liquidjs";
import { merge } from "merge-anything";
import { useMemo } from "react";

export type ITranslation<T> = {
    [Property in keyof Required<T>]: (variables?: any) => string
};

export interface IDefaultTranslations {
    [LCID: number]: string | string[];
    [key: string]: any;
}

interface ILabelsOptions<TTranslations> {
    languageId: number;
    translations?: TTranslations;
    defaultTranslations?: IDefaultTranslations;
}
export const useControlLabels = <TTranslations>(options: ILabelsOptions<TTranslations>): Required<ITranslation<TTranslations>>  => {
    const { languageId, translations, defaultTranslations } = options;
    const liquid = useMemo(() => new Liquid(), []);
    const labels = useMemo(() => {
        const mergedTranslations = merge(defaultTranslations ?? {}, translations ?? {}) as TTranslations;
        return new Proxy(mergedTranslations as any, {
            get(target, key) {
                return (variables: any) => getLabel(key as string, mergedTranslations, variables)
            }
        }) as any;
    }, []);

    const getLabel = (key: string, translations: TTranslations, variables?: any): string | string[] => {
        const strigify = (value: string | string[]) => {
            if (typeof value === 'string') {
                return value;
            }
            return JSON.stringify(value);
        };
        //@ts-ignore
        const translation = translations[key];
        if (!translation) {
            console.error(`Translation for the ${key} label of the ${name} control has not been defined!`);
            return key;
        }
        if (typeof translation === 'string' || Array.isArray(translation)) {
            return strigify(translation);
        }
        let label = translation[languageId];
        if (!label) {
            console.info(`Translation for the ${key} label of the ${name} control has not been found. Using default Czech label instead.`);
            label = translation[1029];
        }
        if (!label) {
            console.error(`Translation for the ${key} label of the ${name} control does not exists neither for Czech language and current LCID.`);
            label = key;
        }

        return liquid.parseAndRenderSync(strigify(label), variables);
    };
    return labels;
}