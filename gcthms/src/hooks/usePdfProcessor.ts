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
}

const myAccount = "09065999634";

function tallyTransactions(text: string): Summary {
  const lines = text.split("\n");
  let totalCredit = 0;
  let totalDebit = 0;
  const transactions: { description: string; debit: number; credit: number }[] = [];
  const pairMap = new Map<string, { count: number; totalDebit: number; totalCredit: number }>();

  for (const line of lines) {
    const ggivesAutoMatch = line.match(/GGives Auto Repayment.*?([\d,.]+)\s+([\d,.]+)\s+\d{4}-\d{2}-\d{2}/i);
    if (ggivesAutoMatch && ggivesAutoMatch.length >= 3) {
      const debit = parseFloat(ggivesAutoMatch[1].replace(/,/g, ""));
      const key = "GGives Auto Repayment";
      if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
      const group = pairMap.get(key)!;
      group.count += 1;
      group.totalDebit += debit;
      transactions.push({ description: "GGives Auto Repayment", debit, credit: 0 });
      totalDebit += debit;
      continue;
    }

    const refundMatch = line.match(/Refund from\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
    if (refundMatch) {
      const [, sender, creditRaw] = refundMatch;
      const credit = parseFloat(creditRaw.replace(/,/g, ""));
      const key = `Refund from ${sender}`;
      if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
      const group = pairMap.get(key)!;
      group.count += 1;
      group.totalCredit += credit;
      transactions.push({ description: `Refund from ${sender}`, debit: 0, credit });
      totalCredit += credit;
      continue;
    }

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
      transactions.push({ description: `Payment to ${receiver}`, debit, credit: 0 });
      totalDebit += debit;
      continue;
    }

    const billsMatch = line.match(/Bills Payment to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
    if (billsMatch) {
      const [, receiver, debitRaw] = billsMatch;
      const debit = parseFloat(debitRaw.replace(/,/g, ""));
      const key = `Bills Payment to ${receiver}`;
      if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
      const group = pairMap.get(key)!;
      group.count += 1;
      group.totalDebit += debit;
      transactions.push({ description: `Bills Payment to ${receiver}`, debit, credit: 0 });
      totalDebit += debit;
      continue;
    }

    const gcreditMatch = line.match(/GCredit\s+([A-Za-z0-9]+).*?\b\d{11,}\b.*?([\d,.]+)\s+([\d,.]+)/i);
    if (gcreditMatch) {
      const [, identifier, amountRaw] = gcreditMatch;
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

    const cashoutMatch = line.match(/Cash-out to\s+(.+?)\s+\d{7,}\s+([\d,.]+)/i);
    if (cashoutMatch) {
      const [, receiver, debitRaw] = cashoutMatch;
      const debit = parseFloat(debitRaw.replace(/,/g, ""));
      const key = `Cash-out to ${receiver}`;
      if (!pairMap.has(key)) pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
      const group = pairMap.get(key)!;
      group.count += 1;
      group.totalDebit += debit;
      transactions.push({ description: `Cash-out to ${receiver}`, debit, credit: 0 });
      totalDebit += debit;
      continue;
    }

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
  };
}

export const usePdfProcessor = (file: File | null) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const readPdfText = async () => {
      if (!file) {
        setSummary(null);
        setError("");
        return;
      }

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

  return { summary, error };
};