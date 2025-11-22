"use client";
import { useState } from "react";

interface BrandCheckResult {
  prompt: string;
  brand: string;
  mentioned: boolean;
  position: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [brand, setBrand] = useState("");
  const [results, setResults] = useState<BrandCheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/check-brand-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, brand })
      });

      const data = await res.json();
      const parsedData = {
        ...data,
        mentioned: data.mentioned === "Yes" || data.mentioned === true // Convert string "Yes" to true, keep boolean true as true
      };
      setResults(prev => [...prev, parsedData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const header = "Prompt,Brand,Mentioned,Position\n";
    const rows = results
      .map(r => `${r.prompt},${r.brand},${r.mentioned},${r.position}`)
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-100 p-8 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold mb-10 text-gray-900 drop-shadow-lg">Gemini brand mention checker</h1>

      <div className="w-full max-w-4xl bg-white shadow-xl rounded-3xl p-8 space-y-6 mb-8 border border-gray-200">
        <textarea
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full min-h-[140px] p-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 outline-none text-lg resize-y"
        />

        <input
          placeholder="Brand name"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 outline-none text-lg"
        />

        <button
          onClick={runCheck}
          disabled={loading}
          className={`w-full bg-blue-700 text-white font-bold rounded-xl text-xl py-4 transition duration-300 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-800 transform hover:-translate-y-1 hover:shadow-lg"}`}
        >
          {loading ? "Running Check..." : "Run Check"}
        </button>

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="ml-3 text-gray-600">Processing...</p>
          </div>
        )}

      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={downloadCSV}
          disabled={results.length === 0 || loading}
          className={`bg-green-600 text-white font-bold rounded-xl text-lg px-8 py-3 transition duration-300 ease-in-out ${results.length === 0 || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 transform hover:-translate-y-1 hover:shadow-lg"}`}
        >
          Download CSV
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-6 overflow-x-auto border border-gray-200">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-4 text-gray-700 font-semibold uppercase tracking-wider">Prompt</th>
              <th className="p-4 text-gray-700 font-semibold uppercase tracking-wider">Brand</th>
              <th className="p-4 text-gray-700 font-semibold uppercase tracking-wider">Mentioned</th>
              <th className="p-4 text-gray-700 font-semibold uppercase tracking-wider">Position</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-200 hover:bg-gray-100 transition-colors`} >
                <td className="p-4 text-gray-800">{r.prompt}</td>
                <td className="p-4 text-gray-800">{r.brand}</td>
                <td className="p-4 text-gray-800">{r.mentioned === null || r.mentioned === undefined ? "N/A" : r.mentioned ? "Yes" : "No"}</td>
                <td className="p-4 text-gray-800">{r.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}