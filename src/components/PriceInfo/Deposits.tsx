import React from 'react';
import { TransactionFeeInfo } from '@jup-ag/react-hook';
import Tooltip from 'src/components/Tooltip';
import { formatNumber } from 'src/misc/utils';
import Decimal from 'decimal.js';

const Deposits = ({
  hasAtaDeposit,
  feeInformation,
}: {
  hasAtaDeposit: boolean;
  feeInformation: TransactionFeeInfo | undefined;
}) => {
  if (hasAtaDeposit) {
    return (
      <div className="flex items-start justify-between text-xs">
        <div className="flex w-[50%] text-primary-text/50">
          <span>Deposit</span>
          <Tooltip
            variant="dark"
            className="-mt-24"
            content={
              <div className="max-w-xs p-2 rounded-lg text-primary-text-75">
                <ul className="pl-2">
                  {hasAtaDeposit && (
                    <li>
                      <p>
                        <span>You need to have the token program in order to execute the trade.</span>
                      </p>
                    </li>
                  )}
                </ul>
              </div>
            }
          >
            <span className="ml-1 cursor-pointer">[?]</span>
          </Tooltip>
        </div>
        <div className="w-[50%] text-primary-text/50 text-xs text-right">
          {(() => {
            if (!feeInformation) {
              return 'Unable to determine fees';
            }

            const content = [
              hasAtaDeposit && (
                <p key="ata">
                  <span>
                    {formatNumber.format(
                      feeInformation?.ataDeposits
                        .reduce<Decimal>((s, deposit) => {
                          return s.add(deposit);
                        }, new Decimal(0))
                        .div(10 ** 9),
                    )}{' '}
                    SOL for {feeInformation?.ataDeposits?.length}{' '}
                    {(feeInformation?.ataDeposits?.length || 0) > 0 ? 'ATA account' : 'ATA accounts'}
                  </span>
                </p>
              ),
            ].filter(Boolean);

            if (content.length) {
              return content;
            }

            return '-';
          })()}
        </div>
      </div>
    );
  }

  return null;
};

export default Deposits;
