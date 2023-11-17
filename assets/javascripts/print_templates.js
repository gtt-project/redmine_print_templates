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

      iframeWindow.postMessage({
        type: 'initialData',
        data: {
          basePdf: basepdfField.value,
          schemas: schemasField.value,
          inputs: inputsField.value
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
