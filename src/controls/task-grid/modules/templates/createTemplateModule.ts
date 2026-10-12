import { ITemplateDataProvider } from "@controls/task-grid/providers/template/TemplateDataProvider";
import { ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { ITaskGridFeature, ITemplateComponents } from "../interfaces";
import { TemplateComponents } from "./moduleComponents";

/** Options for {@link createTemplateModule}. */
export interface ITemplateModuleOptions {
    /**
     * Returns where templates are read from, captured to, and expanded into tasks: typically
     * `new MemoryTemplateDataProvider({ templates, services })`, or your own `ITemplateDataProvider`.
     * Called once per mount.
     */
    onCreateProvider: (params: ITaskGridFactoryParams) => ITemplateDataProvider;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<ITemplateComponents>;
}

/**
 * Builds the templating module: you supply the provider, this brings the UI.
 *
 * Pass it as `features.templates`. The grid registers it as `templatesModule`, which is how the task
 * provider hears about an expansion.
 *
 * @example
 * ```ts
 * features={{
 *     templates: createTemplateModule({
 *         onCreateProvider: ({ services }) => new MemoryTemplateDataProvider({ templates, services }),
 *     }),
 * }}
 * ```
 */
export const createTemplateModule = (options: ITemplateModuleOptions): ITaskGridFeature => ({
    onInitialize: services => {
        const provider = options.onCreateProvider({ services });
        services.register('templatesModule', () => ({
            provider: provider,
            components: { ...TemplateComponents, ...options.components },
        }));
    },
});
