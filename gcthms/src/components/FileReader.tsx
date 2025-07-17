import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  file: File | null;
}

export default function FileReader({ file }: Props) {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const reader: FileReader = new (window as any).FileReader();

    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);

      try {
        let pdf;

try {
    pdf = await pdfjsLib.getDocument({
    data: typedArray
  }).promise;
} catch (err: any) {
  if (err.name === "PasswordException") {
    const password = prompt(" This PDF is protected. Please your enter the password:");
    if (!password) {
      setError(" No password entered.");
      return;
    }
    try {
     pdf = await pdfjsLib.getDocument({
        data: typedArray,
        password: password
      }).promise;
    } catch (err2) {
      setError(" Incorrect password.");
      return;
    }
  } else {
    setError(" Failed to load PDF.");
    return;
  }
}
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }

        const tally = tallyTransactions(fullText);
        setSummary(tally);
      } catch (err: any) {
        if (err?.name === "PasswordException") {
          setError(" Incorrect password or password required.");
        } else {
          setError(" Failed to read PDF.");
        }
      }
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  return (
    <div>
      <h2>Transaction Summary</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {summary ? (
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      ) : (
        !error && "Processing PDF..."
      )}
    </div>
  );
}

function tallyTransactions(text: string) {
  const lines = text.split("\n");
  let totalCredit = 0;
  let totalDebit = 0;
  const entities: Record<string, {reference:number; credit: number; debit: number }> = {};

  for (const line of lines) {
    const match = line.match(/(sent|received|Transfer|Payment|Bills|GCredit|GGives)\s+(?:to|from)?\s*([a-zA-Z0-9\s]+)\s+([\d,.]+)/i);
    if (match) {
      const [, type, nameRaw, amountRaw] = match;
      const name = nameRaw.trim();
      const amount = parseFloat(amountRaw.replace(/,/g, ""));

      if (!entities[name]) entities[name] = { reference:0, credit: 0, debit: 0 };

      if (type.toLowerCase() === "sent") {
        totalDebit += amount;
        entities[name].debit += amount;
      } else {
        totalCredit += amount;
        entities[name].credit += amount;
      }
    }
  }

  return {
    totalCredit,
    totalDebit,
    entities,
  };
}
