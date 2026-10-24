export function ContactsList({
  contacts,
  onSelect,
}: {
  contacts: any[];
  onSelect: (user: any) => void;
}) {
  return (
    <div className="overflow-y-auto flex-1 divide-y divide-base-200">
      {contacts?.length === 0 ? (
        <p className="text-center text-sm text-base-content/50 py-8">
          No contacts found.
        </p>
      ) : (
        contacts.map((contact) => (
          <div
            key={contact._id || contact.id}
            onClick={() => onSelect(contact)}
            className="flex items-center gap-3 p-3 hover:bg-base-200 cursor-pointer transition-colors"
          >
            <img
              src={
                contact.avatar ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              }
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">
                {contact.fullName}
              </h4>
              <p className="text-xs text-base-content/60 truncate">
                {contact.email}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
