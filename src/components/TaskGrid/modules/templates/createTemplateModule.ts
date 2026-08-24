import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
import { ITemplateModule } from "../interfaces";
import { TemplateSelector } from "./template-selector";

/** Options for {@link createTemplateModule}. */
export interface ITemplateModuleOptions {
    /**
     * Where templates are read from and captured to. Typically
     * `new MemoryTemplateDataProvider({ templates })`, or your own `ITemplateDataProvider`.
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
 *     onGetTemplatesModule: () => createTemplateModule({
 *         provider: new MemoryTemplateDataProvider({ templates }),
 *     }),
 * }
 * ```
 */
export const createTemplateModule = (options: ITemplateModuleOptions): ITemplateModule => ({
    provider: options.provider,
    components: { TemplateSelector },
});
