import { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import {
  Center,
  Heading,
  ScrollView,
  Skeleton,
  Text,
  useToast,
  VStack,
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { useAuth } from '@hooks/useAuth';

import { api } from '@services/api';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { AppError } from '@utils/AppError';

import defaultUserPhotoImg from '@assets/userPhotoDefault.png';

const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  old_password: string;
};

const profileSchema = Yup.object({
  name: Yup.string().required('Informe o nome'),
  password: Yup.string()
    .min(6, 'A senha deve ter pelo menos seis digitos')
    .nullable()
    .transform((value) => (!!value ? value : null)),
  confirm_password: Yup.string()
    .nullable()
    .transform((value) => (!!value ? value : null))
    .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
    .when('password', {
      is: (Field: any) => Field,
      then: Yup.string()
        .nullable()
        .required('Informe a confirmação de senha')
        .transform((value) => (!!value ? value : null)),
    }),
});

export function Profile() {
  const { user, updateUserProfile } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema),
  });

  const toast = useToast();

  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function updatedUserPhoto(photo: any) {
    try {
      const fileExtension = photo.assets[0].uri.split('.').pop();

      const photoFile = {
        name: `${user.name}.${fileExtension}`.toLocaleLowerCase(),
        uri: photo.assets[0].uri,
        type: `${photo.assets[0].type}/${fileExtension}`,
      } as any;

      const userPhotoUploadForm = new FormData();
      userPhotoUploadForm.append('avatar', photoFile);

      const avatarUpdatedResponse = await api.patch(
        '/users/avatar',
        userPhotoUploadForm,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const userUpdated = user;
      userUpdated.avatar = avatarUpdatedResponse.data.avatar;

      updateUserProfile(userUpdated);

      toast.show({
        title: 'Avatar atualizado.',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      throw error;
    }
  }

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true);
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri
        );

        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'Essa imagem é muito grande. Escolha uma de até 5MB.',
            placement: 'top',
            bgColor: 'red.500',
          });
        }

        updatedUserPhoto(photoSelected);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possivel carregar a imagem.');
    } finally {
      setPhotoIsLoading(false);
    }
  }

  async function handleUpdateProfile(data: FormDataProps) {
    setIsLoading(true);
    try {
      const userUpdated = user;
      userUpdated.name = data.name;

      await api.put('/users', data);

      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Perfil atualizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possivel atualizar o perfil.';

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
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView mb={4}>
        <Center mt={6} px={10}>
          {photoIsLoading ? (
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded="full"
              startColor="gray.500"
              endColor="gray.400"
            />
          ) : (
            <UserPhoto
              source={
                user.avatar
                  ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                  : defaultUserPhotoImg
              }
              alt="Foto do usuário"
              size={PHOTO_SIZE}
            />
          )}

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color="green.500"
              fontFamily="heading"
              fontSize="md"
              mt={2}
              mb={8}
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                bgColor="gray.600"
                value={value}
                onChangeText={onChange}
                placeholder="Nome"
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                bgColor="gray.600"
                value={value}
                onChangeText={onChange}
                placeholder="E-mail"
                isDisabled
              />
            )}
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color="gray.200" fontSize="md" mb={2} fontFamily="heading">
            Alterar senha
          </Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                bgColor="gray.600"
                placeholder="Senha antiga"
                onChangeText={onChange}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                bgColor="gray.600"
                placeholder="Nova senha"
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input
                bgColor="gray.600"
                placeholder="Confirme a nova senha"
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            isLoading={isLoading}
            onPress={handleSubmit(handleUpdateProfile)}
          />
        </VStack>
      </ScrollView>
    </VStack>
  );
}
2;
