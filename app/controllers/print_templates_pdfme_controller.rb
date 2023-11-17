class PrintTemplatesPdfmeController < ApplicationController
  unloadable
  layout false
  before_action :require_admin

  def designer
    # Designer action code here
  end

  # Future actions for viewer, generator, etc.
  # def form
  # end

  # def viewer
  # end

  # def generator
  # end

  private

  def require_admin
    unless User.current.admin?
      render_403 # Renders a 403 error page
      return
    end
  end
end
