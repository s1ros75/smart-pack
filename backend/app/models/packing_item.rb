class PackingItem < ApplicationRecord
  belongs_to :travel

  validates :category, presence: true
  validates :name,     presence: true
end
