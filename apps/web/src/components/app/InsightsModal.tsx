import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    sessionsToday: number;
    focusedTodayMinutes: number;
    sessionsWeek: number;
    focusedWeekMinutes: number;
  };
  serverWeekStats: {
    sessions: number;
    focusedMinutes: number;
  } | null;
}

export function InsightsModal({ isOpen, onClose, stats, serverWeekStats }: InsightsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-card">
        <DialogTitle className="sr-only">Insights</DialogTitle>
        <DialogDescription className="sr-only">
          View focus session totals and minutes for today and the last seven days.
        </DialogDescription>
        <div className="modal-header">
          <h2>Insights</h2>
        </div>
        <section className="insights-panel" aria-label="Focus statistics">
          <div className="stats-grid">
            <article>
              <p className="stats-label">Today sessions</p>
              <p className="stats-value">{stats.sessionsToday}</p>
            </article>
            <article>
              <p className="stats-label">Today focused</p>
              <p className="stats-value">{stats.focusedTodayMinutes} min</p>
            </article>
            <article>
              <p className="stats-label">7 days sessions</p>
              <p className="stats-value">{stats.sessionsWeek}</p>
            </article>
            <article>
              <p className="stats-label">7 days focused</p>
              <p className="stats-value">{stats.focusedWeekMinutes} min</p>
            </article>
            <article>
              <p className="stats-label">Server 7 days sessions</p>
              <p className="stats-value">{serverWeekStats?.sessions ?? 0}</p>
            </article>
            <article>
              <p className="stats-label">Server 7 days focused</p>
              <p className="stats-value">{serverWeekStats?.focusedMinutes ?? 0} min</p>
            </article>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
