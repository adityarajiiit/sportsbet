import { IoSend } from "react-icons/io5";

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your comment here",
  autoFocus = false,
  className = "",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value?.trim()) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full p-2 border-t border-base-content/10 flex gap-3 justify-center ${className}`}>
      <div className="join w-full">
        <input
          type="text"
          autoFocus={autoFocus}
          className="input join-item w-full"
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="submit" className="btn join-item bg-white text-black">
          <IoSend />
        </button>
      </div>
    </form>
  );
}