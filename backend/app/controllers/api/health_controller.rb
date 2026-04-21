module Api
  class HealthController < ApplicationController
    def index
      db_status = database_connected? ? "connected" : "disconnected"

      render json: {
        status:    "ok",
        message:   "Smart Pack API is running",
        timestamp: Time.current.iso8601,
        database:  db_status
      }
    end

    private

    def database_connected?
      ActiveRecord::Base.connection.execute("SELECT 1")
      true
    rescue StandardError
      false
    end
  end
end
