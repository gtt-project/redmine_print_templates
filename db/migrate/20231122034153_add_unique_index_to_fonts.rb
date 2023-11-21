class AddUniqueIndexToFonts < ActiveRecord::Migration[6.1]
  def change
    add_index :fonts, :name, unique: true
  end
end
