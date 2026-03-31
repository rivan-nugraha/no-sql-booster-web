import type { FormLoginDto } from "../../pages/Login/dto";
import type { FormSetupDto } from "../../pages/Setup/dto";

export interface FormStateRedux {
    LoginForm: FormLoginDto,
    SetupForm: FormSetupDto,
}
