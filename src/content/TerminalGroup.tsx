import IntegratedTerminal from './IntegratedTerminal';
import ModalTerminal from './ModalTerminal';
import WidgetTerminal from './WidgetTerminal';
import { IInit } from 'src/types';

interface TerminalGroupProps {
  tab: IInit['displayMode'];
}

export const TerminalGroup = ({ tab }: TerminalGroupProps) => {
  return (
    <>
      {tab === 'modal' ? <ModalTerminal /> : null}
      {tab === 'integrated' ? <IntegratedTerminal /> : null}
      {tab === 'widget' ? <WidgetTerminal /> : null}
    </>
  );
};
