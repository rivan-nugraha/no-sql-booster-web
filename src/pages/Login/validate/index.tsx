import * as yup from 'yup';

export const LoginFormValidate = yup.object().shape({
    username: yup.string().required("Username must be provide"),
    password: yup.string().required("Password must be provide")
})