import { IPublishedPcfInputs } from './publishedPcfAssets'

const ENTITY = { target: 'account', tag: 'talxis_tag', instance: 'talxis_taginstance' } as const
const FIELD = { id: 'talxis_tagid', name: 'talxis_name', color: 'talxis_color', instanceId: 'talxis_taginstanceid' } as const

export const initialTagPickerValue = JSON.stringify([
    {
        [FIELD.instanceId]: '40000000-0000-4000-8000-000000000001',
        [FIELD.id]: { [FIELD.id]: '30000000-0000-4000-8000-000000000001', [FIELD.name]: 'Priority', [FIELD.color]: '#D13438' },
    },
    {
        [FIELD.instanceId]: '40000000-0000-4000-8000-000000000002',
        [FIELD.id]: { [FIELD.id]: '30000000-0000-4000-8000-000000000002', [FIELD.name]: 'Customer', [FIELD.color]: '#107C10' },
    },
])

export function createTagPickerData(parent: ComponentFramework.Context<IPublishedPcfInputs>) {
    const strings: Record<string, string> = {
        tag: 'Tag',
        initializationErrorMessage: 'Something went wrong during initialization.',
        refreshErrorMessage: 'Something went wrong during refresh.',
        onSearchErrorMessage: 'Something went wrong during searching tags.',
        onSelectErrorMessage: 'Something went wrong during selecting tag.',
        onDeselectErrorMessage: 'Something went wrong during removing tag.',
        onUpdateErrorMessage: 'Something went wrong during updating tag.',
        saveFormMessage: 'Save the form to manage tags',
    }
    const tags = [
        { [FIELD.id]: '30000000-0000-4000-8000-000000000001', [FIELD.name]: 'Priority', [FIELD.color]: '#D13438' },
        { [FIELD.id]: '30000000-0000-4000-8000-000000000002', [FIELD.name]: 'Customer', [FIELD.color]: '#107C10' },
        { [FIELD.id]: '30000000-0000-4000-8000-000000000003', [FIELD.name]: 'Review', [FIELD.color]: '#0078D4' },
    ]
    const webAPI: ComponentFramework.WebApi = {
        ...parent.webAPI,
        retrieveMultipleRecords: async (entity, options, pageSize) => {
            if (entity === ENTITY.instance) return { entities: [], nextLink: '' }
            if (entity === ENTITY.tag) return { entities: tags.map(tag => ({ ...tag })), nextLink: '' }
            return parent.webAPI.retrieveMultipleRecords(entity, options, pageSize)
        },
        retrieveRecord: async (entity, id, options) => {
            if (entity !== ENTITY.tag) return parent.webAPI.retrieveRecord(entity, id, options)
            const tag = tags.find(tag => tag[FIELD.id] === id)
            if (!tag) throw new Error(`Unknown sample tag: ${id}`)
            return { ...tag }
        },
        createRecord: async (entity, data) => {
            if (entity !== ENTITY.instance) throw new Error(`Unsupported sample create: ${entity}`)
            return { id: crypto.randomUUID(), entityType: entity }
        },
        deleteRecord: async (entity, id) => {
            if (entity !== ENTITY.instance) throw new Error(`Unsupported sample delete: ${entity}`)
            return { id, entityType: entity }
        },
    }
    return {
        webAPI,
        resources: {
            ...parent.resources,
            getString: (key: string) => strings[key] ?? key,
        },
        utils: {
            ...parent.utils,
            getEntityMetadata: async (entity: string, attributes?: string[]) => {
                if (entity !== ENTITY.target && entity !== ENTITY.tag) {
                    return parent.utils.getEntityMetadata(entity, attributes)
                }
                return {
                    LogicalName: entity,
                    EntitySetName: entity === ENTITY.target ? 'accounts' : 'talxis_tags',
                    PrimaryIdAttribute: entity === ENTITY.target ? 'accountid' : FIELD.id,
                    PrimaryNameAttribute: entity === ENTITY.target ? 'name' : FIELD.name,
                    DisplayName: entity === ENTITY.target ? 'Account' : 'Tag',
                    DisplayCollectionName: entity === ENTITY.target ? 'Accounts' : 'Tags',
                    Attributes: { get: () => [] },
                } as unknown as ComponentFramework.PropertyHelper.EntityMetadata
            },
        },
    }
}