import { cn } from "src/misc/cn";

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
      className={cn('w-10 h-[22px] flex items-center rounded-full p-[1px] cursor-pointer', className, {
        'bg-jupiter-jungle-green': active,
        'bg-[#010101]': !active,
      })}
      onClick={() => onClick(!active)}
    >
      <div
        className={cn(
          `w-[18px] h-[18px] rounded-full shadow-md transform duration-300 ease-in-out`,
          active ? activeClass : inactiveClass,
          dotClassName,
        )}
      ></div>
    </button>
  );
};

export default Toggle;
