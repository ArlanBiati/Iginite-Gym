import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import {
  Center,
  Heading,
  Image,
  ScrollView,
  Text,
  useToast,
  VStack,
} from 'native-base';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';

import { AppError } from '@utils/AppError';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

interface FormDataProps {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

const signUpSchema = Yup.object({
  name: Yup.string().required('Informe o Nome'),
  email: Yup.string().required('Informe o Email').email('Email inválido'),
  password: Yup.string()
    .required('Informe uma Senha')
    .min(6, 'A senha deve ter pelo menos seis digitos'),
  password_confirm: Yup.string()
    .required('Confirme a Senha')
    .oneOf([Yup.ref('password')], 'As senhas devem ser iguais'),
});

export function SignUp() {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirm: '',
    },
    resolver: yupResolver(signUpSchema),
  });

  function handleGoBack() {
    navigation.goBack();
  }

  async function handleSignUp({ name, email, password }: FormDataProps) {
    setIsLoading(true);
    try {
      await api.post('/users', {
        name,
        email,
        password,
      });

      await signIn(email, password);
    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError
        ? error.message
        : 'Não foi possivel criar a conta, tente novamente mais tarde';
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }

    // fetch('http://192.168.0.110:3333/users', {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     name,
    //     email,
    //     password,
    //   }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => console.log(data));
    reset();
  }

  return (
    <VStack flex={1} px={10} pb={16}>
      <Image
        defaultSource={BackgroundImg}
        source={BackgroundImg}
        alt="Pessoas treinando"
        resizeMode="contain"
        position="absolute"
      />

      <Center my={24}>
        <LogoSvg />
        <Text color="gray.100" fontSize="sm">
          Treine sua mente e seu corpo
        </Text>
      </Center>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Center>
          <Heading color="gray.100" fontFamily="heading" mb={6}>
            Crie sua conta
          </Heading>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirme a Senha"
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            )}
          />

          <Button
            title="Criar e acessar"
            onPress={handleSubmit(handleSignUp)}
            isLoading={isLoading}
          />
        </Center>

        <Center mt={12}>
          <Button
            title="Voltar para o login"
            variant="outline"
            onPress={handleGoBack}
          />
        </Center>
      </ScrollView>
    </VStack>
  );
}
