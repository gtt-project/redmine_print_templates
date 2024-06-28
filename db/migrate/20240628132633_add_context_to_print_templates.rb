class AddContextToPrintTemplates < ActiveRecord::Migration[6.1]
  def change
    add_column :print_templates, :context, :string, default: 'issue', null: false
  end
end
