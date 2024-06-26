function uploadFontFile() {
  return new Promise((resolve, reject) => {
    const fontFile = document.getElementById('font_file').files[0];
    const fontName = document.getElementById('font_name').value;

    if (!fontFile || !fontName) {
      alert(localization.provideFontNameAndFile);
      reject(localization.provideFontNameAndFile);
      return;
    }

    const formData = new FormData();
    formData.append('font[name]', fontName);
    formData.append('font[file]', fontFile); // Append the file directly

    fetch('/print_templates/fonts/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      }
    }).then(response => {
      if (response.ok) {
        resolve();
      } else {
        response.json().then(json => {
          reject(`${localization.errorUploadingFont}: ` + json.message);
        });
      }
    }).catch(error => {
      console.error('Fetch error:', error.message);
      reject('Fetch error: ' + error.message);
    });
  });
}

function deleteFont(fontId) {
  if (!confirm(localization.confirmDeleteFont)) {
    return; // Do nothing if the user cancels the deletion
  }

  fetch('/print_templates/fonts/delete/' + fontId, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    }
  }).then(response => {
    if (response.ok) {
      document.getElementById('font-' + fontId).remove(); // Remove the font from the list
    } else {
      alert(localization.errorDeletingFont);
    }
  }).catch(error => {
    console.error('Error:', error);
    alert(localization.errorDeletingFont);
  });
}

// Function to clear the font input fields
function clearFontFields() {
  document.getElementById('font_name').value = '';
  document.getElementById('font_file').value = '';
}

// Form submission interception
document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('#settings.plugin.plugin-redmine_print_templates');

  console.log('Print Templates Fonts loaded!');

  if (container) {
    const form = container.querySelector('form');

    if (form) {
      form.addEventListener('submit', function(event) {
        const fontFile = document.getElementById('font_file').files[0];

        if (fontFile) {
          event.preventDefault(); // Prevent default form submission if a file is selected
          uploadFontFile().then(() => {
            form.submit(); // Manually submit the form after successful font upload
          }).catch((error) => {
            console.error(`${localization.errorUploadingFont}: `, error);
            alert(localization.errorUploadingFont);
            clearFontFields(); // Clear the input fields
          });
        }
        // If no file is selected, the form submits normally
      });
    } else {
      console.error('Form not found');
    }
  }
});
