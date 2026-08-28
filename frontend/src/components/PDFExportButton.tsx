import html2canvas from "html2canvas";

import jsPDF from "jspdf";

import {
  Download,
} from "lucide-react";

import toast from "react-hot-toast";


function PDFExportButton() {

  async function exportPDF() {

    const input =
      document.getElementById(
        "report-content"
      );


    if (!input) {

      toast.error(
        "Report not found"
      );

      return;
    }


    toast.loading(
      "Generating PDF...",
      {
        id: "pdf",
      }
    );


    try {

      const canvas =
        await html2canvas(input);

      const imgData =
        canvas.toDataURL(
          "image/png"
        );


      const pdf =
        new jsPDF(

          "p",

          "mm",

          "a4"
        );


      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =
        (
          canvas.height *
          pdfWidth
        ) / canvas.width;


      pdf.addImage(

        imgData,

        "PNG",

        0,

        0,

        pdfWidth,

        pdfHeight
      );


      pdf.save(
        "HireSense_Report.pdf"
      );


      toast.success(
        "PDF downloaded",
        {
          id: "pdf",
        }
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "PDF generation failed",
        {
          id: "pdf",
        }
      );
    }
  }


  return (

    <button
      onClick={exportPDF}
      className="
        bg-cyan-400
        hover:bg-cyan-300
        text-black
        font-bold
        px-8
        py-4
        rounded-2xl
        inline-flex
        items-center
        gap-3
      "
    >

      <Download />

      Export PDF

    </button>
  );
}

export default PDFExportButton;