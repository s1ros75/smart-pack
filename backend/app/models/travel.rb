class Travel < ApplicationRecord
  has_many :packing_items, dependent: :destroy

  TRAVEL_TYPES = %w[business leisure outdoor].freeze

  validates :destination, presence: true
  validates :city_code,   presence: true
  validates :nights,      presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :travel_type, inclusion: { in: TRAVEL_TYPES }
  validate  :dates_consistency

  before_validation :calculate_nights_from_dates, if: -> { start_date.present? && end_date.present? }

  private

  def dates_consistency
    return if start_date.nil? && end_date.nil?
    if start_date.nil? || end_date.nil?
      errors.add(:base, "出発日と帰宅日はどちらも入力してください")
    elsif end_date <= start_date
      errors.add(:end_date, "は出発日より後の日付にしてください")
    end
  end

  def calculate_nights_from_dates
    self.nights = (end_date - start_date).to_i
  end
end
