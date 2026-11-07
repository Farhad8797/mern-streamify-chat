import { useState, useEffect } from "react";
import {
  Search,
  Mic,
  Send,
  Paperclip,
  Phone,
  Video,
  Trash2,
  ArrowLeft,
  X,
} from "lucide-react";
import useAuthStore from "../store/useAuthstore";
import useChatStore from "../store/useChatStore";
import ProfileModal from "../components/userProfile";
import SelectChat from "../components/selectChat";
import { ContactsList } from "../components/contacts";
import { ChatsTabList } from "../components/chats";
import { useForm } from "react-hook-form";
import { useRef } from "react";

interface FormInputs {
  messageText: string;
}

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
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showReceiverProfile, setShowReceiverProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const { register, handleSubmit, reset, watch } = useForm<FormInputs>({
    defaultValues: { messageText: "" },
  });

  const messageText = watch("messageText");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | "audio" | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setFileType("image");
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
    } else if (file.type.startsWith("audio/")) {
      setFileType("audio");
    } else {
      alert("Unsupported file type");
      return;
    }

    setSelectedFile(file);
  };

  useEffect(() => {
    loadContacts();
    loadChats();
  }, [loadContacts, loadChats]);

  useEffect(() => {
    if (!selectedUser) return;

    loadChatMessages(selectedUser._id);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedUser,
    loadChatMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  const handleSelectChatUser = (user: any) => {
    useChatStore.setState({ selectedUser: user });
    setMobileView("chat");
  };

  const handleDeleteChatConfirm = () => {
    useChatStore.setState({ selectedUser: null });
    setShowDeleteModal(false);
    setMobileView("list");
  };

  const handleSendMessage = async (data: FormInputs) => {
    if ((!data.messageText.trim() && !selectedFile) || !selectedUser) return;

    const formData = new FormData();
    if (data.messageText.trim()) {
      formData.append("text", data.messageText.trim());
    }

    if (selectedFile && fileType) {
      formData.append(fileType, selectedFile);
    }

    const result = await sendMessage(selectedUser._id, formData);

    if (result.success) {
      reset();
      setSelectedFile(null);
      setFileType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      console.error("Failed to send message:", result.data.message);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div
        className={`w-full md:w-[30%] border-r border-base-300 flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 border-b flex items-center justify-between">
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

        <div className="tabs tabs-boxed m-2 p-1">
          <a
            className={`tab tab-sm flex-1 font-medium text-white  ${activeTab === "chats" ? "tab-active bg-primary text-primary-content" : ""}`}
            onClick={() => setActiveTab("chats")}
          >
            Chats
          </a>
          <a
            className={`tab tab-sm flex-1 font-medium text-white ${activeTab === "contacts" ? "tab-active bg-primary text-primary-content" : ""}`}
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
                <button className="btn btn-ghost btn-sm btn-circle bg-white hover:bg-white/50">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="btn btn-ghost btn-sm btn-circle bg-white hover:bg-white/50">
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    className={`chat ${msg.sender === authUser.data.data._id ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-bubble text-sm bg-white/30 text-white">
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-base-300 flex flex-col">
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 rounded-t-lg relative w-fit mb-2">
                  {fileType === "image" && (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  {fileType === "video" && (
                    <span className="text-xs font-semibold px-2">
                      📹 Video: {selectedFile.name}
                    </span>
                  )}
                  {fileType === "audio" && (
                    <span className="text-xs font-semibold px-2">
                      🎵 Audio: {selectedFile.name}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileType(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSubmit(handleSendMessage)}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost btn-sm btn-circle text-base-content/70 bg-white hover:bg-white/50"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Write message..."
                  className="input input-bordered input-sm w-full text-sm"
                  {...register("messageText")}
                />

                {messageText?.trim() || selectedFile ? (
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

            <div className="px-4 py-2 border-t border-base-200 text-right">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm shadow-xl p-6 space-y-4">
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
