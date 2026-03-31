export interface FormSetupDto {
  user_id: string;
  user_name: string;
  password: string;
  secret_key: string;
}

export const initialFormSetup: FormSetupDto = {
  user_id: '',
  user_name: '',
  password: '',
  secret_key: '',
};
