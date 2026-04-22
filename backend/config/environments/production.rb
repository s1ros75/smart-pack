Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.force_ssl = true

  config.logger = ActiveSupport::Logger.new($stdout)
    .tap  { |l| l.formatter = Logger::Formatter.new }
    .then { |l| ActiveSupport::TaggedLogging.new(l) }
  config.log_level = :info
  config.log_tags  = [:request_id]

  config.active_record.dump_schema_after_migration = false

  # Renderのホストチェックをスキップ（FRONTEND_URLと同一オリジンでないため）
  config.hosts.clear
end
