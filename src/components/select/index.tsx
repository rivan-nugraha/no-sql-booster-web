import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";
import clsx from "clsx";
import { FormStateRedux } from "../../redux/form/interface";
import { FormControl, FormField, FormItem, FormLabel } from "../form";

interface Option {
  value: any;
  label: string;
}

interface TypedSelectProps<FormValues extends FieldValues> {
  name: Path<FormValues>;
  label?: string;
  control: Control<FormValues>;
  options: Option[];
  placeholder?: string;
  readOnly?: boolean;
  disableClearable?: boolean;
  onChange?: (value: Option | null) => void;
  refreshState?: boolean;
  formName?: keyof FormStateRedux;
  className?: string;
}

const Select = <FormValues extends Record<string, any>>({
  name,
  label,
  control,
  options,
  placeholder,
  readOnly,
  onChange,
  className
}: TypedSelectProps<FormValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((opt) => opt.value === field.value) || null;

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl
              renderInput={() => (
                <div className="relative">
                  <Listbox
                    value={selected}
                    onChange={(option) => {
                      if (readOnly) return;
                      if (onChange) onChange(option);
                      else field.onChange(option?.value);
                    }}
                    disabled={readOnly}
                  >
                    <div className="relative z-500000">
                      <Listbox.Button
                        className={clsx(
                          "w-full rounded-md border px-3 py-2 text-left shadow-sm sm:text-sm",
                          readOnly
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-white text-black"
                        )}
                      >
                        <span className="block truncate">
                          {selected?.label || placeholder || "Select"}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </span>
                      </Listbox.Button>

                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="fixed z-[999999] mt-1 max-h-60 w-[90%] md:w-[550px] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5">
                          {options.map((option, idx) => (
                            <Listbox.Option
                              key={idx}
                              className={({ active }) =>
                                clsx(
                                  "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                  active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"
                                )
                              }
                              value={option}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={clsx(
                                      "block truncate",
                                      selected ? "font-semibold" : "font-normal"
                                    )}
                                  >
                                    {option.label}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                      <Check className="w-4 h-4" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              )}
            />
          </FormItem>
        );
      }}
    />
  );
};

export default Select;
