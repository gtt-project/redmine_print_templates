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

    # Designer action code here
  end

  def form
    # Form action code here
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
