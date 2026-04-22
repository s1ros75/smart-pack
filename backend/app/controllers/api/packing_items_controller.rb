module Api
  class PackingItemsController < ApplicationController
    def create
      travel = Travel.find(params[:travel_id])
      item   = travel.packing_items.create!(packing_item_params)
      render json: item, status: :created
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Travel not found" }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def update
      item = PackingItem.find(params[:id])
      item.update!(packing_item_params)
      render json: item
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Item not found" }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def destroy
      PackingItem.find(params[:id]).destroy!
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Item not found" }, status: :not_found
    end

    private

    def packing_item_params
      params.permit(:category, :name, :quantity, :note, :checked)
    end
  end
end
