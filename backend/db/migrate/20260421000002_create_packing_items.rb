class CreatePackingItems < ActiveRecord::Migration[7.2]
  def change
    create_table :packing_items do |t|
      t.references :travel,   null: false, foreign_key: true
      t.string     :category, null: false
      t.string     :name,     null: false
      t.integer    :quantity
      t.string     :note
      t.boolean    :checked,  null: false, default: false
      t.timestamps
    end
  end
end
