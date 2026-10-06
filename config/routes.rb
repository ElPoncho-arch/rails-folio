Rails.application.routes.draw do
  get 'projects/slides', to: 'projects#slides'
  get 'projects/macval', to: 'projects#macval'
  get 'projects/tf1', to: 'projects#tf1'
  get 'projects/shelfie', to: 'projects#shelfie'
  get 'projects/ford', to: 'projects#ford'
  get 'projects/abskate', to: 'projects#abskate'
  get 'projects/mango', to: 'projects#mango'
  get 'projects/la_colline', to: 'projects#la_colline'
  get 'projects/experimentation', to: 'projects#experimentation'

  get "up" => "rails/health#show", as: :rails_health_check

  root to: 'home#index'
  get 'bio', to: 'pages#bio'
  get 'contact', to: 'pages#contact', as: :contact
  get 'mentions-legales', to: 'pages#mentions_legales', as: :mentions_legales
  get 'work', to: redirect('/#projets', status: 301)

  resources :contacts, only: [:create]
end
