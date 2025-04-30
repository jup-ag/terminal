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

const JupShieldIcon: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" width="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none">
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          d="M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.405 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.081C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z"
        />
        <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M12 8v4" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
      </g>
    </svg>
  );
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
    select: (data) => {
      const warnings = data.warnings[tokenAddress];
      return {
        isNotVerified: warnings.find((warning) => warning.type === 'NOT_VERIFIED'),
        totalWarnings: warnings.length,
        highRiskWarnings: warnings.filter(
          (warning) => warning.severity === Severity.CRITICAL || warning.severity === Severity.WARNING,
        ),
        otherWarnings: warnings.filter((warning) => warning.severity === Severity.INFO),
      };
    },
  });

  if (!data || data.totalWarnings === 0) return null;

  const { isNotVerified, totalWarnings, highRiskWarnings, otherWarnings } = data;
  if (!isNotVerified) return null;

  return (
    <PopoverTooltip
      persistOnClick={isMobile}
      placement="bottom"
      drawShades
      buttonContentClassName="!cursor-help"
      offset={[130, 5]}
      content={
        <div className="flex flex-col gap-y-2 p-0 ">
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
        <JupShieldIcon width={15} height={15} className="text-amber-400" />
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
