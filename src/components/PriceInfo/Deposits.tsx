import React from 'react';
import { TransactionFeeInfo } from '@jup-ag/react-hook';
import Tooltip from 'src/components/Tooltip';
import { formatNumber, fromLamports } from 'src/misc/utils';

const Deposits = ({
  hasSerumDeposit,
  hasAtaDeposit,
  feeInformation,
}: {
  hasSerumDeposit: boolean;
  hasAtaDeposit: boolean;
  feeInformation: TransactionFeeInfo | undefined;
}) => {
  if (hasSerumDeposit || hasAtaDeposit) {
    return (
      <div className="flex items-start justify-between text-xs">
        <div className="flex w-[50%] text-white/30">
          <span>Deposit</span>
          <Tooltip
            variant="dark"
            className="-mt-24"
            content={
              <div className="max-w-xs p-2 rounded-lg text-white-75">
                <ul className="pl-2">
                  {hasSerumDeposit && (
                    <li>
                      <p>
                        <span>Open serum require an OpenOrders account but it can be closed later on.</span>{' '}
                        <a
                          className="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          href="https://docs.google.com/document/d/1qEWc_Bmc1aAxyCUcilKB4ZYpOu3B0BxIbe__dRYmVns"
                        >
                          <span>Check here</span>
                        </a>
                        .
                      </p>
                    </li>
                  )}
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
        <div className="w-[50%] text-white/30 text-xs text-right">
          {(() => {
            const content = [
              hasAtaDeposit && (
                <p key="ata">
                  <span>
                    {formatNumber.format(
                      fromLamports(
                        feeInformation?.ataDeposits.reduce((s, deposit) => {
                          s += deposit;
                          return s;
                        }, 0),
                        9,
                      ),
                    )}{' '}
                    SOL for {feeInformation?.ataDeposits?.length}{' '}
                    {(feeInformation?.ataDeposits?.length || 0) > 0 ? 'ATA account' : 'ATA accounts'}
                  </span>
                </p>
              ),
              hasSerumDeposit && (
                <p key="serum">
                  <span>
                    {formatNumber.format(
                      fromLamports(
                        feeInformation?.openOrdersDeposits.reduce((s, deposit) => {
                          s += deposit;
                          return s;
                        }, 0),
                        9,
                      ),
                    )}{' '}
                    SOL for {feeInformation?.openOrdersDeposits.length}{' '}
                    {(feeInformation?.openOrdersDeposits?.length || 0) > 0
                      ? 'Serum OpenOrders account'
                      : 'Serum OpenOrders accounts'}
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
