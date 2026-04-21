Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get "health", to: "health#index"
      get "packing_list", to: "packing_lists#index"
    end
  end
end
