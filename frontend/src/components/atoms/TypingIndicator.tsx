export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="text-lg mr-2">✨</div>
      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
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
