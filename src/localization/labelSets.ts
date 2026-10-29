import { CHECK_LIST_LABELS } from '../controls/check-list/labels';
import { EDIT_COLUMNS_LABELS } from '../controls/dataset-control/components/adapters/edit-columns/labels';
import { EMPTY_RECORDS_LABELS } from '../controls/dataset-control/components/adapters/empty-records/labels';
import { NOTIFICATIONS_LABELS } from '../controls/dataset-control/components/adapters/notifications/labels';
import { PAGE_SIZE_SWITCHER_LABELS } from '../controls/dataset-control/components/adapters/page-size-switcher/labels';
import { PAGINATION_LABELS } from '../controls/dataset-control/components/adapters/pagination/labels';
import { QUICK_FIND_LABELS } from '../controls/dataset-control/components/adapters/quick-find/labels';
import { DATASET_CONTROL_LABELS } from '../controls/dataset-control/components/adapters/root/labels';
import { VIEW_SWITCHER_LABELS } from '../controls/dataset-control/components/adapters/view-switcher/labels';
import { USER_QUERIES_LABELS } from '../controls/dataset-control/modules/user-queries/labels';
import { DATE_TIME_LABELS } from '../controls/fields/date-time/labels';
import { DURATION_LABELS } from '../controls/fields/duration/labels';
import { LOOKUP_LABELS } from '../controls/fields/lookup/labels';
import { TWO_OPTIONS_LABELS } from '../controls/fields/two-options/labels';
import { FORM_LABELS } from '../controls/form/labels';
import { GRID_LABELS } from '../controls/grid/labels';
import { GRID_AGGREGATION_LABELS } from '../controls/grid/modules/aggregation/labels';
import { FILTER_OPERATORS_LABELS } from '../controls/grid/modules/filtering/components/dataset-column-filtering/labels';
import { GRID_FILTERING_LABELS } from '../controls/grid/modules/filtering/labels';
import { GRID_GROUPING_LABELS } from '../controls/grid/modules/grouping/labels';
import { GRID_SORTING_LABELS } from '../controls/grid/modules/sorting/labels';
import { MAP_LABELS } from '../controls/map/labels';
import { NESTED_CONTROL_RENDERER_LABELS } from '../controls/nested-control-renderer/labels';
import { TASK_GRID_LABELS } from '../controls/task-grid/labels';
import { CHECKLIST_LABELS } from '../controls/task-grid/modules/checklist/labels';
import { CUSTOM_COLUMNS_LABELS } from '../controls/task-grid/modules/custom-columns/labels';
import { DEPENDENCIES_LABELS } from '../controls/task-grid/modules/dependencies/labels';
import { GANTT_LABELS } from '../controls/task-grid/modules/gantt/labels';
import { GANTT_LINKS_LABELS } from '../controls/task-grid/modules/gantt/modules/links/labels';
import { GANTT_MARKERS_LABELS } from '../controls/task-grid/modules/gantt/modules/markers/labels';
import { GANTT_NON_WORKING_DAYS_LABELS } from '../controls/task-grid/modules/gantt/modules/non-working-days/labels';
import { GANTT_TOOLTIP_LABELS } from '../controls/task-grid/modules/gantt/modules/tooltip/labels';
import { LOOKUP_MANY_LABELS } from '../controls/task-grid/modules/lookup-many/labels';
import { TEMPLATES_LABELS } from '../controls/task-grid/modules/templates/labels';
import { LEGACY_DATASET_CONTROL_LABELS } from '../legacy/react-components/dataset-control/labels';
import { ERROR_MESSAGE_BAR_LABELS } from '../ui/error-message-bar/labels';
import { LOADING_BOUNDARY_LABELS } from '../ui/loading-boundary/labels';
import { NOTIFICATION_MESSAGE_BAR_LABELS } from '../ui/notifications/message-bar/labels';
import type { ILabelSet } from '../utils/localization';

/** Every label set base-controls defines, for reading a consumer's translations of them. */
export const BASE_CONTROLS_LABEL_SETS: ILabelSet[] = [
    CHECK_LIST_LABELS,
    EDIT_COLUMNS_LABELS,
    EMPTY_RECORDS_LABELS,
    NOTIFICATIONS_LABELS,
    PAGE_SIZE_SWITCHER_LABELS,
    PAGINATION_LABELS,
    QUICK_FIND_LABELS,
    DATASET_CONTROL_LABELS,
    VIEW_SWITCHER_LABELS,
    USER_QUERIES_LABELS,
    DATE_TIME_LABELS,
    DURATION_LABELS,
    LOOKUP_LABELS,
    TWO_OPTIONS_LABELS,
    FORM_LABELS,
    GRID_LABELS,
    GRID_AGGREGATION_LABELS,
    FILTER_OPERATORS_LABELS,
    GRID_FILTERING_LABELS,
    GRID_GROUPING_LABELS,
    GRID_SORTING_LABELS,
    MAP_LABELS,
    NESTED_CONTROL_RENDERER_LABELS,
    TASK_GRID_LABELS,
    CHECKLIST_LABELS,
    CUSTOM_COLUMNS_LABELS,
    DEPENDENCIES_LABELS,
    GANTT_LABELS,
    GANTT_LINKS_LABELS,
    GANTT_MARKERS_LABELS,
    GANTT_NON_WORKING_DAYS_LABELS,
    GANTT_TOOLTIP_LABELS,
    LOOKUP_MANY_LABELS,
    TEMPLATES_LABELS,
    LEGACY_DATASET_CONTROL_LABELS,
    ERROR_MESSAGE_BAR_LABELS,
    LOADING_BOUNDARY_LABELS,
    NOTIFICATION_MESSAGE_BAR_LABELS,
];
