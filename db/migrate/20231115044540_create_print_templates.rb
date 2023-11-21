class CreatePrintTemplates < ActiveRecord::Migration[6.1]
  def change
    create_table :print_templates do |t|
      t.string :name
      t.jsonb :schemas
      t.jsonb :inputs
      t.binary :basepdf
      t.integer :tracker_id

      t.timestamps
    end
  end
end
