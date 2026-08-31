import { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import type { IMemoryEntitySource } from "@talxis/base-controls";

// ─── People entity ────────────────────────────────────────────────────────────

export const PEOPLE_ENTITY_NAME = 'mem_person';
export const PEOPLE_PRIMARY_ID = 'mem_personid';

export const PEOPLE_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: PEOPLE_PRIMARY_ID,
    PrimaryNameAttribute: 'name',
    LogicalName: PEOPLE_ENTITY_NAME,
    QuickFindColumns: ['name'],
};

export const PEOPLE_COLUMNS: IColumn[] = [
    { name: 'name',     dataType: 'SingleLine.Text', displayName: 'Name',      visualSizeFactor: 200, isPrimary: true },
    { name: 'imageurl', dataType: 'SingleLine.Text', displayName: 'Image URL', visualSizeFactor: 200, isHidden: true },
];

export const PEOPLE: IRawRecord[] = [
    { [PEOPLE_PRIMARY_ID]: '00010001-0000-0000-0000-000000000000', name: 'Alex Chen',      imageurl: 'https://i.pravatar.cc/150?u=alex.chen' },
    { [PEOPLE_PRIMARY_ID]: '00010002-0000-0000-0000-000000000000', name: 'Chris Kim',      imageurl: 'https://i.pravatar.cc/150?u=chris.kim' },
    { [PEOPLE_PRIMARY_ID]: '00010003-0000-0000-0000-000000000000', name: 'Jamie Walsh',    imageurl: 'https://i.pravatar.cc/150?u=jamie.walsh' },
    { [PEOPLE_PRIMARY_ID]: '00010004-0000-0000-0000-000000000000', name: 'Jordan Lee',     imageurl: 'https://i.pravatar.cc/150?u=jordan.lee' },
    { [PEOPLE_PRIMARY_ID]: '00010005-0000-0000-0000-000000000000', name: 'Maya Patel',     imageurl: 'https://i.pravatar.cc/150?u=maya.patel' },
    { [PEOPLE_PRIMARY_ID]: '00010006-0000-0000-0000-000000000000', name: 'Riley Thompson', imageurl: 'https://i.pravatar.cc/150?u=riley.thompson' },
    { [PEOPLE_PRIMARY_ID]: '00010007-0000-0000-0000-000000000000', name: 'Sam Rivera',     imageurl: 'https://i.pravatar.cc/150?u=sam.rivera' },
    { [PEOPLE_PRIMARY_ID]: '00010008-0000-0000-0000-000000000000', name: 'Taylor Morgan',  imageurl: 'https://i.pravatar.cc/150?u=taylor.morgan' },
];

// ─── Tags entity ──────────────────────────────────────────────────────────────

export const TAGS_ENTITY_NAME = 'mem_tag';
export const TAGS_PRIMARY_ID = 'mem_tagid';

export const TAGS_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: TAGS_PRIMARY_ID,
    PrimaryNameAttribute: 'name',
    LogicalName: TAGS_ENTITY_NAME,
    QuickFindColumns: ['name'],
};

export const TAGS_COLUMNS: IColumn[] = [
    { name: 'name',  dataType: 'SingleLine.Text', displayName: 'Name',  visualSizeFactor: 200, isPrimary: true },
    { name: 'color', dataType: 'SingleLine.Text', displayName: 'Color', visualSizeFactor: 120, isHidden: true },
];

const C = {
    frontend:  '#0078d4',
    backend:   '#107c10',
    design:    '#8764b8',
    security:  '#d13438',
    devops:    '#ff8c00',
    docs:      '#69797e',
    analytics: '#038387',
    other:     '#ca5010',
};

export const TAGS: IRawRecord[] = [
    { [TAGS_PRIMARY_ID]: '00020001-0000-0000-0000-000000000000', name: 'a11y',           color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020002-0000-0000-0000-000000000000', name: 'access',         color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020003-0000-0000-0000-000000000000', name: 'advanced',       color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020004-0000-0000-0000-000000000000', name: 'alerting',       color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020005-0000-0000-0000-000000000000', name: 'analytics',      color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020006-0000-0000-0000-000000000000', name: 'android',        color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020007-0000-0000-0000-000000000000', name: 'api',            color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020008-0000-0000-0000-000000000000', name: 'architecture',   color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020009-0000-0000-0000-000000000000', name: 'assessment',     color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020010-0000-0000-0000-000000000000', name: 'audit',          color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020011-0000-0000-0000-000000000000', name: 'auth',           color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020012-0000-0000-0000-000000000000', name: 'automation',     color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020013-0000-0000-0000-000000000000', name: 'backend',        color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020014-0000-0000-0000-000000000000', name: 'backup',         color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020015-0000-0000-0000-000000000000', name: 'billing',        color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020016-0000-0000-0000-000000000000', name: 'catalog',        color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020017-0000-0000-0000-000000000000', name: 'churn',          color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020018-0000-0000-0000-000000000000', name: 'ci-cd',          color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020019-0000-0000-0000-000000000000', name: 'cloud',          color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020020-0000-0000-0000-000000000000', name: 'compliance',     color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020021-0000-0000-0000-000000000000', name: 'content',        color: C.other     },
    { [TAGS_PRIMARY_ID]: '00020022-0000-0000-0000-000000000000', name: 'dashboard',      color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020023-0000-0000-0000-000000000000', name: 'data',           color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020024-0000-0000-0000-000000000000', name: 'database',       color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020025-0000-0000-0000-000000000000', name: 'design',         color: C.design    },
    { [TAGS_PRIMARY_ID]: '00020026-0000-0000-0000-000000000000', name: 'design-system',  color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020027-0000-0000-0000-000000000000', name: 'devops',         color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020028-0000-0000-0000-000000000000', name: 'docker',         color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020029-0000-0000-0000-000000000000', name: 'docs',           color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020030-0000-0000-0000-000000000000', name: 'dr',             color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020031-0000-0000-0000-000000000000', name: 'engineering',    color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020032-0000-0000-0000-000000000000', name: 'etl',            color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020033-0000-0000-0000-000000000000', name: 'executive',      color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020034-0000-0000-0000-000000000000', name: 'forecasting',    color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020035-0000-0000-0000-000000000000', name: 'french',         color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020036-0000-0000-0000-000000000000', name: 'frontend',       color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020037-0000-0000-0000-000000000000', name: 'gdpr',           color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020038-0000-0000-0000-000000000000', name: 'github-actions', color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020039-0000-0000-0000-000000000000', name: 'grafana',        color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020040-0000-0000-0000-000000000000', name: 'i18n',           color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020041-0000-0000-0000-000000000000', name: 'infrastructure', color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020042-0000-0000-0000-000000000000', name: 'ios',            color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020043-0000-0000-0000-000000000000', name: 'kubernetes',     color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020044-0000-0000-0000-000000000000', name: 'legal',          color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020045-0000-0000-0000-000000000000', name: 'mfa',            color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020046-0000-0000-0000-000000000000', name: 'ml',             color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020047-0000-0000-0000-000000000000', name: 'mobile',         color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020048-0000-0000-0000-000000000000', name: 'monitoring',     color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020049-0000-0000-0000-000000000000', name: 'networking',     color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020050-0000-0000-0000-000000000000', name: 'oauth',          color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020051-0000-0000-0000-000000000000', name: 'offline',        color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020052-0000-0000-0000-000000000000', name: 'on-call',        color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020053-0000-0000-0000-000000000000', name: 'onboarding',     color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020054-0000-0000-0000-000000000000', name: 'ops',            color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020055-0000-0000-0000-000000000000', name: 'owasp',          color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020056-0000-0000-0000-000000000000', name: 'payments',       color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020057-0000-0000-0000-000000000000', name: 'pentest',        color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020058-0000-0000-0000-000000000000', name: 'performance',    color: C.other     },
    { [TAGS_PRIMARY_ID]: '00020059-0000-0000-0000-000000000000', name: 'pipeline',       color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020060-0000-0000-0000-000000000000', name: 'planning',       color: C.other     },
    { [TAGS_PRIMARY_ID]: '00020061-0000-0000-0000-000000000000', name: 'profile',        color: C.design    },
    { [TAGS_PRIMARY_ID]: '00020062-0000-0000-0000-000000000000', name: 'qa',             color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020063-0000-0000-0000-000000000000', name: 'rbac',           color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020064-0000-0000-0000-000000000000', name: 'react',          color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020065-0000-0000-0000-000000000000', name: 'react-native',   color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020066-0000-0000-0000-000000000000', name: 'release',        color: C.devops    },
    { [TAGS_PRIMARY_ID]: '00020067-0000-0000-0000-000000000000', name: 'reports',        color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020068-0000-0000-0000-000000000000', name: 'requirements',   color: C.other     },
    { [TAGS_PRIMARY_ID]: '00020069-0000-0000-0000-000000000000', name: 'research',       color: C.design    },
    { [TAGS_PRIMARY_ID]: '00020070-0000-0000-0000-000000000000', name: 'sales',          color: C.analytics },
    { [TAGS_PRIMARY_ID]: '00020071-0000-0000-0000-000000000000', name: 'sdk',            color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020072-0000-0000-0000-000000000000', name: 'security',       color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020073-0000-0000-0000-000000000000', name: 'seo',            color: C.other     },
    { [TAGS_PRIMARY_ID]: '00020074-0000-0000-0000-000000000000', name: 'soc2',           color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020075-0000-0000-0000-000000000000', name: 'spanish',        color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020076-0000-0000-0000-000000000000', name: 'support',        color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020077-0000-0000-0000-000000000000', name: 'sync',           color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020078-0000-0000-0000-000000000000', name: 'technical',      color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020079-0000-0000-0000-000000000000', name: 'testing',        color: C.security  },
    { [TAGS_PRIMARY_ID]: '00020080-0000-0000-0000-000000000000', name: 'training',       color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020081-0000-0000-0000-000000000000', name: 'ui',             color: C.frontend  },
    { [TAGS_PRIMARY_ID]: '00020082-0000-0000-0000-000000000000', name: 'user-guide',     color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020083-0000-0000-0000-000000000000', name: 'ux',             color: C.design    },
    { [TAGS_PRIMARY_ID]: '00020084-0000-0000-0000-000000000000', name: 'video',          color: C.docs      },
    { [TAGS_PRIMARY_ID]: '00020085-0000-0000-0000-000000000000', name: 'warehouse',      color: C.backend   },
    { [TAGS_PRIMARY_ID]: '00020086-0000-0000-0000-000000000000', name: 'wireframe',      color: C.design    },
    { [TAGS_PRIMARY_ID]: '00020087-0000-0000-0000-000000000000', name: 'workshop',       color: C.docs      },
];

// ─── Sources consumed by the memory descriptor ────────────────────────────────

export const PEOPLE_SOURCE: IMemoryEntitySource = {
    records: PEOPLE,
    columns: PEOPLE_COLUMNS,
    metadata: PEOPLE_METADATA,
};

export const TAGS_SOURCE: IMemoryEntitySource = {
    records: TAGS,
    columns: TAGS_COLUMNS,
    metadata: TAGS_METADATA,
};

// ─── Reference helpers ────────────────────────────────────────────────────────

const _personByName = new Map<string, IRawRecord>(PEOPLE.map(p => [p.name as string, p]));
const _tagBySlug    = new Map<string, IRawRecord>(TAGS.map(t => [t.name as string, t]));

/** Returns an EntityReference for an in-memory person record, including imageurl in rawData. */
export function personRef(name: string): ComponentFramework.EntityReference {
    const p = _personByName.get(name);
    if (!p) throw new Error(`personRef: unknown person "${name}"`);
    return {
        id:         { guid: p[PEOPLE_PRIMARY_ID] as string },
        name:       p.name as string,
        etn: PEOPLE_ENTITY_NAME,
        rawData:    { imageurl: p.imageurl },
    } as unknown as ComponentFramework.EntityReference;
}

/** Returns an EntityReference for an in-memory tag record, including color in rawData. */
export function tagRef(slug: string): ComponentFramework.EntityReference {
    const t = _tagBySlug.get(slug);
    if (!t) throw new Error(`tagRef: unknown tag "${slug}"`);
    return {
        id:         { guid: t[TAGS_PRIMARY_ID] as string },
        name:       t.name as string,
        etn: TAGS_ENTITY_NAME,
        rawData:    { color: t.color },
    } as any
}
