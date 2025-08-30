import React from "react";
import GigItemCard from "./GigItemCard";
import JobCard from "../../JobCard";

const DashboardTabs = ({ activeTab, setActiveTab, dashboardData, handleCreateGigClick }) => {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "gigs", label: "My Gigs" },
    { key: "jobs", label: "Jobs" },
  ];

  return (
    <div className="relative">
      {/* Background shell */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-100 to-sky-100 blur opacity-60 pb-10" />
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Tab Nav */}
        <div className="border-b border-gray-200 px-6 py-4 flex gap-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition shadow-sm ${
                activeTab === t.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              {/* Gigs preview */}
              <Section
                title="Your Recent Gigs"
                actionLabel="View all"
                onAction={() => setActiveTab("gigs")}
              >
                {dashboardData.myGigs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.myGigs.slice(0, 3).map((gig) => (
                      <GigItemCard key={gig.id} gig={gig} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No gigs yet"
                    description="Get started by creating your first teaching gig."
                    actionLabel="New Gig"
                    onAction={handleCreateGigClick}
                  />
                )}
              </Section>

              {/* Jobs preview */}
              <Section
                title="Matched Jobs"
                actionLabel="View all"
                onAction={() => setActiveTab("jobs")}
              >
                {dashboardData.matchedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {dashboardData.matchedJobs.slice(0, 4).map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No matched jobs"
                    description="We'll show jobs that match your gigs here."
                  />
                )}
              </Section>
            </div>
          )}

          {/* Gigs Tab */}
          {activeTab === "gigs" && (
            <Section
              title="Your Gigs"
              actionLabel="New Gig"
              onAction={handleCreateGigClick}
            >
              {dashboardData.myGigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.myGigs.map((gig) => (
                    <GigItemCard key={gig.id} gig={gig} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No gigs yet"
                  description="Start building your teaching profile by adding your first gig."
                  actionLabel="New Gig"
                  onAction={handleCreateGigClick}
                />
              )}
            </Section>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <Section
              title="Matched Jobs"
              actionLabel="Browse All Jobs"
              onAction={() => (window.location.href = "/jobs")}
            >
              {dashboardData.matchedJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {dashboardData.matchedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No matched jobs"
                  description="We’ll show jobs that match your gigs here."
                  actionLabel="Browse Jobs"
                  onAction={() => (window.location.href = "/jobs")}
                />
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------- Reusable Components ---------- */

const Section = ({ title, actionLabel, onAction, children }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
    <h3 className="mt-3 text-base font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    {actionLabel && (
      <div className="mt-6">
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          {actionLabel}
        </button>
      </div>
    )}
  </div>
);

export default DashboardTabs;
