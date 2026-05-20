import { FetchXmlBuilder, FetchXmlDataProvider, IRecord } from "@talxis/client-libraries";

interface IProjectDataProviderParams {
    projectEntityName: string;
    primaryNameAttribute: string;
    primaryIdAttributeName: string;
    projectId: string;
}

export interface IProjectDataProvider extends FetchXmlDataProvider {
    getProjectRecord(): IRecord;
}

const _getFetchXml = (projectEntityName: string, projectId: string, primaryNameAttribute: string, primaryIdAttributeName: string): string => {
    const entity = new FetchXmlBuilder.entity(projectEntityName);
    entity.addAttribute(new FetchXmlBuilder.attribute(primaryIdAttributeName));
    entity.addAttribute(new FetchXmlBuilder.attribute(primaryNameAttribute));
    entity.addFilter(new FetchXmlBuilder.filter('and', [
        new FetchXmlBuilder.condition(primaryIdAttributeName, 'eq', [new FetchXmlBuilder.value(projectId)])
    ]));
    return new FetchXmlBuilder.fetch(entity).toXml();
}

export class ProjectDataProvider extends FetchXmlDataProvider implements IProjectDataProvider {
    constructor(params: IProjectDataProviderParams) {
        super({
            fetchXml: _getFetchXml(params.projectEntityName, params.projectId, params.primaryNameAttribute, params.primaryIdAttributeName)
        })
    }

    public getProjectRecord(): IRecord {
        if (this.getRecords().length === 0) {
            throw new Error("Project record does not exist. Have you called refresh() on the provider?");
        }
        return this.getRecords()[0];
    }
}