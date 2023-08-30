export type DcaIntegration = {
  version: '0.1.0';
  name: 'dca_integration';
  instructions: [
    {
      name: 'setupDca';
      accounts: [
        {
          name: 'jupDcaProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'jupDca';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'jupDcaInAta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'jupDcaOutAta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'jupDcaEventAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'inputMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'outputMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'escrow';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'escrowInAta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'escrowOutAta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'applicationIdx';
          type: 'u64';
        },
        {
          name: 'inAmount';
          type: 'u64';
        },
        {
          name: 'inAmountPerCycle';
          type: 'u64';
        },
        {
          name: 'cycleFrequency';
          type: 'i64';
        },
        {
          name: 'minOutAmount';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'maxOutAmount';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'startAt';
          type: {
            option: 'i64';
          };
        },
      ];
    },
    {
      name: 'close';
      accounts: [
        {
          name: 'inputMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'outputMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'escrow';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'escrowInAta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'dca';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'escrowOutAta';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'escrow';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'idx';
            type: 'u64';
          },
          {
            name: 'user';
            type: 'publicKey';
          },
          {
            name: 'inputMint';
            type: 'publicKey';
          },
          {
            name: 'outputMint';
            type: 'publicKey';
          },
          {
            name: 'dca';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'DCANotClosed';
      msg: 'DCA Account not yet closed';
    },
    {
      code: 6001;
      name: 'UnexpectedBalance';
      msg: 'Unexpected Balance';
    },
  ];
};

export const IDL: DcaIntegration = {
  version: '0.1.0',
  name: 'dca_integration',
  instructions: [
    {
      name: 'setupDca',
      accounts: [
        {
          name: 'jupDcaProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'jupDca',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'jupDcaInAta',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'jupDcaOutAta',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'jupDcaEventAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'inputMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'outputMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrowInAta',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrowOutAta',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'applicationIdx',
          type: 'u64',
        },
        {
          name: 'inAmount',
          type: 'u64',
        },
        {
          name: 'inAmountPerCycle',
          type: 'u64',
        },
        {
          name: 'cycleFrequency',
          type: 'i64',
        },
        {
          name: 'minOutAmount',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'maxOutAmount',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'startAt',
          type: {
            option: 'i64',
          },
        },
      ],
    },
    {
      name: 'close',
      accounts: [
        {
          name: 'inputMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'outputMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrow',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'escrowInAta',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'dca',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'escrowOutAta',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'escrow',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'idx',
            type: 'u64',
          },
          {
            name: 'user',
            type: 'publicKey',
          },
          {
            name: 'inputMint',
            type: 'publicKey',
          },
          {
            name: 'outputMint',
            type: 'publicKey',
          },
          {
            name: 'dca',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'DCANotClosed',
      msg: 'DCA Account not yet closed',
    },
    {
      code: 6001,
      name: 'UnexpectedBalance',
      msg: 'Unexpected Balance',
    },
  ],
};
