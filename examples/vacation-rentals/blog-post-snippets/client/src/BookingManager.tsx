import { useState, useMemo } from "react";
import {
  useAnalyticsQuery,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
} from "@databricks/appkit-ui/react";
import { sql } from "@databricks/appkit-ui/js";

export function BookingManager() {
  const [bookingId, setBookingId] = useState("");
  const [searchId, setSearchId] = useState<string | null>(null);
  const [flag, setFlag] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  const params = useMemo(
    () => (searchId ? { bookingId: sql.number(Number(searchId)) } : undefined),
    [searchId],
  );
  const { data, loading, error } = useAnalyticsQuery("booking_detail", params, {
    autoStart: !!searchId,
  });

  const booking = data?.[0] ?? null;

  const handleLookup = async () => {
    setSearchId(bookingId);
    const [flagRes, notesRes] = await Promise.all([
      fetch(`/api/bookings/${bookingId}/flag`),
      fetch(`/api/bookings/${bookingId}/notes`),
    ]);
    setFlag(await flagRes.json());
    setNotes(await notesRes.json());
  };

  const handleFlag = async () => {
    if (flag) {
      await fetch(`/api/bookings/${bookingId}/flag`, { method: "DELETE" });
      setFlag(null);
    } else {
      const res = await fetch(`/api/bookings/${bookingId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "flagged for review" }),
      });
      setFlag(await res.json());
    }
  };

  const handleAddNote = async () => {
    const res = await fetch(`/api/bookings/${bookingId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote }),
    });
    const created = await res.json();
    setNotes([created, ...notes]);
    setNewNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-1.5 text-sm"
          placeholder="Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
        <button
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm"
          onClick={handleLookup}
        >
          Look up
        </button>
      </div>

      {loading && <Skeleton className="h-48 w-full" />}
      {error && <p className="text-destructive">{error}</p>}

      {booking && (
        <Card>
          <CardHeader>
            <CardTitle>{booking.property_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {booking.guest_name} · {booking.guest_email}
              </p>
              <p>
                {booking.destination} · {booking.guests_count} guests
              </p>
              <p>
                {booking.check_in} → {booking.check_out} · {booking.status}
              </p>
              <p className="font-medium">${booking.total_amount}</p>
            </div>

            <button
              className={`mt-3 px-3 py-1 rounded text-sm ${
                flag
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              onClick={handleFlag}
            >
              {flag ? "Unflag" : "Flag for review"}
            </button>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Notes</h4>
              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-1.5 text-sm flex-1"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm"
                  onClick={handleAddNote}
                >
                  Add
                </button>
              </div>
              {notes.map((n) => (
                <div key={n.note_id} className="text-sm border-l-2 pl-3 py-1">
                  <p>{n.note}</p>
                  <p className="text-muted-foreground text-xs">
                    {n.agent_email} · {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
