class PrintTemplatesPdfmeController < ApplicationController
  unloadable
  layout false

  before_action :authorize_view_print_templates

  def designer
    # Check if the user is an admin
    unless User.current.admin?
      render_403 # Renders a 403 error page
      return
    end

    # Retrieve fonts and sort them alphabetically by name
    @fonts = Font.order(:name).map do |font|
      {
        name: font.name,
        url: show_print_templates_fonts_path(name: font.name)
      }
    end
  end

  def form
    # Retrieve fonts and sort them alphabetically by name
    @fonts = Font.order(:name).map do |font|
      {
        name: font.name,
        url: show_print_templates_fonts_path(name: font.name)
      }
    end
  end

  # Future actions for viewer, generator, etc.
  # def viewer
  # end

  # def generator
  # end

  private

  def authorize_view_print_templates
    deny_access unless User.current.allowed_to?(:view_print_templates, @project, global: true)
  end
end
