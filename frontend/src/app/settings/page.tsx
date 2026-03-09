"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { settings as api, type Settings, ApiError } from "@/lib/api";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [threshold, setThreshold] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get()
      .then((data: Settings) => {
        setOrgName(data.name);
        setThreshold(String(data.default_low_stock_threshold));
      })
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load settings",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const num = parseInt(threshold, 10);
    if (isNaN(num) || num < 0) {
      setError("Threshold must be a non-negative integer");
      return;
    }
    setSaving(true);
    try {
      await api.update({ default_low_stock_threshold: num });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
            Loading…
          </div>
        )}

        {!loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            {/* Organisation display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organisation
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {orgName}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-700 px-4 py-2.5 rounded-lg text-sm border border-green-200">
                  Settings saved successfully.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Low Stock Threshold
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Products without their own threshold will be flagged as
                  &ldquo;low stock&rdquo; when quantity &le; this value.
                </p>
                <input
                  type="number"
                  min={0}
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="5"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors"
              >
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
