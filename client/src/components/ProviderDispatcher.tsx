import React from 'react';
import {
  Check,
  X,
  MapPin,
  Clock,
  Phone,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Car
} from 'lucide-react';

export interface DispatchJob {
  id: string;
  customerName?: string;
  category: string;
  problemSummary: string;
  status: 'PENDING' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerAddressText: string;
  customerLocation?: { latitude: number; longitude: number };
  locationSharingApproved: boolean;
  estimatedCostMin: number;
  estimatedCostMax: number;
  createdAt: string;
}

interface ProviderDispatcherProps {
  jobs: DispatchJob[];
  onAccept: (jobId: string) => void;
  onReject: (jobId: string) => void;
  onTransitionStatus: (jobId: string, nextStatus: DispatchJob['status']) => void;
  isUpdating?: boolean;
}

export function ProviderDispatcher({
  jobs,
  onAccept,
  onReject,
  onTransitionStatus,
  isUpdating = false,
}: ProviderDispatcherProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800">
        <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-white">No Pending Dispatch Requests</h4>
        <p className="text-slate-400 text-sm mt-1">
          You are currently marked Available. Incoming nearby distress requests will stream in here in real-time.
        </p>
      </div>
    );
  }

  const getNextStatus = (current: DispatchJob['status']): DispatchJob['status'] | null => {
    switch (current) {
      case 'ACCEPTED':
        return 'ON_THE_WAY';
      case 'ON_THE_WAY':
        return 'ARRIVED';
      case 'ARRIVED':
        return 'IN_PROGRESS';
      case 'IN_PROGRESS':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  const getTransitionLabel = (current: DispatchJob['status']) => {
    switch (current) {
      case 'ACCEPTED':
        return 'Mark As: On The Way';
      case 'ON_THE_WAY':
        return 'Mark As: Arrived at Site';
      case 'ARRIVED':
        return 'Start Service Work';
      case 'IN_PROGRESS':
        return 'Complete Job & Revoke Location';
      default:
        return 'Update State';
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map(job => {
        const isPending = job.status === 'PENDING';
        const isCompleted = job.status === 'COMPLETED' || job.status === 'CANCELLED';
        const nextStatus = getNextStatus(job.status);

        return (
          <div
            key={job.id}
            className={`glass-panel rounded-2xl p-5 md:p-6 border transition-all ${
              isPending
                ? 'border-brand-500/70 bg-slate-900/90 shadow-xl shadow-brand-950/40'
                : isCompleted
                ? 'border-slate-800/60 bg-slate-950/50 opacity-75'
                : 'border-slate-700 bg-slate-900/80 shadow-lg'
            }`}
          >
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-brand-300 border border-slate-700">
                  {job.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500">ID: {job.id.slice(0, 12)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide border ${
                    job.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : job.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {job.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Problem & customer info */}
            <div className="py-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block">
                  Problem Report:
                </span>
                <p className="text-white text-base font-medium mt-0.5">
                  {job.problemSummary}
                </p>
              </div>

              {/* Location telemetry */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Customer Address:</strong>{' '}
                    {job.customerAddressText}
                  </span>
                </div>

                {job.locationSharingApproved ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold pl-6">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Live GPS Approved: Lat {job.customerLocation?.latitude?.toFixed(4)}, Lng {job.customerLocation?.longitude?.toFixed(4)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500 italic pl-6">
                    <span>Live GPS Not Granted (Address navigation only)</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Fee Range: ₹{job.estimatedCostMin} – ₹{job.estimatedCostMax}</span>
                <span>Created {new Date(job.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Dispatcher Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => onReject(job.id)}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                    <span>Decline Job</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAccept(job.id)}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-900/40 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Dispatch</span>
                  </button>
                </>
              )}

              {!isPending && nextStatus && (
                <button
                  type="button"
                  onClick={() => onTransitionStatus(job.id, nextStatus)}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition"
                >
                  <span>{getTransitionLabel(job.status)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isCompleted && (
                <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Job Finalized • Location Revoked Automatically</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProviderDispatcher;
