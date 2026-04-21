Rails.application.routes.draw do
  namespace :api do
    get  "health",       to: "health#index"
    get  "weather",      to: "weather#index"
    post "packing_list", to: "packing_lists#create"

    namespace :v1 do
      get "health", to: "health#index"
      get "packing_list", to: "packing_lists#index"
    end
  end
end
