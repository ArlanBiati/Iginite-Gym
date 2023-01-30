import {
  IInputProps,
  Input as NativeBaseInput,
  FormControl,
} from 'native-base';

interface InputProps extends IInputProps {
  bgColor?: string;
  errorMessage?: string | null;
}

export function Input({
  bgColor = 'gray.700',
  errorMessage = null,
  isInvalid,
  ...rest
}: InputProps) {
  const invalid = !!errorMessage || isInvalid;

  return (
    <FormControl isInvalid={invalid} mb={4}>
      <NativeBaseInput
        {...rest}
        bg={bgColor}
        h={14}
        px={4}
        borderWidth={0}
        fontSize="md"
        fontFamily="body"
        color="white"
        mb={4}
        placeholderTextColor="gray.300"
        isInvalid={invalid}
        _invalid={{
          borderWidth: 1,
          borderColor: 'red.500',
        }}
        _focus={{
          bg: 'gray.700',
          borderWidth: 1,
          borderColor: 'green.500',
        }}
      />
      <FormControl.ErrorMessage _text={{ color: 'red.500' }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}
