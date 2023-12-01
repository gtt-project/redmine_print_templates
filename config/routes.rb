# config/routes.rb

# Standard CRUD routes for print templates
resources :print_templates, only: %i(index new create edit update destroy) do
  # Nested routes for PDFme functionalities
  get 'designer', to: 'print_templates_pdfme#designer', on: :collection
  get 'form', to: 'print_templates_pdfme#form', on: :collection
end

# Route to fetch fields for a tracker (AJAX)
get 'print_templates/fields_for_tracker', to: 'print_templates#fields_for_tracker', as: 'fields_for_tracker_print_templates'

# Explicitly define the 'show' route
get 'print_templates/show/:id', to: 'print_templates#show', as: 'show_print_template', constraints: { id: /\d+/ }

# Route to fetch fonts
get 'print_templates/fonts/:name', to: 'print_templates_fonts#show', as: 'show_print_templates_fonts'

# Route to upload fonts
post 'print_templates/fonts/upload', to: 'print_templates_fonts#upload', as: 'upload_print_templates_fonts'

# Route to delete fonts
delete 'print_templates/fonts/delete/:id', to: 'print_templates_fonts#delete', as: 'delete_print_templates_fonts', constraints: { id: /\d+/ }
