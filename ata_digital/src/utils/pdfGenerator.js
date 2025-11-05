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
  pdf.text(`Data: ${new Date(classData.date + 'T00:00:00').toLocaleDateString('pt-BR')}`, 20, 60);
  pdf.text(`Horário: ${classData.startTime}`, 20, 70);
  
  let y = 90;
  
  // Lista de alunos com fotos
  attendanceList.forEach((student, index) => {
    // Verificar se precisa de nova página
    if (y > 240) {
      pdf.addPage();
      y = 20;
    }
    
    // Informações do aluno
    pdf.setFontSize(10);
    pdf.text(`${index + 1}. Nome: ${student.nome}`, 20, y);
    pdf.text(`Matrícula: ${student.matricula}`, 20, y + 8);
    pdf.text(`Curso: ${student.curso || 'N/A'}`, 20, y + 16);
    pdf.text(`Período: ${student.periodo || 'N/A'}`, 20, y + 24);
    pdf.text(`Horário: ${new Date(student.timestamp).toLocaleTimeString('pt-BR')}`, 20, y + 32);
    
    // Adicionar foto se existir
    if (student.biometria) {
      try {
        pdf.addImage(student.biometria, 'JPEG', 140, y - 5, 30, 30);
      } catch (error) {
        console.error('Erro ao adicionar imagem ao PDF:', error);
        pdf.text('Foto n/disponível', 140, y + 15);
      }
    }
    
    // Linha separadora
    pdf.line(20, y + 40, 190, y + 40);
    y += 50;
  });
  
  // Rodapé
  pdf.setFontSize(8);
  pdf.text(`Total de alunos presentes: ${attendanceList.length}`, 20, pdf.internal.pageSize.height - 20);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pdf.internal.pageSize.height - 10);
  
  return pdf;
};