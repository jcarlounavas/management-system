export interface Transaction {
  tx_date: string;
  description: string;
  reference_no: string;
  debit: number;
  credit: number;
  type: string;
  sender: string;
  receiver: string;
  balance: number;
}