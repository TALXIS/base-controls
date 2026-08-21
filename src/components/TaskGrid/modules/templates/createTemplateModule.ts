import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
import { ITemplateModule } from "../interfaces";
import { TemplateSelector } from "./template-selector";

export interface ITemplateModuleOptions {
    /**
     * Where templates are read from and captured to. Typically
     * `new MemoryTemplateDataProvider({ templates })`, or your own `ITemplateDataProvider`.
     */
    provider: ITemplateDataProvider;
}

/**
 * Everything the templating feature needs, in one call: you supply the provider, this brings the UI.
 *
 * Return it from the descriptor's `onGetModules` to switch templating on. Importing this function is
 * what puts the template picker in your bundle, so a grid that never registers the module does not
 * carry it.
 *
 * ```ts
 * onGetModules: () => ({
 *     templates: createTemplateModule({
 *         provider: new MemoryTemplateDataProvider({ templates }),
 *     }),
 * })
 * ```
 */
export const createTemplateModule = (options: ITemplateModuleOptions): ITemplateModule => ({
    provider: options.provider,
    //the only place the picker is named: the hosts retrieve it rather than importing it
    components: { TemplateSelector },
});
