import React from 'react'

export const ItemInfoDarkBlueCard = ({svgIcon, cardHeading, description}) => {
  return (
    <div className="bg-darkBlueOpacity text-gray-800 px-4 py-6 rounded-lg shadow w-full text-center lg:max-w-[25%]">
    <div className="svg-box bg-darkBlue w-12 h-12 flex justify-center items-center rounded-md ml-auto mr-auto mb-4">
       {svgIcon}</div>
        <h3 className="text-md font-medium">{cardHeading}</h3>
        <p className="text-2xl">{description}</p>
</div>
  )
}
