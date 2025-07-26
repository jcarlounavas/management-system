import React, { useState } from 'react';

interface Transaction {
  tx_date: string;
  description: string;
  reference_no: string;
  debit: number;
  credit: number;
  balance: number | null;
  type: string;
  sender: string;
  receiver: string;
}

interface Summary {
  transactions: Transaction[];
}

interface SaveButtonProps {
  fileName: string;
  summary: Summary;
}

interface SummaryPayload {
  fileName: string;
  numberOfTransactions: number;
  transactions: Transaction[];
}

const SaveButton: React.FC<SaveButtonProps> = ({ fileName, summary }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (payload: SummaryPayload) => {
    if (!payload || payload.transactions.length === 0) return;

    setIsSaving(true);

    try {
      console.log("Sending to backend:", payload);

      const summaryResponse = await fetch('http://localhost:3001/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!summaryResponse.ok) {
        const errorDetails = await summaryResponse.json();
        throw new Error(
          `Summary POST failed with status ${summaryResponse.status}: ${JSON.stringify(errorDetails)}`
        );
      }

      const responseData = await summaryResponse.json();
      console.log("Summary saved successfully:", responseData);
      alert("Summary and transactions saved successfully.");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save summary and transactions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      className="btn btn-success"
      onClick={() => handleSubmit({
        fileName,
        numberOfTransactions: summary.transactions.length,
        transactions: summary.transactions
      })}
      disabled={isSaving}
    >
      {isSaving ? 'Saving...' : 'Save to Database'}
    </button>
  );
};

export default SaveButton;
