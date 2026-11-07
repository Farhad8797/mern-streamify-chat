export function ChatsTabList({
  chats,
  onSelect,
  activeUser,
}: {
  chats: any[];
  onSelect: (user: any) => void;
  activeUser: any;
}) {
  console.log(activeUser);
  return (
    <div className="overflow-y-auto flex-1 divide-y divide-base-200">
      {chats?.length === 0 ? (
        <p className="text-center text-sm text-base-content/50 py-8 px-4">
          Chat with any contact to get started.
        </p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id || chat.id}
            onClick={() => onSelect(chat)}
            className={`flex items-center gap-3 p-3 hover:bg-white/20 cursor-pointer transition-colors`}
          >
            {" "}
            {activeUser === chat._id ? (
              <span className="absolute bottom-0 right-0 status status-success status-sm"></span>
            ) : (
              ""
            )}
            <img
              src={
                chat.avatar ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              }
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-semibold text-sm truncate">
                {chat.fullName}
              </h4>
              <p className="text-xs truncate text-white">
                {chat.lastMessage || "Start a conversation..."}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
