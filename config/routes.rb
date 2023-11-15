# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

resources :print_templates, only: %i(index new create edit update destroy)
