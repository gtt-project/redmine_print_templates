document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    basepdfField: document.getElementById('print_template_basepdf'),
    schemasField: document.getElementById('print_template_schemas'),
    trackerIdSelect: document.getElementById('print_template_tracker_id'),
    openBtn: document.getElementById('open-designer-fullscreen-btn'),
    closeBtn: document.getElementById('close-designer-fullscreen-btn'),
    designerOverlay: document.getElementById('designer-fullscreen'),
    iframe: document.getElementById('pdfme-designer-iframe'),
    uploadField: document.getElementById('pdf-upload'),
    useBlankPdfLink: document.getElementById('use-blank-pdf'),
    templateDownloadBtn: document.getElementById('template_download-designer-fullscreen-btn'),
    templateUploadBtn: document.getElementById('template_upload-designer-fullscreen-btn'),
    templateFileInput: document.getElementById('template-file-input'),
    basepdfIcon: document.getElementById('basepdf-ok-icon')
  };

  // console.log('Print Templates Designer loaded!');

  const showError = (message) => {
    console.error(message);
    alert('An error occurred. Please try again.');
  };

  const loadTrackerData = () => {
    if (elements.trackerIdSelect) {
      Rails.ajax({
        url: `${elements.trackerIdSelect.getAttribute('data-url')}?tracker_id=${elements.trackerIdSelect.value}`,
        type: 'GET',
        dataType: 'json',
        success: (response) => {
          sessionStorage.setItem('fieldKeyOptions', JSON.stringify(response.fieldKeyOptions));
          sessionStorage.setItem('fieldFormatOptions', JSON.stringify(response.fieldFormatOptions));
        }
      });
    }
  };

  const handleTemplateDownloadClick = () => {
    const iframeWindow = elements.iframe.contentWindow;
    const trackerName = elements.trackerIdSelect.options[elements.trackerIdSelect.selectedIndex].text;

    iframeWindow.postMessage({
      type: 'downloadTemplate',
      data: { trackerName: trackerName }
    }, window.location.origin);
  };

  const handleTemplateUploadClick = () => {
    elements.templateFileInput.click();
  };

  const handleTemplateFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const templateData = JSON.parse(e.target.result);

          if (templateData.basePdf) {
            elements.basepdfField.value = templateData.basePdf;
          } else {
            elements.basepdfField.value = ''; // Reset if 'basePdf' is not provided
          }

          toggleBasePDFControls();

          const iframeWindow = elements.iframe.contentWindow;
          iframeWindow.postMessage({
            type: 'uploadTemplate',
            data: { templateData: templateData }
          }, window.location.origin);
        } catch (error) {
          showError('Failed to parse template file: ' + error);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON template file.');
    }
  };

  const encodeBasePDF = (input) => {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const encodedPDF = e.target.result;
        if (elements.basepdfField) {
          elements.basepdfField.value = encodedPDF;
        }
        toggleBasePDFControls();
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  const toggleBasePDFControls = () => {
    if (elements.basepdfField && elements.basepdfField.value) {
      elements.basepdfIcon.style.display = 'inline';
      elements.useBlankPdfLink.style.display = 'inline';
    } else {
      elements.basepdfIcon.style.display = 'none';
      elements.useBlankPdfLink.style.display = 'none';
    }
  };

  const handleOpenBtnClick = () => {
    elements.designerOverlay.style.display = 'block';
    const iframeWindow = elements.iframe.contentWindow;

    const data = {};
    elements.basepdfField.value ? data.basePdf = elements.basepdfField.value : null;
    elements.schemasField.value ? data.schemas = JSON.parse(elements.schemasField.value) : null;

    data.fieldKeyOptions = JSON.parse(sessionStorage.getItem('fieldKeyOptions'));
    data.fieldFormatOptions = JSON.parse(sessionStorage.getItem('fieldFormatOptions'));

    iframeWindow.postMessage({
      type: 'openDesigner',
      data: data
    }, window.location.origin);
  };

  const handleCloseBtnClick = () => {
    elements.designerOverlay.style.display = 'none';
    elements.iframe.src = elements.iframe.src; // Refresh the iframe
  };

  const handleMessageEvent = (event) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'updateData') {
      const { schemas } = event.data.data;
      elements.schemasField.value = JSON.stringify(schemas);
    }
  };

  elements.trackerIdSelect?.addEventListener('change', loadTrackerData);
  loadTrackerData();

  elements.templateDownloadBtn?.addEventListener('click', handleTemplateDownloadClick);
  elements.templateUploadBtn?.addEventListener('click', handleTemplateUploadClick);
  elements.templateFileInput?.addEventListener('change', handleTemplateFileChange);

  elements.uploadField?.addEventListener('change', function() {
    encodeBasePDF(this);
  });

  elements.useBlankPdfLink?.addEventListener('click', (event) => {
    event.preventDefault();
    if (elements.basepdfField) {
      elements.basepdfField.value = '';
      elements.uploadField.value = '';
      toggleBasePDFControls();
    }
  });

  elements.openBtn?.addEventListener('click', handleOpenBtnClick);
  elements.closeBtn?.addEventListener('click', handleCloseBtnClick);

  window.addEventListener('message', handleMessageEvent);
});
