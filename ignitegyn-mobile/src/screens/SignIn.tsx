import {
  Center,
  Heading,
  Image,
  ScrollView,
  Text,
  useToast,
  VStack,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';

import { useAuth } from '@hooks/useAuth';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import { AppError } from '@utils/AppError';

import BackgroundImg from '@assets/background.png';
import LogoSvg from '@assets/logo.svg';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useState } from 'react';

type FormData = {
  email: string;
  password: string;
};

export function SignIn() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  const { signIn } = useAuth();

  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  function handleNewAccount() {
    navigation.navigate('signUp');
  }

  async function handleSignIn({ email, password }: FormData) {
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError
        ? error.message
        : 'Não foi possivel entrar. Tente novamente mais tarde';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image
          defaultSource={BackgroundImg}
          source={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />

        <Center my={40}>
          <LogoSvg />
          <Text color="gray.100" fontSize="sm">
            Treine sua mente e seu corpo
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontFamily="heading" mb={6}>
            Acesse sua conta
          </Heading>

          <Controller
            control={control}
            name="email"
            rules={{ required: 'Informe o e-mail' }}
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Informe a senha' }}
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button
            title="Acessar"
            onPress={handleSubmit(handleSignIn)}
            isLoading={isLoading}
          />
        </Center>

        <Center mt={24}>
          <Text color="gray.100" fontSize="sm" fontFamily="body" mb={3}>
            Ainda não tenho acesso
          </Text>
          <Button
            title="Criar conta"
            variant="outline"
            onPress={handleNewAccount}
          />
        </Center>
      </VStack>
    </ScrollView>
  );
}
