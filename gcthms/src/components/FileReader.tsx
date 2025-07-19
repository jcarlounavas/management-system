import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

interface Summary {
  transactions: { description: string; debit: number; credit: number }[];
  totalCredit: number;
  totalDebit: number;
  pairSummaries?: {
    pair: string;
    count: number;
    totalDebit: number;
    totalCredit: number;
  }[];
  contactSummaries?: {
    contact: string;
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

    function tallyTransactions(text: string): Summary {
      const lines = text.split("\n");
      let totalCredit = 0;
      let totalDebit = 0;
      const transactions: { description: string; debit: number; credit: number }[] = [];
      const pairMap = new Map<string, { count: number; totalDebit: number; totalCredit: number }>();
      const contactTotals = new Map<string, { count: number; totalDebit: number; totalCredit: number }>();
function cleanDescription(line: string): string {
  return line
  
    // Remove dates (e.g., 2025-04-01)
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
    // Remove times (e.g., 08:59 AM)
    .replace(/\b\d{1,2}:\d{2}\s?[AP]M\b/gi, '')
    // Remove known reference numbers (16-digit or >10-digit numeric)
    .replace(/\b\d{11,}\b/g, '')
    // Remove balance values (e.g., "356.00", if it appears after debit/credit)
    .replace(/(\d{1,3}(,\d{3})*|\d+)\.\d{2}(?=\s*$)/g, '')
    // Collapse multiple spaces to one
    .replace(/\s+/g, ' ')
    .trim();
}
      for (const line of lines) {
  // GGives Auto Repayment (most specific)
  const ggivesAutoMatch = line.match(/GGives Auto Repayment.*?([\d,.]+)\s+([\d,.]+)\s+\d{4}-\d{2}-\d{2}/i);
if (ggivesAutoMatch && ggivesAutoMatch.length >= 3) {
  const debit = parseFloat(ggivesAutoMatch[1].replace(/,/g, ""));
  const balance = parseFloat(ggivesAutoMatch[2].replace(/,/g, ""));

  const key = "GGives Auto Repayment";
  if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
  const group = pairMap.get(key)!;
  group.count += 1;
  group.totalDebit += debit;

  transactions.push({ description:"GGives Auto Repayment", debit, credit: 0 });
  totalDebit += debit;
  continue;
}

  // Refund
  const refundMatch = line.match(/Refund from\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
  if (refundMatch) {
    const [, sender, creditRaw] = refundMatch;
    const credit = parseFloat(creditRaw.replace(/,/g, ""));
    const key = `Refund from ${sender}`;
    if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
    const group = pairMap.get(key)!;
    group.count += 1;
    group.totalCredit += credit;
    transactions.push({ description:`Refund from ${sender}`, debit: 0, credit });
    totalCredit += credit;
    continue;
  }

  // Payment
  const paymentMatch = line.match(/Payment to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
  if (paymentMatch) {
    let receiver = paymentMatch[1].trim();
    if (/^\d+$/.test(receiver)) receiver = "Others";
    const debit = parseFloat(paymentMatch[2].replace(/,/g, ""));
    const key = `Payment to ${receiver}`;
    if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
    const group = pairMap.get(key)!;
    group.count += 1;
    group.totalDebit += debit;
    transactions.push({ description:`Payment to ${receiver}`, debit, credit: 0 });
    totalDebit += debit;
    continue;
  }

  // Bills Payment
  const billsMatch = line.match(/Bills Payment to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
  if (billsMatch) {
    const [, receiver, debitRaw] = billsMatch;
    const debit = parseFloat(debitRaw.replace(/,/g, ""));
    const key = `Bills Payment to ${receiver}`;
    if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
    const group = pairMap.get(key)!;
    group.count += 1;
    group.totalDebit += debit;
    transactions.push({ description:`Bills Payment to ${receiver}`, debit, credit: 0 });
    totalDebit += debit;
    continue;
  }

  // GCredit
  const gcreditMatch = line.match(/GCredit\s+([A-Za-z0-9]+).*?\b\d{11,}\b.*?([\d,.]+)\s+([\d,.]+)/i);
if (gcreditMatch) {
  const [ , identifier, amountRaw ] = gcreditMatch;
  const debit = parseFloat(amountRaw.replace(/,/g, ""));
  const description = `GCredit ${identifier}`;
  const key = "GCredit";
  if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
  const group = pairMap.get(key)!;
  group.count += 1;
  group.totalDebit += debit;
  transactions.push({ description, debit, credit: 0 });
  totalDebit += debit;
  continue;
}

  // Cash-out
  const cashoutMatch = line.match(/Cash-out to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
  if (cashoutMatch) {
    const [, receiver, debitRaw] = cashoutMatch;
    const debit = parseFloat(debitRaw.replace(/,/g, ""));
    const key = `Cash-out to ${receiver}`;
    if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
    const group = pairMap.get(key)!;
    group.count += 1;
    group.totalDebit += debit;
    transactions.push({ description:`Cash-out to ${receiver}`, debit, credit: 0 });
    totalDebit += debit;
    continue;
  }

  // Transfer (last, most general)
  // const transferMatch = line.match(/Transfer from\s+(\d{7,})\s+to\s+(\d{7,})\s+\d+\s+([\d,.]+)(?:\s+([\d,.]+))?/i);
const transferMatch = line.match(/Transfer from\s+(\d{7,})\s+to\s+(\d{7,})\s+(?:\d+\s+)?([\d,.]+)(?:\s+([\d,.]+))?/i);

  if (transferMatch) {
  const sender = transferMatch?.[1] ?? "Unknown";
const receiver = transferMatch?.[2] ?? "Unknown";
const debitRaw = transferMatch?.[3] ?? "0";
const creditRaw = transferMatch?.[4] ?? "0";

  const debit = parseFloat(debitRaw.replace(/,/g, ""));
  const credit = creditRaw ? parseFloat(creditRaw.replace(/,/g, "")) : 0;

  const key = `Transfer from ${sender} to ${receiver}`;
  if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
  const group = pairMap.get(key)!;
  group.count += 1;

  let txDebit = 0;
  let txCredit = 0;

  if (sender === myAccount) {
    group.totalDebit += debit;
    totalDebit += debit;
    txDebit = debit;
  } else if (receiver === myAccount) {
    group.totalCredit += debit;
    totalCredit += debit;
    txCredit = debit;
  } else {
    // not the user's transaction, skip total
  }
const transferDirection = `Transfer from ${sender} to ${receiver}`;
transactions.push({ description: transferDirection, debit: txDebit, credit: txCredit });

  continue;
}

}

  
  return {
    transactions,
    totalCredit,
    totalDebit,
    pairSummaries: Array.from(pairMap.entries()).map(([pair, data]) => ({
      pair,
      count: data.count,
      totalDebit: data.totalDebit,
      totalCredit: data.totalCredit,
    })),
    contactSummaries: Array.from(contactTotals.entries()).map(([contact, data]) => ({
      contact,
      count: data.count,
      totalDebit: data.totalDebit,
      totalCredit: data.totalCredit,
    })),
  };
    }

    const readPdfText = async () => {
      if (!file) return;

      try {
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async () => {
          try {
            const typedArray = new Uint8Array(reader.result as ArrayBuffer);
            const loadingTask = pdfjsLib.getDocument({
              data: typedArray,
              password: "",
            });

            loadingTask.onPassword = (callback: (password: string) => void) => {
              const userPassword = prompt("Enter PDF password:") || "";
              callback(userPassword);
            };

            const pdf = await loadingTask.promise;
            let fullText = "";

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              const pageText = content.items.map((item: any) => item.str).join(" ");
              const cleanedText = pageText.replace(/\b(GGives Auto Repayment|Transfer from|Payment to|Refund from|Bills Payment to|Cash-out to|GCredit)\b/gi, "\n$1");
              fullText += cleanedText + "\n";
            }

            const tally = tallyTransactions(fullText);
            setSummary(tally);
          } catch (err: any) {
            if (err?.name === "PasswordException") {
              setError("Incorrect password or password required.");
            } else {
              setError("Failed to process PDF.");
            }
          }
        };

        reader.onerror = () => {
          setError("Failed to read file.");
        };
      } catch (err: any) {
        setError("Failed to process PDF.");
      }
    };

    readPdfText();
  }, [file]);

  return (
    <div>
      <h2>Transaction Summary</h2>
      {error && <p>{error}</p>}

      {summary ? (
        <>


          {/* Sender → Receiver Pair Summary */}
          {summary.pairSummaries && summary.pairSummaries.length > 0 && (
            <>
              <h3 style={{ marginTop: "2rem" }}>By Sender → Receiver</h3>
              <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
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
                  {summary.pairSummaries.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.pair}</td>
                      <td>{item.count}</td>
                      <td>{item.totalDebit.toLocaleString()}</td>
                      <td>{item.totalCredit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <p style={{ marginTop: "1.5rem" }}>
            Total Transactions: {summary.transactions.length}
          </p>
          {summary.transactions && summary.transactions.length > 0 && (
  <>
          <h3 style={{ marginTop: "2rem" }}>All Individual Transactions</h3>
          <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {summary.transactions.map((tx, i) => (
                <tr key={i}>
                  <td>{tx.description}</td>
                  <td>{tx.debit.toLocaleString()}</td>
                  <td>{tx.credit.toLocaleString()}</td>

                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
              <td>Total</td>
              <td>{summary.totalDebit.toLocaleString()}</td>
              <td>{summary.totalCredit.toLocaleString()}</td>
            </tr>
            </tbody>
          </table>
        </>
      )}

        </>
      ) : (
        !error && <p>Processing PDF...</p>
      )}
    </div>
  );
};

export default FileReader;
