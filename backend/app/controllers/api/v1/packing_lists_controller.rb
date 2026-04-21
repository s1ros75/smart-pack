module Api
  module V1
    class PackingListsController < ApplicationController
      def index
        city_code = params.require(:city_code)
        nights    = params.require(:nights).to_i
        laundry   = ActiveModel::Type::Boolean.new.cast(params[:laundry])

        weather_data = WeatherService.new(city_code).fetch
        items        = PackingCalculator.new(nights: nights, laundry: laundry, weather: weather_data).calculate

        render json: { city_code: city_code, nights: nights, items: items, weather: weather_data }
      rescue ActionController::ParameterMissing => e
        render json: { error: e.message }, status: :unprocessable_entity
      rescue WeatherService::Error => e
        render json: { error: e.message }, status: :bad_gateway
      end
    end
  end
end
