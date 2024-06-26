document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    viewPdfButton: document.getElementById('open-form-fullscreen-btn'),
    printTemplateSelect: document.getElementById('print_template_select'),
    formOverlay: document.getElementById('form-fullscreen'),
    downloadPdfButton: document.getElementById('download-pdf-button'),
    closeFormBtn: document.getElementById('close-form-fullscreen-btn'),
    formIframe: document.getElementById('pdfme-form-iframe')
  };

  console.log('Print Templates Viewer loaded!');

  const showError = (message) => {
    console.error(message);
    alert('An error occurred. Please try again.');
  };

  const handleViewPdfClick = () => {
    const selectedTemplateId = elements.printTemplateSelect.value;
    if (!selectedTemplateId) {
      alert('Please select a print template.');
      return;
    }

    Rails.ajax({
      url: `/print_templates/show/${selectedTemplateId}.json`,
      type: 'GET',
      dataType: 'json',
      success: (response) => {
        const data = {};
        data.basePdf = response.basepdf;
        data.schemas = response.schemas;
        data.fieldKeyOptions = response.fieldKeyOptions;
        data.fieldFormatOptions = response.fieldFormatOptions;

        elements.formOverlay.style.display = 'block';
        elements.formIframe.contentWindow.postMessage({
          type: 'openViewer',
          data: data
        }, window.location.origin);
      },
      error: (error) => {
        showError('Error fetching template data: ' + error);
      }
    });
  };

  const handleDownloadPdfClick = () => {
    if (elements.formIframe?.contentWindow) {
      elements.formIframe.contentWindow.postMessage(
        { type: 'generatePdf' },
        window.location.origin
      );
    }
  };

  const handleCloseFormClick = () => {
    elements.formOverlay.style.display = 'none';
    elements.formIframe.src = elements.formIframe.src; // Refresh the iframe
  };

  elements.viewPdfButton?.addEventListener('click', handleViewPdfClick);
  elements.downloadPdfButton?.addEventListener('click', handleDownloadPdfClick);
  elements.closeFormBtn?.addEventListener('click', handleCloseFormClick);
});
