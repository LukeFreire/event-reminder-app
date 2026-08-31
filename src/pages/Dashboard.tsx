import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import EventCard from "../components/EventCard";
import type { Event } from "../types/Event";
import type { Reminder, ReminderStatus } from "../types/Reminder";
import type { Team } from "../types/Team";
import CreateEventForm from "../components/CreateEventForm";
import EventEditPage from "./EventEditPage";
import LiveEventPage from "./LiveEventPage";
import TeamsPage from "./TeamsPage";
import MyRemindersPage from "./MyRemindersPage";
import * as eventsApi from "../lib/eventsApi";
import * as teamsApi from "../lib/teamsApi";
import { supabase } from "../lib/supabaseClient";

interface DashboardProps {
  session: Session;
}

function Dashboard({ session }: DashboardProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [liveEventId, setLiveEventId] = useState<string | null>(null);
  const [showTeamsPage, setShowTeamsPage] = useState(false);
  const [showMyReminders, setShowMyReminders] = useState(false);

  useEffect(() => {
    Promise.all([
      eventsApi.fetchEvents(),
      eventsApi.fetchTeams(),
      teamsApi.fetchMyTeams(session.user.id),
    ])
      .then(([fetchedEvents, fetchedTeams, fetchedMyTeams]) => {
        setEvents(fetchedEvents);
        setTeams(fetchedTeams);
        setMyTeams(fetchedMyTeams);
      })
      .catch(() => setError("Couldn't load events. Try refreshing."))
      .finally(() => setIsLoading(false));
  }, [session.user.id]);

  async function handleAddEvent(
    input: Omit<Event, "id" | "reminders" | "createdBy">
  ) {
    const newEvent = await eventsApi.createEvent({
      ...input,
      createdBy: session.user.email ?? session.user.id,
    });
    setEvents([...events, newEvent]);
    setShowCreateForm(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleAddReminder(
    eventId: string,
    input: Omit<Reminder, "id" | "eventId" | "teamName">
  ) {
    const newReminder = await eventsApi.addReminder(eventId, input);
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? { ...event, reminders: [...event.reminders, newReminder] }
          : event
      )
    );
  }

  async function handleCreateTeam(name: string): Promise<Team> {
    const newTeam = await eventsApi.createTeam(name);
    setTeams([...teams, newTeam].sort((a, b) => a.name.localeCompare(b.name)));
    return newTeam;
  }

  async function handleUpdateReminderStatus(
    eventId: string,
    reminderId: string,
    status: ReminderStatus
  ) {
    await eventsApi.updateReminderStatus(reminderId, status);
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              reminders: event.reminders.map((reminder) =>
                reminder.id === reminderId ? { ...reminder, status } : reminder
              ),
            }
          : event
      )
    );
  }

  async function handleDeleteReminder(eventId: string, reminderId: string) {
    await eventsApi.deleteReminder(reminderId);
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              reminders: event.reminders.filter(
                (reminder) => reminder.id !== reminderId
              ),
            }
          : event
      )
    );
  }

  async function handleUpdateEvent(updatedEvent: Event) {
    await eventsApi.updateEvent(updatedEvent);
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setEditingEventId(null);
  }

  async function handleDeleteEvent(eventId: string) {
    await eventsApi.deleteEvent(eventId);
    setEvents(events.filter((event) => event.id !== eventId));
    setEditingEventId(null);
  }

  const editingEvent = events.find((event) => event.id === editingEventId);
  const liveEvent = events.find((event) => event.id === liveEventId);

  if (liveEvent) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Live Event Production</h1>
          <p>Build timelines. Trigger reminders. Keep teams on track.</p>
        </header>

        <main className="dashboard">
          <LiveEventPage
            event={liveEvent}
            session={session}
            onExit={() => setLiveEventId(null)}
            onUpdateReminderStatus={handleUpdateReminderStatus}
          />
        </main>
      </div>
    );
  }

  if (showTeamsPage) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Live Event Production</h1>
          <p>Build timelines. Trigger reminders. Keep teams on track.</p>
        </header>

        <main className="dashboard">
          <TeamsPage teams={teams} onBack={() => setShowTeamsPage(false)} />
        </main>
      </div>
    );
  }

  if (showMyReminders) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Live Event Production</h1>
          <p>Build timelines. Trigger reminders. Keep teams on track.</p>
        </header>

        <main className="dashboard">
          <MyRemindersPage
            teamIds={myTeams.map((team) => team.id)}
            onBack={() => setShowMyReminders(false)}
          />
        </main>
      </div>
    );
  }

  if (editingEvent) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Live Event Production</h1>
          <p>Build timelines. Trigger reminders. Keep teams on track.</p>
          <div className="session-bar">
            <span>Signed in as {session.user.email}</span>
            <button className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <main className="dashboard">
          <EventEditPage
            event={editingEvent}
            teams={teams}
            onSave={handleUpdateEvent}
            onCancel={() => setEditingEventId(null)}
            onAddReminder={handleAddReminder}
            onCreateTeam={handleCreateTeam}
            onUpdateReminderStatus={handleUpdateReminderStatus}
            onDeleteReminder={handleDeleteReminder}
            onDeleteEvent={handleDeleteEvent}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Live Event Production</h1>
        <p>Build timelines. Trigger reminders. Keep teams on track.</p>
        <div className="session-bar">
          <span>Signed in as {session.user.email}</span>
          {myTeams.length > 0 && (
            <button
              className="secondary-button"
              onClick={() => setShowMyReminders(true)}
            >
              My Reminders
            </button>
          )}
          <button
            className="secondary-button"
            onClick={() => setShowTeamsPage(true)}
          >
            Manage Teams
          </button>
          <button className="secondary-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-top">
          <h2>Scheduled Events</h2>
        </div>

        {error && <p className="error-message">{error}</p>}

        {isLoading ? (
          <p className="reminders-empty">Loading events...</p>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEditEvent={setEditingEventId}
                onGoLive={setLiveEventId}
              />
            ))}
          </div>
        )}

        {showCreateForm ? (
          <CreateEventForm
            onCreateEvent={handleAddEvent}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : (
          <button
            className="primary-button create-event-button"
            onClick={() => setShowCreateForm(true)}
          >
            + Create Event
          </button>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
