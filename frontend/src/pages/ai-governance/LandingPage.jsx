/**
 * AI Governance Landing Page
 * Demo landing with split entry points for company and employee access
 */

import { useNavigate } from "react-router-dom";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

import Header from "../../components/Header.jsx";
import CompanyDashboard from "./CompanyDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

const LandingPage = () => {
  const navigate = useNavigate();
  const rememberedAccessType =
    localStorage.getItem("ai_governance_access_type") || "";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark relative overflow-hidden">
        <div className="relative border-b border-do_border_light dark:border-gray-700/70 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CpuChipIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
                <span className="text-lg font-semibold tracking-tight text-do_text_light dark:text-do_text_dark">
                  AI Governance Demo
                </span>
              </div>
              {rememberedAccessType && (
                <div className="hidden md:flex items-center gap-2 rounded-full border border-do_border_light dark:border-gray-700 px-3 py-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                  <CheckBadgeIcon className="h-4 w-4" />
                  Resuming as{" "}
                  {rememberedAccessType === "employee"
                    ? "Employee"
                    : "Company"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="max-w-3xl mb-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-do_border_light dark:border-gray-700 bg-white/70 dark:bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-do_text_gray_light dark:text-do_text_gray_dark">
              <PresentationChartBarIcon className="h-4 w-4" />
              Product walkthrough
            </p>
            <h1 className="mt-5 text-4xl md:text-6xl font-light tracking-tight text-do_text_light dark:text-do_text_dark">
              Embedded dashboards for
              <span className="block font-semibold">Company and Employee</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-do_text_light/85 dark:text-white/80 leading-relaxed">
              This demo mounts the real dashboards inside the landing so the
              product can be shown exactly as it behaves in production, but
              side by side.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <section className="rounded-3xl border border-do_border_light dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-do_border_light dark:border-gray-700">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-do_border_light bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-do_text_light dark:border-gray-700 dark:bg-white/5 dark:text-white">
                    <BuildingOfficeIcon className="h-3.5 w-3.5" />
                    Company view
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-do_text_light dark:text-white">
                    Executive dashboard
                  </h2>
                  <p className="mt-1 text-sm text-do_text_light/80 dark:text-white/75">
                    Strategy, policies, approvals, and audit control.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("ai_governance_access_type", "company");
                    navigate("/ai-governance/dashboard?type=company");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-do_border_light bg-white/70 px-4 py-2 text-sm text-do_text_light hover:bg-do_card_light transition-colors dark:border-gray-700 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Open full
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[78vh] overflow-auto">
                <CompanyDashboard embedded />
              </div>
            </section>

            <section className="rounded-3xl border border-do_border_light dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-do_border_light dark:border-gray-700">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-do_border_light px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-do_text_light dark:border-gray-700 dark:text-white">
                    <UserGroupIcon className="h-3.5 w-3.5" />
                    Employee view
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-do_text_light dark:text-white">
                    Operational dashboard
                  </h2>
                  <p className="mt-1 text-sm text-do_text_light/80 dark:text-white/75">
                    Approvals, task execution, and audit visibility.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("ai_governance_access_type", "employee");
                    navigate("/ai-governance/dashboard?type=employee");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-do_border_light bg-white/70 px-4 py-2 text-sm text-do_text_light hover:bg-do_card_light transition-colors dark:border-gray-700 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Open full
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[78vh] overflow-auto">
                <EmployeeDashboard embedded />
              </div>
            </section>
          </div>

          <div className="mt-8 rounded-3xl border border-do_border_light dark:border-gray-700 bg-white/70 dark:bg-[#17181C]/80 backdrop-blur px-6 py-6 md:px-8 md:py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-do_text_light dark:text-white">
                  Public operations
                </p>
                <p className="text-sm text-do_text_light/75 dark:text-white/70">
                  A secondary path for live demos without signing in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("ai_governance_access_type", "public");
                  navigate("/ai-governance/public");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-do_border_light dark:border-gray-700 px-4 py-2 text-sm text-do_text_light dark:text-do_text_dark hover:bg-do_card_light dark:hover:bg-do_card_dark transition-colors"
              >
                <GlobeAltIcon className="h-4 w-4" />
                Open public demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
