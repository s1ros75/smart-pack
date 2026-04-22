# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_04_21_000002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "packing_items", force: :cascade do |t|
    t.bigint "travel_id", null: false
    t.string "category", null: false
    t.string "name", null: false
    t.integer "quantity"
    t.string "note"
    t.boolean "checked", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["travel_id"], name: "index_packing_items_on_travel_id"
  end

  create_table "travels", force: :cascade do |t|
    t.string "destination", null: false
    t.string "city_code", null: false
    t.integer "nights", null: false
    t.boolean "laundry", default: false, null: false
    t.string "travel_type", default: "leisure", null: false
    t.date "start_date"
    t.date "end_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "packing_items", "travels"
end
