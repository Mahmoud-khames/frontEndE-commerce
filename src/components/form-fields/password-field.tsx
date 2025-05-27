import { IFormField } from "@/types/app";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { FieldError } from "react-hook-form";
import { useParams } from "next/navigation";
import { Languages } from "@/constants/enums";

interface Props extends IFormField {
  error?: FieldError;
}

const PasswordField = ({
  label,
  name,
  placeholder,
  disabled = false,
  autoFocus = false,
  error,
  defaultValue,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const { locale } = useParams();

  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="capitalize text-black text-sm">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          defaultValue={defaultValue}
          aria-invalid={!!error}
          className="outline-none border-transparent border-b-2 border-b-black bg-transparent w-full focus:outline-none focus:ring-0 focus:border-b-black"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className={`absolute ${locale === Languages.ARABIC ? "left-3" : "right-3"}`}
        >
          <span>
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4 text-gray-500 cursor-pointer" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-500 cursor-pointer" />
            )}
          </span>
        </button>
      </div>
      {error && (
        <p className="text-red-500 mt-2 text-sm font-medium">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
