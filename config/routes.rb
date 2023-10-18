# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

resources :gtt_pdfme, only: %i(index new create edit update destroy)
