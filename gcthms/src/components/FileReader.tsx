
import React, { useState, useEffect } from 'react';
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import SaveButton from './SaveButton';

// import Spinner from "./loading/Spinner";

export interface Transaction {
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

export interface Summary {
  transactions: Transaction[];
  totalCredit: number;
  totalDebit: number;
  totalBalance: number;
  fileName: string; 
  pairSummaries?: {
    pair: string;
    count: number;
    totalDebit: number;
    totalCredit: number;
  }[];
}



const FileReader = ({ file, accNum }: { file: File | null, accNum: string }) => {

  const [fileName, setFileName] = useState<string>('');
  const myAccount = accNum;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);



  useEffect(() => {
    if (file) {
    setUploadedFile(file);
    setFileName(file.name); 
  }
    const extractStartingBalance = (lines: string[]): number | null => {
      for (const line of lines) {
        if (/starting balance/i.test(line)) {
          const match = line.match(/(\d{1,3}(?:,\d{3})*|\d+)\.\d{2}/);
          if (match) return parseFloat(match[1].replace(/,/g, ""));
        }
      }
      for (const line of lines) {
        const match = line.match(/(\d{1,3}(?:,\d{3})*|\d+)\.\d{2}(?=\s*$)/);
        if (match) return parseFloat(match[1].replace(/,/g, ""));
      }
      return null;
    };

    const parseTransactions = (text: string): Summary => {
      const lines = text.split("\n");
      let totalCredit = 0;
      let totalDebit = 0;
      const transactions: Transaction[] = [];
      const pairMap = new Map<string, { count: number; totalDebit: number; totalCredit: number }>();

      let runningBalance: number | null = extractStartingBalance(lines);
      if (runningBalance == null) runningBalance = 0;

      const pushTransaction = (tx: Omit<Transaction, "balance">, debit: number, credit: number) => {
        if (runningBalance != null) {
          runningBalance += credit;
          runningBalance -= debit;
        }
        transactions.push({ ...tx, balance: runningBalance });
      };

      for (const line of lines) {
        const dateMatch = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)/i);
        const tx_date = dateMatch ? dateMatch[0] : "";


        const referenceMatch = line.match(/\b\d{13,}\b/);
        const reference_no = referenceMatch ? referenceMatch[0] : "";

        const buildPair = (label: string, debit: number, credit: number) => {
          if (!pairMap.has(label)) pairMap.set(label, { count: 0, totalDebit: 0, totalCredit: 0 });
          const group = pairMap.get(label)!;
          group.count++;
          group.totalDebit += debit;
          group.totalCredit += credit;
        };

        const patterns: {
          regex: RegExp;
          type: string;
          process: (match: RegExpMatchArray) => void;
        }[] = [
          {
            regex: /Transfer from\s+(\d{7,})\s+to\s+(\d{7,})\s+(?:\d+\s+)?([\d,.]+)(?:\s+([\d,.]+))?/i,
            type: "Transfer",
            process: (m) => {
              const [_, sender, receiver, debitStr, creditStr] = m;
              const debit = parseFloat(debitStr.replace(/,/g, ""));
              const credit = creditStr ? parseFloat(creditStr.replace(/,/g, "")) : 0;
              const description = `Transfer from ${sender} to ${receiver}`;
              let d = 0, c = 0;
              if (sender === myAccount) d = debit;
              if (receiver === myAccount) c = debit;
              totalDebit += d;
              totalCredit += c;
              buildPair(description, d, c);
              pushTransaction({ tx_date, description, reference_no, type: "Transfer", sender, receiver, debit: d, credit: c }, d, c);
            },
          },
          {
            regex: /Refund from\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i,
            type: "Refund",
            process: (m) => {
              const [, sender, creditStr] = m;
              const credit = parseFloat(creditStr.replace(/,/g, ""));
              totalCredit += credit;
              const description = `Refund from ${sender}`;
              buildPair(description, 0, credit);
              pushTransaction({ tx_date, description, reference_no, type: "Refund", sender, receiver: myAccount, debit: 0, credit }, 0, credit);
            },
          },
          {
            regex: /Payment to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i,
            type: "Payment",
            process: (m) => {
              const [, receiver, debitStr] = m;
              const debit = parseFloat(debitStr.replace(/,/g, ""));
              totalDebit += debit;
              const description = `Payment to ${receiver}`;
              buildPair(description, debit, 0);
              pushTransaction({ tx_date, description, reference_no, type: "Payment", sender: myAccount, receiver, debit, credit: 0 }, debit, 0);
            },
          },
          {
            regex: /GGives Auto Repayment.*?([\d,.]+)\s+([\d,.]+)\s+\d{4}-\d{2}-\d{2}/i,
            type: "GGives",
            process: (m) => {
              const debit = parseFloat(m[1].replace(/,/g, ""));
              totalDebit += debit;
              const description = "GGives Auto Repayment";
              buildPair(description, debit, 0);
              pushTransaction({ tx_date, description, reference_no, type: "GGives", sender: myAccount, receiver: "", debit, credit: 0 }, debit, 0);
            },
          },
          {
            regex: /GCredit\s+([A-Za-z0-9]+).*?\b\d{11,}\b.*?([\d,.]+)/i,
            type: "GCredit",
            process: (m) => {
              const id = m[1];
              const debit = parseFloat(m[2].replace(/,/g, ""));
              totalDebit += debit;
              const description = `GCredit ${id}`;
              buildPair("GCredit", debit, 0);
              pushTransaction({ tx_date, description, reference_no, type: "GCredit", sender: myAccount, receiver: "", debit, credit: 0 }, debit, 0);
            },
          },
          {
            regex: /Cash-out to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i,
            type: "Cashout",
            process: (m) => {
              const [, receiver, debitStr] = m;
              const debit = parseFloat(debitStr.replace(/,/g, ""));
              totalDebit += debit;
              const description = `Cash-out to ${receiver}`;
              buildPair(description, debit, 0);
              pushTransaction({ tx_date, description, reference_no, type: "Cashout", sender: myAccount, receiver, debit, credit: 0 }, debit, 0);
            },
          },
        ];

        for (const { regex, process } of patterns) {
          const match = line.match(regex);
          if (match) {
            process(match);
            break;
          }
        }
      }

      return {
        fileName,
        transactions,
        totalCredit,
        totalDebit,
        totalBalance: runningBalance,
        pairSummaries: Array.from(pairMap.entries()).map(([pair, d]) => ({
          pair,
          ...d,
        })),
      };
    };

    // const sendToBackend = async (txs: Transaction[]) => {
    //   try {
    //     const res = await fetch("http://localhost:3001/api/transactions", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(txs),
    //     });
    //     const result = await res.json();
    //     console.log("POST success");
    //   } catch (err) {
    //     console.error("POST failed:", err);
    //   }
    // };

    const readPdfText = async () => {
  if (!file) return;

  try {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      setLoading(true);

      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      let pdf: PDFDocumentProxy;
      let passwordTries = 0;

      const loadDocument = async () => {
        const loadingTask = pdfjsLib.getDocument({
          data: typedArray,
          password: "", // initial blank, real one from prompt
        });

        loadingTask.onPassword = (
          callback: (password: string) => void,
          reason: number
        ) => {
          if (reason === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
            const pw = prompt("This PDF is password protected. Enter password:") || "";
            if (!pw) {
              setError("Password is required to open the file.");
              loadingTask.destroy();
              return;
            }
            callback(pw);
          } else if (reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
            passwordTries++;
            const pw = prompt("Incorrect password. Please try again:") || "";
            if (!pw) {
              setError("Failed to open PDF due to incorrect password.");
              loadingTask.destroy();
              return;
            }
            callback(pw);
          }
        };

        try {
          pdf = await loadingTask.promise;
        } catch (err) {
          console.error("PDF loading failed:", err);
          setError("Unable to open PDF. Check password or file.");
          return;
        }

        let fullText = "";

        for (let page = 1; page <= pdf.numPages; page++) {
          const pageObj: PDFPageProxy = await pdf.getPage(page);
          const content = await pageObj.getTextContent();
          fullText += content.items.map((i: any) => i.str).join(" ") + "\n";
        }

        const cleaned = fullText.replace(
          /\b(GGives Auto Repayment|Transfer from|Payment to|Refund from|Bills Payment to|Cash-out to|GCredit)\b/gi,
          "\n$1"
        );

        

        const parsed = parseTransactions(cleaned);


          const transactionsWithFileName = parsed.transactions.map(tx => ({
          ...tx,
          file_name: fileName,
        }));
        setSummary({ ...parsed, fileName: file.name });
        // await sendToBackend(transactionsWithFileName);
      };

      await loadDocument();
      setLoading(false);

    };

    reader.onerror = () => setError("PDF read error.");
  } catch (err) {
    console.error("Error reading PDF:", err);
    setError("PDF processing error.");
  }
};


    readPdfText();
  }, [file]);

  return (
  <div className="transaction-summary-ui">
    <h2 className="section-title">Transaction Summary</h2>

  <form>
    {loading ? (
      <div className="text-center my-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : summary?.pairSummaries && summary.pairSummaries.length > 0 ? (
      <div className="table-wrapper">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th className='text-center'>Sender → Receiver</th>
              <th className='text-center'>Number of Transactions</th>
              <th className='text-center'>Total Debit</th>
              <th className='text-center'>Total Credit</th>
            </tr>
          </thead>
          <tbody>
            {summary.pairSummaries
              .sort((a, b) => b.count - a.count)
              .map((item, index) => (
                <tr key={index}>
                  <td>{item.pair}</td>
                  <td className='text-center'>{item.count}</td>
                  <td className='text-end'>{item.totalDebit.toLocaleString()}</td>
                  <td className='text-end'>{item.totalCredit.toLocaleString()}</td>
                </tr>
              ))}
            <tr className="table-footer">
              <td>Total</td>
              <td>{summary.transactions.length}</td>
              <td>{summary.totalDebit.toLocaleString()}</td>
              <td>{summary.totalCredit.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    ) : (
      <div className="alert alert-info text-center">No transactions found.</div>
    )}
  </form>
    

    {summary && (
  <SaveButton
    summary={summary}
    fileName={uploadedFile?.name || ''}
  />
)}





  </div>
);

};

export default FileReader;
