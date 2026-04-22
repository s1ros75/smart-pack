require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module SmartPack
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
  end
end
