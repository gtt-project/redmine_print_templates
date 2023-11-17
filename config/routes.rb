# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

resources :print_templates, only: %i(index new create edit update destroy) do

  # Nested routes for different PDFme functionalities
  get 'designer', to: 'print_templates_pdfme#designer', on: :collection

  # Future routes
  # get 'form', to: 'print_templates_pdfme#form', on: :collection
  # get 'viewer', to: 'print_templates_pdfme#viewer', on: :collection
  # get 'generator', to: 'print_templates_pdfme#generator', on: :collection
end
