class PrintTemplatesController < ApplicationController
  layout ->{ @project ? 'base' : 'admin' }

  self.main_menu = false

  before_action :set_trackers, only: [:new, :create, :edit, :update]
  before_action :find_print_template, only: [:edit, :update, :destroy]
  before_action :require_admin, except: [:show, :fields_for_tracker]

  # TODO: make this work with Rails.ajax
  # before_action :authorize_view_print_templates, only: [:show, :fields_for_tracker]

  def index
    @print_templates = PrintTemplate.includes(:tracker).all
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
    # @print_template is set by before_action
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
    @print_template = PrintTemplate.find(params[:id])
    respond_to do |format|
      format.json { render json: @print_template }
      format.js
    end
  end

  def fields_for_tracker
    @tracker = Tracker.find(params[:tracker_id])

    # Define core fields
    @core_fields = {
      'standard#author.name' => ['text', 'field_author'],
      'standard#status.name' => ['text', 'field_status'],
      'standard#priority.name' => ['text', 'field_priority'],
      'standard#assigned_to.name' => ['text', 'field_assigned_to'],
      'standard#category.name' => ['text', 'field_category'],
      'standard#fixed_version.name' => ['text', 'field_fixed_version'],
      'standard#subject' => ['text', 'field_subject'],
      'standard#description' => ['text', 'field_description'],
      'standard#start_date' => ['date', 'field_start_date'],
      'standard#due_date' => ['date', 'field_due_date'],
      'standard#done_ratio' => ['text', 'field_done_ratio'],
      'standard#estimated_hours' => ['text', 'field_estimated_hours'],
      'standard#total_estimated_hours' => ['text', 'field_total_estimated_hours'],
      'standard#spent_hours' => ['text', 'label_spent_time'],
      'standard#total_spent_hours' => ['text', 'label_total_spent_time'],
      'standard#created_on' => ['date', 'field_created_on'],
      'standard#updated_on' => ['date', 'field_updated_on'],
      'standard#closed_on' => ['date', 'field_closed_on'],
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    # Define custom fields with their names directly
    @custom_fields = @tracker.custom_fields.map do |cf|
      field_identifier = "custom#issue_custom_field_values_#{cf.id}"
      field_format = cf.field_format
      field_name = cf.name

      create_field_hash(field_identifier, field_format, field_name)
    end

    # Define special fields with localization keys
    @special_fields = {
      'special#issue_map' => ['image', 'field_issue_map'],
      'special#issue_url' => ['qrcode', 'field_issue_url']
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    # Sorting
    @core_fields.sort_by! { |field| field[:name].downcase }
    @custom_fields.sort_by! { |field| field[:name].downcase }
    @special_fields.sort_by! { |field| field[:name].downcase }

    respond_to do |format|
      format.js
    end
  end

  private

  def create_field_hash(field, format, name_or_key)
    name = I18n.exists?(name_or_key) ? I18n.t(name_or_key) : name_or_key

    {
      name: name,
      identifier: field,
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
    params.require(:print_template).permit(:name, :schemas, :inputs, :basepdf, :tracker_id)
  end

  def require_admin
    render_403 unless User.current.admin?
  end

  def authorize_view_print_templates
    deny_access unless User.current.allowed_to?(:view_print_templates, @project, global: true)
  end
end
