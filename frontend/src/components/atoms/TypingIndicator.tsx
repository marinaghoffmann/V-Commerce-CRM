import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex flex-shrink-0 items-center justify-center mr-2">
        <AssistenteIcon className="w-[18px] h-[18px] text-current fill-current" />
      </div>
      <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none h-[40px] flex items-center justify-center">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
          <span
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></span>
          <span
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
