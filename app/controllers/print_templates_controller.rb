class PrintTemplatesController < ApplicationController
  layout -> { @project ? 'base' : 'admin' }

  self.main_menu = false

  before_action :set_trackers, only: [:new, :create, :edit, :update]
  before_action :find_print_template, only: [:edit, :update, :destroy, :show]
  before_action :require_login, except: [:show, :fields_for_tracker]
  before_action :require_admin, except: [:show, :fields_for_tracker]

  def index
    @print_templates = PrintTemplate.includes(:tracker).all.order(name: :asc)
  end

  def new
    @print_template = PrintTemplate.new
  end

  def create
    @print_template = PrintTemplate.new(print_template_params)
    if @print_template.save
      redirect_to print_templates_path
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @print_template.update(print_template_params)
      redirect_to print_templates_path
    else
      render :edit
    end
  end

  def destroy
    if @print_template.destroy
      redirect_to print_templates_path, notice: 'Print template was successfully deleted.'
    else
      redirect_to print_templates_path, alert: 'Failed to delete print template.'
    end
  end

  def show
    # Define the keys that need to be parsed as JSON
    json_keys = ['schemas']

    # Parse specified JSON strings to nested JSON
    parsed_json = @print_template.attributes.each_with_object({}) do |(key, value), hash|
      hash[key] = if json_keys.include?(key) && value.is_a?(String)
                    begin
                      JSON.parse(value)
                    rescue JSON::ParserError
                      value
                    end
                  else
                    value
                  end
    end

    fields_data = generate_fields_data(@print_template.tracker)

    # Merge fields data into parsed_json
    merged_json = parsed_json.merge(fields_data)

    respond_to do |format|
      format.json { render json: merged_json }
    end
  end

  def fields_for_tracker
    tracker = Tracker.find(params[:tracker_id])
    fields_data = generate_fields_data(tracker)
    render json: fields_data
  end

  private

  def generate_fields_data(tracker)
    # Define the fields that are available for the print template
    core_fields = {
      'author.name' => ['string', l(:field_author)],
      'status.name' => ['string', l(:field_status)],
      'priority.name' => ['string', l(:field_priority)],
      'assigned_to.name' => ['string', l(:field_assigned_to)],
      'category.name' => ['string', l(:field_category)],
      'fixed_version.name' => ['string', l(:field_fixed_version)],
      'subject' => ['string', l(:field_subject)],
      'description' => ['text', l(:field_description)],
      'start_date' => ['date', l(:field_start_date)],
      'due_date' => ['date', l(:field_due_date)],
      'done_ratio' => ['float', l(:field_done_ratio)],
      'estimated_hours' => ['float', l(:field_estimated_hours)],
      'total_estimated_hours' => ['float', l(:field_total_estimated_hours)],
      'spent_hours' => ['float', l(:label_spent_time)],
      'total_spent_hours' => ['float', l(:label_total_spent_time)],
      'created_on' => ['date', l(:field_created_on)],
      'updated_on' => ['date', l(:field_updated_on)],
      'closed_on' => ['date', l(:field_closed_on)],
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    # Custom fields
    custom_fields = tracker.custom_fields.map do |cf|
      field_key = "cf_#{cf.id}"
      field_format = cf.field_format
      field_label = cf.name

      create_field_hash(field_key, field_format, field_label)
    end

    # Special fields
    special_fields = {
      'issue_map' => ['map', l(:field_issue_map)],
      'issue_url' => ['link', l(:field_issue_url)],
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    # Field formats
    format_list = {
      'bool' => ['boolean', 'Boolean'],
      'date' => ['date', 'Date'],
      # 'attachment' => ['file', 'File'],
      'float' => ['float', 'Float'],
      'int' => ['integer', 'Integer'],
      # 'enumeration' => ['enumeration', 'Key/value list'],
      # 'link' => ['link', 'Link'],
      # 'list' => ['list', 'List'],
      # 'text' => ['text', 'Long text'],
      'string' => ['string', 'Text'],
      # 'user' => ['user', 'User'],
      # 'version' => ['version', 'Version'],
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    # Return the fields data
    {
      'fieldKeyOptions': [{
        'label': l(:label_core_fields),
        'options': core_fields.sort_by! { |field| field[:value].downcase }
      }, {
        'label': l(:label_custom_fields),
        'options': custom_fields.sort_by! { |field| field[:value].downcase }
      }, {
        'label': l(:label_special_fields),
        'options': special_fields.sort_by! { |field| field[:value].downcase }
      }],
      'fieldFormatOptions': format_list
    }
  end

  def create_field_hash(field, format, name_or_key)
    name = I18n.exists?(name_or_key) ? I18n.t(name_or_key) : name_or_key

    {
      label: name,
      value: field,
      format: format
    }
  end

  def set_trackers
    @trackers = Tracker.order(:position)
  end

  def find_print_template
    @print_template = PrintTemplate.find(params[:id])
  end

  def print_template_params
    params.require(:print_template).permit(:name, :schemas, :basepdf, :tracker_id, :context)
  end

  def require_login
    unless User.current.logged?
      redirect_to signin_path(back_url: request.original_url)
    end
  end

  def require_admin
    render_403 unless User.current.admin?
  end

  def authorize_view_print_templates
    deny_access unless User.current.allowed_to?(:view_print_templates, @project, global: true)
  end
end
