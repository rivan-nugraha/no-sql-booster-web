/* eslint-disable @typescript-eslint/naming-convention */
import {
    FormProvider,
    useForm
} from 'react-hook-form';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../redux/redux-hook';
import { selectForm, setValue } from '../../redux/form';
import type { FormStateRedux } from '../../redux/form/interface';
import type { JSX, ReactNode} from 'react';
import type * as yup from 'yup';
import type {
    DefaultValues,
    FieldValues,
    Resolver,
    UseFormReturn
} from 'react-hook-form';

const Form = FormProvider;

interface FormPanelProps<FormValues extends FieldValues> {
    formName: keyof FormStateRedux;
    onSubmit: (values: FormValues) => void;
    validate: yup.ObjectSchema<FormValues>;
    children: (props: { form: UseFormReturn<FormValues> }) => ReactNode;
}

const FormPanel = <FormValues extends FieldValues>({
    onSubmit,
    children,
    formName,
    validate,
}: FormPanelProps<FormValues>): JSX.Element => {
    const dispatch = useAppDispatch();
    const initialValues = useAppSelector(selectForm)[formName as keyof FormStateRedux] as unknown as DefaultValues<FormValues>;

    const form = useForm<FormValues>({
        resolver: yupResolver(validate) as unknown as Resolver<FormValues>,
        defaultValues: initialValues,
        mode: 'onChange'
    })

    useEffect(() => {
        const currentValues = form.getValues();
        if (JSON.stringify(currentValues) !== JSON.stringify(initialValues)) {
            form.reset(initialValues);
        }
    }, [initialValues, form]);

    useEffect(() => {
        const watchSubscription = form.watch(async (values) => {
          try {
            const validValues = await validate.validate(values);
            dispatch(setValue({ form: formName, values: validValues! }));
          } catch (error) {
            console.log(error);
          }
        });
    
        return () => {
          watchSubscription.unsubscribe();
        };
    }, [form, dispatch, validate, formName]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>{children({ form })}</form>
        </Form>
    )
}

export default FormPanel;