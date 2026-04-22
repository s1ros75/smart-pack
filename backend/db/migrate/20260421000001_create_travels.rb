class CreateTravels < ActiveRecord::Migration[7.2]
  def change
    create_table :travels do |t|
      t.string  :destination, null: false
      t.string  :city_code,   null: false
      t.integer :nights,      null: false
      t.boolean :laundry,     null: false, default: false
      t.string  :travel_type, null: false, default: "leisure"
      t.date    :start_date
      t.date    :end_date
      t.timestamps
    end
  end
end
