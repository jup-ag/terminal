import { useQuery } from '@tanstack/react-query';
import { Severity, ultraSwapService, Warning } from 'src/data/UltraSwapService';
import { useMobile } from 'src/hooks/useMobile';
import PopoverTooltip from './Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import { useCallback } from 'react';
import Plural from './Plural';
import WarningIcon from 'src/icons/WarningIcon';
import InfoIcon from 'src/icons/InfoIcon';

const parseShieldWarningtoSentenceCase = (warning: { type: string }) => {
  const str = warning.type.replace(/_/g, ' ');
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Warnings = ({
  warning,
  children,
  isHighRisk,
}: {
  warning: Warning;
  children: React.ReactNode;
  isHighRisk: boolean;
}) => {
  const warningTitle = useCallback((warning: Warning) => {
    return parseShieldWarningtoSentenceCase(warning);
  }, []);

  return (
    <div key={warning.type} className="flex gap-1">
      {children}
      <div className="flex flex-1 flex-col">
        <span className={cn('text-neutral-300', isHighRisk && 'text-amber-400')}>{warningTitle(warning)}</span>
        <span className={cn('text-neutral-500', isHighRisk && 'text-amber-200')}>{warning.message}</span>
      </div>
    </div>
  );
};
const JupShield = ({ tokenAddress }: { tokenAddress: string }) => {
  const isMobile = useMobile();
  const { data, isFetching } = useQuery({
    queryKey: ['shield', tokenAddress],
    queryFn: () => ultraSwapService.getShield([tokenAddress]),
    cacheTime: 5 * 60_000,
    staleTime: 5 * 60_000,
    keepPreviousData: true,
    select: (data) => data.warnings[tokenAddress],
  });

  const isNotVerified = data?.find((warning) => warning.type === 'NOT_VERIFIED');

  if (!data || data?.length === 0 || !isNotVerified) return null;

  const totalWarnings = data.length;
  const highRiskWarnings = data.filter(
    (warning) => warning.severity === Severity.CRITICAL || warning.severity === Severity.WARNING,
  );
  const otherWarnings = data.filter((warning) => warning.severity === Severity.INFO);
  return (
    <PopoverTooltip
      persistOnClick={isMobile}
      placement="bottom"
      drawShades
      buttonContentClassName="!cursor-help"
      offset={[140, 5]}
      content={
        <div className="flex flex-col gap-y-2 p-0">
          <div className="text-sm font-semibold text-amber-400">
            {totalWarnings} JupShield <Plural one="Warning" other="Warnings" value={totalWarnings} />
          </div>

          {highRiskWarnings.length > 0 && (
            <div className="flex flex-col gap-y-2 rounded-md bg-amber-400/[8%] p-2">
              {highRiskWarnings.map((warning) => (
                <Warnings key={warning.type} warning={warning} isHighRisk={true}>
                  <InfoIcon width={15} height={15} className="text-amber-400" />
                </Warnings>
              ))}
            </div>
          )}

          {otherWarnings.length > 0 && (
            <div className={cn('flex flex-col gap-y-2', highRiskWarnings.length > 0 && 'p-2')}>
              {otherWarnings.map((warning) => (
                <Warnings key={warning.type} warning={warning} isHighRisk={false}>
                  <InfoIcon width={15} height={15} />
                </Warnings>
              ))}
            </div>
          )}
        </div>
      }
    >
      <div className={cn('mt-1 flex items-center gap-x-1', isFetching && 'blur-sm')}>
        <InfoIcon width={15} height={15} className="text-amber-400" />
        <span
          className={cn(
            '!text-xxs font-semibold text-amber-400 underline decoration-amber-400 decoration-dashed underline-offset-4',
          )}
        >
          {totalWarnings} Warnings
        </span>
      </div>
    </PopoverTooltip>
  );
};

export default JupShield;
