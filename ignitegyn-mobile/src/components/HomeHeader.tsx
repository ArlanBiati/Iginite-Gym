import { Heading, HStack, Icon, IconButton, Text, VStack } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';

import { UserPhoto } from './UserPhoto';

import defaultUserPhotoImg from '@assets/userPhotoDefault.png';

export function HomeHeader() {
  const { user, signOut } = useAuth();

  return (
    <HStack bgColor="gray.600" pt={16} pb={5} px={8} alignItems="center">
      <UserPhoto
        source={
          user.avatar
            ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
            : defaultUserPhotoImg
        }
        alt="Imagem do usuário"
        size={16}
        mr={4}
      />
      <VStack flex={1}>
        <Text color="gray.100" fontSize="md">
          Olá,
        </Text>
        <Heading color="gray.100" fontSize="md" fontFamily="heading">
          {user.name}
        </Heading>
      </VStack>
      <IconButton
        icon={
          <Icon as={MaterialIcons} name="logout" color="gray.200" size={7} />
        }
        colorScheme="gray"
        _pressed={{ borderColor: 'green.500', borderWidth: 1 }}
        onPress={signOut}
      />
    </HStack>
  );
}
