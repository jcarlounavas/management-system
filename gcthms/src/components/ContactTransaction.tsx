import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Transaction {
  tx_date: string;
  description_with_names: string;
  reference_no: string;
  debit: number;
  credit: number;
  type: string;
  balance: number;
}

interface Totals {
  total_debit: number;
  total_credit: number;
}

const ContactTransactions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [contactName, setContactName] = useState<string>('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/contacts/${id}/transactions`);
        const data = await res.json();
        setTransactions(data.transactions);
        setTotals(data.totals);
        if (data.transactions.length > 0) {
          setContactName(data.transactions[0].contact_name);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    if (id) {
      fetchTransactions();
    }
  }, [id]);

  return (
      <div className="container mt-4">
        <h2 className="mb-3">Transactions with {contactName}</h2>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Reference No</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{new Date(tx.tx_date).toLocaleDateString()}</td>
                  <td>{tx.description_with_names}</td>
                  <td>{tx.reference_no}</td>
                  <td>{tx.debit > 0 ? `₱${tx.debit.toLocaleString()}` : '-'}</td>
                  <td>{tx.credit > 0 ? `₱${tx.credit.toLocaleString()}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default ContactTransactions;
