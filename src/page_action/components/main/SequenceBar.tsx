import { Container, UseHooks, View } from '@foo-x/react-container';
import { useContext } from 'react';
import { CurrentTimeStateContext } from 'src/page_action/contexts/CurrentTimeContext';

type Props = unknown;

type HooksResult = {
  currentTime: number;
  duration: number;
};

export const useHooks: UseHooks<Props, HooksResult> = () => {
  const result = useContext(CurrentTimeStateContext);
  return result;
};

export const view: View<Props, HooksResult> = ({
  hooksResult: { currentTime },
}) => {
  // TODO
  return <div>{currentTime}</div>;
};

const SequenceBar = Container({ useHooks, view });

export default SequenceBar;
