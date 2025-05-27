import React, { useState } from 'react';

const IconMenuOptions = ({ trigger, items, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                className="flex justify-center items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                onClick={toggleDropdown}
                aria-haspopup="menu"
                aria-expanded={isOpen ? "true" : "false"}
            >
                {trigger}
            </button>

            {/*IconMenuOptions Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 min-w-60 bg-white shadow-md rounded-lg transition-opacity duration-200 z-10"
                    role="menu"
                    aria-orientation="vertical"
                    onMouseLeave={closeDropdown}
                >
                    <div className="space-y-0.5 flex flex-col p-2 gap-1">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                className="text-blue-500 hover:underline text-left"
                                onClick={() => {
                                    onSelect(item);
                                    closeDropdown();
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IconMenuOptions;
