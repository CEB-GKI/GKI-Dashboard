import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';

/**
 * Mampu mengekspor sebuah elemen DOM atau sekumpulan halamannya (jika ada .export-page / .glass-panel) menjadi PDF multi-halaman.
 */
export const exportPDF = async (
  containerRef: React.RefObject<HTMLDivElement | null>,
  churchName: string,
  sheetName: string
) => {
  if (!containerRef.current) return;
  try {
    let pages = Array.from(containerRef.current.querySelectorAll('.export-page'));
    if (pages.length === 0) {
      pages = Array.from(containerRef.current.querySelectorAll('.glass-panel'));
    }
    
    if (pages.length === 0) {
      const canvas = await html2canvas(containerRef.current, { scale: 2, backgroundColor: '#070B14' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`GKI_${churchName ? churchName.replace(/\s+/g, '_') : 'Waha'}_${sheetName.replace(/\s+/g, '_')}.pdf`);
      return;
    }

    let pdf: any = null;
    for (let i = 0; i < pages.length; i++) {
      const el = pages[i] as HTMLElement;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#070B14' });
      const imgData = canvas.toDataURL('image/png');
      
      if (i === 0) {
        pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'l' : 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      } else if (pdf) {
        pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'l' : 'p');
        pdf.setPage(i + 1);
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      }
    }
    if (pdf) {
      pdf.save(`GKI_${churchName ? churchName.replace(/\s+/g, '_') : 'Waha'}_${sheetName.replace(/\s+/g, '_')}.pdf`);
    }
  } catch (error) {
    console.error('Failed to export PDF', error);
    alert('Gagal mengexport PDF');
  }
};

/**
 * Mengekspor list ref elemen menjadi beberapa slide PPTX.
 */
export const exportPPTX = async (
  refs: React.RefObject<HTMLDivElement | null>[],
  churchName: string,
  sheetName: string
) => {
  // Pastikan minimal 1 ref valid
  const validRefs = refs.filter(r => r && r.current);
  if (validRefs.length === 0) return;

  try {
    const pres = new pptxgen();
    
    const captureAndAddSlide = async (element: HTMLElement) => {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#070B14' });
      const imgData = canvas.toDataURL('image/png');
      const slide = pres.addSlide();
      
      const slideWidth = 10;
      const slideHeight = 5.625;
      const canvasRatio = canvas.width / canvas.height;
      const slideRatio = slideWidth / slideHeight;
      
      let targetW, targetH;
      if (canvasRatio > slideRatio) {
         targetW = slideWidth;
         targetH = slideWidth / canvasRatio;
      } else {
         targetH = slideHeight;
         targetW = slideHeight * canvasRatio;
      }
      
      const x = (slideWidth - targetW) / 2;
      const y = (slideHeight - targetH) / 2;

      slide.addImage({ data: imgData, x, y, w: targetW, h: targetH });
    };

    // Khusus untuk Dashboard (jika ada class export-page/glass-panel, kita juga iterasi)
    // Untuk menyederhanakan (karena PPTX butuh tangkapan layar per elemen besar):
    // Jika container utama punya pages, tangkap per pages
    for (const ref of validRefs) {
      let pages = Array.from(ref.current!.querySelectorAll('.export-page'));
      if (pages.length === 0) {
        pages = Array.from(ref.current!.querySelectorAll('.glass-panel'));
      }
      
      // Jika ref merupakan container Analisa yang punya banyak card
      if (pages.length > 0) {
        for (const page of pages) {
          await captureAndAddSlide(page as HTMLElement);
        }
      } else {
        await captureAndAddSlide(ref.current!);
      }
    }

    pres.writeFile({ fileName: `GKI_${churchName ? churchName.replace(/\s+/g, '_') : 'Waha'}_${sheetName.replace(/\s+/g, '_')}.pptx` });
  } catch (error) {
    console.error('Failed to export PPTX', error);
    alert('Gagal mengexport PPTX');
  }
};
