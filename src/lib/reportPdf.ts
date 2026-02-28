import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExpenseEntry, IncomeEntry } from './db';
import { getCategoryById } from './categories';
import { isSavingsCategory } from './categories';
import { format, parseISO } from 'date-fns';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateReportPdf(
  from: string,
  to: string,
  income: IncomeEntry[],
  expenses: ExpenseEntry[],
  formatCurr: (n: number) => string = formatCurrency
): Promise<void> {
  const doc = new jsPDF();

  const expenseEntries = expenses.filter((e) => !isSavingsCategory(e.categoryId));
  const savingsEntries = expenses.filter((e) => isSavingsCategory(e.categoryId));

  const incomeTotal = income.reduce((s, i) => s + i.amount, 0);
  const expenseTotal = expenseEntries.reduce((s, e) => s + e.amount, 0);
  const savingsTotal = savingsEntries.reduce((s, e) => s + e.amount, 0);
  const net = incomeTotal - expenseTotal - savingsTotal;

  const fromLabel = format(parseISO(from), 'MMM d, yyyy');
  const toLabel = format(parseISO(to), 'MMM d, yyyy');

  doc.setFontSize(18);
  doc.text('Expense Report', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`${fromLabel} – ${toLabel}`, 14, 30);
  doc.setTextColor(0, 0, 0);

  let y = 42;

  // Summary
  doc.setFontSize(12);
  doc.text('Summary', 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Amount']],
    body: [
      ['Income', formatCurr(incomeTotal)],
      ['Total Expenses', formatCurr(expenseTotal)],
      ...(savingsTotal > 0 ? [['Savings', formatCurr(savingsTotal)]] : []),
      ['Net', formatCurr(net)],
    ],
    theme: 'plain',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 14 },
  });
  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 12;

  // Income by source
  if (income.length > 0) {
    const bySource = new Map<string, number>();
    for (const i of income) {
      bySource.set(i.source, (bySource.get(i.source) ?? 0) + i.amount);
    }
    doc.setFontSize(12);
    doc.text('Income by Source', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Source', 'Amount']],
      body: Array.from(bySource.entries()).map(([source, amt]) => [source, formatCurr(amt)]),
      theme: 'plain',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 12;
  }

  // Expenses by category
  if (expenseEntries.length > 0) {
    const byCat = new Map<string, number>();
    for (const e of expenseEntries) {
      const label = getCategoryById(e.categoryId).label;
      byCat.set(label, (byCat.get(label) ?? 0) + e.amount);
    }
    doc.setFontSize(12);
    doc.text('Expenses by Category', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount']],
      body: Array.from(byCat.entries())
        .map(([cat, amt]) => [cat, formatCurr(amt)])
        .sort((a, b) => {
          const aNum = parseFloat(String(a[1]).replace(/[^0-9.-]/g, '')) || 0;
          const bNum = parseFloat(String(b[1]).replace(/[^0-9.-]/g, '')) || 0;
          return bNum - aNum;
        }),
      theme: 'plain',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 12;
  }

  // Transaction list (if space)
  if (y < 250 && (income.length > 0 || expenseEntries.length > 0)) {
    doc.setFontSize(12);
    doc.text('Recent Transactions', 14, y);
    y += 8;

    const rows: string[][] = [];
    const combined = [
      ...income.map((i) => ({ date: i.date, desc: i.source, amount: i.amount, type: 'Income' as const })),
      ...expenseEntries.map((e) => ({
        date: e.date,
        desc: e.note || getCategoryById(e.categoryId).label,
        amount: -e.amount,
        type: 'Expense' as const,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    for (const t of combined.slice(0, 20)) {
      rows.push([format(parseISO(t.date), 'MMM d, yyyy'), t.desc, t.type, formatCurr(Math.abs(t.amount))]);
    }

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Description', 'Type', 'Amount']],
      body: rows,
      theme: 'plain',
      headStyles: { fillColor: [100, 100, 100] },
      margin: { left: 14 },
    });
  }

  doc.save(`expense-report-${from}-to-${to}.pdf`);
}
