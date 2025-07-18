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


  const myAccount = "09065999634";

for (const line of lines) {
  const match = line.match(/(sent|received|Transfer|Payment)\s+(?:to|from)?\s*([a-zA-Z0-9\s]+)\s+([\d,.]+)/i);
  if (match) {
    const [, type, nameRaw, amountRaw] = match;
    const name = nameRaw.trim();
    const amount = parseFloat(amountRaw.replace(/,/g, ""));
    
    const lowerLine = line.toLowerCase();
    let isDebit = false;
    let isCredit = false;

    if (type.includes("/sent\s+to|transfer\s+to|payment\s+to/.test(lowerLine)")) {
      isDebit = true;
    } else if (/received\s+from/.test(lowerLine)) {
      isCredit = true;
    }

    if (!isDebit && !isCredit) {
      isDebit = true; // fallback
    }

    const sender = isDebit ? myAccount : name;
    const receiver = isDebit ? name : myAccount;

    const debit = isDebit ? amount : 0;
    const credit = isCredit ? amount : 0;

    const description = line.trim();
    transactions.push({ description, debit, credit });
    totalCredit += credit;
    totalDebit += debit;

    const key = `${sender} → ${receiver}`;
    if (!pairMap.has(key)) {
      pairMap.set(key, { count: 0, totalDebit: 0, totalCredit: 0 });
    }
    const group = pairMap.get(key)!;
    group.count += 1;
    group.totalDebit += debit;
    group.totalCredit += credit;

    const contact = isDebit ? receiver : sender;

    if (!contactTotals.has(contact)) {
      contactTotals.set(contact, { count: 0, totalDebit: 0, totalCredit: 0 });
    }
    const contactData = contactTotals.get(contact)!;
    contactData.count += 1;
    contactData.totalDebit += debit;
    contactData.totalCredit += credit;
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
            const cleanedText = pageText.replace(/(sent|received|Transfer|Payment)/gi, "\n$1");
            fullText += cleanedText + "\n";
          }

          const tally = tallyTransactions(fullText);
          setSummary(tally);
        };
      } catch (err: any) {
        if (err?.name === "PasswordException") {
          setError("Incorrect password or password required.");
        } else {
          setError("Failed to process PDF.");
        }
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
          <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>

            <tbody>
              {summary.contactSummaries && (
  <>
    <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>Description</th>
          <th>Number of Transactions</th>
          <th>Total Debit</th>
          <th>Total Credit</th>
        </tr>
      </thead>
      <tbody>
        {summary.contactSummaries.map((item, index) => (
          <tr key={index}>
            <td>{item.contact}</td>
            <td>{item.count}</td>
            <td>{item.totalDebit.toLocaleString()}</td>
            <td>{item.totalCredit.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}

              <tr style={{ fontWeight: "bold" }}>
                <td>Total</td>
                <td>{summary.totalDebit.toLocaleString()}</td>
                <td>{summary.totalCredit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          

          <p>Total Transactions: {summary.transactions.length}</p>
        </>
      ) : (
        !error && "Processing PDF..."
      )}
    </div>
  );
};

export default FileReader;
