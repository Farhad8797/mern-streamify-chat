import React, { useState, useEffect } from "react";
import {
  Search,
  Mic,
  Send,
  Paperclip,
  Phone,
  Video,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import useAuthStore from "../store/useAuthstore";
import useChatStore from "../store/useChatStore";
import ProfileModal from "../components/userProfile";
import SelectChat from "../components/selectChat";
import { ContactsList } from "../components/contacts";
import { ChatsTabList } from "../components/chats";

export default function ChatsPage() {
  const { authUser, onlineUsers, isSigningOut, signOut } = useAuthStore();
  const {
    allContacts,
    loadContacts,
    allChats,
    loadChats,
    allChatMessages,
    loadChatMessages,
    activeTab,
    setActiveTab,
    selectedUser,
  } = useChatStore() as any;

  const [searchQuery, setSearchQuery] = useState("");
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showReceiverProfile, setShowReceiverProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  useEffect(() => {
    loadContacts();
    loadChats();
    loadChatMessages();
  }, [loadContacts, loadChats, loadChatMessages]);

  const handleSelectChatUser = (user: any) => {
    useChatStore.setState({ selectedUser: user });
    setMobileView("chat");
  };

  const handleDeleteChatConfirm = () => {
    useChatStore.setState({ selectedUser: null });
    setShowDeleteModal(false);
    setMobileView("list");
  };

  const handleSendMessage = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageText("");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base-100">
      <div
        className={`w-full md:w-[30%] border-r border-base-300 flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowMyProfile(true)}
          >
            <img
              src={
                authUser?.avatar ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              }
              alt="My Profile"
              className="w-10 h-10 rounded-full object-cover border border-primary"
            />
            <span className="font-semibold text-sm text-base-content">
              {authUser?.fullName || "My Profile"}
            </span>
          </div>
        </div>

        <div className="p-3 border-b border-base-300">
          <label className="input input-bordered input-sm flex items-center gap-2">
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search contacts/chats/messages..."
              className="grow text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="tabs tabs-boxed bg-base-200 m-2 p-1">
          <a
            className={`tab tab-sm flex-1 font-medium ${activeTab === "chats" ? "tab-active bg-primary text-primary-content" : ""}`}
            onClick={() => setActiveTab("chats")}
          >
            Chats
          </a>
          <a
            className={`tab tab-sm flex-1 font-medium ${activeTab === "contacts" ? "tab-active bg-primary text-primary-content" : ""}`}
            onClick={() => setActiveTab("contacts")}
          >
            Contacts
          </a>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "chats" ? (
            <ChatsTabList
              chats={allChats}
              onSelect={handleSelectChatUser}
              activeUser={onlineUsers}
            />
          ) : (
            <ContactsList
              contacts={allContacts}
              onSelect={handleSelectChatUser}
            />
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col relative ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        <div className="absolute top-4 right-4 z-20">
          <button
            disabled={isSigningOut}
            onClick={signOut}
            className="btn btn-sm btn-outline btn-error"
          >
            Sign Out
          </button>
        </div>

        {selectedUser ? (
          <>
            <div className="p-4 border-b border-base-300 flex items-center justify-between pr-24">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden btn btn-ghost btn-sm btn-circle"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={
                    selectedUser.avatar ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  }
                  alt="Receiver"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => setShowReceiverProfile(true)}
                />
                <div>
                  <h3
                    className="font-semibold text-sm cursor-pointer"
                    onClick={() => setShowReceiverProfile(true)}
                  >
                    {selectedUser.fullName}
                  </h3>
                  <span className="text-xs text-success">Active now</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-base-content/70">
                <button className="btn btn-ghost btn-sm btn-circle">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="btn btn-ghost btn-sm btn-circle">
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/50">
              {allChatMessages?.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-base-content/50 font-medium">
                    Write message to start conversation
                  </p>
                </div>
              ) : (
                allChatMessages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-bubble text-sm">{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-base-300 bg-base-100 flex items-center gap-3">
              <label className="btn btn-ghost btn-circle btn-sm cursor-pointer">
                <Paperclip className="w-5 h-5 text-base-content/70" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                />
              </label>

              <form
                onSubmit={handleSendMessage}
                className="flex-1 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Write message..."
                  className="input input-bordered input-sm w-full text-sm"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                {messageText.trim() ? (
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-circle"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <Mic className="w-5 h-5 text-base-content/70" />
                  </button>
                )}
              </form>
            </div>

            <div className="px-4 py-2 bg-base-100 border-t border-base-200 text-right">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-xs text-error hover:underline flex items-center gap-1 ml-auto font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete this chat
              </button>
            </div>
          </>
        ) : (
          <SelectChat />
        )}
      </div>

      <ProfileModal
        user={authUser}
        isOpen={showMyProfile}
        onClose={() => setShowMyProfile(false)}
        isAuthUserProfile={true}
      />
      <ProfileModal
        user={selectedUser}
        isOpen={showReceiverProfile}
        onClose={() => setShowReceiverProfile(false)}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm bg-base-100 shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-error">Delete this chat?</h3>
            <p className="text-xs text-base-content/70">
              Delete this chat with this user? This can't be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChatConfirm}
                className="btn btn-sm btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
