import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
import { ITemplateModule } from "../interfaces";
import { TemplateSelector } from "./template-selector";

/** Options for {@link createTemplateModule}. */
export interface ITemplateModuleOptions {
    /**
     * Where templates are read from, captured to, and expanded into tasks. Typically
     * `new MemoryTemplateDataProvider({ templates, onGetTaskDataProvider })`, or your own
     * `ITemplateDataProvider`. It resolves what a template expands into; the grid's task provider adds
     * those tasks.
     */
    provider: ITemplateDataProvider;
}

/**
 * Builds the templating module: you supply the provider, this brings the UI.
 *
 * Assign it to a `modules` key — `modules.onGetTemplatesModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetTemplatesModule: context => createTemplateModule({
 *         provider: new MemoryTemplateDataProvider({ templates, onGetTaskDataProvider: context.onGetTaskDataProvider }),
 *     }),
 * }
 * ```
 */
export const createTemplateModule = (options: ITemplateModuleOptions): ITemplateModule => ({
    provider: options.provider,
    components: { TemplateSelector },
});
