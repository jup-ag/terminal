import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type ResponseData = {
  result?: string;
  error?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const walletPublicKey = req.body;
  if (walletPublicKey === undefined || typeof walletPublicKey !== 'string') {
    return res.status(400).json({
      error: 'walletPublicKey is required as a string',
    });
  }

  res.status(200).json({
    result: crypto
      .createHash('sha512')
      .update((walletPublicKey + process.env.MERCURYO_SECRET_KEY) as string)
      .digest('hex'),
  });
}
