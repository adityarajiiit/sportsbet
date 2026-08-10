import { AnimatePresence, motion } from "framer-motion";
import { FaReply } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import Avatar from "react-avatar";
import CommentInput from "./CommentInput";

function ReplyToggleLabel({ isActive }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive ? (
        <motion.span
          key="cancel"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-1"
        >
          <MdCancel /> Cancel
        </motion.span>
      ) : (
        <motion.span
          key="reply"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-1"
        >
          <FaReply /> Reply
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function ChatCard({
  chat,
  avatarSize = "2rem",
  isReplyOpen,
  onToggleReply,
  inputValue,
  onInputChange,
  onSubmitReply,
  extraFooter = null,
  wrapperClassName = "",
  children = null,
}) {
  return (
    <div className={`p-1 flex items-start gap-3 w-full ${wrapperClassName}`}>
      <Avatar name={chat.author} className="rounded-full object-cover" size={avatarSize} />
      <div className="flex flex-col items-start justify-center w-full">
        <p className="text-sm font-inter text-neutral-300 font-medium">
          {chat.author}{" "}
          <span className="font-inter text-xs text-neutral-400 font-normal ml-1">
            {chat.date}
          </span>
        </p>

        <p className="font-inter text-sm font-normal">
          {chat.replyto && <span className="text-blue-500">{"@" + chat.replyto}</span>}{" "}
          {chat.chat}
        </p>

        <div className="mt-1 flex flex-col justify-center items-start w-full gap-1">
          <div className="flex justify-center items-center gap-4">
            <button
              className="text-xs font-poppins text-info flex items-center gap-1 relative h-6"
              onClick={onToggleReply}
            >
              <ReplyToggleLabel isActive={isReplyOpen} />
            </button>
            {extraFooter}
          </div>

          {isReplyOpen && (
            <CommentInput
              value={inputValue}
              onChange={onInputChange}
              onSubmit={onSubmitReply}
              autoFocus
            />
          )}
        </div>

        {children}
      </div>
    </div>
  );
}