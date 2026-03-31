import * as yup from 'yup';

export const SetupFormValidate = yup.object().shape({
  user_id: yup.string().required('User ID wajib diisi'),
  user_name: yup.string().required('Nama wajib diisi'),
  password: yup.string().required('Password wajib diisi'),
  secret_key: yup.string().required('Secret key wajib diisi'),
});
