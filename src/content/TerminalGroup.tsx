import IntegratedTerminal from './IntegratedTerminal';
import ModalTerminal from './ModalTerminal';
import WidgetTerminal from './WidgetTerminal';
import { IInit } from 'src/types';

interface TerminalGroupProps {
  tab: IInit['displayMode'];
}

export const TerminalGroup = ({ tab }: TerminalGroupProps) => {
  return (
    <div className='h-[550px] w-[360px]'>
      {tab === 'modal' ? <ModalTerminal /> : null}
      {tab === 'integrated' ? <IntegratedTerminal /> : null}
      {tab === 'widget' ? <WidgetTerminal /> : null}
    </div>
  );
};
