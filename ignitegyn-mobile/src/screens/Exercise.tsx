import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { ScrollView } from 'react-native';

import {
  Box,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  useToast,
  VStack,
} from 'native-base';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';

import { Feather } from '@expo/vector-icons';

import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionsSvg from '@assets/repetitions.svg';

import { Button } from '@components/Button';
import { ExercisesDTO } from '@dtos/ExercisesDTO';
import { Loading } from '@components/Loading';

type RouteParamsProps = {
  exerciseId: string;
};

export function Exercise() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const routes = useRoute();
  const toast = useToast();

  const { exerciseId } = routes.params as RouteParamsProps;

  const [isLoading, setIsLoading] = useState(true);
  const [sendingRegister, setSendingRegister] = useState(false);
  const [exercise, setExercise] = useState<ExercisesDTO>({} as ExercisesDTO);

  function handleGoBack() {
    navigation.goBack();
  }

  async function fetchExercisesDetails() {
    setIsLoading(true);
    try {
      const response = await api.get(`/exercises/${exerciseId}`);
      setExercise(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possivel carregar os detalhes do exercício';
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExerciseHistoryRegister() {
    setSendingRegister(true);
    try {
      await api.post('/history', { exercise_id: exerciseId });

      toast.show({
        title: 'Parabéns! Exercício registrado em seu histórico',
        placement: 'top',
        bgColor: 'green.700',
        duration: 1500,
      });

      setTimeout(() => {
        navigation.navigate('history');
      }, 2000);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possivel registrar o exercício';
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setSendingRegister(false);
    }
  }

  useEffect(() => {
    fetchExercisesDetails();
  }, [exerciseId]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1}>
          <VStack px={8} bg="gray.600" pt={16}>
            <HStack
              justifyContent="space-between"
              mt={4}
              mb={8}
              alignItems="center"
            >
              <IconButton
                icon={
                  <Icon
                    as={Feather}
                    name="arrow-left"
                    color="green.500"
                    size={6}
                  />
                }
                colorScheme="gray"
                onPress={handleGoBack}
                _pressed={{ borderColor: 'green.500', borderWidth: 1 }}
              />
              <Heading
                color="gray.100"
                fontSize="lg"
                fontFamily="heading"
                flexShrink={1}
              >
                {exercise.name}
              </Heading>

              <HStack alignItems="center">
                <BodySvg />
                <Text color="gray.200" ml={1} textTransform="capitalize">
                  {exercise.group}
                </Text>
              </HStack>
            </HStack>
          </VStack>

          <ScrollView>
            <VStack p={8}>
              <Box rounded="lg" mb={3} overflow="hidden">
                <Image
                  w="full"
                  h={80}
                  source={{
                    uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`,
                  }}
                  alt="Nome do exercicio"
                  resizeMode="cover"
                  rounded="lg"
                />
              </Box>

              <Box bg="gray.600" rounded="md" pb={4} px={4}>
                <HStack
                  alignItems="center"
                  justifyContent="space-around"
                  mb={6}
                  mt={5}
                >
                  <HStack>
                    <SeriesSvg />
                    <Text color="gray.200" ml={2}>
                      {exercise.series} séries
                    </Text>
                  </HStack>

                  <HStack>
                    <RepetitionsSvg />
                    <Text color="gray.200" ml={2}>
                      {exercise.repetitions} repetições
                    </Text>
                  </HStack>
                </HStack>

                <Button
                  title="Marcar como realizado"
                  onPress={handleExerciseHistoryRegister}
                  isLoading={sendingRegister}
                />
              </Box>
            </VStack>
          </ScrollView>
        </VStack>
      )}
    </>
  );
}
