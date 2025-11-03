import jsPDF from 'jspdf';

export const generateAttendancePDF = (classData, attendanceList) => {
  const pdf = new jsPDF();
  
  // Cabeçalho
  pdf.setFontSize(20);
  pdf.text('ATA DE PRESENÇA', 105, 20, { align: 'center' });
  
  // Informações da aula
  pdf.setFontSize(12);
  pdf.text(`Aula: ${classData.name}`, 20, 40);
  pdf.text(`Curso: ${classData.course}`, 20, 50);
  pdf.text(`Data: ${new Date(classData.date).toLocaleDateString('pt-BR')}`, 20, 60);
  pdf.text(`Horário: ${classData.startTime} - ${classData.endTime}`, 20, 70);
  
  // Tabela de presença
  pdf.setFontSize(10);
  let y = 90;
  
  // Cabeçalho da tabela
  pdf.text('Matrícula', 20, y);
  pdf.text('Nome', 60, y);
  pdf.text('Horário de Entrada', 140, y);
  
  y += 10;
  pdf.line(20, y, 190, y); // Linha horizontal
  
  // Lista de alunos
  attendanceList.forEach((student, index) => {
    y += 10;
    pdf.text(student.matricula, 20, y);
    pdf.text(student.nome, 60, y);
    pdf.text(new Date(student.timestamp).toLocaleTimeString('pt-BR'), 140, y);
    
    // Nova página se necessário
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });
  
  // Rodapé
  pdf.setFontSize(8);
  pdf.text(`Total de alunos presentes: ${attendanceList.length}`, 20, pdf.internal.pageSize.height - 20);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pdf.internal.pageSize.height - 10);
  
  return pdf;
};