# app/models/font.rb
class Font < ActiveRecord::Base
  validates :name, presence: true, uniqueness: true
  validates :data, presence: true
  validate :limit_number_of_fonts

  def to_pdfme_format
    {
      name => {
        data: Base64.decode64(data),
        fallback: fallback,
        subset: subset
      }
    }
  end

  private

  def limit_number_of_fonts
    max_fonts = 5 # Set your desired limit
    errors.add(:base, "Exceeds maximum number of fonts (#{max_fonts})") if Font.count >= max_fonts
  end
end
