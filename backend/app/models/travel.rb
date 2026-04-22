class Travel < ApplicationRecord
  has_many :packing_items, dependent: :destroy

  TRAVEL_TYPES = %w[business leisure outdoor].freeze

  validates :destination, presence: true
  validates :city_code,   presence: true
  validates :nights,      presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :travel_type, inclusion: { in: TRAVEL_TYPES }
end
