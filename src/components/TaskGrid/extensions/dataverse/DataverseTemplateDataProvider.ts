import { FetchXmlDataProvider, IRawRecord, IRecord } from "@talxis/client-libraries";
import { TemplateDataProviderBase } from "@components/TaskGrid/providers";

/**
 * {@link ITemplateDataProvider} implementation for the Dataverse / Talxis platform — templates are
 * loaded through FetchXML like any other Dataverse entity.
 *
 * Capturing a template from a task is **not implemented yet**; `createTemplateFromTask` throws.
 * {@link DataverseTaskGridDescriptor} therefore does not wire this provider up, which leaves
 * templating switched off for the Dataverse extension.
 */
export class DataverseTemplateDataProvider extends TemplateDataProviderBase(FetchXmlDataProvider) {
    protected onCreateTemplateFromTask(task: IRecord): Promise<IRawRecord | null> {
        throw new Error("Method not implemented.");
    }
}
