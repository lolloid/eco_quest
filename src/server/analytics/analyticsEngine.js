import { getAdminSummary } from "@/server/admin/adminEngine";

export async function getAnalyticsSummary(db) {
  const summary = await getAdminSummary(db);
  return {
    activeUsersEstimate: summary.totalUsers,
    questCompletionRate: summary.totalUsers > 0 ? Math.min(100, Math.round((summary.totalTrashCollected / (summary.totalUsers * 20)) * 100)) : 0,
    trashCollected: summary.totalTrashCollected,
    articlesRead: summary.totalArticlesRead,
    suspiciousUsers: summary.suspiciousUsers,
    topUsers: summary.topUsers,
  };
}
