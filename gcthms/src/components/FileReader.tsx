// FileReader.tsx

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
// import Spinner from "./loading/Spinner";

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
  totalCredit: number;
  totalDebit: number;
  totalBalance: number;
  pairSummaries?: {
    pair: string;
    count: number;
    totalDebit: number;
    totalCredit: number;
  }[];
}

const FileReader = ({ file }: { file: File | null }) => {
  const myAccount = "09065999634";
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
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
        const dateMatch = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (AM|PM)/i);
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

    const sendToBackend = async (txs: Transaction[]) => {
      try {
        const res = await fetch("http://localhost:3001/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(txs),
        });
        const result = await res.json();
        console.log("POST success");
      } catch (err) {
        console.error("POST failed:", err);
      }
    };

    const readPdfText = async () => {
      if (!file) return;
      try {
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument({
            data: typedArray,
            password: "",
          });

          loadingTask.onPassword = (callback: (pw: string) => void) => {
            const pw = prompt("Enter PDF password:") || "";
            callback(pw);
          };

          const pdf = await loadingTask.promise;
          let fullText = "";

          for (let page = 1; page <= pdf.numPages; page++) {
            const content = await pdf.getPage(page).then(p => p.getTextContent());
            fullText += content.items.map((i: any) => i.str).join(" ") + "\n";
          }

          const cleaned = fullText.replace(/\b(GGives Auto Repayment|Transfer from|Payment to|Refund from|Bills Payment to|Cash-out to|GCredit)\b/gi, "\n$1");
          const parsed = parseTransactions(cleaned);
          setSummary(parsed);
          await sendToBackend(parsed.transactions);
        };
        reader.onerror = () => setError("PDF read error.");
      } catch {
        setError("PDF processing error.");
      }
    };

    readPdfText();
  }, [file]);

  return (
    <div className="transaction-summary-ui">
      <h2 className="section-title">Transaction Summary</h2>
      {/* <Spinner /> */}

      {summary?.pairSummaries && summary.pairSummaries.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sender → Receiver</th>
                <th>Number of Transactions</th>
                <th>Total Debit</th>
                <th>Total Credit</th>
              </tr>
            </thead>
            <tbody>
              {summary.pairSummaries
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.pair}</td>
                    <td>{item.count}</td>
                    <td>{item.totalDebit.toLocaleString()}</td>
                    <td>{item.totalCredit.toLocaleString()}</td>
                  </tr>
                ))}
              <tr className="table-footer">
                <td>Total</td>
                <td></td>
                <td>{summary.transactions.length}</td>
                <td>{summary.totalDebit.toLocaleString()}</td>
                <td>{summary.totalCredit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileReader;
