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

    # Pass the CSRF token to the view
    @csrf_token = form_authenticity_token
  end

  def viewer
    issue_id = params[:issue_id]
    api_key = User.current.api_key

    # Construct the full URL using Rails URL helpers
    url = issue_url(issue_id, key: api_key, include: 'journals,attachments,relations', format: :json)
    uri = URI.parse(url)

    response = Net::HTTP.get_response(uri)

    if response.is_a?(Net::HTTPSuccess)
      @issue_data = response.body
    else
      # Handle errors (e.g., issue not found, access denied)
      @issue_data = {}.to_json
    end

    # Retrieve fonts and sort them alphabetically by name
    @fonts = Font.order(:name).map do |font|
      {
        name: font.name,
        url: show_print_templates_fonts_path(name: font.name)
      }
    end

    # Retrieve plugin settings
    @plugin_settings = Setting.plugin_redmine_print_templates

    # Pass the CSRF token to the view
    @csrf_token = form_authenticity_token
  end

  private

  def authorize_view_print_templates
    deny_access unless User.current.allowed_to?(:view_print_templates, @project, global: true)
  end
end
