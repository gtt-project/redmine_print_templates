class RemoveInputsFromPrintTemplates < ActiveRecord::Migration[6.1]
  def change
    remove_column :print_templates, :inputs, :jsonb
  end
end
