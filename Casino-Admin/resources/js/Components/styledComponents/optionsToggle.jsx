import { useState } from "react";

const OptionsDropdown = ({ options = [], onOptionClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        if (onOptionClick) {
            onOptionClick(option);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            {/* Trigger */}
            <button
                onClick={toggleDropdown}
                className="inline-flex justify-center w-full px-2 py-2 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none"
            >
                <svg
                    className="w-5 h-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v.01M12 12v.01M12 18v.01"
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionsDropdown;
