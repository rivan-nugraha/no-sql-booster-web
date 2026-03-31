import { Lock, Shield, User, Key, Moon, Sun } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import Field from "../../components/field";
import FormPanel from "../../components/panel_form";
import Button from "../../components/button";
import { useAppDispatch } from "../../redux/redux-hook";
import { resetForm } from "../../redux/form";
import { SetupFormValidate } from "./validate";
import { useToast } from "../../context/ToastContext";
import { registerSuApi } from "../../client";
import { useTheme } from "../../context/ThemeContext";

const Setup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const onSubmit = async (values: any) => {
    try {
      await registerSuApi(values);
      dispatch(resetForm("SetupForm"));
      showToast("Setup berhasil", "User super admin dibuat", "success");
      navigate({ to: "/" });
    } catch (err: any) {
      showToast("Setup gagal", err?.message || "Error", "error");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex justify-center items-center h-screen transition-colors">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 px-3 py-2 text-sm shadow-sm backdrop-blur hover:shadow"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
      </button>
      <div className="w-1/2 h-screen hidden lg:block">
        <img
          src="https://img.freepik.com/free-vector/server-room-datacenter-isometric-composition-with-computer-equipment-racks-cooling-system-illustration_1284-77441.jpg"
          alt="Datacenter"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
        <div className="flex items-center gap-2 mb-4">
          <Shield />
          <h1 className="text-2xl font-semibold">Initial Setup (SU)</h1>
        </div>
        <FormPanel
          formName="SetupForm"
          onSubmit={onSubmit}
          validate={SetupFormValidate}
        >
          {({ form }) => (
            <>
              <Field
                type="text"
                control={form.control}
                icon={<User />}
                positionIcon="left"
                label="User ID"
                name="user_id"
                className="mb-4"
                isShow={true}
                placeholder="su_admin"
              />
              <Field
                type="text"
                control={form.control}
                icon={<User />}
                positionIcon="left"
                label="User Name"
                name="user_name"
                className="mb-4"
                isShow={true}
                placeholder="Full name"
              />
              <Field
                control={form.control}
                hiddenText
                icon={<Lock />}
                positionIcon="left"
                label="Password"
                name="password"
                placeholder="Password"
                className="mb-4"
              />
              <Field
                control={form.control}
                hiddenText
                icon={<Key />}
                positionIcon="left"
                label="Secret Key (plain)"
                name="secret_key"
                placeholder="Server secret key"
                className="mb-6"
              />
              <Button type="submit" text="Create Super User" />
            </>
          )}
        </FormPanel>
      </div>
    </div>
  );
};

export default Setup;
