class PrintTemplate < ActiveRecord::Base
  belongs_to :tracker

  validates :name, presence: true
  validates :name, uniqueness: { scope: :tracker_id }

  validates :tracker_id, presence: true
end
