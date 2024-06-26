import { Template, BLANK_PDF, getDefaultFont } from '@pdfme/common';
import { Form } from '@pdfme/ui';
import { generate } from '@pdfme/generator';

import { getPlugins } from './schemas';

interface FontData {
  name: string;
  url: string;
}

declare const embeddedFonts: FontData[];
declare const issueData: any;
declare const pluginSettings: any;

const urlParams = new URLSearchParams(window.location.search);
const issueId = urlParams.get('issue_id');

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById('pdfme-container');
  let form: Form | undefined;

  window.addEventListener('message', async function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, templateData } = event.data;

    switch (type) {
      case 'loadSelectedTemplate':
        if (container && templateData) {
          // Parse schemas and inputs from JSON strings to JavaScript arrays
          const schemas = JSON.parse(templateData.schemas || '[]');
          const inputs = [mapIssueDataToTemplate(issueData, schemas)] || [{}];

          // Use BLANK_PDF as a fallback if basePdf is not provided
          const basePdf = templateData.basepdf || BLANK_PDF;

          // Define the template structure
          const template: Template = {
            basePdf: basePdf,
            schemas: schemas
          };

          async function initializeForm() {
            // Set the default fonts
            const availableFonts = getDefaultFont();

            for (const font of embeddedFonts) {
              const response = await fetch(font.url);
              const arrayBuffer = await response.arrayBuffer();

              availableFonts[font.name] = {
                data: arrayBuffer,
              };
            }

            // Recreate the Form instance with the new template and inputs
            form = new Form({
              domContainer: container,
              template: template as Template | any,
              inputs: inputs,
              // plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
              options: {
                theme: {
                  token: {
                    colorPrimary: '#f1515c'
                  },
                },
                font: availableFonts,
              },
            });
          }

          initializeForm();
        }
        break;

      case 'generatePdf':
        if (form) {
          const currentInputs = form.getInputs();

          async function initializeGenerator() {
            // Set the default fonts
            const availableFonts = getDefaultFont();

            for (const font of embeddedFonts) {
              const response = await fetch(font.url);
              const arrayBuffer = await response.arrayBuffer();

              availableFonts[font.name] = {
                data: arrayBuffer,
                // include fallback and subset options if necessary
              };
            }

            generate({
              template: form.getTemplate() as Template | any,
              inputs: currentInputs,
              // plugins: getPlugins({ fieldKeyOptions, fieldFormatOptions }),
              options: {
                font: availableFonts,
                author: pluginSettings.default_pdf_author || "",
                creator: pluginSettings.default_pdf_creator || "",
                keywords: [],
                language: "en-US",
                producer: pluginSettings.default_pdf_producer || "",
                subject: "Redmine Issue Report",
                title: `Issue #${issueId}: Feature Implementation`,
              },
            }).then((pdf) => {
              const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
              const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');

               // Create and trigger download link
              const downloadLink = document.createElement("a");
              downloadLink.href = URL.createObjectURL(blob);
              downloadLink.download = `${timestamp}_issue_${issueId}.pdf`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(downloadLink.href);
            }).catch((error) => {
              console.error('Error generating PDF:', error);
            });
          }

          initializeGenerator();
        }
        break;
        // Handle other cases if necessary
    }
  });
});

function mapIssueDataToTemplate(issueData: any, template: any) {
  const mappedInputs: any = {};

  template.forEach((page: any) => {
    Object.keys(page).forEach(key => {
      const match = key.match(/\$\(([^#]+)#([^)]+)\)/);
      if (match && match.length >= 3) {
        const type = match[1];
        const field = match[2];
        let value = '';

        switch (type) {
          case 'standard':
            const fields = field.split('.');
            value = fields.reduce((acc, curr) => acc && acc[curr], issueData.issue);
            break;
          case 'custom':
            const customField = issueData.issue.custom_fields.find((f: any) => f.name === field);
            value = customField ? customField.value : '';
            break;
          case 'special':
            // Handle special cases here
            break;
          default:
            // Handle unknown type
            break;
        }

        if (value !== undefined) {
          mappedInputs[key] = String(value);
        }
      }
    });
  });

  return mappedInputs;
}
