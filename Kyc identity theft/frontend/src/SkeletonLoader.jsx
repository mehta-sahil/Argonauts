import React from 'react';

export const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-argos-bg text-argos-text font-inter overflow-hidden">
      {/* Skeleton Navbar */}
      <div className="h-16 border-b border-argos-border flex items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-attack/20 animate-pulse" />
          <div className="w-28 h-4 rounded bg-argos-surface shimmer-bar" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="w-12 h-3.5 rounded bg-argos-surface shimmer-bar" />
          <div className="w-20 h-3.5 rounded bg-argos-surface shimmer-bar" />
          <div className="w-16 h-3.5 rounded bg-argos-surface shimmer-bar" />
        </div>
        <div className="w-28 h-9 rounded bg-argos-surface border border-argos-border shimmer-bar" />
      </div>

      {/* Skeleton Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5">
          <div className="w-60 h-6 rounded bg-attack/15 border border-attack/20 shimmer-bar" />
          <div className="w-4/5 h-12 rounded-lg bg-argos-surface shimmer-bar" />
          <div className="w-3/5 h-12 rounded-lg bg-argos-surface shimmer-bar" />
          <div className="w-full h-4 rounded bg-argos-surface/60 mt-3 shimmer-bar" />
          <div className="w-4/5 h-4 rounded bg-argos-surface/60 shimmer-bar" />
          <div className="flex gap-4 mt-4">
            <div className="w-36 h-10 rounded bg-attack/30 shimmer-bar" />
            <div className="w-32 h-10 rounded border border-argos-border bg-argos-surface shimmer-bar" />
          </div>
        </div>
        <div className="h-[380px] rounded-lg border border-argos-border bg-argos-surface/40 shimmer-bar" />
      </div>

      {/* Skeleton Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="w-72 h-8 rounded-lg bg-argos-surface mb-8 shimmer-bar" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg border border-argos-border bg-argos-surface flex flex-col overflow-hidden">
              <div className="p-4 border-b border-argos-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-argos-surface-2 shimmer-bar" />
                  <div className="w-32 h-4 rounded bg-argos-surface-2 shimmer-bar" />
                </div>
                <div className="w-6 h-3.5 rounded bg-argos-surface-2 shimmer-bar" />
              </div>
              <div className="p-4 flex-1 border-b border-argos-border bg-argos-surface/50 shimmer-bar" />
              <div className="p-4 flex-1 bg-argos-surface/30 shimmer-bar" />
              <div className="p-3 bg-[#0E1012] flex justify-between">
                <div className="w-24 h-4 rounded bg-argos-surface-2 shimmer-bar" />
                <div className="w-12 h-4 rounded bg-argos-surface-2 shimmer-bar" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
