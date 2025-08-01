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
  contact_name?: string;
}

const ContactTransactions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contactName, setContactName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/contacts/${id}/transactions`);
        const data = await res.json();
        setTransactions(data.transactions);

        if (data.transactions.length > 0) {
          setContactName(data.transactions[0].contact_name);

          // Default: filter all June transactions if no filters are selected
          if (!startDate && !endDate) {
            const juneStart = new Date('2025-06-01');
            const juneEnd = new Date('2025-06-30');
            setStartDate(juneStart.toISOString().split('T')[0]);
            setEndDate(juneEnd.toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    if (id) fetchTransactions();
  }, [id]);

 const filteredTransactions = transactions.filter(tx => {
  const txDate = new Date(tx.tx_date);
  txDate.setHours(0, 0, 0, 0);

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  return (!start || txDate >= start) && (!end || txDate <= end);
});

  const totalDebit = filteredTransactions.reduce((sum, tx) => sum + Number(tx.debit || 0), 0);
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + Number(tx.credit || 0), 0);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Transactions with {contactName}</h2>

      <div className="d-flex gap-2 mb-3">
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="form-control"
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th className="text-center">Date</th>
              <th className="text-center">Description</th>
              <th className="text-center">Reference No</th>
              <th className="text-center">Debit</th>
              <th className="text-center">Credit</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, idx) => (
              <tr key={idx}>
                <td className="text-center">
                  {new Date(tx.tx_date).toLocaleDateString('en-US')}
                </td>
                <td className="text-center">{tx.description_with_names}</td>
                <td className="text-center">{tx.reference_no}</td>
                <td className="text-end">
                  {tx.debit > 0 ? currency.format(tx.debit) : '-'}
                </td>
                <td className="text-end">
                  {tx.credit > 0 ? currency.format(tx.credit) : '-'}
                </td>
              </tr>
            ))}
            <tr className="table-footer">
              <td colSpan={3}>Total</td>
              <td className="text-end">{currency.format(totalDebit)}</td>
              <td className="text-end">{currency.format(totalCredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactTransactions;
