Rails.application.routes.draw do
  get 'contacts/create'
  get 'projects/slides'
  get 'projects/macval'
  get 'projects/tf1'
  get 'projects/shelfie'
  get 'projects/ford'
  get 'projects/abskate'
  get 'projects/mango'
  get 'projects/la_colline'
  get 'projects/experimentation'
  get 'home/index'

  get "/contact", to: "pages#contact"
  post "/contacts", to: "contacts#create", as: :contacts
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root to: 'home#index'
  get 'bio', to: 'pages#bio'
  get 'contact', to: 'pages#contact'
end
