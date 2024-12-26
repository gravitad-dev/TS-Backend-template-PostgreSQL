export interface VerifyTransactionResponse {
  verified: boolean;
  message: string;
  transactionStatus: 'Pending' | 'Confirming' | 'Completed' | 'Error';
  currentConfirmations: number;
  address?: string;
  transaction?: string;
  amountInEther?: string;
  requiredConfirmations: number;
  remainingConfirmations: number;
  error?: string;
}
