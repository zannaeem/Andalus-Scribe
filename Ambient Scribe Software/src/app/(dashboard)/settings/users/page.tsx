"use client";

import { mockUsers } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";

const roleColors: Record<string, string> = {
  owner: "bg-purple-50 text-purple-700 border-purple-200",
  doctor: "bg-blue-50 text-blue-700 border-blue-200",
  admin: "bg-green-50 text-green-700 border-green-200",
  viewer: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Team</h1>
        <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors">
          + Invite member
        </button>
      </div>

      <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100">
        {mockUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-bold text-white">
                  {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-900">{user.full_name}</p>
                <p className="text-[11px] text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user.last_sign_in_at && (
                <p className="text-[11px] text-gray-400 hidden sm:block">
                  Last seen {format(parseISO(user.last_sign_in_at), "d MMM")}
                </p>
              )}
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border capitalize ${roleColors[user.role] || roleColors.viewer}`}>
                {user.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
