import { IDefaultTranslations, ITranslation, useControlLabels } from '@hooks/useControlLabels';
import { ITranslations } from '@interfaces/context';
import { IMapModuleContext } from './interfaces';

/** The overrides a module accepts for its strings: any subset of them, per language. */
export type IMapModuleTranslations<TLabels> = Partial<ITranslations<TLabels>>;

/** A module's strings resolved for the current language. */
export type IMapModuleLabels<TLabels> = Required<ITranslation<IMapModuleTranslations<TLabels>>>;

/**
 * Resolves a module's strings for the user's language, the same way the control resolves its own. Every
 * module carries its own defaults next to the UI that shows them, and takes overrides through its options.
 */
export const useModuleLabels = <TLabels extends IDefaultTranslations>(
    context: IMapModuleContext,
    defaults: TLabels,
    overrides?: IMapModuleTranslations<TLabels>
): IMapModuleLabels<TLabels> =>
    useControlLabels<IMapModuleTranslations<TLabels>>({
        languageId: context.context.userSettings.languageId,
        translations: overrides,
        defaultTranslations: defaults
    });
