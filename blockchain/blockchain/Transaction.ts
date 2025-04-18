export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  signature?: string;
  status: 'success' | 'failed';
  failureReason?: string;
}