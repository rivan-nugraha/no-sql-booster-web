import { useNavigate } from "@tanstack/react-router";
import { setLoadingAll, stopLoading } from "../../../redux/utility";
import { resetForm } from "../../../redux/form";
import { useAuth } from "../../../context/AuthContext";
import type { AppThunk } from "../../../redux/redux-store";

const LoginRedux = () => {
    const navigation = useNavigate();
    const { login } = useAuth();
    const loginNow = (): AppThunk => {
        return (dispatch, getState) => {
            try {
                dispatch(setLoadingAll());
                const loginForm = getState().form.LoginForm;
                dispatch(resetForm("LoginForm"));
                login({ username: loginForm.username, name: "Checking", division: "HAHA Division", token: "Asup" });
                navigation({ to: "/dashboard" });
                dispatch(stopLoading());
            } catch (error) {
                dispatch(stopLoading());
            }
        }
    }

    return {
        loginNow,
    }
}

export default LoginRedux;