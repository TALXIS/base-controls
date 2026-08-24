import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
import { ITemplateModule } from "../interfaces";
import { TemplateSelector } from "./template-selector";

/** Options for {@link createTemplateModule}. */
export interface ITemplateModuleOptions {
    /**
     * Where templates are read from, captured to, and expanded into tasks. Typically
     * `new MemoryTemplateDataProvider({ templates, services })`, or your own
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
 * The grid registers it as `templatesModule`, which is how the task provider hears about an expansion.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetTemplatesModule: (services) => createTemplateModule({
 *         provider: new MemoryTemplateDataProvider({ templates, services }),
 *     }),
 * }
 * ```
 */
export const createTemplateModule = (options: ITemplateModuleOptions): ITemplateModule => ({
    provider: options.provider,
    components: { TemplateSelector },
});
