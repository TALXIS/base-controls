import * as React from "react";
import { useFieldValue } from "../useFieldValue";
import { useFormInstance } from "../useFormInstance";
import {
    BOOLEAN_CLASSID,
    DATETIME_CLASSID,
    DECIMAL_CLASSID,
    INTEGER_CLASSID,
    MONEY_CLASSID,
    MULTILINE_TEXT_CLASSID,
    MULTISELECT_PICKLIST_CLASSID,
    PICKLIST_CLASSID,
    SINGLE_LINE_TEXT_CLASSID,
    STATUS_CLASSID,
    STATUSREASON_CLASSID,
} from "./standardControlClassIds";

export interface IFieldInputProps {
    classid: string;
    datafieldname: string;
    /** id of the form-cell control element (used for data-id). */
    controlId?: string;
    /** disabled flag from formXml `disabled` attr. */
    disabled?: boolean;
}

/**
 * Routes a cell to a concrete input based on classid. Anything not handled
 * here falls back to a read-only `<input>` of the stringified value so the
 * cell is still visible (caller has already gated on `isStandardControlClassId`).
 */
export const FieldInput: React.FC<IFieldInputProps> = ({ classid, datafieldname, controlId, disabled }) => {
    const normalized = classid.toLowerCase();
    const common = {
        datafieldname,
        controlId,
        disabled,
    };
    switch (normalized) {
        case SINGLE_LINE_TEXT_CLASSID:
            return <TextInput {...common} />;
        case MULTILINE_TEXT_CLASSID:
            return <TextAreaInput {...common} />;
        case BOOLEAN_CLASSID:
            return <BooleanInput {...common} />;
        case INTEGER_CLASSID:
            return <NumberInput {...common} integerOnly />;
        case DECIMAL_CLASSID:
        case MONEY_CLASSID:
            return <NumberInput {...common} />;
        case DATETIME_CLASSID:
            return <DateTimeInput {...common} />;
        case PICKLIST_CLASSID:
        case STATUS_CLASSID:
        case STATUSREASON_CLASSID:
            return <PicklistInput {...common} />;
        case MULTISELECT_PICKLIST_CLASSID:
            return <MultiSelectPicklistInput {...common} />;
        default:
            return <ReadOnlyFallback {...common} />;
    }
};

interface IBaseInputProps {
    datafieldname: string;
    controlId?: string;
    disabled?: boolean;
}

const fieldDataId = (datafieldname: string) => `field-${datafieldname}`;

const TextInput: React.FC<IBaseInputProps> = ({ datafieldname, controlId, disabled }) => {
    const [value, setValue] = useFieldValue<string>(datafieldname);
    return (
        <input
            type="text"
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            value={value ?? ""}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
        />
    );
};

const TextAreaInput: React.FC<IBaseInputProps> = ({ datafieldname, controlId, disabled }) => {
    const [value, setValue] = useFieldValue<string>(datafieldname);
    return (
        <textarea
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            value={value ?? ""}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
        />
    );
};

const BooleanInput: React.FC<IBaseInputProps> = ({ datafieldname, controlId, disabled }) => {
    const [value, setValue] = useFieldValue<boolean>(datafieldname);
    return (
        <input
            type="checkbox"
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            checked={value === true}
            disabled={disabled}
            onChange={(e) => setValue(e.target.checked)}
        />
    );
};

interface INumberInputProps extends IBaseInputProps {
    integerOnly?: boolean;
}

const NumberInput: React.FC<INumberInputProps> = ({ datafieldname, controlId, disabled, integerOnly }) => {
    const [value, setValue] = useFieldValue<number>(datafieldname);
    const display = value === undefined || value === null || Number.isNaN(value as number) ? "" : String(value);
    return (
        <input
            type="number"
            step={integerOnly ? 1 : "any"}
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            value={display}
            disabled={disabled}
            onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                    setValue(undefined as unknown as number);
                    return;
                }
                const parsed = integerOnly ? parseInt(raw, 10) : parseFloat(raw);
                if (!Number.isNaN(parsed)) {
                    setValue(parsed);
                }
            }}
        />
    );
};

const toDateTimeLocal = (v: unknown): string => {
    if (!v) return "";
    const d = v instanceof Date ? v : new Date(v as string | number);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DateTimeInput: React.FC<IBaseInputProps> = ({ datafieldname, controlId, disabled }) => {
    const [value, setValue] = useFieldValue<Date | string>(datafieldname);
    return (
        <input
            type="datetime-local"
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            value={toDateTimeLocal(value)}
            disabled={disabled}
            onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                    setValue(undefined as unknown as Date);
                    return;
                }
                const d = new Date(raw);
                if (!Number.isNaN(d.getTime())) {
                    setValue(d);
                }
            }}
        />
    );
};

const PicklistInput: React.FC<IBaseInputProps> = ({ datafieldname, controlId, disabled }) => {
    const form = useFormInstance();
    const [value, setValue] = useFieldValue<number>(datafieldname);
    let options: { value: number; label: string }[] = [];
    try {
        const cfg = form.getAttributeConfiguration(datafieldname);
        options = cfg.options ?? [];
    } catch {
        options = [];
    }
    return (
        <select
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            value={value === undefined || value === null ? "" : String(value)}
            disabled={disabled}
            onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                    setValue(undefined as unknown as number);
                    return;
                }
                const parsed = parseInt(raw, 10);
                if (!Number.isNaN(parsed)) {
                    setValue(parsed);
                }
            }}
        >
            <option value="">--</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
};

const MultiSelectPicklistInput: React.FC<IBaseInputProps> = ({ datafieldname, controlId, disabled }) => {
    const form = useFormInstance();
    const [value, setValue] = useFieldValue<number[]>(datafieldname);
    let options: { value: number; label: string }[] = [];
    try {
        const cfg = form.getAttributeConfiguration(datafieldname);
        options = cfg.options ?? [];
    } catch {
        options = [];
    }
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
        <select
            multiple
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
            value={selected}
            disabled={disabled}
            onChange={(e) => {
                const next: number[] = [];
                for (const opt of Array.from(e.target.selectedOptions)) {
                    const parsed = parseInt(opt.value, 10);
                    if (!Number.isNaN(parsed)) next.push(parsed);
                }
                setValue(next);
            }}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
};

const ReadOnlyFallback: React.FC<IBaseInputProps> = ({ datafieldname, controlId }) => {
    const [value] = useFieldValue<unknown>(datafieldname);
    return (
        <span
            data-id={fieldDataId(datafieldname)}
            data-control-id={controlId}
        >
            {value === undefined || value === null ? "" : String(value)}
        </span>
    );
};
