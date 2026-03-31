/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect } from "react";
import DatePicker from "react-datepicker";
import { FormControl, FormField, FormItem, FormLabel } from "../form";
import { CheckBox } from "../check_box";
import { HiddenField } from "../hidden_field";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { HTMLInputTypeAttribute, JSX} from "react";

interface TypedFieldProps<FormValues extends FieldValues> {
    name: Path<FormValues>;
    label?: string;
    control: Control<FormValues>;
    placeholder?: string;
    hiddenText?: boolean;
    isTextarea?: boolean;
    readOnly?: boolean;
    type?: HTMLInputTypeAttribute;
    note?: string;
    rows?: number;
    tabIndex?: number;
    maxLength?: number;
    value?: string | number;
    onChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: JSX.Element | string;
    endAdorment?: JSX.Element | string;
    positionIcon?: 'left' | 'right' | 'none';
    onClickIcon?: () => void;
    isShow?: boolean;
    openCropper?: boolean;
    className?: string;
}

const Field = <FormValues extends Record<string, any>>({
    name,
    label,
    placeholder,
    control,
    readOnly,
    isTextarea = false,
    hiddenText,
    type = 'text',
    rows = 4,
    value,
    onChange,
    icon,
    endAdorment,
    maxLength,
    positionIcon = 'right',
    isShow = true,
    className
}: TypedFieldProps<FormValues>) => {
    return (
        <FormField
            name={name}
            control={control}
            render={({ field }) => {
                useEffect(() => {
                    if (value !== undefined) {
                        field.onChange(value || field.value || "");
                    }
                }, [field, value]);

                return (
                    <FormItem
                        className={!isShow ? "hidden" : className}
                    >
                        {
                            type !== "checkbox" && type !== "hidden" && (
                                <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {label}
                                </FormLabel>
                            )
                        }
                        <FormControl
                            renderInput={() => (
                                type === "checkbox" ? (
                                    <FormLabel>
                                        <CheckBox label={label} {...field} checked={field.value} onChange={(e) => {
                                            field.onChange(e);
                                        }} />
                                    </FormLabel>
                                ) : isTextarea ? (
                                    <textarea
                                        {...(field as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                                        rows={rows} // atau gunakan minRows jika pakai autosize lib
                                        placeholder={placeholder}
                                        value={field.value ?? ''}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                                    />
                                ) : hiddenText ? (
                                    <div className="relative flex items-center">
                                        {/* Ikon kiri */}
                                        {positionIcon === 'left' && icon && (
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            {icon}
                                            </div>
                                        )}

                                        <HiddenField
                                            placeholder={placeholder}
                                            {...field}
                                            positionIcon={positionIcon}
                                            onChange={(e: any) => {
                                                field.onChange(e.target.value);
                                                if (onChange) onChange(e);
                                            }}
                                        />
                                    </div>
                                ) : type === "date" ? (
                                    <div className="relative flex flex-col gap-2">
                                        <div className="relative flex flex-col gap-2">
                                            <DatePicker
                                                selected={field.value ? new Date(field.value) : null}
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                }}
                                                // onChange={(date: Date) => {
                                                //     field.onChange(date);
                                                //     if (onChange) onChange(date);
                                                // }}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText={placeholder || "Pilih tanggal"}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`relative flex items-center`}>
                                        {/* Ikon kiri */}
                                        {positionIcon === 'left' && icon && (
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                                {icon}
                                            </div>
                                        )}

                                        <input
                                            type={type}
                                            placeholder={placeholder}
                                            readOnly={readOnly}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                            field.onChange(e.target.value);
                                                if (onChange) onChange(e);
                                            }}
                                            maxLength={maxLength}
                                            className={`
                                                w-full rounded-md border px-3 py-2 text-sm shadow-sm transition 
                                                bg-[var(--input-bg)] text-[var(--input-text)] border-[var(--input-border)]
                                                focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                                ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
                                                ${positionIcon === 'left' ? 'pl-10' : ''}
                                                ${endAdorment ? 'pr-10' : ''}
                                            `}
                                        />

                                        {/* Ikon kanan */}
                                        {endAdorment && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                {endAdorment}
                                            </div>
                                        )}
                                    </div>
                                ) 
                            )}
                        />
                    </FormItem>
                )
            }}
        />
    )
}

export default Field;
