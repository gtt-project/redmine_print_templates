document.addEventListener("DOMContentLoaded", function() {
  const basepdfField = document.getElementById('print_template_basepdf');
  const schemasField = document.getElementById('print_template_schemas');
  const inputsField = document.getElementById('print_template_inputs');
  const trackerIdSelect = document.getElementById('print_template_tracker_id');
  const openBtn = document.getElementById('open-designer-fullscreen-btn');
  const closeBtn = document.getElementById('close-designer-fullscreen-btn');
  const designerOverlay = document.getElementById('designer-fullscreen');
  const iframe = document.getElementById('pdfme-designer-iframe');
  const uploadField = document.getElementById('pdf-upload');
  const useBlankPdfLink = document.getElementById('use-blank-pdf');
  const fieldsDropdown = document.getElementById('tracker-fields');
  const addFieldBtn = document.getElementById('add-field-btn');
  const templateDownloadBtn = document.getElementById('template_download-designer-fullscreen-btn');
  const templateUploadBtn = document.getElementById('template_upload-designer-fullscreen-btn');
  const templateFileInput = document.getElementById('template-file-input');

  // Function to update fields dropdown
  function loadTrackerData() {
    if (trackerIdSelect) {
      Rails.ajax({
        url: trackerIdSelect.getAttribute('data-url') + "?tracker_id=" + trackerIdSelect.value,
        type: 'GET',
        dataType: 'script'
      });
    }
  }

  // Event listener for tracker dropdown change
  if (trackerIdSelect) {
    trackerIdSelect.addEventListener('change', function() {
      loadTrackerData();
    });

    // Trigger the loadTrackerData request on page load
    loadTrackerData();
  }

  // Function to get the selected field's details
  function getSelectedFieldDetails() {
    const selectedOption = fieldsDropdown.options[fieldsDropdown.selectedIndex];
    return {
      identifier: selectedOption.value,
      name: selectedOption.text,
      format: selectedOption.getAttribute('data-format')
    };
  }

  if (templateDownloadBtn) {
    templateDownloadBtn.addEventListener('click', function() {
      const iframeWindow = document.getElementById('pdfme-designer-iframe').contentWindow;
      const trackerSelect = document.getElementById('print_template_tracker_id');
      const trackerName = trackerSelect.options[trackerSelect.selectedIndex].text;

      iframeWindow.postMessage({
        type: 'triggerDownloadTemplate',
        data: { trackerName: trackerName }  // Enclose trackerName within a data object
      }, window.location.origin);
    });
  }

  if (templateUploadBtn && templateFileInput) {
    templateUploadBtn.addEventListener('click', function() {
      // Trigger the hidden file input when the button is clicked
      document.getElementById('template-file-input').click();
    });

    // Assuming BLANK_PDF_DATA_URL is the known blank PDF data URL from PDFme
    const BLANK_PDF_DATA_URL = "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNTk1LjQ0IDg0MS45Ml0KL1Jlc291cmNlcyA8PAo+PgovQ29udGVudHMgNSAwIFIKL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL3RyYXBwZWQgKGZhbHNlKQovQ3JlYXRvciAoU2VyaWYgQWZmaW5pdHkgRGVzaWduZXIgMS4xMC40KQovVGl0bGUgKFVudGl0bGVkLnBkZikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwNjE0MDg1OCswOScwMCcpCi9Qcm9kdWNlciAoaUxvdmVQREYpCi9Nb2REYXRlIChEOjIwMjIwMTA2MDUwOTA5WikKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAxIDAgUgovSW5mbyAzIDAgUgovSUQgWzwyODhCM0VENTAyOEU0MDcyNERBNzNCOUE0Nzk4OUEwQT4gPEY1RkJGNjg4NkVERDZBQUNBNDRCNEZDRjBBRDUxRDlDPl0KL1R5cGUgL1hSZWYKL1cgWzEgMiAyXQovRmlsdGVyIC9GbGF0ZURlY29kZQovSW5kZXggWzAgN10KL0xlbmd0aCAzNgo+PgpzdHJlYW0KeJxjYGD4/5+RUZmBgZHhFZBgDAGxakAEP5BgEmFgAABlRwQJCmVuZHN0cmVhbQplbmRvYmoKc3RhcnR4cmVmCjUzMgolJUVPRgo=";

    templateFileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const templateData = JSON.parse(e.target.result);

            // Check if uploaded 'basePdf' is the same as the blank PDF data URL
            if (templateData.basePdf === BLANK_PDF_DATA_URL) {
              basepdfField.value = '';
            } else if (templateData.basePdf) {
              basepdfField.value = templateData.basePdf;
            } else {
              basepdfField.value = ''; // Reset if 'basePdf' is not provided
            }

            // Toggle visibility of basepdf controls
            toggleBasePDFControls();

            // Post the remaining data to the iframe
            const iframeWindow = document.getElementById('pdfme-designer-iframe').contentWindow;
            iframeWindow.postMessage({
              type: 'loadTemplate',
              data: { templateData: templateData }
            }, window.location.origin);
          } catch (error) {
            console.error('Failed to parse template file:', error);
            alert('Invalid JSON template file.');
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a valid JSON template file.');
      }
    });
  }

  // Function to encode a PDF file in base64
  function encodeBasePDF(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const encodedPDF = e.target.result;
        if (basepdfField) {
          basepdfField.value = encodedPDF;
        }
        toggleBasePDFControls();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Function to toggle the visibility of the basepdf controls
  function toggleBasePDFControls() {
    const basepdfIcon = document.getElementById('basepdf-ok-icon');

    if (basepdfField && basepdfField.value) {
      basepdfIcon.style.display = 'inline';
      useBlankPdfLink.style.display = 'inline';
    } else {
      basepdfIcon.style.display = 'none';
      useBlankPdfLink.style.display = 'none';
    }
  }

  // Event listener for file upload
  if (uploadField) {
    uploadField.addEventListener('change', function() {
      encodeBasePDF(this);
    });
  }

  // Event listener for resetting the PDF
  if (useBlankPdfLink) {
    useBlankPdfLink.addEventListener('click', function(event) {
      event.preventDefault();
      if (basepdfField) {
        basepdfField.value = '';
        uploadField.value = '';
        toggleBasePDFControls();
      }
    });
  }

  // Event listeners for iframe communication
  if (basepdfField && schemasField && inputsField && openBtn && closeBtn && designerOverlay && iframe) {
    openBtn.addEventListener('click', function() {
      designerOverlay.style.display = 'block';
      const iframeWindow = iframe.contentWindow;

      // Parse schemas and inputs into arrays
      const parsedSchemas = schemasField.value ? JSON.parse(schemasField.value) : [];
      const parsedInputs = inputsField.value ? JSON.parse(inputsField.value) : [{}];

      iframeWindow.postMessage({
        type: 'initialData',
        data: {
          basePdf: basepdfField.value,
          schemas: parsedSchemas,
          inputs: parsedInputs
        }
      }, window.location.origin);
    });

    closeBtn.addEventListener('click', function() {
      designerOverlay.style.display = 'none';
      iframe.src = iframe.src; // Refresh the iframe
    });

    window.addEventListener('message', function(event) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'updateData') {
        // Only updating schemas and inputs
        const { schemas, inputs } = event.data.data;
        schemasField.value = JSON.stringify(schemas);
        inputsField.value = JSON.stringify(inputs);
      }
    });
  }

  if (addFieldBtn && fieldsDropdown && iframe) {
    addFieldBtn.addEventListener('click', function() {
      const selectedField = getSelectedFieldDetails();
      const iframeWindow = iframe.contentWindow;

      iframeWindow.postMessage({
        type: 'addField',
        data: selectedField
      }, window.location.origin);
    });
  }
});
