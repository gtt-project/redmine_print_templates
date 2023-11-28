class PrintTemplatesFontsController < ApplicationController
  unloadable
  layout false

  before_action :authorize_view_print_templates

  def show
    font = Font.find_by(name: params[:name])
    if font
      send_data font.data, type: 'font/ttf', disposition: 'inline'
    else
      head :not_found
    end
  end

  def upload
    font_params = params.require(:font).permit(:name, :file)
    file_data = font_params[:file].read

    existing_font = Font.find_by(name: font_params[:name])
    current_time = Time.current
    timestamp_attributes = existing_font ? { updated_at: current_time } : { created_at: current_time, updated_at: current_time }

    upserted_font = Font.upsert({
      name: font_params[:name],
      data: file_data, # Store the raw binary data
      fallback: font_params[:fallback] || false,
      subset: font_params[:subset] || true
    }.merge(timestamp_attributes), unique_by: :name)

    if upserted_font
      render json: { success: true, message: 'Font uploaded successfully.' }
    else
      render json: { success: false, message: 'Error uploading font.' }, status: :unprocessable_entity
    end
  rescue ActiveRecord::NotNullViolation => e
    render json: { success: false, message: "Database error: #{e.message}" }, status: :unprocessable_entity
  rescue => e
    render json: { success: false, message: "Unexpected error: #{e.message}" }, status: :internal_server_error
  end

  def delete
    font = Font.find(params[:id])
    if font.destroy
      render json: { success: true }
    else
      render json: { success: false }, status: :unprocessable_entity
    end
  end

  private

  def authorize_view_print_templates
    deny_access unless User.current.allowed_to?(:view_print_templates, @project, global: true)
  end
end
