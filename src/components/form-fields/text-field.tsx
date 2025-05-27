import { IFormField } from "@/types/app";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationErrors } from "@/validations/auth";

interface Props extends IFormField {
  error?: any;
}

const FormFields = ({
  label,
  name,
  type = "text",
  placeholder,
  disabled = false,
  autoFocus = false,
  error,
  defaultValue,
  readOnly = false,
}: Props) => {
  const fieldErrors = error?.message || (Array.isArray(error) && error.map((e) => e)) || null;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="capitalize text-black mb-2">
        {label}
      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="outline-none border-transparent border-b-2 border-b-black bg-transparent w-full focus:!outline-none focus:!ring-0 focus:!border-b-2 focus:!border-b-black"
      />

      {/* Show Validation Errors */}
      {fieldErrors && (
        <div className="text-red-500 mt-2 text-sm font-medium">
          {Array.isArray(fieldErrors) ? (
            fieldErrors.map((err, idx) => <p key={idx}>{err}</p>)
          ) : (
            <p>{fieldErrors}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FormFields;
