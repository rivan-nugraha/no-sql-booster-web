import { useNavigate } from "@tanstack/react-router";
import { setLoadingAll, stopLoading } from "../../../redux/utility";
import { resetForm } from "../../../redux/form";
import { login as loginAction } from "../../../redux/auth";
import { loginApi } from "../../../client";
import { useToast } from "../../../context/ToastContext";
import type { AppThunk } from "../../../redux/redux-store";
import type { LoginResponse } from "../../../client/model/auth_model";

const LoginRedux = () => {
  const navigation = useNavigate();
  const { showToast } = useToast();

  const loginNow = (): AppThunk => {
    return async (dispatch, getState) => {
      try {
        dispatch(setLoadingAll());
        const loginForm = getState().form.LoginForm;
        const payload = {
          user_id: loginForm.username,
          password: loginForm.password,
        };

        const response = await loginApi(payload);
        const data: LoginResponse = response.data;

        dispatch(
          loginAction({
            user_id: data.user_id,
            name: data.user_name,
            level: data.level,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          }),
        );

        dispatch(resetForm("LoginForm"));
        navigation({ to: "/dashboard" });
      } catch (error: any) {
        console.error(error);
        showToast("Login failed", error?.message || "Unauthorized", "error");
      } finally {
        dispatch(stopLoading());
      }
    };
  };

  return {
    loginNow,
  };
};

export default LoginRedux;
