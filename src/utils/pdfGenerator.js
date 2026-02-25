import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReport = (summary, memberStats, monthName) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Mess Bondhu Report - ${monthName}`, 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Summary Section
  doc.text("Summary", 14, 40);
  doc.text(`Total Expense: ৳${summary.totalExpense}`, 14, 48);
  doc.text(`Total Meals: ${summary.totalMeals}`, 14, 54);
  doc.text(`Meal Rate: ৳${summary.mealRate}`, 14, 60);

  // Table Data
  const tableColumn = ["Member", "Meals", "Meal Cost", "Rent", "Utility", "Total", "Paid", "Due"];
  const tableRows = [];

  memberStats.forEach(member => {
    const memberData = [
      member.name,
      member.meals,
      `৳${member.mealCost}`,
      `৳${member.rentCost}`,
      `৳${member.utilityCost}`,
      `৳${member.totalExpense}`,
      `৳${member.paid}`,
      `৳${member.due}`
    ];
    tableRows.push(memberData);
  });

  // Generate Table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    theme: 'grid',
    headStyles: { fillColor: [34, 87, 122] }, // Baltic Blue
    styles: { fontSize: 9 },
  });

  doc.save(`Mess_Report_${monthName}.pdf`);
};
