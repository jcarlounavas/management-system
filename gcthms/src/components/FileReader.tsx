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

      for (const line of lines) {
      const transferMatch = line.match(/(?:Transfer|Refund|Payment|GCredit)\s+from\s+(\d+)\s+to\s+(\d+)\s+\d+\s+([\d,.]+)/i);
        if (transferMatch) {
          const [type, sender, receiver, amountRaw] = transferMatch;
          const amount = parseFloat(amountRaw.replace(/,/g, ""));
          const looseRefundMatch = line.match(/Refund\s+from\s+(.+?)(?:\s+\d{4,})?\s+([\d,]+\.\d{2})/i);
          const otherTransaction = line.match(/Payment\s+to\s+(.+?)\s+\d+\s+([\d,.]+)/i);
          const otherTransacB = line.match(/GCredit\s+(.+?)\s+\d+\s+([\d,.]+)/i);
          const otherTransacC = line.match(/GGives\s+(.+?)\s+\d+\s+([\d,.]+)/i);
          const otherTransacD = line.match(/Cash-out\s+(.+?)\s+\d+\s+([\d,.]+)/i);


          // Only record debit for sender in transactions
          const myAccount = "09065999634";

          if(sender === myAccount) {
            transactions.push({
            description: `Transfer from ${sender} to ${receiver}`,
            debit: amount,
            credit: 0,
          });
          totalDebit += amount;
          }
          if(receiver === myAccount) {
            transactions.push({
            description: `Transfer to ${receiver} to ${sender}`,
            debit: 0,
            credit: amount,
          });
          totalCredit += amount;
          }
      if (looseRefundMatch) {
          const [_, sender, amountRaw] = looseRefundMatch;
          const amount = parseFloat(amountRaw.replace(/,/g, ""));
          transactions.push({
            description: `Refund from ${sender}`,
            debit: 0,
            credit: amount,
          });
          totalCredit += amount;
      } else if (otherTransaction) {
          const [_, receiver, amountRaw] = otherTransaction;
          const amount = parseFloat(amountRaw.replace(/,/g, ""));
          transactions.push({
            description: `Payment to ${receiver} `,
            debit: amount,
            credit: 0,
          });
          totalDebit += amount;
        } else if (otherTransacB) {
          const [_,receiver, amountRaw] = otherTransacB;
          const amount = parseFloat(amountRaw.replace(/,/g, ""));
          transactions.push({
            description: `GCredit ${receiver} `,
            debit: amount,
            credit: 0,
          });
          totalDebit += amount;
        } else if (otherTransacC){
          const [_,receiver, amountRaw] = otherTransacC;
          const amount = parseFloat(amountRaw.replace(/,/g, ""));
          transactions.push({
            description: `GGives ${receiver} `,
            debit: amount,
            credit: 0,
          });
          totalDebit += amount;
        }else if (otherTransacD){
          const [_,receiver, amountRaw] = otherTransacD;
          const amount = parseFloat(amountRaw.replace(/,/g, ""));
          transactions.push({
            description: `Cash-out to ${receiver} `,
            debit: amount,
            credit: 0,
          });
          totalDebit += amount;
        }
     
    //  const otherKeyB = ``;
    //  const otherKey = `Refund from ${sender}`;
     const key = `Transfer from ${sender} to ${receiver}`;
      if (!pairMap.has(key)) {
        pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
      }
      const group = pairMap.get(key)!;
      group.count += 1;
      if (sender === myAccount) group.totalDebit += amount;
      if (receiver === myAccount) group.totalCredit += amount;
      if (type.toLowerCase() === "refund") group.totalCredit += amount;
      if(type.toLowerCase() === "payment" || type.toLowerCase() === "gcredit") group.totalDebit += amount;
      // if(type.toLowerCase() === "gcredit") group.totalDebit += amount;

      // Contact grouping
      if (!contactTotals.has(sender)) {
        contactTotals.set(sender, { count: 0, totalDebit: 0, totalCredit: 0 });
      }
      const senderData = contactTotals.get(sender)!;
      senderData.count += 1;
      if (sender === myAccount) senderData.totalDebit += amount;

      if (!contactTotals.has(receiver)) {
        contactTotals.set(receiver, { count: 0, totalDebit: 0, totalCredit: 0 });
      }
      const receiverData = contactTotals.get(receiver)!;
      receiverData.count += 1;
      if (receiver === myAccount) receiverData.totalCredit += amount;


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
              const cleanedText = pageText.replace(/(sent|received|Transfer)/gi, "\n$1");
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
