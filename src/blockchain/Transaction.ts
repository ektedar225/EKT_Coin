export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  signature?: string;
}