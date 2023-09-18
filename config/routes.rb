Rails.application.routes.draw do
  root 'weather#dashboard'
  get 'weather/dashboard', to: 'weather#dashboard'
  post 'weather/dashboard_location', to: 'weather#dashboard_location'
  post '/weather/reverse_geocode', to: 'weather#reverse_geocode'
end