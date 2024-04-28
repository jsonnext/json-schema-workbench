import React from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { isEnumControl, rankWith, ControlProps } from "@jsonforms/core";
import { useStyles } from "@jsonforms/vanilla-renderers";

const CustomControl = ({
  data,
  handleChange,
  path,
  schema,
  label,
  required
}: ControlProps) => {
  const styles = useStyles();

  const { classNames } = styles?.find(({ name }) => name === "control.select")!;
  const { classNames: labelClassName } = styles?.find(
    ({ name }) => name === "control.label"
  )!;

  return (
    <div>
      <label htmlFor={path} className={String(labelClassName)}>
        {label}
        {required ? "*" : ""}
      </label>
      <div className="relative">
        <select
          id={path}
          value={data}
          onChange={(ev) => handleChange(path, ev.currentTarget.value)}
          className={String(classNames)}
        >
          {schema?.enum?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export const SelectControl = withJsonFormsControlProps(CustomControl);

export const SelectTester = rankWith(3, isEnumControl);
