module RedminePrintTemplates
  def self.setup
  end

  def self.settings
    Setting.plugin_redmine_print_templates
  end

  def self.fonts
    Font.all.map do |font|
      {
        id: font.id,
        name: font.name,
        fallback: font.fallback,
        subset: font.subset,
        size_mb: (font.data.bytesize.to_f / 1_048_576).round(2) # Size in MB, rounded to 2 decimal places
      }
    end
  end

end
