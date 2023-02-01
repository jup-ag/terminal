import classNames from 'classnames';

type Props = {
  active: boolean;
  onClick: (active: boolean) => void;
  className?: string;
  dotClassName?: string;
};

const Toggle = ({ active, onClick, className, dotClassName }: Props) => {
  const activeClass = 'bg-white transform translate-x-full';
  const inactiveClass = 'bg-white';
  return (
    <button
      type="button"
      className={classNames('w-16 h-9 flex items-center rounded-full p-1 cursor-pointer', className, {
        'bg-jupiter-jungle-green': active,
        'bg-[#010101]': !active,
      })}
      onClick={() => onClick(!active)}
    >
      <div
        className={classNames(
          `h-7 w-7 rounded-full shadow-md transform duration-300 ease-in-out`,
          active ? activeClass : inactiveClass,
          dotClassName,
        )}
      ></div>
    </button>
  );
};

export default Toggle;
