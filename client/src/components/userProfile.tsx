import { X } from "lucide-react";

interface ProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  isAuthUserProfile?: boolean;
}

export default function ProfileModal({
  user,
  isOpen,
  onClose,
  isAuthUserProfile = false,
}: ProfileModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-4 top-4 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cover Image */}
        <div className="h-32 bg-primary/20 relative">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute -bottom-10 left-6">
            <img
              src={
                user.avatar ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-base-100 object-cover shadow-md"
            />
          </div>
        </div>

        <div className="card-body pt-14 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{user.fullName}</h2>
            <p className="text-sm text-base-content/60">{user.email}</p>
          </div>

          {!isAuthUserProfile && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-base-content/80">
                Shared Media Files
              </h3>
              <div className="grid grid-cols-3 gap-2 bg-base-200 p-2 rounded-box min-h-[100px] items-center justify-center">
                {user.mediaFiles?.length > 0 ? (
                  user.mediaFiles.map((media: string, idx: number) => (
                    <img
                      key={idx}
                      src={media}
                      alt="Shared media"
                      className="w-full h-20 object-cover rounded"
                    />
                  ))
                ) : (
                  <p className="col-span-3 text-xs text-center text-base-content/50">
                    No media files shared yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
