'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SermonResultProps {
  sermonData: {
    title: string;
    introduction: string;
    mainPoints: { title: string; content: string }[];
    conclusion: string;
    scriptureReferences: string[];
    illustrations?: string[];
  };
  onReset: () => void;
}

export default function SermonResult({ sermonData, onReset }: SermonResultProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('');

  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };
  
  // No longer needed - direct PDF generation implemented

  // Function to close the PDF preview modal
  const closePdfPreview = () => {
    setPdfPreviewUrl(null);
  };

  // Function to download the PDF
  const downloadPdf = () => {
    if (pdfPreviewUrl) {
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = pdfPreviewUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Close the preview after download
      closePdfPreview();
    }
  };

  return (
    <div>
      <div className="sermon-container rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-500 p-6 dark:border-gray-700 dark:from-indigo-500 dark:to-blue-400">
          <h2 className="text-2xl font-bold text-white">{sermonData.title}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {sermonData.scriptureReferences.map((ref, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white"
              >
                {ref}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Introduction */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <button
                className="flex w-full items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white"
                onClick={() => toggleSection('introduction')}
              >
                <span className="text-lg font-semibold">Introduction</span>
                <svg
                  className={`h-5 w-5 transition-transform ${
                    activeSection === 'introduction' || activeSection === 'all' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all ${
                  activeSection === 'introduction' || activeSection === 'all' ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{sermonData.introduction}</p>
                </div>
              </div>
            </div>

            {/* Main Points */}
            {Array.isArray(sermonData.mainPoints) ? (
              sermonData.mainPoints.map((point, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                >
                  <button
                    className="flex w-full items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white"
                    onClick={() => toggleSection(`point-${index}`)}
                  >
                    <span className="text-lg font-semibold">
                      {index + 1}. {point.title || `Point ${index + 1}`}
                    </span>
                    <svg
                      className={`h-5 w-5 transition-transform ${
                        activeSection === `point-${index}` || activeSection === 'all' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all ${
                      activeSection === `point-${index}` || activeSection === 'all' ? 'max-h-96 overflow-y-auto' : 'max-h-0'
                    }`}
                  >
                    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{point.content || 'No content available for this point.'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">No main points available.</p>
              </div>
            )}

            {/* Conclusion */}
            {sermonData.conclusion ? (
              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <button
                  className="flex w-full items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white"
                  onClick={() => toggleSection('conclusion')}
                >
                  <span className="text-lg font-semibold">Conclusion</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${
                      activeSection === 'conclusion' || activeSection === 'all' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all ${
                    activeSection === 'conclusion' || activeSection === 'all' ? 'max-h-96 overflow-y-auto' : 'max-h-0'
                  }`}
                >
                  <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{sermonData.conclusion}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">No conclusion available.</p>
              </div>
            )}

            {/* Illustrations if available */}
            {sermonData.illustrations && sermonData.illustrations.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <button
                  className="flex w-full items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white"
                  onClick={() => toggleSection('illustrations')}
                >
                  <span className="text-lg font-semibold">Illustrations & Examples</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${
                      activeSection === 'illustrations' || activeSection === 'all' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all ${
                    activeSection === 'illustrations' || activeSection === 'all' ? 'max-h-96 overflow-y-auto' : 'max-h-0'
                  }`}
                >
                  <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    <ul className="list-inside list-disc space-y-2">
                      {sermonData.illustrations.map((illustration, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {illustration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button
              onClick={onReset}
              className="flex-1 rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Generate Another Sermon
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsGeneratingPDF(true);
                  
                  // Create PDF with A4 dimensions (more standard for printing)
                  const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                  });
                  
                  // Set document properties for better metadata
                  pdf.setProperties({
                    title: sermonData.title,
                    subject: `Sermon based on ${sermonData.scriptureReferences.join(', ')}`,
                    author: 'LittleGabriel Sermon Generator',
                    creator: 'LittleGabriel'
                  });
                  
                  // Define page dimensions and margins
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const pageHeight = pdf.internal.pageSize.getHeight();
                  const margin = 20; // 20mm margins
                  const contentWidth = pageWidth - (margin * 2);
                  const contentHeight = pageHeight - (margin * 2);
                  
                  // Set default font styles
                  pdf.setFont('helvetica', 'normal');
                  pdf.setFontSize(12);
                  
                  // Add title and references (first page header)
                  pdf.setFontSize(22);
                  pdf.setFont('helvetica', 'bold');
                  const titleWidth = pdf.getStringUnitWidth(sermonData.title) * 22 / pdf.internal.scaleFactor;
                  const titleX = (pageWidth - titleWidth) / 2;
                  pdf.text(sermonData.title, Math.max(margin, titleX), margin + 10);
                  
                  // Add Scripture references
                  pdf.setFontSize(12);
                  pdf.setFont('helvetica', 'italic');
                  const references = `Scripture: ${sermonData.scriptureReferences.join(', ')}`;
                  const refsWidth = pdf.getStringUnitWidth(references) * 12 / pdf.internal.scaleFactor;
                  const refsX = (pageWidth - refsWidth) / 2;
                  pdf.text(references, Math.max(margin, refsX), margin + 20);
                  
                  // Add line under header
                  pdf.setDrawColor(200);
                  pdf.line(margin, margin + 25, pageWidth - margin, margin + 25);
                  
                  // Start position for content
                  let yPos = margin + 35;
                  
                  // Function to add text with word wrapping and pagination
                  const addTextWithWrapping = (text: string, startY: number, fontSize = 12, isBold = false, isTitle = false) => {
                    // Set font for this text block
                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                    
                    // Split text into paragraphs
                    const paragraphs = text.split('\n').filter((p: string) => p.trim() !== '');
                    
                    // Start position
                    let y = startY;
                    
                    // Process each paragraph
                    for (const paragraph of paragraphs) {
                      // Check if we need a new page
                      if (y > pageHeight - margin - 10) {
                        pdf.addPage();
                        y = margin + 10;
                        
                        // Add continuation header on new pages
                        pdf.setFontSize(10);
                        pdf.setFont('helvetica', 'italic');
                        pdf.text(`${sermonData.title} (continued)`, margin, y - 5);
                        pdf.setDrawColor(200);
                        pdf.line(margin, y, pageWidth - margin, y);
                        y += 10;
                      }
                      
                      // Split paragraph into lines that fit the page width
                      const lines = pdf.splitTextToSize(paragraph, contentWidth);
                      
                      // Check if adding these lines would exceed page, if so add a new page
                      if (y + (lines.length * (fontSize * 0.352777778)) > pageHeight - margin) {
                        pdf.addPage();
                        y = margin + 10;
                        
                        // Add continuation header on new pages
                        pdf.setFontSize(10);
                        pdf.setFont('helvetica', 'italic');
                        pdf.text(`${sermonData.title} (continued)`, margin, y - 5);
                        pdf.setDrawColor(200);
                        pdf.line(margin, y, pageWidth - margin, y);
                        y += 10;
                        
                        // Reset font for content
                        pdf.setFontSize(fontSize);
                        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                      }
                      
                      // Add the text lines
                      pdf.text(lines, margin, y);
                      
                      // Move position down based on number of lines
                      y += lines.length * (fontSize * 0.352777778) * 1.2;
                      
                      // Add extra space after paragraph if not a title
                      if (!isTitle) {
                        y += fontSize * 0.352777778 * 0.5;
                      }
                    }
                    
                    return y;
                  };
                  
                  // Add Introduction
                  yPos = addTextWithWrapping('Introduction', yPos, 16, true, true);
                  yPos = addTextWithWrapping(sermonData.introduction, yPos);
                  yPos += 5; // Extra space after section
                  
                  // Add Main Points
                  if (sermonData.mainPoints && sermonData.mainPoints.length > 0) {
                    sermonData.mainPoints.forEach((point, index) => {
                      const pointTitle = `${index + 1}. ${point.title}`;
                      yPos = addTextWithWrapping(pointTitle, yPos, 16, true, true);
                      yPos = addTextWithWrapping(point.content, yPos);
                      yPos += 5; // Extra space after section
                    });
                  }
                  
                  // Add Conclusion
                  yPos = addTextWithWrapping('Conclusion', yPos, 16, true, true);
                  yPos = addTextWithWrapping(sermonData.conclusion, yPos);
                  
                  // Add Illustrations if available
                  if (sermonData.illustrations && sermonData.illustrations.length > 0) {
                    yPos += 5;
                    yPos = addTextWithWrapping('Illustrations & Examples', yPos, 16, true, true);
                    
                    sermonData.illustrations.forEach((illustration, index) => {
                      yPos = addTextWithWrapping(`• ${illustration}`, yPos);
                    });
                  }
                  
                  // Add page numbers
                  const totalPages = pdf.internal.pages.length - 1; // -1 because pages array is 0-indexed
                  for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.setTextColor(100);
                    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10);
                  }
                  
                  // Create a sanitized filename from the sermon title
                  const filename = `sermon_${sermonData.title
                    .replace(/[^a-z0-9]/gi, '_')
                    .toLowerCase()
                    .substring(0, 30)}.pdf`;
                  
                  // Get PDF data URL for preview
                  const pdfDataUri = pdf.output('dataurlstring');
                  
                  // Save to state for preview modal
                  setPdfPreviewUrl(pdfDataUri);
                  setPdfFilename(filename);
                  
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  alert('Could not generate PDF. Please try again.');
                } finally {
                  setIsGeneratingPDF(false);
                }
              }}
              disabled={isGeneratingPDF}
              className="flex-1 rounded-md bg-indigo-100 px-4 py-2 font-medium text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            >
              <span className="flex items-center justify-center">
                {isGeneratingPDF ? (
                  <>
                    <svg
                      className="mr-2 h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="mr-2 h-5 w-5"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                      />
                    </svg>
                    Save as PDF
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sermon PDF Preview
                </h3>
                <button
                  onClick={closePdfPreview}
                  className="rounded-md bg-gray-50 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <object 
                data={pdfPreviewUrl} 
                type="application/pdf"
                className="h-[70vh] w-full"
                title="PDF Preview"
              >
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-center text-gray-500">
                    Your browser doesn't support PDF preview. 
                    <br />
                    Click the Download button below to view the PDF.
                  </p>
                </div>
              </object>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closePdfPreview}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadPdf}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PDF
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}