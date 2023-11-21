document.addEventListener("DOMContentLoaded", function() {
  const viewPdfButton = document.getElementById('open-form-fullscreen-btn');
  const printTemplateSelect = document.getElementById('print_template_select');

  const formOverlay = document.getElementById('form-fullscreen');
  const downloadPdfButton = document.getElementById('download-pdf-button');
  const closeFormBtn = document.getElementById('close-form-fullscreen-btn');
  const formIframe = document.getElementById('pdfme-form-iframe');

  if (viewPdfButton && printTemplateSelect) {
    viewPdfButton.addEventListener('click', function() {
      const selectedTemplateId = printTemplateSelect.value;
      if (selectedTemplateId) {
        // Fetch the template data from the server
        Rails.ajax({
          url: `/print_templates/show/${selectedTemplateId}.json`,
          type: 'GET',
          dataType: 'json',
          success: function(response) {
            // Open the form overlay and send the fetched template data
            formOverlay.style.display = 'block';
            formIframe.contentWindow.postMessage({
              type: 'loadSelectedTemplate',
              templateData: response
            }, window.location.origin);
          },
          error: function(error) {
            console.error('Error fetching template data:', error);
          }
        });
      } else {
        alert('Please select a print template.');
      }
    });
  }

  if (downloadPdfButton) {
    downloadPdfButton.addEventListener('click', function() {
      if (formIframe && formIframe.contentWindow) {
        // Send a message to the iframe to trigger PDF generation
        formIframe.contentWindow.postMessage({ type: 'generatePdf' }, window.location.origin);
      }
    });
  }

  // Close button logic
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', function() {
      formOverlay.style.display = 'none';
      formIframe.src = formIframe.src; // Refresh the iframe
    });
  }
});
