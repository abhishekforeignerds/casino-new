import React from 'react'

export const ItemInfoGreeCard = ({svgIcon, cardHeading, description}) => {
  return (
    <div className="bg-lightGreen text-gray-800 px-4 py-6 rounded-lg shadow w-full text-center">
    <div className="svg-box bg-green w-12 h-12 flex justify-center items-center rounded-lg ml-auto mr-auto mb-4">
        {svgIcon}
    </div>
    <h3 className="text-md font-medium">{cardHeading}</h3>
    <p className="text-2xl">{description}</p>
</div>  )
}

export default ItemInfoGreeCard;