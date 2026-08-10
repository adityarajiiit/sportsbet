import { useState } from "react";
import ChatCard from "./ChatCard";
import CommentInput from "./CommentInput";
import NoDataState from "@/components/ui/NoDataState";

export default function CommentSection({
  comments,
  newComment,
  variant = "fixed",
  listClassName,
}) {
  const [commentIndex, setCommentIndex] = useState(null);
  const [showReplies, setShowReplies] = useState(null);
  const [replyIndex, setReplyIndex] = useState(null);
  const [usercomment, setUsercomment] = useState({});

  const getDraft = (key) => usercomment[key] || "";
  const setDraft = (key, value) =>
    setUsercomment((prev) => ({ ...prev, [key]: value }));

  const submitAndClear = (text, parentId, replyToAuthor, draftKey) => {
    newComment(text, parentId, replyToAuthor);
    setDraft(draftKey, "");
  };

  const sizingClass =
    listClassName ?? (variant === "grow" ? "flex-grow" : "h-96 max-h-96");

  return (
    <>
      <div className={`${sizingClass} p-3 overflow-y-auto flex flex-col gap-1`}>
        {comments.length === 0 ? (
          <NoDataState
            title="No comments yet"
            description="Be the first to start the conversation. Your comment will appear here once you post it."
            className="my-2"
            compact
          />
        ) : (
          comments.map((chat, index) => {
            const isReplyingToComment = commentIndex === index;
            const repliesVisible = showReplies === index;

            return (
              <ChatCard
                key={chat.id ?? index}
                chat={chat}
                avatarSize="2rem"
                isReplyOpen={isReplyingToComment}
                onToggleReply={() =>
                  setCommentIndex(isReplyingToComment ? null : index)
                }
                inputValue={getDraft(chat.id)}
                onInputChange={(value) => setDraft(chat.id, value)}
                onSubmitReply={() => {
                  submitAndClear(getDraft(chat.id), chat.id, null, chat.id);
                  setCommentIndex(null);
                }}
                extraFooter={
                  chat.replies ? (
                    <p
                      className="relative text-xs font-poppins text-neutral-300 cursor-pointer"
                      onClick={() =>
                        setShowReplies(repliesVisible ? null : index)
                      }
                    >
                      {repliesVisible ? "Show less replies" : "Show all replies"}
                    </p>
                  ) : null
                }
              >
                {repliesVisible &&
                  chat.replies &&
                  chat.replies.map((reply, replyIdx) => {
                    const isReplyingToReply = replyIndex === replyIdx;

                    return (
                      <ChatCard
                        key={reply.id ?? replyIdx}
                        chat={reply}
                        avatarSize="1.8rem"
                        wrapperClassName="mt-2"
                        isReplyOpen={isReplyingToReply}
                        onToggleReply={() =>
                          setReplyIndex(isReplyingToReply ? null : replyIdx)
                        }
                        inputValue={getDraft(reply.id)}
                        onInputChange={(value) => setDraft(reply.id, value)}
                        onSubmitReply={() => {
                          submitAndClear(
                            getDraft(reply.id),
                            chat.id,
                            reply.author,
                            reply.id,
                          );
                          setReplyIndex(null);
                        }}
                      />
                    );
                  })}
              </ChatCard>
            );
          })
        )}
      </div>

      <CommentInput
        value={getDraft(null)}
        onChange={(value) => setDraft(null, value)}
        onSubmit={() => submitAndClear(getDraft(null), null, null, null)}
      />
    </>
  );
}