import IntegratedPlugin from './IntegratedPlugin';
import ModalPlugin from './ModalPlugin';
import WidgetPlugin from './WidgetPlugin';
import { IInit } from 'src/types';

interface PluginGroupProps {
  tab: IInit['displayMode'];
}

export const PluginGroup = ({ tab }: PluginGroupProps) => {
  return (
    <div className='min-h-[550px] w-[360px]'>
      {tab === 'modal' ? <ModalPlugin /> : null}
      {tab === 'integrated' ? <IntegratedPlugin /> : null}
      {tab === 'widget' ? <WidgetPlugin /> : null}
    </div>
  );
};
