import { Lock, User } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import Field from "../../components/field";
import FormPanel from "../../components/panel_form";
import { useAppDispatch, useAppSelector } from "../../redux/redux-hook";
import { selectAuth } from "../../redux/auth";
import Button from "../../components/button";
import LoginRedux from "./redux";
import { LoginFormValidate } from "./validate";

const Login = () => {
  const proses = LoginRedux();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth).token;
  const navigation = useNavigate();

  useEffect(() => {
    if (auth) {
      navigation({ to: '/dashboard' });
    }
  }, [auth, navigation]);


  const login = () => {
   dispatch(proses.loginNow());
  }
  
  return (
    <div className="bg-transparent flex justify-center items-center h-screen">
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