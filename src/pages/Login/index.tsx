import { Lock, User, Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import Field from "../../components/field";
import FormPanel from "../../components/panel_form";
import { useAppDispatch, useAppSelector } from "../../redux/redux-hook";
import { selectAuth } from "../../redux/auth";
import Button from "../../components/button";
import LoginRedux from "./redux";
import { LoginFormValidate } from "./validate";
import { useTheme } from "../../context/ThemeContext";

const Login = () => {
  const proses = LoginRedux();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth).access_token;
  const navigation = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (auth) {
      navigation({ to: '/dashboard' });
    }
  }, [auth, navigation]);


  const login = () => {
   dispatch(proses.loginNow());
  }
  
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
        <img src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826" alt="Placeholder Image" className="object-cover w-full h-full" />
      </div>
      <div className= "lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <FormPanel
          formName="LoginForm"
          onSubmit={login}
          validate={LoginFormValidate}
        >
          {({ form }) => (
            <>
              <Field
                type="text"
                control={form.control}
                icon={<User />}
                positionIcon="left"
                label="Username"
                name="username"
                className="mb-4"
                isShow={true}
                placeholder="provide your username here"
              />
              <Field
                control={form.control}
                hiddenText
                icon={<Lock />}
                positionIcon="left"
                label="Password"
                name="password"
                placeholder="provide your password here"
                className="mb-4"
              />
              <Button type="submit" text="Login" />
            </>
          )}
        </FormPanel>
      </div>
    </div>
  )
}

export default Login;
