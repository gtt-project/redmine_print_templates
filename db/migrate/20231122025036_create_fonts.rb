# db/migrate/xxxx_create_fonts.rb
class CreateFonts < ActiveRecord::Migration[6.1]
  def change
    create_table :fonts do |t|
      t.string :name
      t.binary :data
      t.boolean :fallback, default: false
      t.boolean :subset, default: true

      t.timestamps
    end
  end
end
