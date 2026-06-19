"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Phone, Mail, Users, ChevronRight } from "lucide-react";
import { mockPatients } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type SortOption = "name_asc" | "name_desc" | "newest" | "visits";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let result = [...mockPatients];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.ic_number && p.ic_number.includes(q))
      );
    }
    if (sortOption === "name_asc") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOption === "name_desc") result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortOption === "newest") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortOption === "visits") result.sort((a, b) => b.total_visits - a.total_visits);
    return result;
  }, [search, sortOption]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Patients</h1>
        <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors">
          + Add patient
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 mb-6">
        <div>
          <p className="text-[28px] font-semibold text-gray-900 leading-none">{mockPatients.length}</p>
          <p className="text-[12px] text-gray-500 mt-1">Total patients</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-[28px] font-semibold text-gray-900 leading-none">
            {mockPatients.filter((p) => p.total_visits >= 10).length}
          </p>
          <p className="text-[12px] text-gray-500 mt-1">10+ visits</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div>
          <p className="text-[28px] font-semibold text-gray-900 leading-none">
            {mockPatients.filter((p) => p.consent_given).length}
          </p>
          <p className="text-[12px] text-gray-500 mt-1">Consent given</p>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, IC..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-4 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-400 placeholder:text-gray-400 transition-colors"
          />
        </div>
        <select
          value={sortOption}
          onChange={(e) => { setSortOption(e.target.value as SortOption); setCurrentPage(1); }}
          className="px-3 py-2 text-[13px] bg-white border border-gray-200 rounded-lg outline-none text-gray-700 cursor-pointer"
        >
          <option value="name_asc">A – Z</option>
          <option value="name_desc">Z – A</option>
          <option value="visits">Most visits</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {/* Patient list */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-[14px] font-medium text-gray-500">No patients found</p>
            <p className="text-[12px] text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginated.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[12px] font-semibold text-primary">
                      {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">{patient.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                      {patient.ic_number && (
                        <span className="text-[11px] text-gray-400">{patient.ic_number}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-medium text-gray-800">{patient.total_visits} visits</p>
                    {patient.last_visit && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Last: {format(parseISO(patient.last_visit), "d MMM yyyy")}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full hidden md:inline",
                    patient.gender === "female" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {patient.gender === "female" ? "F" : patient.gender === "male" ? "M" : "—"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[12px] text-gray-500">
            {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} patients
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1.5 text-[12px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1.5 text-[12px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
