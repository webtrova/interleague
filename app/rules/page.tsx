"use client";
import { useState } from "react";
import { RulesEnglish } from "@/content/rules-en";
import { RulesSpanish } from "@/content/rules-es";

const RULES = [
  {
    lang: "en",
    label: "English",
    title: "Tournament Rules (English)"
  },
  {
    lang: "es",
    label: "Español",
    title: "Reglas del Torneo (Español)"
  }
];

export default function RulesPage() {
  const [selectedLang, setSelectedLang] = useState("en");
  const rule = RULES.find(r => r.lang === selectedLang)!;
  return (
    <div className="max-w-4xl mx-auto py-10 lg:py-16 px-4">
      <h1 className="text-3xl font-extrabold text-center mb-6">{rule.title}</h1>
      <div className="flex justify-center mb-6 gap-2">
        {RULES.map(r => (
          <button
            key={r.lang}
            onClick={() => setSelectedLang(r.lang)}
            className={`px-4 py-2 rounded font-semibold border transition-all ${selectedLang === r.lang ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
            aria-label={`Show rules in ${r.label}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 w-full">
        {selectedLang === "en" && (
          <div className="w-full border-2 border-purple-600 shadow-lg rounded-xl bg-white p-8 my-4 text-gray-900">
            <RulesEnglish />
            <div className="flex justify-end mt-8">
              <a
                href="/downloads/rules-en.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded border-2 border-purple-600 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}
        {selectedLang === "es" && (
          <div className="w-full border-2 border-purple-600 shadow-lg rounded-xl bg-white p-8 my-4 text-gray-900">
            <RulesSpanish />
            <div className="flex justify-end mt-8">
              <a
                href="/downloads/rules-es.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded border-2 border-purple-600 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg"
              >
                Descargar PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
