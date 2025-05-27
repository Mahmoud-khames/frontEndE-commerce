/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pages } from "@/constants/enums";
import { IFormField } from "@/types/app";
import { useAppSelector } from "@/redux/hooks";
  const useFormFields = ({ slug, t }: { slug: string; t: any }) => {
    const {user} = useAppSelector((state) => state.user)
  const loginFields = (): IFormField[] => [
    {
      name: "email",
      type: "email",
      placeholder: t.formFields.emailPlaceholder,
      label: t.formFields.emailLabel,
      autoFocus: true,
    },
    {
      name: "password",
      type: "password",
      label: t.formFields.passwordLabel,
      placeholder: t.formFields.passwordPlaceholder,
    },
  ];

  const signupFields = (): IFormField[] => [
    {
      name: "firstName",
      type: "text",
      placeholder: t.formFields.firstNamePlaceholder,
      label: t.formFields.firstNameLabel,
      autoFocus: true,
    },
    {
      name: "lastName",
      type: "text",
      placeholder: t.formFields.lastNamePlaceholder,
      label: t.formFields.lastNameLabel,
    },
    {
      name: "email",
      type: "email",
      placeholder: t.formFields.emailPlaceholder,
      label: t.formFields.emailLabel,
    },
    {
      name: "password",
      type: "password",
      placeholder: t.formFields.passwordPlaceholder,
      label: t.formFields.passwordLabel,
    },
    {
      name: "cPassword",
      type: "password",
      placeholder: t.formFields.confirmPasswordPlaceholder,
      label: t.formFields.confirmPasswordLabel,
    },
  ];

  const forgotPasswordFields = (): IFormField[] => [
    {
      name: "email",
      type: "email",
      placeholder: t.formFields.emailPlaceholder,
      label: t.formFields.emailLabel,
    },
  ];

  const resetPasswordFields = (): IFormField[] => [
    {
      name: "password",
      type: "password",
      placeholder: t.formFields.passwordPlaceholder,
      label: t.formFields.passwordLabel,
      autoFocus: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: t.formFields.confirmPasswordPlaceholder,
      label: t.formFields.confirmPasswordLabel,
    },
  ];

  const profileFields = (): IFormField[] => [
    {
      name: "firstName",
      type: "text",
      placeholder: t.formFields.firstNamePlaceholder,
      label: t.formFields.firstNameLabel,
      defaultValue: user?.firstName, // قيمة افتراضية (يمكن استبدالها ببيانات من API)
    },
    {
      name: "lastName",
      type: "text",
      placeholder: t.formFields.lastNamePlaceholder,
      label: t.formFields.lastNameLabel,
      defaultValue: user?.lastName,
    },
    {
      name: "email",
      type: "email",
      placeholder: t.formFields.emailPlaceholder,
      label: t.formFields.emailLabel,
      defaultValue: user?.email,
    },
    {
      name: "role",
      type: "text",
      placeholder: t.formFields.rolePlaceholder,
      label: t.formFields.roleLabel,
      defaultValue: user?.role,
    },
    {
      name: "currentPassword",
      type: "password",
      placeholder: t.formFields.currentPasswordPlaceholder,
      label: t.formFields.currentPasswordLabel,
    },
    {
      name: "newPassword",
      type: "password",
      placeholder: t.formFields.newPasswordPlaceholder,
      label: t.formFields.newPasswordLabel,
    },
    {
      name: "confirmNewPassword",
      type: "password",
      placeholder: t.formFields.confirmNewPasswordPlaceholder,
      label: t.formFields.confirmNewPasswordLabel,
    },
  ];

  const getFormFields = (): IFormField[] => {
    switch (slug) {
      case Pages.LOGIN:
        return loginFields();
      case Pages.REGISTER:
        return signupFields();
      case Pages.FORGOT_PASSWORD:
        return forgotPasswordFields();
      case Pages.RESET_PASSWORD:
        return resetPasswordFields();
      case Pages.PROFILE:
        return profileFields();
      default:
        return [];
    }
  };

  return { getFormFields };
};

export default useFormFields;