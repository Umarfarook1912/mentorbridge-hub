export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <style>{`
        @page { size: A4 landscape; margin: 12mm 10mm 14mm; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
      {children}
    </div>
  )
}
