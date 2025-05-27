import React, { useState } from 'react';

const NotificationTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: 'Tab 1', content: 'This is the content of Tab 1.' },
    { title: 'Tab 2', content: 'Here’s what you’ll see in Tab 2.' },
    { title: 'Tab 3', content: 'Welcome to Tab 3 content!' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto mt-10">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-2 px-4 text-sm font-semibold focus:outline-none ${
              activeTab === index
                ? 'border-b-2 border-red-500 text-red-500'
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-white shadow-lg rounded-lg mt-4">
        <p className="text-gray-700">{tabs[activeTab].content}</p>
      </div>
    </div>
  );
};

export default NotificationTabs;
