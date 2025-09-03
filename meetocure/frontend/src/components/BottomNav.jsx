const BottomNav = ({ navItems }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-50 block md:hidden">
      <div className="flex justify-around items-center h-16 px-4 text-[#0A4D68] text-xl">
        {navItems?.map((item, idx) => {
          if (item.onClick) {
            // 🔹 Handle custom actions (like Enquiry modal)
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="flex flex-col items-center cursor-pointer focus:outline-none"
                aria-label={item.label}
              >
                {item.icon}
                {/* <span className="text-xs">{item.label}</span> */}
              </button>
            );
          }

          // 🔹 Default: Navigation link
          return (
            <a
              key={idx}
              href={item.path}
              className="flex flex-col items-center cursor-pointer"
              aria-label={item.label}
            >
              {item.icon}
              {/* <span className="text-xs">{item.label}</span> */}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
